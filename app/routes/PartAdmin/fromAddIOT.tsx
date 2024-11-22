import { useState, useEffect } from 'react';
import axios from 'axios';

export default function FromAddIOT() {
  const [iotData, setIotData] = useState<any>({});

  // ดึงข้อมูล IoT จาก API เมื่อโหลดหน้า
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get('http://localhost:3005/api/getIoTData');
        setIotData(response.data);
      } catch (error) {
        console.error('Error fetching IoT data:', error);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-semibold text-indigo-600 text-center mb-8">Admin Dashboard</h1>

      {/* แสดงข้อมูล IoT */}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold text-indigo-600 mb-4">IoT Data</h2>
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-indigo-100 text-indigo-700">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium">PM1</th>
                <th className="px-6 py-3 text-left text-sm font-medium">PM10</th>
                <th className="px-6 py-3 text-left text-sm font-medium">PM2_5</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 text-sm text-indigo-700">{iotData.PM1}</td>
                <td className="px-6 py-4 text-sm text-indigo-700">{iotData.PM10}</td>
                <td className="px-6 py-4 text-sm text-indigo-700">{iotData.PM2_5}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}