import { useState } from "react";
import { CreateBatchForm } from "./CreateBatchForm";
import { BatchList } from "../Common/BatchList";
import { BatchGridView } from "../Common/BatchGridView";
import { COLORS } from "../../constants/colors";
import { WorkspaceHeader } from "../Common/WorkspaceHeader";

export default function FarmerWorkspaceActions({ lots, setLots, loading, error, view, setView, search, setSearch, handleOpenDetail, fetchMyBatches }) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filter, setFilter] = useState("all");

  const handleCreateSuccess = () => {
    setShowCreateForm(false);
    if (fetchMyBatches) fetchMyBatches();
  };

  const filtered = lots.filter(l => {
    const matchesFilter = filter === "all" || l.status === filter;
    const code = l.traceability_node || l.traceability_code || "";
    const variety = l.plant_variety || "";

    return matchesFilter && (
      code.toLowerCase().includes(search.toLowerCase()) ||
      variety.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-coffee-100 pb-6">
        <WorkspaceHeader 
            role="FARMER"
            desc="Quản lý, khai báo thông tin thu hoạch và khởi tạo nguồn gốc nông sản nông hộ"
        />
        {!showCreateForm && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-5 py-2.5 rounded-xl font-semibold text-white text-sm flex items-center gap-2 transition-all hover:opacity-90 shadow-md shadow-forest-900/10 self-start md:self-auto"
            style={{ background: COLORS.forest900 }}
          >
            <i className="fa-solid fa-plus text-xs" /> Tạo Lô Cà Phê Mới
          </button>
        )}
      </div>

      {/* Create Batch Form */}
      {showCreateForm && (
        <div className="p-1 rounded-2xl bg-white border border-coffee-200 shadow-sm animate-fadeIn">
          <CreateBatchForm
            lots={lots}
            setLots={setLots}
            onSuccess={handleCreateSuccess}
            setShowCreateForm={setShowCreateForm}
          />
        </div>
      )}

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-stretch gap-3">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Tìm kiếm mã chuỗi truy xuất, giống cà phê..."
          className="flex-1 px-4 py-2 rounded-xl text-sm outline-none shadow-sm border bg-white"
          style={{ borderColor: COLORS.coffee200 }}
        />

        <div className="w-full sm:w-48 flex">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl text-sm font-semibold transition-all bg-white cursor-pointer focus:outline-none focus:ring-1"
            style={{
              color: COLORS.forest700,
              border: `1px solid ${COLORS.coffee200}`,
              borderColor: filter !== "all" ? COLORS.forest900 : COLORS.coffee200,
            }}
          >
            {[
              { id: "all", label: "Tất cả trạng thái" },
              { id: "INITIAL", label: "Mới khởi tạo" },
              { id: "HARVESTED", label: "Đã thu hoạch" },
              { id: "PRE_PROCESSED", label: "Chờ HTX tiếp quản" },
              { id: "REJECTED", label: "Bị trả về" },
            ].map(f => (
              <option key={f.id} value={f.id} className="text-gray-900 bg-white">
                {f.label}
              </option>
            ))}
          </select>
        </div>

        {/* GRID/LIST Button */}
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

      {/* Batch Data */}
      {loading ? (
        <div className="text-center py-12 text-sm" style={{ color: COLORS.coffee600 }}>
          Đang tải danh sách lô hàng từ cơ sở dữ liệu chuỗi cung ứng...
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl text-sm text-red-700 bg-red-50 border border-red-200">
          <strong>Lỗi hệ thống:</strong> {error}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-sm border-2 border-dashed rounded-2xl bg-white" style={{ borderColor: COLORS.coffee200, color: COLORS.coffee600 }}>
          Không tìm thấy lô hàng nào phù hợp với điều kiện lọc hiện tại.
        </div>
      ) : view === "list" ? (
        <BatchList batches={filtered} handleOpenDetail={handleOpenDetail} />
      ) : (
        <BatchGridView batches={filtered} handleOpenDetail={handleOpenDetail} />
      )}
    </div>
  );
}