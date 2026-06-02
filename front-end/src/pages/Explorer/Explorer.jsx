import { useState, useEffect, useRef } from "react";
import TimelineItem from "../../components/Traceability/TimelineItem/TimelineItem";
import axiosInstance from "../../utils/axiosInstance";
import "./Explorer.css";

// ─── Mock data (xóa khi có API thật) ─────────────────────────────────────────
const MOCK_LOT = {
  id: "LOT-8492",
  status: "Hoàn Thành",
  name: "Robusta Sơ Chế Ướt",
  region: "Cư M'gar, Đắk Lắk",
  weight: "2.5 Tấn",
  variety: "TR4, TR9",
  harvestDate: "15/10/2025",
  humidity: "12.5%",
  qrCodeUrl: "https://storage.googleapis.com/uxpilot-auth.appspot.com/52f07bc677-184d5dfca4068dc516a8.png",
  timeline: [
    {
      id: "tl-1",
      stage: "Thu Hoạch & Phân Loại",
      unit: "Nông hộ: Nguyễn Văn A (Buôn Hồ)",
      date: "15/10/2025",
      time: "08:30 AM",
      icon: "fa-solid fa-leaf",
      avatar: {
        src: "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg",
        alt: "Nguyễn Văn A",
      },
      details: [
        { label: "Tỷ lệ quả chín", value: "95%" },
        { label: "Tạp chất", value: "< 1%" },
      ],
      attachments: [
        { icon: "fa-solid fa-file-pdf", iconColor: "text-red-500", name: "Giấy_chứng_nhận_VietGAP.pdf" },
        { icon: "fa-solid fa-image", iconColor: "text-blue-500", name: "Anh_thu_hoach_1.jpg" },
      ],
      txHash: "0x8f2a...9c41",
      etherscanUrl: "https://etherscan.io/tx/0x8f2a9c41",
    },
    {
      id: "tl-2",
      stage: "Sơ Chế Ướt (Washed)",
      unit: "Trạm sơ chế: HTX Nông Nghiệp Ea Tul",
      date: "16/10/2025",
      time: "14:15 PM",
      icon: "fa-solid fa-droplet",
      avatarIcon: "fa-solid fa-industry",
      avatarBg: "bg-coffee-100",
      details: [
        { label: "Thời gian lên men", value: "24 giờ" },
        { label: "Độ ẩm sau sấy", value: "12%" },
      ],
      attachments: [
        { icon: "fa-solid fa-file-lines", iconColor: "text-forest-500", name: "Nhat_ky_so_che.pdf" },
      ],
      txHash: "0x3b1c...7d92",
      etherscanUrl: "https://etherscan.io/tx/0x3b1c7d92",
    },
    {
      id: "tl-3",
      stage: "Vận Chuyển Nội Địa",
      unit: "Đơn vị: Logistics Trường Hải",
      date: "18/10/2025",
      time: "09:00 AM",
      icon: "fa-solid fa-truck",
      avatarIcon: "fa-solid fa-building",
      avatarBg: "bg-forest-100",
      transportFrom: "Kho Ea Tul, Đắk Lắk",
      transportTo: "Nhà máy Trung Nguyên, Bình Dương",
      details: [{ label: "", value: "" }], // trigger render nhưng dùng transport layout
      txHash: "0x9a4f...2e11",
      etherscanUrl: "https://etherscan.io/tx/0x9a4f2e11",
      isLast: true,
    },
  ],
};
// ─────────────────────────────────────────────────────────────────────────────

