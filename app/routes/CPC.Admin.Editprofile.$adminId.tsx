import { useEffect, useState } from "react";
import { useNavigate } from "@remix-run/react";
import axios from "axios";
import HeaderAdmin from "./PartAdmin/headerAdmin";

export default function AdminUpdate() {
  const navigate = useNavigate();

  // State hooks for form fields
  const [role] = useState("admin");
  const [adminName, setAdminName] = useState("");
  const [email, setEmail] = useState("");
  const [adminPass, setAdminPass] = useState("");
  const [adminNum, setAdminNum] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");

  // State for password visibility
  const [showPassword, setShowPassword] = useState(false);

  // Authentication state
  const [adminId, setAdminId] = useState<string | null>(null);

  // Handle form submission
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    const adminData = {
      role,
      adminName,
      email,
      adminPass,
      adminNum,
      phone,
      date,
    };

    try {
      const response = await axios.post(
        `http://localhost:3005/api/updateAdmin/${adminId}`,
        adminData
      );

      if (response.data.message === "Admin updated successfully.") {
        alert(response.data.message);
        navigate(`/cpc/admin/dashboard/${adminId}`);
      } else {
        alert(response.data.message || "Failed to update admin.");
      }
    } catch (error) {
      console.error("[Error Updating Admin]:", error);
      alert("An error occurred. Please try again.");
    }
  };

  // Check if admin is authenticated
  useEffect(() => {
    const storedAdminId = localStorage.getItem("adminId");

    if (!storedAdminId) {
      alert("You must log in to access this page.");
      navigate("/cpc/login");
    } else {
      setAdminId(storedAdminId);
    }
  }, [navigate]);

  return (
    <>
      <HeaderAdmin adminId={adminId} />
      <div className="flex min-h-screen items-center justify-center bg-indigo-100">
        <div className="w-full max-w-md bg-white p-8 shadow-lg rounded-lg">
          <h1 className="text-2xl font-bold text-center mb-6 text-indigo-700">
            Update Admin Profile
          </h1>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-black">Role</label>
              <input
                type="text"
                value={role}
                readOnly
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-200 text-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black">Name</label>
              <input
                type="text"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
            <div className="relative">
                <label className="block text-sm font-medium text-black">Password</label>
                <div className="relative mt-1">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={adminPass}
                    onChange={(e) => setAdminPass(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-2 top-2 flex items-center cursor-pointer"
                  >
                    <div
                    className={`bg-white w-5 h-5 rounded-full shadow-md transform duration-300 ${showPassword ? "translate-x-10" : "translate-x-5"}`}
                  />
                    <div
                      className={`w-10 h-6 flex items-center bg-gray-300 rounded-full p-1 duration-300 ${showPassword ? "bg-green-500" : "bg-gray-300"}`}
                    />
                  </button>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-black">Admin ID</label>
              <input
                type="text"
                value={adminNum}
                onChange={(e) => setAdminNum(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black">Registration Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700"
            >
              Update Profile
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
