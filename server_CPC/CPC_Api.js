import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import admin from "firebase-admin";
import bcrypt from "bcrypt"; // Hash passwords securely


import serviceAccount from './server/config/CPC_Fire_DB.json' assert { type: "json" };

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const app = express();
const port = 3005;

app.use(bodyParser.json());
app.use(cors());

app.listen(port, () => {
  console.log(`Web application listening on port ${port}.`);
});
// Function to add a new admin
async function addAdmin(adminData) {
    try {
      const adminRef = db.collection("admin").doc();
      const passwordToStore = adminData.adminPass
        ? await bcrypt.hash(adminData.adminPass, 10)
        : await bcrypt.hash('Hax', 10);
  
      const adminEntry = {
        ...adminData,
        adminId: adminRef.id, // สร้าง adminId ด้วยค่าเอกสารที่ได้จาก Firestore
        role: "admin",
        adminPass: passwordToStore,
      };
  
      await adminRef.set(adminEntry);
      console.log("Admin added successfully with ID:", adminRef.id);
    } catch (error) {
      console.error("Error adding admin:", error);
      throw new Error("Failed to add admin.");
    }
}

// Add a new admin
app.post("/api/addAdmin", async (req, res) => {
    const { adminName, adminNum, adminPass, date, email, phone } = req.body;
  
    // Simple validation
    if (!adminName || !adminNum || !adminPass || !email || !phone || !date) {
      return res.status(400).json({ message: "All fields are required." });
    }
  
    try {
      // Hash the password before storing it
      const hashedPassword = await bcrypt.hash(adminPass, 10);
  
      const adminData = {
        adminName,
        adminNum,
        adminPass: hashedPassword, // Store hashed password
        date,
        email,
        phone,
      };
  
      // You should also check if the admin already exists by email or admin number
      const existingAdmin = await checkIfAdminExists(adminNum, email);
      if (existingAdmin) {
        return res.status(400).json({ message: "Admin with this email or admin number already exists." });
      }
  
      // Add the admin to the database
      await addAdmin(adminData);
      res.status(200).json({ message: "เพิ่ม Admin สำเร็จ" });
    } catch (error) {
      console.error("Error adding admin:", error);
      res.status(500).json({ message: "เพิ่ม Admin ไม่สำเร็จ" });
    }
  });
// Delete an admin
app.delete("/api/deleteAdmin", async (req, res) => {
  const { adminId } = req.body;
  try {
    await db.collection("admin").doc(adminId).delete();
    res.status(200).json({ message: "Admin deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete admin." });
  }
});

// Fetch all admins
app.get("/api/getAdmin", async (req, res) => {
  try {
    const admins = [];
    const adminSnapshot = await db.collection("admin").get();
    adminSnapshot.forEach((doc) => {
      const data = doc.data();
      delete data.adminPass; // Remove password before sending
      admins.push({ id: doc.id, ...data });
    });
    res.status(200).json(admins);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch admins." });
  }
});

// Fetch an admin by ID
app.get("/api/getAdmin/:adminId", async (req, res) => {
  const { adminId } = req.params;
  try {
    const adminDoc = await db.collection("admin").doc(adminId).get();
    if (!adminDoc.exists) {
      return res.status(404).json({ message: "ไม่พบผู้ดูแลระบบ." });
    }
    const adminData = adminDoc.data();
    delete adminData.adminPass;
    res.status(200).json(adminData);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch admin." });
  }
});

// Update an admin
app.post("/api/updateAdmin/:adminId", async (req, res) => {
  const { adminId } = req.params;
  const { adminNum, adminName, adminPass, date, email, phone } = req.body;

  console.log("Received adminId:", adminId);
  console.log("Received body:", req.body);

  if (!adminId) {
    return res.status(400).json({ message: "Admin ID is required." });
  }

  try {
    // Prepare data to update
    const updatedData = {
      adminName,
      adminNum,
      date,
      email,
      phone,
      role: "admin",
    };

    if (adminPass) {
      updatedData.adminPass = await bcrypt.hash(adminPass, 10);
    }

    // Get admin document reference
    const adminDoc = db.collection("admin").doc(adminId);
    const doc = await adminDoc.get();
    if (!doc.exists) {
      return res.status(404).json({ message: "Admin not found." });
    }

    // Update admin document
    await adminDoc.update(updatedData);
    res.status(200).json({ message: "Admin updated successfully." });
  } catch (error) {
    console.error("Error updating admin:", error);
    res.status(500).json({ message: "Failed to update admin." });
  }
});

