import { useWeb3 } from '../Web3Context';
export default function LotDetails() {
  const { currentRole, setRole } = useWeb3(); // Lấy role hiện tại từ Context

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Thanh công cụ giả lập đổi Role để bạn tự test UI nhanh */}
      <div className="mb-6 p-2 bg-yellow-100 rounded text-sm">
        <strong>[Chế độ Test cho Khuyến]:</strong> Đổi Role ví tại đây xem UI thay đổi: {' '}
        <button onClick={() => setRole('HTX')} className="mx-1 px-2 py-0.5 bg-blue-500 text-white rounded">HTX</button>
        <button onClick={() => setRole('PROCESSOR')} className="mx-1 px-2 py-0.5 bg-purple-500 text-white rounded">Nhà chế biến</button>
      </div>

      <h1 className="text-3xl font-bold mb-2">Chi Tiết Lô Hàng #LOT-2026</h1>
      <p className="text-gray-600 mb-6">Trạng thái: Đang chờ xử lý tiếp theo</p>

      {/* Thông tin chung của lô hàng (Ai cũng nhìn thấy) */}
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <p><strong>Nguồn gốc:</strong> Nông trại Đắk Lắk</p>
        <p><strong>Giống cà phê:</strong> Robusta</p>
      </div>

      {/* RẼ NHÁNH GIAO DIỆN THEO QUYỀN (Conditional Rendering) */}
      
      {/* 1. Nếu là HỢP TÁC XÃ */}
      {currentRole === 'HTX' && (
        <div className="p-4 border-2 border-blue-500 rounded-lg bg-blue-50">
          <h3 className="text-lg font-semibold text-blue-700 mb-2">Không Gian Xử Lý: Hợp Tác Xã</h3>
          <p className="text-sm mb-4">Bạn có quyền phê duyệt hoặc từ chối chứng nhận sơ chế cho lô hàng này.</p>
          <div className="flex gap-4">
            <button onClick={() => alert('Duyệt sơ chế')} className="bg-blue-600 text-white px-4 py-2 rounded">Duyệt Sơ Chế</button>
            <button onClick={() => alert('Từ chối')} className="bg-red-500 text-white px-4 py-2 rounded">Từ Chối</button>
          </div>
        </div>
      )}

      {/* 2. Nếu là NHÀ CHẾ BIẾN (PROCESSOR) */}
      {currentRole === 'PROCESSOR' && (
        <div className="p-4 border-2 border-purple-500 rounded-lg bg-purple-50">
          <h3 className="text-lg font-semibold text-purple-700 mb-2">Không Gian Xử Lý: Nhà Chế Biến / Rang Xay</h3>
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert('Lưu thông số rang'); }}>
            <div>
              <label className="block text-sm font-medium">Nhiệt độ rang (°C):</label>
              <input type="number" className="p-2 border rounded w-full" placeholder="Ví dụ: 200" />
            </div>
            <div>
              <label className="block text-sm font-medium">Điểm SCA Cupping Score:</label>
              <input type="number" step="0.1" className="p-2 border rounded w-full" placeholder="Ví dụ: 82.5" />
            </div>
            <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded">Cập Nhật Thông Số Mẻ Rang</button>
          </form>
        </div>
      )}
    </div>
  );
}