const Explorer = () => {
  const [query, setQuery] = useState("");
  const [lotData, setLotData] = useState(MOCK_LOT);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stageFilters, setStageFilters] = useState({
    all: true,
    harvest: false,
    processing: false,
    transport: false,
    roasting: false,
  });
  const [docFilter, setDocFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const inputRef = useRef(null);

  // ── Gọi API khi có UUID / mã lô ────────────────────────────────────────────
  const fetchLotData = async (lotId) => {
    if (!lotId.trim()) return;
    setLoading(true);
    setError(null);
    try {
      // API công khai - không cần token (axiosInstance vẫn dùng được,
      // interceptor chỉ gắn token nếu có trong localStorage)
      const res = await axiosInstance.get(`/lots/${lotId.trim()}`);
      setLotData(res.data);
    } catch (err) {
      setError("Không tìm thấy lô hàng. Vui lòng kiểm tra lại mã lô.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => fetchLotData(query);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  // ── Quét QR → nhận UUID ────────────────────────────────────────────────────
  const handleQrScan = () => {
    // Tích hợp với thư viện QR scanner (vd: html5-qrcode)
    // Khi quét xong → fetchLotData(uuid)
    alert("Kết nối camera quét QR — tích hợp thư viện html5-qrcode tại đây.");
  };

  // ── Render timeline theo sort ──────────────────────────────────────────────
  const sortedTimeline = lotData?.timeline
    ? [...lotData.timeline].sort((a, b) => {
        const dateA = new Date(a.date.split("/").reverse().join("-"));
        const dateB = new Date(b.date.split("/").reverse().join("-"));
        return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
      })
    : [];

  return (
    <div className="m-0 p-0 bg-coffee-50 text-forest-900 font-sans relative overflow-x-hidden min-h-screen flex flex-col">

      {/* Background Texture */}
      <div className="fixed inset-0 pointer-events-none z-[-1] bg-grain mix-blend-multiply opacity-50"></div>

      {/* Header */}
      <header className="fixed top-0 w-full z-50 glass-panel border-b border-coffee-200/50 transition-all duration-300">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
          <a href="#" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-forest-600 to-forest-900 flex items-center justify-center shadow-lg shadow-forest-900/20 group-hover:scale-105 transition-transform">
              <i className="fa-solid fa-seedling text-white text-xl"></i>
            </div>
            <span className="font-serif text-2xl font-bold text-forest-900 tracking-tight">ROBUSTRACE</span>
          </a>

          <nav className="hidden xl:flex items-center gap-1">
            <a href="#" className="px-4 py-2 rounded-lg text-forest-700 hover:bg-coffee-100 hover:text-forest-900 font-medium text-sm transition-colors">Trang Chủ</a>
            <a href="#" className="px-4 py-2 rounded-lg text-forest-700 hover:bg-coffee-100 hover:text-forest-900 font-medium text-sm transition-colors">Bảng Điều Khiển</a>
            <a href="#" className="px-4 py-2 rounded-lg bg-forest-50 text-forest-900 font-medium text-sm transition-colors">Tra Cứu Minh Bạch</a>
            <div className="w-px h-4 bg-coffee-300 mx-2"></div>
            <a href="#" className="px-4 py-2 rounded-lg text-forest-700 hover:bg-coffee-100 hover:text-forest-900 font-medium text-sm transition-colors flex items-center gap-2">
              <i className="fa-solid fa-layer-group text-xs"></i> Workspace
            </a>
            <a href="#" className="px-4 py-2 rounded-lg text-forest-700 hover:bg-coffee-100 hover:text-forest-900 font-medium text-sm transition-colors flex items-center gap-2">
              <i className="fa-solid fa-boxes-stacked text-xs"></i> Lô Hàng
            </a>
            <a href="#" className="px-4 py-2 rounded-lg text-forest-700 hover:bg-coffee-100 hover:text-forest-900 font-medium text-sm transition-colors flex items-center gap-2">
              <i className="fa-solid fa-shield-halved text-xs"></i> Quản Trị
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <button className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-xl border border-coffee-300 bg-white text-forest-800 font-medium hover:border-forest-500 hover:shadow-md transition-all text-sm">
              <i className="fa-solid fa-user-circle"></i> Chọn Vai Trò
            </button>
            <button className="relative group overflow-hidden rounded-xl p-[1px]">
              <span className="absolute inset-0 bg-gradient-to-r from-forest-400 via-coffee-400 to-forest-600 rounded-xl opacity-70 group-hover:opacity-100 transition-opacity"></span>
              <div className="relative flex items-center gap-2 px-6 py-2.5 bg-forest-900 text-white rounded-xl font-medium text-sm transition-all group-hover:bg-opacity-90">
                <i className="fa-solid fa-wallet"></i> Kết Nối Ví
              </div>
            </button>
            <button className="xl:hidden text-forest-900 text-2xl p-2">
              <i className="fa-solid fa-bars"></i>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow pt-24 pb-16">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">

          {/* Search Header */}
          <div className="mb-10 flex flex-col lg:flex-row gap-6 lg:items-center justify-between">
            <div className="flex-1 max-w-2xl">
              <h1 className="font-serif text-3xl font-bold text-forest-900 mb-4">Tra Cứu Nguồn Gốc</h1>
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Nhập mã lô (VD: LOT-8492), TxHash, hoặc quét QR..."
                  className="w-full pl-12 pr-32 py-4 rounded-xl border border-coffee-300 bg-white/80 backdrop-blur-sm text-forest-900 placeholder-forest-400 focus:outline-none focus:border-forest-500 focus:ring-2 focus:ring-forest-500/20 transition-all shadow-sm"
                />
                <i className="fa-solid fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-forest-400"></i>
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                  <button
                    onClick={handleQrScan}
                    className="w-10 h-10 rounded-lg bg-coffee-50 text-forest-600 hover:bg-coffee-100 transition-colors flex items-center justify-center"
                  >
                    <i className="fa-solid fa-qrcode"></i>
                  </button>
                  <button
                    onClick={handleSearch}
                    className="px-4 py-2 rounded-lg bg-forest-900 text-white font-medium text-sm hover:bg-forest-800 transition-colors"
                  >
                    Tra Cứu
                  </button>
                </div>
              </div>
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-20">
              <i className="fa-solid fa-circle-notch fa-spin text-forest-500 text-3xl"></i>
            </div>
          )}

          {!loading && lotData && (
            <div className="flex flex-col lg:flex-row gap-8">

              {/* Left Column: Timeline */}
              <div className="flex-1">

                {/* Lot Summary */}
                <div className="glass-panel p-6 rounded-[1rem] border border-coffee-200/50 shadow-sm mb-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-forest-100 rounded-full blur-3xl opacity-50 transform translate-x-1/2 -translate-y-1/2"></div>
                  <div className="flex flex-col md:flex-row justify-between gap-6 relative z-10">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-2xl font-bold text-forest-900">Lô #{lotData.id}</h2>
                        <span className="px-3 py-1 bg-forest-100 text-forest-700 text-xs font-semibold rounded-full border border-forest-200">{lotData.status}</span>
                      </div>
                      <p className="text-forest-600 text-sm mb-4">{lotData.name} • {lotData.region}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div>
                          <p className="text-xs text-forest-500 mb-1">Khối Lượng</p>
                          <p className="font-semibold text-forest-900">{lotData.weight}</p>
                        </div>
                        <div>
                          <p className="text-xs text-forest-500 mb-1">Giống Cà Phê</p>
                          <p className="font-semibold text-forest-900">{lotData.variety}</p>
                        </div>
                        <div>
                          <p className="text-xs text-forest-500 mb-1">Ngày Thu Hoạch</p>
                          <p className="font-semibold text-forest-900">{lotData.harvestDate}</p>
                        </div>
                        <div>
                          <p className="text-xs text-forest-500 mb-1">Độ Ẩm</p>
                          <p className="font-semibold text-forest-900">{lotData.humidity}</p>
                        </div>
                      </div>
                    </div>
                    <div className="md:w-48 flex-shrink-0 flex flex-col items-center justify-center p-4 bg-white/60 rounded-xl border border-coffee-100">
                      <img
                        className="w-24 h-24 object-contain mb-3"
                        src={lotData.qrCodeUrl}
                        alt="QR Code lô hàng"
                      />
                      <button className="text-xs font-medium text-forest-600 hover:text-forest-900 flex items-center gap-1">
                        <i className="fa-solid fa-download"></i> Tải QR Code
                      </button>
                    </div>
                  </div>
                </div>

                {/* Timeline Explorer */}
                <div className="relative pl-4 md:pl-10">
                  {/* Animated Flow Line */}
                  <div className="absolute left-[39px] md:left-[63px] top-6 bottom-10 w-0.5 bg-coffee-200 z-0"></div>
                  <svg
                    className="absolute left-[39px] md:left-[63px] top-6 bottom-10 w-0.5 h-full z-0 overflow-visible pointer-events-none"
                    preserveAspectRatio="none"
                  >
                    <line x1="0" y1="0" x2="0" y2="100%" className="dash-flow" stroke="#4A9D7D" strokeWidth="2" />
                  </svg>

                  {/* Render TimelineItem nodes sắp xếp theo thời gian */}
                  {sortedTimeline.map((item, index) => (
                    <TimelineItem
                      key={item.id}
                      item={{
                        ...item,
                        isLast: index === sortedTimeline.length - 1,
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Right Column: Filters Sidebar */}
              <div className="w-full lg:w-[320px] flex-shrink-0">
                <div className="glass-panel rounded-[1rem] border border-coffee-200/50 shadow-sm p-6 sticky top-24">
                  <h3 className="font-bold text-forest-900 text-lg mb-4">Lọc Thông Tin</h3>

                  <div className="space-y-6">
                    {/* Stage Filter */}
                    <div>
                      <label className="block text-xs font-medium text-forest-600 mb-2 uppercase tracking-wider">Trạng Thái Giai Đoạn</label>
                      <div className="space-y-2">
                        {[
                          { key: "all", label: "Tất cả giai đoạn" },
                          { key: "harvest", label: "Thu hoạch" },
                          { key: "processing", label: "Sơ chế" },
                          { key: "transport", label: "Vận chuyển" },
                          { key: "roasting", label: "Rang xay & Đóng gói" },
                        ].map(({ key, label }) => (
                          <label key={key} className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={stageFilters[key]}
                              onChange={() =>
                                setStageFilters((prev) => ({ ...prev, [key]: !prev[key] }))
                              }
                              className="w-4 h-4 rounded border-coffee-300 text-forest-600 focus:ring-forest-500"
                            />
                            <span className="text-sm text-forest-800">{label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Doc Filter */}
                    <div>
                      <label className="block text-xs font-medium text-forest-600 mb-2 uppercase tracking-wider">Tài Liệu Đính Kèm</label>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { key: "all", label: "Tất cả" },
                          { key: "cert", label: "Chứng nhận" },
                          { key: "image", label: "Hình ảnh" },
                          { key: "log", label: "Nhật ký" },
                        ].map(({ key, label }) => (
                          <button
                            key={key}
                            onClick={() => setDocFilter(key)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                              docFilter === key
                                ? "bg-forest-900 text-white"
                                : "bg-white border border-coffee-200 text-forest-700 hover:bg-coffee-50"
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Sort */}
                    <div>
                      <label className="block text-xs font-medium text-forest-600 mb-2 uppercase tracking-wider">Sắp Xếp</label>
                      <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-coffee-200 bg-white text-sm text-forest-800 focus:outline-none focus:border-forest-500"
                      >
                        <option value="newest">Mới nhất trước</option>
                        <option value="oldest">Cũ nhất trước</option>
                      </select>
                    </div>
                  </div>

                  {/* Verify Button */}
                  <div className="mt-8 pt-6 border-t border-coffee-200/50">
                    <button className="w-full relative group overflow-hidden rounded-xl p-[1px]">
                      <span className="absolute inset-0 bg-gradient-to-r from-forest-400 via-coffee-400 to-forest-600 rounded-xl opacity-70 group-hover:opacity-100 transition-opacity"></span>
                      <div className="relative flex items-center justify-center gap-2 px-6 py-3 bg-forest-900 text-white rounded-xl font-medium text-sm transition-all group-hover:bg-opacity-90">
                        <i className="fa-solid fa-shield-check"></i> Xác Thực Toàn Bộ Lô
                      </div>
                    </button>
                    <p className="text-[10px] text-center text-forest-500 mt-2">Dữ liệu được lưu trữ bất biến trên Blockchain</p>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-forest-900 text-forest-200 pt-20 pb-10 border-t border-forest-800 mt-auto">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
            <div className="lg:col-span-2">
              <a href="#" className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-forest-800 flex items-center justify-center">
                  <i className="fa-solid fa-seedling text-coffee-300 text-xl"></i>
                </div>
                <span className="font-serif text-2xl font-bold text-white tracking-tight">ROBUSTRACE</span>
              </a>
              <p className="text-forest-300 text-sm leading-relaxed max-w-sm mb-6">
                Nền tảng truy xuất nguồn gốc cà phê ứng dụng công nghệ Blockchain, minh bạch hóa chuỗi cung ứng và nâng tầm giá trị nông sản Việt.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-forest-800 flex items-center justify-center hover:bg-coffee-400 hover:text-forest-900 transition-colors"><i className="fa-brands fa-twitter"></i></a>
                <a href="#" className="w-10 h-10 rounded-full bg-forest-800 flex items-center justify-center hover:bg-coffee-400 hover:text-forest-900 transition-colors"><i className="fa-brands fa-linkedin-in"></i></a>
                <a href="#" className="w-10 h-10 rounded-full bg-forest-800 flex items-center justify-center hover:bg-coffee-400 hover:text-forest-900 transition-colors"><i className="fa-brands fa-github"></i></a>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-6 uppercase tracking-wider text-sm">Sản phẩm</h4>
              <ul className="space-y-4 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Trang Chủ</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Bảng Điều Khiển</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Tra Cứu Lô Hàng</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Kết Nối Ví</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-6 uppercase tracking-wider text-sm">Giải pháp</h4>
              <ul className="space-y-4 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Cho Nông Dân</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cho Nhà Rang Xay</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cho Doanh Nghiệp</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Smart Contracts</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-6 uppercase tracking-wider text-sm">Tài nguyên</h4>
              <ul className="space-y-4 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Tài liệu API</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Hướng dẫn sử dụng</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Hỗ trợ</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-forest-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-forest-400">
            <p>&copy; 2026 ROBUSTRACE. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition-colors">Chính sách bảo mật</a>
              <a href="#" className="hover:text-white transition-colors">Điều khoản dịch vụ</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Explorer;