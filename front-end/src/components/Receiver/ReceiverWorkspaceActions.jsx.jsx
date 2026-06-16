import { useState } from "react";
import { BatchList } from "../Common/BatchList";
import { BatchGridView } from "../Common/BatchGridView";
import { COLORS } from "../../constants/colors";
import { WorkspaceHeader } from "../Common/WorkspaceHeader";

export default function ReceiverWorkspaceActions({ 
    lots, 
    loading, 
    error, 
    view, 
    setView, 
    search, 
    setSearch, 
    handleOpenDetail,
    onImportDeclare, // Hàm mở modal thông quan hải quan nhập khẩu
}) {
    const [activeTab, setActiveTab] = useState("pending");

    // Lọc danh sách lô hàng theo đặc thù luồng của Nhà Nhập Khẩu (Receiver)

    console.log(lots);
    
    const filtered = lots.filter(l => {
        // Chờ xử lý = Đang được vận chuyển hoặc Exporter đã bàn giao ký nhận (EXPORTED)
        // Đã xử lý = Toàn bộ chuỗi cung ứng khép kín hoàn tất (COMPLETED)
        const matchesTab = activeTab === "pending"
            ? l.status === "EXPORTED"
            : l.status === "COMPLETED";

        const code = l.traceability_node || l.traceability_code || "";
        const variety = l.plant_variety || "";
        const matchesSearch = code.toLowerCase().includes(search.toLowerCase()) ||
            variety.toLowerCase().includes(search.toLowerCase());

        return matchesTab && matchesSearch;
    });

    const pendingCount = lots.filter(l => l.status === "EXPORTED").length;

    return (
        <div className="space-y-6">
            {/* Header thông tin vai trò Receiver */}
            <WorkspaceHeader
                role="RECEIVER"
                desc={"Tiếp nhận vận đơn quốc tế, kiểm tra đối chiếu mã chuỗi, thực hiện thông quan bến cảng đích và xác nhận nhập kho thành phẩm."}
            />

            {/* Hệ thống Tabs trạng thái */}
            <div className="flex border-b border-coffee-200 gap-6">
                <button
                    onClick={() => setActiveTab("pending")}
                    className={`pb-3 text-sm font-semibold transition-all relative flex items-center gap-2 ${
                        activeTab === "pending" ? "text-forest-900" : "text-gray-400 hover:text-forest-700"
                    }`}
                >
                    Lô Hàng Đang Cập Cảng
                    {pendingCount > 0 && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700 font-bold animate-pulse">
                            {pendingCount}
                        </span>
                    )}
                    {activeTab === "pending" && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style={{ background: COLORS.forest900 }} />
                    )}
                </button>

                <button
                    onClick={() => setActiveTab("handled")}
                    className={`pb-3 text-sm font-semibold transition-all relative ${
                        activeTab === "handled" ? "text-forest-900" : "text-gray-400 hover:text-forest-700"
                    }`}
                >
                    Kho Hàng Đã Nhập
                    {activeTab === "handled" && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style={{ background: COLORS.forest900 }} />
                    )}
                </button>
            </div>

            {/* Bộ lọc tìm kiếm */}
            <div className="flex flex-col sm:flex-row sm:items-stretch gap-3">
                <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Tìm kiếm mã chuỗi, số hiệu container, cảng đích..."
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

            {/* Khối danh sách hiển thị */}
            {loading ? (
                <div className="text-center py-12 text-sm" style={{ color: COLORS.coffee600 }}>
                    Đang quét dữ liệu tờ khai nhập khẩu và luồng vận đơn on-chain...
                </div>
            ) : error ? (
                <div className="p-4 rounded-xl text-sm text-red-700 bg-red-50 border border-red-200">
                    <strong>Lỗi hệ thống tiếp nhận:</strong> {error}
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-16 rounded-2xl bg-white border border-dashed flex flex-col items-center justify-center p-6" style={{ borderColor: COLORS.coffee200 }}>
                    <span className="text-3xl mb-2">{activeTab === "pending" ? "⚓" : "🏢"}</span>
                    <p className="text-sm font-medium" style={{ color: COLORS.coffee600 }}>
                        {activeTab === "pending"
                            ? "Hiện không có kiện container nào đang neo đậu chờ thông quan."
                            : "Kho tổng trống. Bạn chưa thực hiện lệnh nhập kho cho lô hàng nào."}
                    </p>
                </div>
            ) : view === "list" ? (
                <BatchList 
                    batches={filtered} 
                    handleOpenDetail={handleOpenDetail}
                    actionType={activeTab === "pending" ? "RECEIVE_ACTION" : "DONE"}
                    onActionOne={onImportDeclare}
                />
            ) : (
                <BatchGridView 
                    batches={filtered} 
                    handleOpenDetail={handleOpenDetail}
                    actionType={activeTab === "pending" ? "RECEIVE_ACTION" : "DONE"}
                    onActionOne={onImportDeclare}
                />
            )}
        </div>
    );
}