import { useEffect, useState } from "react";
import { useNavigate } from "@remix-run/react";
import axios from "axios";
import HeaderAdmin from "./PartAdmin/headerAdmin";

const AddIOT = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [adminId, setAdminId] = useState<string | null>(null);
  const [adminName, setAdminName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [adminNum, setAdminNum] = useState<string | null>(null);
  const [phone, setPhone] = useState<string | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const [iotData, setIotData] = useState<any>({}); // เริ่มต้นเป็น object ว่าง
  const [newData, setNewData] = useState({
    pmId: '',
    pm1: '',
    pm10: '',
    pm2_5: '',
    timestamp: '',
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get('http://localhost:3005/api/getIoTData');
        console.log('API Response:', response.data); // ตรวจสอบข้อมูลที่ได้รับ
        setIotData(response.data);  // อัพเดต state ด้วยข้อมูลที่ได้รับ
      } catch (error) {
        console.error('Error fetching IoT data:', error);
      }
    }
    fetchData();
  }, []);

  // ฟังก์ชันสำหรับกรอกข้อมูลใหม่
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewData({
      ...newData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // ส่งข้อมูลใหม่ไปที่ API
      await axios.post('http://localhost:3005/api/addIoTData', newData);

      // รีเฟรชข้อมูลหลังจากเพิ่มข้อมูล
      const response = await axios.get('http://localhost:3005/api/getIoTData');
      setIotData(response.data);
    } catch (error) {
      console.error('Error submitting new data:', error);
    }
  };

  useEffect(() => {
    const storedAdminId = localStorage.getItem("adminId");
    if (!storedAdminId) {
      navigate("/cpc/login");
    } else {
      setAdminId(storedAdminId);
    }
  }, [navigate]);

  useEffect(() => {
    if (!adminId) return;

    const checkAdminAccess = async () => {
      try {
        const response = await axios.get(`http://localhost:3005/api/getAdmin/${adminId}`);
        console.log("Admin API Response:", response);

        if (response.status === 200) {
          setAdminName(response.data.adminName);
          setEmail(response.data.email);
          setAdminNum(response.data.adminNum);
          setPhone(response.data.phone);
          setDate(response.data.date);
          setIsLoading(false);
        } else {
          setError("ไม่สามารถดึงข้อมูลผู้ดูแลระบบ");
        }
      } catch (err) {
        console.error("Error fetching admin:", err);
        setError("Error fetching admin data.");
        navigate("/cpc/login");
      }
    };

    checkAdminAccess();
  }, [adminId, navigate]);

  if (isLoading) {
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

  if (error) {
    return (
      <div className="text-center text-red-500 mt-10">
        <p>{error}</p>
      </div>
    );
  }

  const handleLogout = () => {
    localStorage.removeItem("adminId");
    setTimeout(() => {
      navigate('/cpc/login');
    }, 1000);
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <HeaderAdmin adminId={adminId} />
      <div className="container mx-auto px-6 py-10">
        <div className="flex items-center justify-between bg-white shadow-md p-6 rounded-lg">
          <div className="flex items-center space-x-4">
            <h1
              className="text-2xl font-bold text-indigo-600 cursor-pointer flex items-center"
              onClick={toggleMenu}
            >
              {adminName || "Loading..."}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill="#4F46E5"
                className="ml-2"
              >
                <path d="M480-360 280-560h400L480-360Z" />
              </svg>
            </h1>
            <span className="bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full text-sm">
              Admin
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition duration-200"
            title="Logout"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 24 24"
              className="w-6 h-6"
            >
              <path
                d="M16 13v-2H7V9h9V7l5 4-5 4zm-2 7H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h8V2H6C4.346 2 3 3.346 3 5v14c0 1.654 1.346 3 3 3h8v-2z"
              />
            </svg>
          </button>
        </div>

        <h1 className="text-3xl font-semibold text-indigo-600 text-center mb-8">Admin Dashboard</h1>

      {/* ฟอร์มสำหรับกรอกข้อมูล IoT ใหม่ */}
      <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-indigo-600 mb-4">Add New IoT Data</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Device ID</label>
            <input
              type="text"
              name="pmId"
              value={newData.pmId}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">PM1</label>
            <input
              type="number"
              name="pm1"
              value={newData.pm1}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">PM10</label>
            <input
              type="number"
              name="pm10"
              value={newData.pm10}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">PM2.5</label>
            <input
              type="number"
              name="pm2_5"
              value={newData.pm2_5}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Timestamp</label>
            <input
              type="datetime-local"
              name="timestamp"
              value={newData.timestamp}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition duration-200"
          >
            Submit Data
          </button>
        </form>
      </div>

      {/* แสดงข้อมูล IoT */}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold text-indigo-600 mb-4">IoT Data</h2>
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-indigo-100 text-indigo-700">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium">Device ID</th>
                <th className="px-6 py-3 text-left text-sm font-medium">PM1</th>
                <th className="px-6 py-3 text-left text-sm font-medium">PM10</th>
                <th className="px-6 py-3 text-left text-sm font-medium">PM2.5</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {/* แสดงข้อมูลจาก iotData */}
              <tr>
                <td className="px-6 py-4 text-sm">{iotData.pmId}</td>
                <td className="px-6 py-4 text-sm">{iotData.pm1}</td>
                <td className="px-6 py-4 text-sm">{iotData.pm10}</td>
                <td className="px-6 py-4 text-sm">{iotData.pm2_5}</td>
                <td className="px-6 py-4 text-sm">{iotData.timestamp}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

        {menuOpen && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white shadow-lg p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-indigo-700 mb-4">
                Admin Information
              </h3>
              <div className="space-y-2">
                <p className="text-gray-700">
                  <strong>ID:</strong> {adminId || "Loading..."}
                </p>
                <p className="text-gray-700">
                  <strong>Name:</strong> {adminName || "Loading..."}
                </p>
                <p className="text-gray-700">
                  <strong>Email:</strong> {email || "Loading..."}
                </p>
                <p className="text-gray-700">
                  <strong>Admin Number:</strong> {adminNum || "Loading..."}
                </p>
                <p className="text-gray-700">
                  <strong>Phone:</strong> {phone || "Loading..."}
                </p>
                <p className="text-gray-700">
                  <strong>Date:</strong> {date || "Loading..."}
                </p>
              </div>
              <a
                href={`/cpc/admin/editprofile/${adminId}`}
                className="block mt-4 text-center text-indigo-500 font-semibold"
              >
                Edit Profile
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddIOT;
