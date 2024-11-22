import { useState, useEffect } from "react";
import { useNavigate } from "@remix-run/react";
import { auth } from '../firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';

export default function AdminSignup() {
  const navigate = useNavigate();

  // State hooks for form fields
  const [role] = useState("admin");
  const [adminName, setAdminName] = useState("");
  const [email, setEmail] = useState("");
  const [adminPass, setAdminPass] = useState("");
  const [adminNum, setAdminNum] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // User authentication state
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  // Handle signup form submission
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!adminName || !email || !adminPass || !adminNum || !phone || !date) {
      alert("All fields are required.");
      return;
    }

    if (!email.includes('@')) {
      alert("Please enter a valid email.");
      return;
    }

    const signupData = { role, adminName, email, adminPass, adminNum, phone, date };

    try {
      const response = await fetch("http://localhost:3005/api/addAdmin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signupData),
      });

      if (response.ok) {
        const data = await response.json();
        alert(`${data.message}`);
        navigate("/cpc/adminsignup"); // Redirect on success
      } else {
        alert("มี Admin นี้อยู่ในระบบแล้ว");
      }
    } catch (error) {
      alert("[ERR] An error occurred while updating the form.");
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentAdmin) => {
      if (currentAdmin) {
        const emailDomain = currentAdmin.email;
        if (emailDomain === 'cramza556@gmail.com') {
          setAdmin(currentAdmin);
        } else {
          navigate('/cpc/login');
        }
      } else {
        navigate('/cpc/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setLoading(true);
      setTimeout(() => {
        navigate('/cpc/login');
      }, 1000);
    } catch (error) {
      console.error("Logout error", error);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-100">
        <div className="flex items-center space-x-4">
          <svg
            className="animate-spin h-12 w-12 text-indigo-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 100 8v4a8 8 0 01-8-8z"
            ></path>
          </svg>
          <span className="text-indigo-600 text-xl font-medium">
            กรุณารอซักครู่ กำลังโหลดเนื้อหา...
          </span>
        </div>
      </div>
    );
  }
    
  return admin ? (
    <div className="flex min-h-screen items-center justify-center bg-indigo-100">
      <div className="w-full max-w-md bg-indigo-300 p-8 shadow-lg rounded-lg">
        <h1 className="text-2xl font-bold text-center mb-6 text-indigo-700">
          SignUp/Admin
        </h1>
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-black">Role</label>
            <input type="text" value={role} readOnly />
          </div>
          <div>
            <label className="block text-sm font-medium text-black">
              ชื่อ-สกุล(ภาษาไทย)
            </label>
            <input
              type="text"
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black">
              อีเมล @cpc.rmutto.ac.th
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div className="relative">
            <label className="block text-sm font-medium text-black">
              รหัสผ่าน
            </label>
            <input
              type={showPassword ? "text" : "password"}
              value={adminPass}
              onChange={(e) => setAdminPass(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-2 top-8 flex items-center cursor-pointer"
                  >
                    <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ${showPassword ? "translate-x-9" : "translate-x-4"}`}
                  />
                    <div
                      className={`w-9 h-5 flex items-center bg-gray-300 rounded-full p-1 duration-300 ${showPassword ? "bg-green-500" : "bg-gray-300"}`}
                    />
                  </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-black">
              รหัสผู้ดูแล
            </label>
            <input
              type="text"
              value={adminNum}
              onChange={(e) => setAdminNum(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black">
              เบอร์โทรติดต่อ
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black">
              วันที่ลงทะเบียน
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            สมัครสมาชิก
          </button>
        </form>
        <br />
        <center>
          <button onClick={handleLogout} className="mt-4 py-2 px-4 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700">
            Logout
          </button>
        </center>
      </div>
    </div>
  ) : (
    <p>Redirecting to login...</p>
  );
}