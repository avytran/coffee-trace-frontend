import React, { useState } from "react";
import { ethers } from "ethers";
import axiosInstance from "../../utils/axiosInstance";
import { COLORS } from "../../constants/colors";
import { getContractABI, getContractAddress } from "../../config/contracts";
import { FileInput } from "../Common/FileInput";
import TransferNextOwnerModal from "../Common/TransferNextOwnerModal";

const contractAbi = getContractABI("BATCH_REGISTRY");
const contractAddress = getContractAddress("BATCH_REGISTRY");

export default function CoopBatchActions({ lotInfo, onRefresh }) {
    console.log(lotInfo?.owner.role);

    const [loading, setLoading] = useState(false);

    // Trạng thái hiển thị Modals
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showTransferModal, setShowTransferModal] = useState(false);

    // Form dữ liệu phê duyệt
    const [approveData, setApproveData] = useState({
        moisture: "",
        impurity: "",
        broken_ratio: "",
        cupping_score: "80",
        document_desc: "",
        ipfs_file: null
    });

    // Form dữ liệu từ chối
    const [rejectData, setRejectData] = useState({
        reason: "",
        document_desc: "",
        ipfs_file: null
    });

    // Form dữ liệu chuyển giao Nhà chế biến
    const [transferData, setTransferData] = useState({
        document_desc: "Vận đơn bàn giao nhà chế biến sâu",
        ipfs_file: null
    });

    // =========================================================================
    // 🟢 LUỒNG 1: PHÊ DUYỆT LÔ HÀNG (TUYẾN TÍNH - KHÔNG DÙNG ONCE EVENT)
    // =========================================================================
    const handleApproveSubmit = async (e) => {
        if (e && e.preventDefault) e.preventDefault();

        if (!approveData.moisture || !approveData.impurity || !approveData.broken_ratio || !approveData.cupping_score) {
            alert("Vui lòng nhập đầy đủ tất cả các thông số kiểm định chất lượng hạt!");
            return;
        }

        setLoading(true);
        try {
            // Bước 1: Đẩy dữ liệu và tệp lên IPFS qua API Backend
            const formDataPayload = new FormData();
            formDataPayload.append("batch_id", lotInfo.id);
            formDataPayload.append("moisture", parseFloat(approveData.moisture));
            formDataPayload.append("impurity", parseFloat(approveData.impurity));
            formDataPayload.append("broken_ratio", parseFloat(approveData.broken_ratio));
            formDataPayload.append("cupping_score", parseFloat(approveData.cupping_score));
            formDataPayload.append("document_desc", approveData.document_desc);
            if (approveData.ipfs_file) {
                formDataPayload.append("ipfs_file", approveData.ipfs_file);
            }

            console.log("📡 1. Đang đẩy dữ liệu kiểm định lên IPFS qua Backend...");
            const ipfsResponse = await axiosInstance.post('/cooperative/batches/approve-ipfs', formDataPayload);
            const serverPayload = ipfsResponse.data.data;

            // Khởi tạo kết nối Blockchain bằng Ethers.js v6
            if (!window.ethereum) throw new Error("Không tìm thấy tiện ích MetaMask!");
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(contractAddress, contractAbi, signer);

            // Bước 2: Kích hoạt ký và gửi giao dịch On-chain lên Smart Contract
            console.log("🔗 2. Đang mở MetaMask yêu cầu ký phê duyệt trạng thái mới...");
            const tx = await contract.updateBatchStatus(lotInfo.id, 4);

            console.log(`⏳ Giao dịch phê duyệt đang được khai thác... TxHash: ${tx.hash}`);
            const txReceipt = await tx.wait(); // Đợi block được đào thành công
            console.log("⛏️ Block phê duyệt đã được đào thành công!");

            const finalTxHash = txReceipt ? txReceipt.hash : tx.hash;

            // Bước 3: Đồng bộ kết quả trực tiếp xuống cơ sở dữ liệu PostgreSQL
            console.log("💾 3. Tiến hành đồng bộ kết quả phê duyệt vào PostgreSQL...");
            try {
                await axiosInstance.post('/cooperative/batches/save-approve-db', {
                    batchId: lotInfo.id,
                    status: 2, // PROCESSED
                    moisture: serverPayload.moisture,
                    impurity: serverPayload.impurity,
                    broken_ratio: serverPayload.broken_ratio,
                    cupping_score: serverPayload.cupping_score,
                    ipfsCid: serverPayload.ipfsCid,
                    txHash: finalTxHash
                });

                alert(`🎉 Lô hàng #${lotInfo.id} đã được phê duyệt on-chain và đồng bộ hệ thống thành công!`);
                setShowApproveModal(false);
                onRefresh();
            } catch (dbErr) {
                console.error("❌ Thất bại khi ghi nhận vào PostgreSQL:", dbErr);
                alert(`Giao dịch Blockchain thành công (${finalTxHash}) nhưng DB local lỗi đồng bộ: ${dbErr.response?.data?.message || dbErr.message}`);
            }

        } catch (err) {
            console.error("❌ Lỗi luồng phê duyệt lô hàng:", err);
            alert(`❌ Lỗi phê duyệt: ${err.response?.data?.message || err.message}`);
        } finally {
            setLoading(false);
        }
    };

    // =========================================================================
    // 🔴 LUỒNG 2: TỪ CHỐI LÔ HÀNG (TUYẾN TÍNH - KHÔNG DÙNG ONCE EVENT)
    // =========================================================================
    const handleRejectSubmit = async (e) => {
        if (e && e.preventDefault) e.preventDefault();

        if (!rejectData.reason.trim()) {
            alert("Vui lòng nhập rõ lý do trả về để nông dân có cơ sở chỉnh sửa!");
            return;
        }

        setLoading(true);
        try {
            // Bước 1: Đẩy lý do và tài liệu minh chứng lỗi lên mạng lưới IPFS
            const formDataPayload = new FormData();
            formDataPayload.append("batch_id", lotInfo.id);
            formDataPayload.append("reject_reason", rejectData.reason.trim());
            formDataPayload.append("document_desc", rejectData.document_desc);
            if (rejectData.ipfs_file) {
                formDataPayload.append("ipfs_file", rejectData.ipfs_file);
            }

            console.log("📡 1. Đang đẩy minh chứng lỗi lên IPFS qua Backend...");
            const ipfsResponse = await axiosInstance.post('/cooperative/batches/reject-ipfs', formDataPayload);
            const serverPayload = ipfsResponse.data.data;

            if (!window.ethereum) throw new Error("Không tìm thấy tiện ích MetaMask!");
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(contractAddress, contractAbi, signer);

            // Bước 2: Ký xác thực hủy bỏ và chuyển trạng thái trên mạng Blockchain
            console.log("🔗 2. Đang mở MetaMask yêu cầu ký xác nhận hủy bỏ...");
            const tx = await contract.updateBatchStatus(lotInfo.id, 3);

            console.log(`⏳ Giao dịch từ chối đang được khai thác... TxHash: ${tx.hash}`);
            const txReceipt = await tx.wait(); // Đợi đào block thành công
            console.log("⛏️ Block từ chối đã được đào thành công!");

            const finalTxHash = txReceipt ? txReceipt.hash : tx.hash;

            // Bước 3: Đồng bộ trạng thái và lý do hủy bỏ vào PostgreSQL
            console.log("💾 3. Tiến hành cập nhật lý do từ chối vào PostgreSQL...");
            try {
                await axiosInstance.post('/cooperative/batches/save-reject-db', {
                    batchId: lotInfo.id,
                    status: 3, // REJECTED
                    rejectReason: serverPayload.rejectReason,
                    ipfsCid: serverPayload.ipfsCid,
                    txHash: finalTxHash
                });

                alert(`❌ Lô hàng #${lotInfo.id} đã bị từ chối và trả về cho nông dân thành công.`);
                setShowRejectModal(false);
                onRefresh();
            } catch (dbErr) {
                console.error("❌ Thất bại khi ghi nhận vào PostgreSQL:", dbErr);
                alert(`Hủy lô hàng on-chain thành công (${finalTxHash}) nhưng DB gặp lỗi đồng bộ.`);
            }

        } catch (err) {
            console.error("❌ Lỗi luồng từ chối lô hàng:", err);
            alert(`❌ Lỗi từ chối: ${err.response?.data?.message || err.message}`);
        } finally {
            setLoading(false);
        }
    };

    // =========================================================================
    // 🔵 LUỒNG 3: CHUYỂN GIAO NHÀ CHẾ BIẾN (TUYẾN TÍNH - KHÔNG DÙNG ONCE EVENT)
    // =========================================================================
    const handleTransferSubmit = async (targetProcessor) => {
        if (!targetProcessor || !targetProcessor.id || !targetProcessor.wallet_address) {
            alert("Vui lòng chọn Nhà chế biến tiếp nhận hợp lệ từ danh sách!");
            return;
        }

        setLoading(true);
        try {
            // ── BƯỚC 1: ĐẨY BIÊN BẢN / VẬN ĐƠN BÀN GIAO LÊN IPFS ──
            const formDataPayload = new FormData();
            formDataPayload.append("batch_id", lotInfo.id);
            formDataPayload.append("processor_id", targetProcessor.id);
            formDataPayload.append("document_desc", transferData.document_desc);
            if (transferData.ipfs_file) {
                formDataPayload.append("ipfs_file", transferData.ipfs_file);
            }

            console.log("📡 1. Đang đẩy dữ liệu bàn giao lên IPFS qua Backend...");
            const ipfsResponse = await axiosInstance.post('/cooperative/batches/transfer-ipfs', formDataPayload);
            const serverPayload = ipfsResponse.data.data;

            if (!window.ethereum) throw new Error("Không tìm thấy tiện ích MetaMask!");
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(contractAddress, contractAbi, signer);

            // ── BƯỚC 2: THỰC THI GIAO DỊCH TRÊN BLOCKCHAIN ──

            // A. Cập nhật trạng thái lô hàng sang TRADING (Index: 4)
            console.log("🔗 2a. Đang gọi MetaMask cập nhật trạng thái lô hàng (TRADING)...");
            const txStatus = await contract.updateBatchStatus(lotInfo.id, 4);
            await txStatus.wait();

            // B. Chuyển quyền sở hữu tài sản (Wallet Address) sang Nhà chế biến
            console.log(`🔗 2b. Đang ký chuyển quyền sở hữu sang ví: ${targetProcessor.wallet_address}...`);
            const txOwnership = await contract.transferBatchOwnership(lotInfo.id, targetProcessor.wallet_address);

            console.log(`⏳ Giao dịch đổi chủ đang được khai thác... TxHash: ${txOwnership.hash}`);
            const receipt = await txOwnership.wait();
            console.log("⛏️ Khai thác khối chuyển giao tài sản thành công!");

            const realTxHash = receipt ? receipt.hash : txOwnership.hash;

            // ── BƯỚC 3: ĐỒNG BỘ TOÀN BỘ DỮ LIỆU VỀ POSTGRESQL LOCAL ──
            console.log("💾 3. Tiến hành đồng bộ lịch sử bàn giao vào PostgreSQL...");
            try {
                await axiosInstance.post('/cooperative/batches/save-transfer-db', {
                    batchId: lotInfo.id,
                    status: "TRADING",
                    processorId: targetProcessor.id,
                    ipfsCid: serverPayload.ipfsCid,
                    txHash: realTxHash
                });

                alert(`🎉 Đã bàn giao thành công lô hàng sang Nhà chế biến: ${targetProcessor.name}`);
                setShowTransferModal(false);
                onRefresh();
            } catch (dbErr) {
                console.error("❌ Thất bại khi ghi nhận vào PostgreSQL:", dbErr);
                alert(`On-chain bàn giao thành công (${realTxHash}) nhưng lỗi đồng bộ cơ sở dữ liệu local.`);
            }

        } catch (err) {
            console.error("❌ Lỗi luồng bàn giao sang Nhà chế biến:", err);
            alert(`❌ Lỗi chuyển giao: ${err.response?.data?.message || err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* ── THANH HÀNH ĐỘNG CỦA HỢP TÁC XÃ ── */}
            <div className="flex items-center gap-2 animate-fadeIn">
                {lotInfo?.status === "PRE_PROCESSED" && (
                    <>
                        <button
                            disabled={loading}
                            onClick={() => setShowRejectModal(true)}
                            className="px-4 py-2 rounded-xl text-xs font-bold text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 transition-all shadow-xs disabled:opacity-50"
                        >
                            Từ Chối
                        </button>

                        <button
                            disabled={loading}
                            onClick={() => setShowApproveModal(true)}
                            className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md shadow-emerald-900/10 hover:opacity-90 transition-all bg-emerald-600 disabled:opacity-50"
                        >
                            Phê Duyệt
                        </button>
                    </>
                )}

                {lotInfo?.status === "PROCESSED" && lotInfo?.owner.role === "COOPERATIVE" && (
                    <button
                        disabled={loading}
                        onClick={() => setShowTransferModal(true)}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90 shadow-md disabled:opacity-50"
                        style={{ background: COLORS.coffee600 }}
                    >
                        Chuyển giao Nhà chế biến
                    </button>
                )}
            </div>

            {/* ================= 🟢 MODAL: PHÊ DUYỆT LÔ HÀNG ================= */}
            {showApproveModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
                    <div className="absolute inset-0" onClick={() => !loading && setShowApproveModal(false)}></div>
                    <div className="relative z-10 bg-white rounded-2xl max-w-md w-full border shadow-xl overflow-hidden animate-scaleUp" style={{ borderColor: COLORS.coffee200 }}>
                        <div className="p-5 border-b flex justify-between items-center bg-gray-50" style={{ borderColor: COLORS.coffee100 }}>
                            <h3 className="font-bold text-base text-emerald-800">Biên Bản Kiểm Định Chất Lượng</h3>
                            <button type="button" disabled={loading} onClick={() => setShowApproveModal(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold p-1">×</button>
                        </div>
                        <form onSubmit={handleApproveSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-bold uppercase text-gray-700 mb-1">Độ ẩm (%) *</label>
                                    <input type="number" step="0.01" required placeholder="12.5" value={approveData.moisture} onChange={e => setApproveData(prev => ({ ...prev, moisture: e.target.value }))} disabled={loading} className="w-full bg-white border text-sm rounded-xl p-2.5 outline-none focus:ring-1 focus:ring-emerald-600 disabled:bg-gray-100" style={{ borderColor: COLORS.coffee300 }} />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold uppercase text-gray-700 mb-1">Tạp chất (%) *</label>
                                    <input type="number" step="0.01" required placeholder="0.2" value={approveData.impurity} onChange={e => setApproveData(prev => ({ ...prev, impurity: e.target.value }))} disabled={loading} className="w-full bg-white border text-sm rounded-xl p-2.5 outline-none focus:ring-1 focus:ring-emerald-600 disabled:bg-gray-100" style={{ borderColor: COLORS.coffee300 }} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-bold uppercase text-gray-700 mb-1">Tỷ lệ hạt vỡ (%) *</label>
                                    <input type="number" step="0.01" required placeholder="1.0" value={approveData.broken_ratio} onChange={e => setApproveData(prev => ({ ...prev, broken_ratio: e.target.value }))} disabled={loading} className="w-full bg-white border text-sm rounded-xl p-2.5 outline-none focus:ring-1 focus:ring-emerald-600 disabled:bg-gray-100" style={{ borderColor: COLORS.coffee300 }} />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold uppercase text-gray-700 mb-1">Cupping Score (SCA) *</label>
                                    <input type="number" step="0.25" required value={approveData.cupping_score} onChange={e => setApproveData(prev => ({ ...prev, cupping_score: e.target.value }))} disabled={loading} className="w-full bg-white border text-sm rounded-xl p-2.5 outline-none focus:ring-1 focus:ring-emerald-600 font-semibold disabled:bg-gray-100" style={{ borderColor: COLORS.coffee300 }} />
                                </div>
                            </div>
                            <FileInput label="Chứng nhận chất lượng" loading={loading} onFileChange={(e) => setApproveData(prev => ({ ...prev, ipfs_file: e.target.files[0] }))} onFileDescChange={e => setApproveData(prev => ({ ...prev, document_desc: e.target.value }))} value={approveData.document_desc} />
                            <div className="pt-4 flex items-center justify-end gap-3 border-t" style={{ borderColor: COLORS.coffee100 }}>
                                <button type="button" onClick={() => setShowApproveModal(false)} disabled={loading} className="px-4 py-2 rounded-xl text-xs font-semibold border text-gray-600 bg-white hover:bg-gray-50">Hủy</button>
                                <button type="submit" disabled={loading} className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:opacity-90 disabled:opacity-50">{loading ? "Đang xử lý..." : "Xác Nhận Phê Duyệt"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ================= 🔴 MODAL: TỪ CHỐI LÔ HÀNG ================= */}
            {showRejectModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
                    <div className="absolute inset-0" onClick={() => !loading && setShowRejectModal(false)}></div>
                    <div className="relative z-10 bg-white rounded-2xl max-w-md w-full border shadow-xl overflow-hidden animate-scaleUp" style={{ borderColor: COLORS.coffee200 }}>
                        <div className="p-5 border-b flex justify-between items-center bg-gray-50" style={{ borderColor: COLORS.coffee100 }}>
                            <h3 className="font-bold text-base text-red-800">Trả Về Lô Hàng Khỏi Chuỗi</h3>
                            <button type="button" disabled={loading} onClick={() => setShowRejectModal(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold p-1">×</button>
                        </div>
                        <form onSubmit={handleRejectSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-700 mb-1.5">Lý do từ chối *</label>
                                <textarea required rows="3" disabled={loading} placeholder="Nhập chi tiết lý do..." value={rejectData.reason} onChange={e => setRejectData(prev => ({ ...prev, reason: e.target.value }))} className="w-full bg-white border text-gray-900 text-sm rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-red-500 resize-none disabled:bg-gray-100" style={{ borderColor: COLORS.coffee300 }} />
                            </div>
                            <FileInput label="Biên bản lỗi hàng" loading={loading} onFileChange={(e) => setRejectData(prev => ({ ...prev, ipfs_file: e.target.files[0] }))} onFileDescChange={e => setRejectData(prev => ({ ...prev, document_desc: e.target.value }))} value={rejectData.document_desc} />
                            <div className="pt-4 flex items-center justify-end gap-3 border-t" style={{ borderColor: COLORS.coffee100 }}>
                                <button type="button" onClick={() => setShowRejectModal(false)} disabled={loading} className="px-4 py-2 rounded-xl text-xs font-semibold border text-gray-600 bg-white hover:bg-gray-50">Hủy</button>
                                <button type="submit" disabled={loading || !rejectData.reason.trim()} className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50">{loading ? "Đang xử lý..." : "Xác Nhận Trả Về"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ================= 🔵 MODAL: CHUYỂN GIAO NHÀ CHẾ BIẾN ================= */}
            {showTransferModal && (
                <TransferNextOwnerModal
                    lotInfo={lotInfo}
                    loading={loading}
                    onClose={() => setShowTransferModal(false)}
                    onSuccess={handleTransferSubmit}
                    title="Bàn Giao Lô Hàng Cho Nhà Chế Biến"
                    fetchTargetUrl="/users?role=PROCESSOR"
                    targetLabel="Chọn Nhà Chế Biến Tiếp Nhận"
                    placeholder="-- Chọn Nhà Chế Biến --"
                    primaryColor={COLORS.coffee600}
                    onFileChange={(file) => setTransferData(prev => ({ ...prev, ipfs_file: file }))}
                    onFileDescChange={(desc) => setTransferData(prev => ({ ...prev, document_desc: desc }))}
                    fileDescValue={transferData.document_desc}
                />
            )}
        </>
    );
}