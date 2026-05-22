import React from 'react';
import { useWeb3 } from '../Web3Context';
import { Link } from 'react-router-dom';

export default function AgentDashboard() {
  const { currentRole } = useWeb3();

  
  const stats = [
    { id: 1, title: 'Lô hàng đang quản lý', count: '12 Lô', color: 'bg-blue-500' },
    { id: 2, title: 'Chờ duyệt sơ chế', count: '3 Lô', color: 'bg-yellow-500' },
    { id: 3, title: 'Đã lên sàn IPFS', count: '8 Tệp', color: 'bg-green-500' },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {}
      <div className="mb-6 p-4 bg-white rounded-xl shadow-sm border-l-4 border-green-600 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Bảng Điều Khiển Tác Nhân</h1>
          <p className="text-sm text-gray-500">Xin chào! Bạn đang đăng nhập với tư cách: <span className="font-bold text-green-600">{currentRole}</span></p>
        </div>
        <Link to="/manage-lots" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-medium transition-colors">
          + Khởi Tạo Lô Hàng Mới
        </Link>
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((item) => (
          <div key={item.id} className="p-6 bg-white rounded-xl shadow-md flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium uppercase">{item.title}</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{item.count}</p>
            </div>
            <div className={`w-12 h-12 rounded-full ${item.color} opacity-20`} />
          </div>
        ))}
      </div>

      {}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Danh sách công việc chuỗi cung ứng cần xử lý</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b bg-gray-50 text-gray-600 text-sm uppercase">
                <th className="p-3">Mã Lô</th>
                <th className="p-3">Vùng Trồng</th>
                <th className="p-3">Trạng Thái</th>
                <th className="p-3">Hành Động</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 text-sm">
              <tr className="border-b hover:bg-gray-50">
                <td className="p-3 font-bold">#LOT-2026-01</td>
                <td className="p-3">Cầu Đất, Đà Lạt</td>
                <td className="p-3"><span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">Chờ HTX Duyệt</span></td>
                <td className="p-3">
                  <Link to="/lots/1" className="text-blue-600 hover:underline font-medium">Xem chi tiết</Link>
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="p-3 font-bold">#LOT-2026-02</td>
                <td className="p-3">Chư Prông, Gia Lai</td>
                <td className="p-3"><span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Đã duyệt Rang</span></td>
                <td className="p-3">
                  <Link to="/lots/1" className="text-blue-600 hover:underline font-medium">Xem chi tiết</Link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
