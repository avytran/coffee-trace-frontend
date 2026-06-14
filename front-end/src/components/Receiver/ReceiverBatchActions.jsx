import React, { useState } from "react";
import { ethers } from "ethers";
import axiosInstance from "../../utils/axiosInstance";
import { COLORS } from "../../constants/colors";
import { getContractABI, getContractAddress } from "../../config/contracts";
import { FileInput } from "../Common/FileInput";

const contractAbi = getContractABI("BATCH_REGISTRY");
const contractAddress = getContractAddress("BATCH_REGISTRY");

export default function ReceiverBatchActions({ lotInfo, onRefresh }) {
    const [loading, setLoading] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);

    // Chỉ giữ lại thông tin tài liệu và file để đẩy lên IPFS
    const [importData, setImportData] = useState({
        document_desc: "Tờ khai thông quan nhập khẩu & Chứng nhận nghiệm thu kết thúc chuỗi cung ứng",
        ipfs_file: null
    });

    // =========================================================================
    // ⚙️ THỰC THI THÔNG QUAN & HOÀN THÀNH CHUỖI CUNG ỨNG (IMPORT & COMPLETE)
    // =========================================================================
    const handleImportSubmit = async (e) => {
        if (e && e.preventDefault) e.preventDefault();

        if (!importData.ipfs_file) {
            alert("Vui lòng tải lên tài liệu nghiệm thu / tờ khai thông quan để tiếp tục!");
            return;
        }

        setLoading(true);
        try {
            // Bước 1: Chỉ đẩy duy nhất batch_id và tệp chứng từ đính kèm lên IPFS
            const formDataPayload = new FormData();
            formDataPayload.append("batch_id", lotInfo.id);
            formDataPayload.append("document_desc", importData.document_desc);
            formDataPayload.append("ipfs_file", importData.ipfs_file);

            console.log("📡 1. Đang tải tệp hồ sơ thông quan nghiệm thu lên IPFS...");
            const ipfsResponse = await axiosInstance.post('/receiver/batches/import-ipfs', formDataPayload);
            const serverPayload = ipfsResponse.data.data;

            // Kiểm tra ví Web3
            if (!window.ethereum) throw new Error("Không tìm thấy tiện ích ví MetaMask!");
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(contractAddress, contractAbi, signer);

            // Bước 2: Ký xác thực trạng thái kết thúc hành trình (COMPLETED - Index 7)
            console.log("🔗 2. Đang mở MetaMask xác nhận đóng chuỗi trạng thái (COMPLETED)...");
            const tx = await contract.updateBatchStatus(lotInfo.id, 7); 

            console.log(`⏳ Giao dịch đang được khai thác trên Blockchain... TxHash: ${tx.hash}`);
            const txReceipt = await tx.wait();
            const finalTxHash = txReceipt ? txReceipt.hash : tx.hash;
            console.log("⛏️ Blockchain đã xác nhận đóng chuỗi cung ứng!");

            // Bước 3: Lưu trữ dữ liệu tinh gọn xuống PostgreSQL cục bộ
            console.log("💾 3. Đồng bộ mã IPFS và thông tin trạng thái về DB local...");
            try {
                await axiosInstance.post('/receiver/batches/save-import-db', {
                    batchId: lotInfo.id,
                    status: "COMPLETED",
                    ipfsCid: serverPayload.ipfsCid || serverPayload.ipfs_cid || ipfsResponse.data?.ipfsCid,
                    txHash: finalTxHash
                });

                alert(`🎉 Lô hàng #${lotInfo.id} đã đóng chuỗi và hoàn tất hành trình truy xuất nguồn gốc!`);
                setShowImportModal(false);
                onRefresh();
            } catch (dbErr) {
                console.error("❌ Lỗi đồng bộ hóa dữ liệu PostgreSQL:", dbErr);
                alert(`Giao dịch Web3 thành công (${finalTxHash}) nhưng database nội bộ chưa được đồng bộ.`);
            }

        } catch (err) {
            console.error("❌ Lỗi luồng thực thi nhập khẩu:", err);
            alert(`❌ Lỗi hệ thống: ${err.response?.data?.message || err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* ── THANH BẤM HÀNH ĐỘNG CỦA RECEIVER ── */}
            <div className="flex items-center gap-2 animate-fadeIn">
                {/* Lô hàng ở trạng thái EXPORTED chờ Receiver xác nhận nghiệm thu */}
                {lotInfo?.status === "EXPORTED" && (
                    <button
                        disabled={loading}
                        onClick={() => setShowImportModal(true)}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md shadow-blue-900/10 hover:opacity-90 transition-all bg-blue-600 disabled:opacity-50"
                    >
                        ⚓ Nghiệm Thu & Nhập Kho
                    </button>
                )}

                {/* Nếu trạng thái đã hoàn thành */}
                {lotInfo?.status === "COMPLETED" && (
                    <span className="px-3 py-1.5 bg-gray-100 text-gray-500 rounded-xl text-xs font-semibold border border-gray-200">
                        🔒 Chuỗi Cung Ứng Hoàn Tất
                    </span>
                )}
            </div>

            {/* ================= ⚓ MODAL: CHỈ ĐÍNH KÈM CHỨNG TỪ & BATCH_ID ================= */}
            {showImportModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
                    <div className="absolute inset-0" onClick={() => !loading && setShowImportModal(false)}></div>
                    <div className="relative z-10 bg-white rounded-2xl max-w-md w-full border shadow-xl overflow-hidden" style={{ borderColor: COLORS.coffee200 }}>
                        <div className="p-5 border-b flex justify-between items-center bg-gray-50" style={{ borderColor: COLORS.coffee100 }}>
                            <h3 className="font-bold text-base text-blue-800">Xác Nhận Nghiệm Thu Lô Hàng</h3>
                            <button type="button" disabled={loading} onClick={() => setShowImportModal(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold p-1">×</button>
                        </div>
                        <form onSubmit={handleImportSubmit} className="p-6 space-y-4">
                            
                            <div className="bg-gray-50 p-3.5 rounded-xl border border-dashed border-gray-200">
                                <p className="text-[11px] font-semibold text-gray-500 uppercase">Mã lô hàng đang xử lý</p>
                                <p className="text-xs font-mono font-bold text-gray-800 break-all mt-0.5">{lotInfo.id}</p>
                            </div>

                            <FileInput 
                                label="Tải lên biên bản thông quan / kiểm định nhập kho (PDF/Image) *" 
                                loading={loading} 
                                onFileChange={(e) => setImportData(prev => ({ ...prev, ipfs_file: e.target.files[0] }))} 
                                onFileDescChange={e => setImportData(prev => ({ ...prev, document_desc: e.target.value }))} 
                                value={importData.document_desc} 
                            />

                            <div className="pt-4 flex items-center justify-end gap-3 border-t" style={{ borderColor: COLORS.coffee100 }}>
                                <button type="button" onClick={() => setShowImportModal(false)} disabled={loading} className="px-4 py-2 rounded-xl text-xs font-semibold border text-gray-600 bg-white hover:bg-gray-50">Hủy</button>
                                <button type="submit" disabled={loading} className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:opacity-90 disabled:opacity-50">{loading ? "Đang Khóa Chuỗi..." : "Xác Nhận Đóng Chuỗi"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}