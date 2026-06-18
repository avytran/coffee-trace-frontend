import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { FileInput } from "../Common/FileInput";

export default function TransferNextOwnerModal({ 
    lotInfo, 
    loading, 
    onClose, 
    onSuccess,
    title = "Chuyển Giao Quyền Sở Hữu Lô Hàng",
    fetchTargetUrl,
    targetLabel = "Chọn đối tác tiếp nhận",
    placeholder = "-- Chọn đơn vị tiếp nhận --",
    primaryColor = "#78350f"
}) {
    const [targets, setTargets] = useState([]);
    const [selectedTarget, setSelectedTarget] = useState({ id: "", name: "", wallet_address: "" });
    const [transferData, setTransferData] = useState({
        document_desc: "",
        ipfs_file: null
    });

    // Lấy danh sách đối tác dựa vào URL động truyền từ bên ngoài
    useEffect(() => {
        if (!fetchTargetUrl) return;
        const fetchTargets = async () => {
            try {
                const response = await axiosInstance.get(fetchTargetUrl);
                if (response.data?.success) {
                    setTargets(response.data.data);
                }
            } catch (err) {
                console.error("❌ Không thể tải danh sách đối tác tiếp nhận:", err);
            }
        };
        fetchTargets();
    }, [fetchTargetUrl]);

    console.log(targets);
    

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedTarget.id || !selectedTarget.wallet_address) {
            alert("Vui lòng chọn đối tác tiếp nhận và đảm bảo địa chỉ ví hợp lệ!");
            return;
        }
        onSuccess(selectedTarget, transferData);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
            <div className="absolute inset-0" onClick={() => !loading && onClose()}></div>
            <div className="relative z-10 bg-white rounded-2xl max-w-md w-full border shadow-xl overflow-hidden animate-scaleUp border-gray-200">
                
                {/* Header */}
                <div className="p-5 border-b flex justify-between items-center bg-gray-50 border-gray-100">
                    <h3 className="font-bold text-base text-gray-900" style={{ color: primaryColor }}>
                        {title}
                    </h3>
                    <button type="button" disabled={loading} onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-bold p-1">×</button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                            {targetLabel} <span className="text-red-500">*</span>
                        </label>
                        <select
                            required
                            value={selectedTarget.id}
                            onChange={(e) => {
                                const target = targets.find(t => t.id === e.target.value);
                                setSelectedTarget(target || { id: "", name: "", wallet_address: "" });
                            }}
                            disabled={loading}
                            className="w-full bg-white border border-gray-300 text-sm rounded-xl p-2.5 outline-none focus:ring-1 text-gray-800"
                            style={{ '--tw-ring-color': primaryColor }}
                        >
                            <option value="">{placeholder}</option>
                            {targets.map(item => (
                                <option key={item.id} value={item.id}>
                                    {item.name} ({item.wallet_address ? `${item.wallet_address.slice(0, 6)}...${item.wallet_address.slice(-4)}` : "Chưa có địa chỉ ví"})
                                </option>
                            ))}
                        </select>
                    </div>

                    <FileInput
                        label="Chứng từ đi kèm (Biên bản bàn giao / Vận đơn)"
                        loading={loading}
                        onFileChange={(e) => setTransferData(prev => ({ ...prev, ipfs_file: e.target.files[0] }))}
                        onFileDescChange={e => setTransferData(prev => ({ ...prev, document_desc: e.target.value }))}
                        value={transferData.document_desc}
                    />

                    {/* Footer Actions */}
                    <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
                        <button type="button" onClick={onClose} disabled={loading} className="px-4 py-2 rounded-xl text-xs font-semibold border text-gray-600 bg-white hover:bg-gray-50">
                            Hủy
                        </button>
                        <button 
                            type="submit" 
                            disabled={loading || !selectedTarget.wallet_address} 
                            className="px-5 py-2 rounded-xl text-xs font-bold text-white shadow-sm disabled:opacity-50 transition-all"
                            style={{ background: primaryColor }}
                        >
                            {loading ? "Đang xử lý hệ thống..." : "Xác Nhận Bàn Giao"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}