import { useState, useEffect } from "react";
import { BatchList } from "../Common/BatchList";
import { BatchGridView } from "../Common/BatchGridView";
import { COLORS } from "../../constants/colors";
import { WorkspaceHeader } from "../Common/WorkspaceHeader";
import LoadingSpinner from "../Common/LoadingSpinner";
import { NotificationModal } from "../Common/NotificationModal";
import { parseWeb3Error } from "../../utils/errorHandler";

export default function ProcessorWorkspaceActions({ lots, loading, error, view, setView, search, setSearch, handleOpenDetail }) {
    const [activeTab, setActiveTab] = useState("pending");
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        title: "",
        message: "",
        type: "success",
        callback: null
    });

    useEffect(() => {
        if (error) {
            const parsedError = parseWeb3Error(error);
            setModalConfig({
                isOpen: true,
                title: parsedError.title || "Lỗi Hệ Thống",
                message: parsedError.message || String(error),
                type: "error",
                callback: null
            });
        }
    }, [error]);

    const handleCloseModal = () => {
        setModalConfig(prev => ({ ...prev, isOpen: false }));
        if (modalConfig.callback) {
            modalConfig.callback();
        }
    };

    const filtered = lots.filter(l => {
        const matchesTab = activeTab === "pending"
            ? l.status === "PROCESSED" 
            : ["ASSESSED", "EXPORTED", "COMPLETED"].includes(l.status); 

        const code = l.traceability_node || l.traceability_code || "";
        const variety = l.plant_variety || "";
        const matchesSearch = code.toLowerCase().includes(search.toLowerCase()) ||
            variety.toLowerCase().includes(search.toLowerCase());

        return matchesTab && matchesSearch;
    });

    const pendingCount = lots.filter(l => l.status === "PRE_PROCESSED").length;

    return (
        <div className="space-y-6 relative">
            {loading && <LoadingSpinner loadingStatus="Đang truy vấn dữ liệu chế biến từ mạng lưới..." />}

            <WorkspaceHeader
                role="PROCESSOR"
                desc={"Tiếp nhận lô hàng, thiết lập thông số mẻ rang và ghi nhận kết quả đánh giá cảm quan chất lượng hạt cà phê."}
            />

            <div className="flex border-b border-coffee-200 gap-6">
                <button
                    onClick={() => setActiveTab("pending")}
                    className={`pb-3 text-sm font-semibold transition-all relative flex items-center gap-2 ${activeTab === "pending" ? "text-forest-900" : "text-gray-400 hover:text-forest-700"
                        }`}
                >
                    Lô Hàng Chờ Rang
                    {pendingCount > 0 && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-600 font-bold animate-pulse">
                            {pendingCount}
                        </span>
                    )}
                    {activeTab === "pending" && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style={{ background: COLORS.forest900 }} />
                    )}
                </button>

                <button
                    onClick={() => setActiveTab("handled")}
                    className={`pb-3 text-sm font-semibold transition-all relative ${activeTab === "handled" ? "text-forest-900" : "text-gray-400 hover:text-forest-700"
                        }`}
                >
                    Đã Xử Lý
                    {activeTab === "handled" && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style={{ background: COLORS.forest900 }} />
                    )}
                </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-stretch gap-3">
                <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Tìm kiếm mã chuỗi truy xuất, giống cà phê..."
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none shadow-sm border bg-white"
                    style={{ borderColor: COLORS.coffee200 }}
                />

                <div className="flex items-center gap-1 p-1 rounded-xl shadow-sm self-end sm:self-auto" style={{ background: COLORS.coffee100 }}>
                    {["list", "grid"].map(v => (
                        <button
                            key={v}
                            onClick={() => setView(v)}
                            className="px-4 h-full flex items-center justify-center rounded-lg text-sm transition-all font-medium"
                            style={{
                                background: view === v ? "white" : "transparent",
                                color: COLORS.forest900,
                                boxShadow: view === v ? "0 1px 3px rgba(0,0,0,0.1)" : "none"
                            }}
                        >
                            {v === "list" ? "☰" : "⊞"}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12 text-sm" style={{ color: COLORS.coffee600 }}>
                    Đang truy vấn danh sách dữ liệu từ chuỗi cung ứng...
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-16 rounded-2xl bg-white border border-dashed flex flex-col items-center justify-center p-6" style={{ borderColor: COLORS.coffee200 }}>
                    <p className="text-sm font-medium" style={{ color: COLORS.coffee600 }}>
                        {activeTab === "pending"
                            ? "Tuyệt vời! Hiện tại không có lô hàng nào đang chờ chế biến."
                            : "Thư mục lịch sử trống. Bạn chưa thực hiện thao tác chế biến lô hàng nào."}
                    </p>
                </div>
            ) : view === "list" ? (
                <BatchList batches={filtered} handleOpenDetail={handleOpenDetail} />
            ) : (
                <BatchGridView batches={filtered} handleOpenDetail={handleOpenDetail} />
            )}

            <NotificationModal
                isOpen={modalConfig.isOpen}
                onClose={handleCloseModal}
                title={modalConfig.title}
                message={modalConfig.message}
                type={modalConfig.type}
            />
        </div>
    );
}