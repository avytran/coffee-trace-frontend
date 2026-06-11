import { useState } from "react";

const LOTS_DATA = [
  { id: "LOT-2026-01A", type: "Arabica - Washed", weight: "1,500 kg", status: "completed", time: "2 giờ trước" },
  { id: "LOT-2026-02B", type: "Robusta - Natural", weight: "1,200 kg", status: "processing", time: "1 ngày trước" },
  { id: "LOT-2026-03C", type: "Arabica - Honey",  weight: "800 kg",   status: "completed", time: "3 ngày trước" },
  { id: "LOT-2026-04D", type: "Robusta - Washed", weight: "2,000 kg", status: "pending",   time: "5 ngày trước" },
];

const C = {
  coffee50:  "#FDF8F5", coffee100: "#F7EBE1", coffee200: "#EED5C1",
  coffee300: "#E4BEA0", coffee400: "#DDB892", coffee500: "#B08968",
  coffee600: "#9C6644", coffee700: "#7F5539", coffee800: "#5C3A21", coffee900: "#4A2E1B",
  forest50:  "#F2F7F5", forest100: "#E1EFE8", forest200: "#C4DFD2",
  forest300: "#9BCCB7", forest400: "#6CB297", forest500: "#4A9D7D",
  forest600: "#357F63", forest700: "#2A6550", forest800: "#245242", forest900: "#1B4332",
};

const Card = ({ children, className = "" }) => (
  <div className={`rounded-2xl ${className}`}
    style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(221,184,146,0.3)",
      boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
    {children}
  </div>
);
 
const StatCard = ({ icon, label, value, sub, color = C.forest500 }) => (
  <Card className="p-5 flex flex-col gap-3">
    <div className="flex items-center justify-between">
      <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: C.coffee600 }}>{label}</span>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm"
        style={{ background: color }}>{icon}</div>
    </div>
    <div className="text-3xl font-bold" style={{ color: C.forest900 }}>{value}</div>
    {sub && <div className="text-xs" style={{ color: C.coffee600 }}>{sub}</div>}
  </Card>
);

const Badge = ({ status }) => {
  const map = {
    pending:    { bg: "#FDF8F5", color: "#9C6644", border: "#EED5C1", label: "Chờ xử lý" },
    processing: { bg: "#F2F7F5", color: "#4A9D7D", border: "#C4DFD2", label: "Đang xử lý" },
    completed:  { bg: "#E1EFE8", color: "#1B4332", border: "#9BCCB7", label: "Đã hoàn thành" },
    signed:     { bg: "#E1EFE8", color: "#1B4332", border: "#9BCCB7", label: "Đã ký" },
    cancelled:  { bg: "#FEF2F2", color: "#991B1B", border: "#FECACA", label: "Đã hủy" },
  };
  const s = map[status] || map.pending;
  return (
    <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}
      className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold">
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
      {s.label}
    </span>
  );
};

export default function BatchesPage  ({ setPage }) {
  const [view, setView] = useState("list");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
 
  const filtered = LOTS_DATA.filter(l =>
    (filter === "all" || l.status === filter) &&
    (l.id.toLowerCase().includes(search.toLowerCase()) || l.type.toLowerCase().includes(search.toLowerCase()))
  );
 
  return (
    <div className="pt-10-- pb-16 px-4 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: C.forest900, fontFamily: "'Playfair Display',serif" }}>
            Quản Lý Lô Hàng
          </h1>
          <p className="text-sm mt-1" style={{ color: C.coffee600 }}>67 lô hàng · cập nhật vừa xong</p>
        </div>
        <button className="px-5 py-2.5 rounded-xl font-semibold text-white text-sm"
          style={{ background: C.forest900 }}>➕ Tạo Lô Mới</button>
      </div>
 
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Tìm kiếm mã lô, loại cà phê..."
          className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none"
          style={{ border: `1px solid ${C.coffee200}`, background: "white" }} />
        <div className="flex gap-2">
          {[
            { id: "all", label: "Tất cả" },
            { id: "pending", label: "Chờ xử lý" },
            { id: "processing", label: "Đang xử lý" },
            { id: "completed", label: "Hoàn thành" },
          ].map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              className="px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all"
              style={{ background: filter === f.id ? C.forest900 : "white",
                color: filter === f.id ? "white" : C.forest700,
                border: `1px solid ${filter === f.id ? C.forest900 : C.coffee200}` }}>
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: C.coffee100 }}>
          {["list","grid"].map(v => (
            <button key={v} onClick={() => setView(v)}
              className="px-3 py-1.5 rounded-lg text-sm transition-all"
              style={{ background: view === v ? "white" : "transparent", color: C.forest900 }}>
              {v === "list" ? "☰" : "⊞"}
            </button>
          ))}
        </div>
      </div>
 
      {view === "list" ? (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: C.coffee50, color: C.coffee600 }} className="text-xs uppercase tracking-wider">
                  <th className="p-4 text-left">Mã Lô</th>
                  <th className="p-4 text-left">Loại Cà Phê</th>
                  <th className="p-4 text-left">Khối Lượng</th>
                  <th className="p-4 text-left">Trạng Thái</th>
                  <th className="p-4 text-left">Cập Nhật</th>
                  <th className="p-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(l => (
                  <tr key={l.id} className="border-b hover:bg-green-50/30 transition-colors cursor-pointer"
                    style={{ borderColor: C.coffee100 }}
                    onClick={() => setPage("detail")}>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs"
                          style={{ background: C.forest100, color: C.forest600 }}>📦</div>
                        <span className="font-medium text-sm" style={{ color: C.forest900 }}>{l.id}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm" style={{ color: C.forest700 }}>{l.type}</td>
                    <td className="p-4 text-sm font-medium" style={{ color: C.forest900 }}>{l.weight}</td>
                    <td className="p-4"><Badge status={l.status} /></td>
                    <td className="p-4 text-xs" style={{ color: C.coffee600 }}>{l.time}</td>
                    <td className="p-4 text-right">
                      <div className="flex gap-1 justify-end" onClick={e => e.stopPropagation()}>
                        <button className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                          style={{ background: C.forest100, color: C.forest900 }}
                          onClick={() => setPage("detail")}>Xem</button>
                        <button className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                          style={{ background: C.coffee100, color: C.coffee700 }}
                          onClick={() => setPage("sign")}>Ký</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(l => (
            <Card key={l.id} className="p-5 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setPage("detail")}>
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                  style={{ background: C.forest100 }}>📦</div>
                <Badge status={l.status} />
              </div>
              <div className="font-bold text-sm mb-1" style={{ color: C.forest900 }}>{l.id}</div>
              <div className="text-xs mb-2" style={{ color: C.coffee600 }}>{l.type}</div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold" style={{ color: C.forest900 }}>{l.weight}</span>
                <span className="text-xs" style={{ color: C.coffee500 }}>{l.time}</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