// Admin login
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Query for the admin by email
        const adminQuerySnapshot = await db.collection("admin").where("email", "==", email).get();

        if (adminQuerySnapshot.empty) {
            return res.status(400).json({ message: "ข้อมูล Admin ไม่ถูกต้อง" });
        }

        const docData = adminQuerySnapshot.docs[0]; // Get the first document
        const admin = docData.data();

        const isPasswordValid = await bcrypt.compare(password, admin.adminPass);

        if (!isPasswordValid) {
            return res.status(401).json({ message: "ข้อมูล Password ไม่ถูกต้อง" });
        }

        const adminId = docData.id;  // Get the document ID
        console.log("Admin ID from backend:", adminId); // Log the adminId to verify

        // Get the admin data from Firestore using the adminId
        const adminRef = db.collection('admin').doc(adminId);
        const adminDataDoc = await adminRef.get();
        const adminData = adminDataDoc.data();

        if (adminData && adminData.adminId) {
            return res.status(200).json({
                adminId: adminData.adminId,  
                role: "admin",
                email: adminData.email
            });
        } else {
            return res.status(400).json({ message: "Admin ID not found" });
        }
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Error during login" });
    }
});

async function checkIfAdminExists(adminNum, email) {

    const emailSnapshot = await db.collection("admin").where("email", "==", email).get();
    const adminNumSnapshot = await db.collection("admin").where("adminNum", "==", adminNum).get();
    return !emailSnapshot.empty || !adminNumSnapshot.empty;
}

app.get('/api/checkAdmin/:adminId', async (req, res) => {
  const { adminId } = req.params;
  try {
    // Retrieve the admin document by adminId
    const adminDoc = await db.collection("admin").doc(adminId).get();

    // Check if the admin document exists
    if (!adminDoc.exists) {
      return res.status(404).json({ message: 'ข้อมูล Admin ไม่ถูกต้อง' });
    }

    const adminData = adminDoc.data();

    // Check if the admin role is "admin"
    if (adminData.role !== "admin") {
      return res.status(403).json({ message: 'Forbidden: Not an admin.' });
    }

    // Return the admin's role
    res.status(200).json({ role: adminData.role });
  } catch (error) {
    res.status(500).json({ message: 'Error verifying admin.' });
  }
});

//---------------------------------------------------------------------------------User----------------------------------------------------------------------------------
async function addUser(userData) {
  try {
    // Use "users" collection consistently
    const userRef = db.collection("users").doc(userData.userId);  // Use userId as the document ID
    
    const userEntry = {
      ...userData,
      userId: userData.userId,  // Set userId equal to userId
      role: "user",
    };

    await userRef.set(userEntry);  // Use userId as the document ID when saving the user data
    console.log("User added successfully with ID:", userData.userId);
    
    return userEntry;  // Return user data including the userId (which is userId now)
  } catch (error) {
    console.error("Error adding user:", error);
    throw new Error("Failed to add user.");
  }
}

// Add a new user through API
app.post('/api/addUser', async (req, res) => {
  const { userName, useremail, userId, userphone, date } = req.body;

  // Check if all fields are provided
  if (!userName || !useremail || !userId || !userphone || !date) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Check if the user already exists based on email
    const userRef = db.collection('users').where('useremail', '==', useremail);
    const snapshot = await userRef.get(userId);

    if (!snapshot.empty) {
      return res.status(409).json({ message: 'User already exists' });
    }

    // Create a new user document
    const newUser = {
      userName,
      useremail,
      userId,
      userphone,
      date,
    };

    const addedUser = await addUser(newUser);  // Add user and get the added user object

    // Respond with the added user data
    return res.status(201).json({ 
      message: 'User successfully registered', 
      user: addedUser 
    });
  } catch (error) {
    console.error('Error adding user to Firestore:', error);
    return res.status(500).json({ message: 'An error occurred while registering the user' });
  }
});

//---------------------------------------------IOT-----------------------------------------------------------------------------------------------------
app.post('/api/addIoTData', async (req, res) => {
  const { pmId, pm1, pm10, pm2_5, timestamp } = req.body;

  try {
    const newData = {
      pmId,
      pm1,
      pm10,
      pm2_5,
      timestamp,
    };

    // เพิ่มข้อมูลลงใน Firestore
    await db.collection('PMDataT9').add(newData);
    res.status(201).json({ message: 'Data added successfully' });
  } catch (error) {
    console.error('Error adding IoT data:', error);
    res.status(500).json({ message: 'Failed to add IoT data.' });
  }
});

app.get('/api/getIoTData', async (req, res) => {
  try {
    // ดึงข้อมูลจาก collection "PMValues" ใน Firestore
    const snapshot = await db.collection('PMDataT9').doc('PMValues').get();

    if (!snapshot.exists) {
      return res.status(404).json({ message: 'No IoT data found.' });
    }

    // ส่งข้อมูลทั้งหมดกลับไป
    const pmData = snapshot.data();
    res.status(200).json(pmData); // ส่งข้อมูล PM1, PM10, PM2_5
  } catch (error) {
    console.error('Error getting IoT data:', error);
    res.status(500).json({ message: 'Failed to retrieve IoT data.' });
  }
});

