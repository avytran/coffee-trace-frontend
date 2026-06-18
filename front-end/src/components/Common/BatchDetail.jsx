import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { Card } from "./Card";
import { Badge } from "./Badge";
import { COLORS } from "../../constants/colors";
import { PINATA_GATEWAY } from "../../constants/pinata";

export function BatchDetail({ batchId, onBack, actionComponent }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lotInfo, setLotInfo] = useState(null);
  const [extendedDetails, setExtendedDetails] = useState(null);

  const fetchBatchDetailData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get(`/batch/${batchId}`);

      if (response.data.success) {
        const fullData = response.data.data;
        setLotInfo(fullData);

        setExtendedDetails({
          location: fullData.cultivation_bio || "Đà Lạt, Lâm Đồng",
          workspaceId: `WS-ACTOR-${fullData.owner_id?.substring(0, 4)}`,
          technicalInfo: {
            coordinates: `Lat: ${fullData.latitude || "0"}° N, Long: ${fullData.longitude || "0"}° E`,
            altitude: `${fullData.altitude || "1500"}m`,
            cultivation_info: fullData.cultivation_bio || "Canh tác hữu cơ theo tiêu chuẩn nghiêm ngặt.",
            cooperative: fullData.actor_engagements?.[0]?.coop?.name || null,
            harvest_time: fullData.cafe_batch_details?.[0]?.harvest_time || null,
            harvest_method: fullData.cafe_batch_details?.[0]?.harvest_method || null
          },
          documents: fullData.documents || [],
          ledgerHistory: (fullData.batch_events || []).map(evt => ({
            id: evt.id,
            action: evt.event_type,
            date: new Date(evt.created_at).toLocaleDateString("vi-VN"),
            time: new Date(evt.created_at).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' }),
            actorName: evt.user?.name || "Thành viên chuỗi",
            actorRole: evt.user?.role || "Actor",
            txHash: evt.event_data?.txHash || "N/A"
          })).reverse()
        });
      }
    } catch (err) {
      console.error("❌ Thất bại khi đồng bộ chi tiết lô hàng:", err);
      setError(err.response?.data?.message || "Không thể tải cấu trúc dữ liệu Sổ cái.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (batchId) fetchBatchDetailData();
  }, [batchId]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-24 gap-3">
        <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: `${COLORS.forest500} ${COLORS.forest100} ${COLORS.forest100} ${COLORS.forest100}` }}></div>
        <p className="text-sm font-medium animate-pulse" style={{ color: COLORS.forest700 }}>Đang truy xuất dữ liệu sổ cái bất biến...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-center max-w-xl mx-auto my-12">
        <p className="text-red-700 font-semibold mb-4">⚠️ Lỗi: {error}</p>
        <button onClick={onBack} className="px-4 py-2 bg-gray-800 text-white text-xs font-bold rounded-xl">Quay Lại Danh Sách</button>
      </div>
    );
  }

  return (
    <div className="text-forest-900 animate-fadeIn relative">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border mb-6 shadow-sm" style={{ borderColor: COLORS.coffee200 }}>
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:opacity-80"
            style={{ background: COLORS.forest50, color: COLORS.forest900 }}
          >
            <span className="text-lg font-bold">←</span>
          </button>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: COLORS.forest900 }}>
              Chi Tiết Lô Hàng: {lotInfo?.traceability_node || lotInfo?.traceability_code}
            </h1>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs" style={{ color: COLORS.coffee600 }}>
              <span className="font-mono">ID: {batchId}</span>
              <span className="w-1 h-1 rounded-full bg-gray-300"></span>
              <span>Khởi tạo: {new Date(lotInfo?.created_at).toLocaleString("vi-VN")}</span>
            </div>
          </div>
        </div>

        {/* 🛠️ KHU VỰC ĐỘNG: Render Nút bấm & Modal của từng Role truyền vào */}
        <div className="flex items-center gap-3 self-end sm:center">
          {actionComponent && React.cloneElement(actionComponent, { lotInfo, extendedDetails, onRefresh: fetchBatchDetailData })}
          <Badge status={lotInfo?.status} />
        </div>
      </div>

      {/* Layout lưới hiển thị thông tin tĩnh */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Cột trái */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="p-6 bg-white border" style={{ borderColor: COLORS.coffee100 }}>
            <h3 className="text-base font-bold mb-4 pb-2 border-b flex items-center gap-2" style={{ color: COLORS.forest900, borderColor: COLORS.coffee100 }}>
              ℹ️ Thông Số Kỹ Thuật
            </h3>
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl border bg-gray-50/50" style={{ borderColor: COLORS.coffee100 }}>
                  <span className="block text-xs text-gray-400 mb-0.5">Giống cây trồng</span>
                  <span className="font-semibold" style={{ color: COLORS.forest900 }}>{lotInfo?.plant_variety}</span>
                </div>
                <div className="p-3 rounded-xl border bg-gray-50/50" style={{ borderColor: COLORS.coffee100 }}>
                  <span className="block text-xs text-gray-400 mb-0.5">Khối lượng ban đầu</span>
                  <span className="font-semibold" style={{ color: COLORS.forest900 }}>{lotInfo?.weight || "Chưa cân"}</span>
                </div>
              </div>

              {extendedDetails?.technicalInfo.harvest_time && (
                <div className="p-3 rounded-xl border bg-orange-50/30 border-l-4 border-l-amber-600 space-y-2" style={{ borderColor: COLORS.coffee100 }}>
                  <span className="block text-[11px] font-bold text-amber-800 uppercase tracking-wider">🌾 Dữ liệu thu hoạch chi tiết</span>
                  <div className="text-xs text-gray-700 space-y-1">
                    <div>Thời gian: <span className="font-mono font-semibold">{new Date(extendedDetails.technicalInfo.harvest_time).toLocaleString("vi-VN")}</span></div>
                    <div>Phương pháp: <span className="font-semibold">{extendedDetails.technicalInfo.harvest_method}</span></div>
                  </div>
                </div>
              )}

              {extendedDetails?.technicalInfo.cooperative && (
                <div className="p-3 rounded-xl border bg-emerald-50/40 border-l-4 border-l-emerald-600" style={{ borderColor: COLORS.forest200 }}>
                  <span className="block text-[11px] font-bold text-emerald-700 uppercase tracking-wider mb-0.5">Hợp Tác Xã tiếp quản</span>
                  <span className="font-bold text-sm text-gray-800">{extendedDetails.technicalInfo.cooperative}</span>
                </div>
              )}

              <div className="p-3 rounded-xl border bg-gray-50/50" style={{ borderColor: COLORS.coffee100 }}>
                <span className="block text-xs text-gray-400 mb-1">Thông tin vùng trồng</span>
                <p className="text-xs text-gray-600 mb-1">Tọa độ: {extendedDetails?.technicalInfo.coordinates}</p>
                <p className="text-xs text-gray-600 mb-1">Cao độ vùng: {extendedDetails?.technicalInfo.altitude}</p>
                <p className="text-xs leading-relaxed text-gray-500">{extendedDetails?.technicalInfo.cultivation_info}</p>
              </div>
            </div>
          </Card>

          {/* Minh chứng IPFS */}
          <Card className="p-6 bg-white border" style={{ borderColor: COLORS.coffee100 }}>
            <h3 className="text-base font-bold mb-4 pb-2 border-b flex items-center gap-2" style={{ color: COLORS.forest900, borderColor: COLORS.coffee100 }}>
              📂 Minh Chứng Chuỗi Cung Ứng (IPFS)
            </h3>
            <div className="space-y-3">
              {extendedDetails?.documents.length === 0 ? (
                <p className="text-xs text-gray-400 italic py-2">Không tìm thấy tài liệu on-chain đính kèm lô hàng này.</p>
              ) : (
                extendedDetails?.documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 rounded-xl border bg-white" style={{ borderColor: COLORS.coffee200 }}>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-red-50 text-red-500 flex items-center justify-center font-bold text-xs">PDF</div>
                      <div>
                        <span className="block text-xs font-semibold text-gray-800 truncate max-w-[160px]">{doc.description || "Chung_nhan_Lô_Hang.pdf"}</span>
                        <span className="block text-[10px] text-gray-400 font-mono">CID: {doc.ipfs_cid ? `${doc.ipfs_cid.slice(0, 6)}...${doc.ipfs_cid.slice(-6)}` : "N/A"}</span>
                      </div>
                    </div>
                    {doc.ipfs_cid && (
                      <a href={`${PINATA_GATEWAY}${doc.ipfs_cid}`} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg text-xs font-bold border" style={{ color: COLORS.forest900, borderColor: COLORS.coffee300 }}>Xem ↗</a>
                    )}
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Cột phải: Nhật ký thời gian thực Blockchain */}
        <div className="lg:col-span-7">
          <Card className="p-6 bg-white border h-full" style={{ borderColor: COLORS.coffee100 }}>
            <h3 className="text-base font-bold mb-6 pb-2 border-b flex items-center justify-between" style={{ color: COLORS.forest900, borderColor: COLORS.coffee100 }}>
              <span>⛓️ Sổ Cái Bất Biến (Blockchain Ledger Timeline)</span>
            </h3>
            <div className="space-y-6 relative pl-2">
              {extendedDetails?.ledgerHistory.length === 0 ? (
                <p className="text-xs text-gray-400 italic">Chưa phát sinh bất kỳ sự kiện tương tác nào.</p>
              ) : (
                extendedDetails?.ledgerHistory.map((item, idx) => (
                  <div key={item.id} className="relative pl-6 pb-2 last:pb-0">
                    {idx !== extendedDetails.ledgerHistory.length - 1 && <div className="absolute left-[5px] top-4 bottom-0 w-0.5 bg-gray-200"></div>}
                    <div className="absolute left-0 top-1 w-3 h-3 rounded-full" style={{ background: COLORS.forest500 }}></div>
                    <div className="bg-gray-50/70 border rounded-xl p-4" style={{ borderColor: COLORS.coffee100 }}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-bold text-sm text-gray-900">🛠 {item.action}</h4>
                          <span className="text-[10px] text-gray-400">{item.time} • {item.date}</span>
                        </div>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">✓ Đã Ghi Block</span>
                      </div>
                      <div className="text-xs text-gray-500 flex flex-col gap-1 border-t pt-2" style={{ borderColor: COLORS.coffee100 }}>
                        <div>Ký biên bản: <span className="font-semibold text-gray-700">{item.actorName}</span> ({item.actorRole})</div>
                        <div className="font-mono text-[10px] text-gray-400 break-all">TxHash: <span className="text-gray-600 bg-white px-1.5 py-0.5 border rounded">{item.txHash}</span></div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}