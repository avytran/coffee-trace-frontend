import { useState, useRef } from "react";
import TimelineItem from "../../components/Traceability/TimelineItem/TimelineItem";
import axiosInstance from "../../utils/axiosInstance";
import "./Explorer.css";

const Explorer = () => {
    const [query, setQuery] = useState("");
    const [lotData, setLotData] = useState(null); 
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [sortOrder, setSortOrder] = useState("newest");
    const inputRef = useRef(null);

    /**
     * ── 🛡️ BỘ LỌC VÀ KIỂM SOÁT INPUT TRƯỚC KHI GỬI (VALIDATION) ─────────────────
     */
    const validateInput = (input) => {
        const cleanInput = input.trim();

        if (!cleanInput) {
            return { isValid: false, message: "Vui lòng nhập mã lô hàng hoặc TxHash để tra cứu!" };
        }

        // 1. Regex kiểm tra UUID v4 (Mã định danh lô hàng chuẩn quốc tế)
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        
        // 2. Regex kiểm tra TxHash Blockchain (Ethereum/Sepolia chuẩn 66 ký tự)
        const txHashRegex = /^0x[0-9a-f]{64}$/i;

        // 3. Regex kiểm tra mã lô rút gọn tùy chỉnh nội bộ (Ví dụ: LOT-8492 hoặc chuỗi chữ-số từ 4-12 ký tự)
        const customLotRegex = /^(LOT-\d+|\w{4,12})$/i;

        // Tiến hành đối soát dữ liệu đầu vào
        if (uuidRegex.test(cleanInput)) {
            return { isValid: true, type: "UUID", value: cleanInput };
        }
        if (txHashRegex.test(cleanInput)) {
            return { isValid: true, type: "TXHASH", value: cleanInput };
        }
        if (customLotRegex.test(cleanInput)) {
            return { isValid: true, type: "CUSTOM_LOT", value: cleanInput.toUpperCase() };
        }

        // Trả về cảnh báo nếu không trùng khớp bất cứ định dạng an toàn nào
        return { 
            isValid: false, 
            message: "Định dạng không hợp lệ! Vui lòng nhập đúng mã UUID lô hàng, chuỗi ký tự hợp lệ, hoặc TxHash bắt đầu bằng '0x'." 
        };
    };

    // ── Gọi API lấy dữ liệu thực từ hệ thống ─────────────────────────────────
    const fetchLotData = async (targetId) => {
        // Thực thi kiểm soát đầu vào nghiêm ngặt
        const validation = validateInput(targetId);
        
        if (!validation.isValid) {
            setError(validation.message);
            // Kích hoạt hiệu ứng lắc nhẹ thanh input hoặc focus để người dùng nhận biết
            inputRef.current?.focus();
            return;
        }

        setLoading(true);
        setError(null);
        
        try {
            // Sử dụng giá trị đã được làm sạch và chuẩn hóa hóa chữ hoa/thường từ bộ validation
            const res = await axiosInstance.get(`/public/lots/${validation.value}`);
            setLotData(res.data);
        } catch (err) {
            console.error("❌ Lỗi tra cứu chuỗi:", err);
            setLotData(null);
            setError(
                err.response?.data?.message || 
                "Không tìm thấy thông tin trên mạng lưới. Có thể lô hàng chưa được đồng bộ on-chain."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => fetchLotData(query);

    const handleKeyDown = (e) => {
        if (e.key === "Enter") handleSearch();
    };

    // ── Chức năng tải xuống QR Code trực tiếp từ giao diện ────────────────────
    const handleDownloadQR = () => {
        if (!lotData?.qrCodeUrl) return;
        const link = document.createElement("a");
        link.href = lotData.qrCodeUrl;
        link.download = `QR_Code_Batch_${lotData.id}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // ── Xử lý đảo chiều Timeline động theo lựa chọn bộ lọc ─────────────────
    const sortedTimeline = lotData?.timeline
        ? [...lotData.timeline].sort((a, b) => {
              const parseDate = (dStr) => new Date(dStr.split("/").reverse().join("-"));
              return sortOrder === "newest" ? parseDate(b.date) - parseDate(a.date) : parseDate(a.date) - parseDate(b.date);
          })
        : [];

    return (
        <div className="m-0 p-0 bg-coffee-50 text-forest-900 font-sans relative overflow-x-hidden min-h-screen flex flex-col">
            <div className="fixed inset-0 pointer-events-none z-[-1] bg-grain mix-blend-multiply opacity-50"></div>

            <main className="flex-grow pt-10 pb-16">
                <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
                    
                    {/* Thanh công cụ tìm kiếm chính */}
                    <div className="mb-10 flex flex-col lg:flex-row gap-6 lg:items-center justify-between">
                        <div className="flex-1 max-w-2xl">
                            <h1 className="text-3xl font-bold text-forest-900 mb-4">Tra Cứu Chuỗi Cung Ứng Cà Phê</h1>
                            <div className="relative">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={query}
                                    onChange={(e) => {
                                        setQuery(e.target.value);
                                        if (error) setError(null); // Xóa thông báo lỗi ngay khi người dùng gõ lại
                                    }}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Dán mã định danh UUID, mã lô (LOT-xxxx), hoặc TxHash Blockchain..."
                                    className={`w-full pl-12 pr-32 py-4 rounded-xl border bg-white/80 backdrop-blur-sm text-forest-900 focus:outline-none focus:ring-2 transition-all shadow-sm ${
                                        error ? "border-red-400 focus:ring-red-500/20" : "border-coffee-300 focus:border-forest-500 focus:ring-forest-500/20"
                                    }`}
                                />
                                <i className={`fa-solid fa-search absolute left-4 top-1/2 transform -translate-y-1/2 ${error ? "text-red-400" : "text-forest-400"}`}></i>
                                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                                    <button
                                        onClick={handleSearch}
                                        className="px-5 py-2 rounded-lg bg-emerald-700 text-white font-bold text-sm hover:bg-emerald-800 transition-colors shadow-xs"
                                    >
                                        Tra Cứu
                                    </button>
                                </div>
                            </div>
                            {error && (
                                <p className="text-red-500 font-semibold text-xs mt-2.5 animate-headShake">
                                    ⚠️ {error}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Màn hình chờ: Khi người dùng chưa thực hiện hành động tra cứu */}
                    {!loading && !lotData && !error && (
                        <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-coffee-200 rounded-2xl bg-white/40">
                            <i className="fa-solid fa-shield-search text-coffee-300 text-5xl mb-4 animate-pulse"></i>
                            <h3 className="font-bold text-base text-forest-800">Sẵn Sàng Minh Bạch Chuỗi Giá Trị</h3>
                            <p className="text-xs text-forest-500 max-w-sm mt-1">Hãy cung cấp mã định danh duy nhất của lô hàng để kết xuất dữ liệu chứng thực nguồn gốc.</p>
                        </div>
                    )}

                    {/* Hiệu ứng nạp dữ liệu */}
                    {loading && (
                        <div className="flex items-center justify-center py-20">
                            <i className="fa-solid fa-circle-notch fa-spin text-emerald-600 text-3xl"></i>
                        </div>
                    )}

                    {/* Render thông tin động sau khi có kết quả trả về */}
                    {!loading && lotData && (
                        <div className="flex flex-col lg:flex-row gap-8">
                            
                            {/* Cột trái: Hiển thị Timeline cốt lõi */}
                            <div className="flex-1">
                                
                                {/* Khối Tổng Overview Lô Hàng */}
                                <div className="glass-panel p-6 rounded-[1rem] border border-coffee-200/50 shadow-sm mb-8 relative overflow-hidden bg-white">
                                    <div className="flex flex-col md:flex-row justify-between gap-6 relative z-10">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <h2 className="text-xl font-mono font-bold text-forest-900">Mã Lô: #{lotData.id.slice(0, 8)}...</h2>
                                                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200 uppercase tracking-wider">{lotData.status}</span>
                                            </div>
                                            <p className="text-forest-600 text-sm font-semibold mb-4">{lotData.name} • <span className="text-gray-500 font-normal">{lotData.region}</span></p>
                                            
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-2">
                                                <div>
                                                    <p className="text-[11px] font-bold text-forest-400 uppercase">Khối Lượng</p>
                                                    <p className="font-bold text-sm text-forest-900 mt-0.5">{lotData.weight}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[11px] font-bold text-forest-400 uppercase">Giống Cà Phê</p>
                                                    <p className="font-bold text-sm text-forest-900 mt-0.5">{lotData.variety}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[11px] font-bold text-forest-400 uppercase">Ngày Thu Hoạch</p>
                                                    <p className="font-bold text-sm text-forest-900 mt-0.5">{lotData.harvestDate}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[11px] font-bold text-forest-400 uppercase">Độ Ẩm Gốc</p>
                                                    <p className="font-bold text-sm text-forest-900 mt-0.5">{lotData.humidity}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Khối sinh QR Code và Download */}
                                        <div className="md:w-44 flex-shrink-0 flex flex-col items-center justify-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                                            <img className="w-24 h-24 object-contain bg-white p-1 rounded-md border shadow-2xs mb-2" src={lotData.qrCodeUrl} alt="Hệ thống QR" />
                                            <button onClick={handleDownloadQR} className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 transition-colors">
                                                <i className="fa-solid fa-download"></i> Lưu Mã QR
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Khối Dòng chảy thời gian cốt lõi */}
                                <div className="relative pl-4 md:pl-10">
                                    <div className="absolute left-[39px] md:left-[63px] top-6 bottom-10 w-0.5 bg-coffee-200 z-0"></div>
                                    
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
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Explorer;