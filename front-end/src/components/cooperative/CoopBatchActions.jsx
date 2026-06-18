import React, { useState } from "react";
import { ethers } from "ethers";
import axiosInstance from "../../utils/axiosInstance";
import { COLORS } from "../../constants/colors";
import { getContractABI, getContractAddress } from "../../config/contracts";
import { FileInput } from "../Common/FileInput";
import TransferNextOwnerModal from "../Common/TransferNextOwnerModal";
import LoadingSpinner from "../Common/LoadingSpinner";
import { NotificationModal } from "../Common/NotificationModal";
import { parseWeb3Error } from "../../utils/errorHandler";

const contractAbi = getContractABI("BATCH_REGISTRY");
const contractAddress = getContractAddress("BATCH_REGISTRY");

export default function CoopBatchActions({ lotInfo, onRefresh }) {
    const [loading, setLoading] = useState(false);
    const [loadingStatus, setLoadingStatus] = useState("");

    const [notification, setNotification] = useState({
        isOpen: false,
        type: "success",
        title: "",
        message: ""
    });

    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showTransferModal, setShowTransferModal] = useState(false);

    const [approveData, setApproveData] = useState({
        moisture: "",
        impurity: "",
        broken_ratio: "",
        cupping_score: "80",
        document_desc: "",
        ipfs_file: null
    });

    const [rejectData, setRejectData] = useState({
        reason: "",
        document_desc: "",
        ipfs_file: null
    });

    const [transferData, setTransferData] = useState({
        document_desc: "Vận đơn bàn giao nhà chế biến sâu",
        ipfs_file: null
    });

    const triggerNotification = (type, title, message) => {
        setNotification({ isOpen: true, type, title, message });
    };

    const handleApproveSubmit = async (e) => {
        if (e && e.preventDefault) e.preventDefault();

        if (!approveData.moisture || !approveData.impurity || !approveData.broken_ratio || !approveData.cupping_score) {
            triggerNotification("error", "Thiếu thông tin", "Vui lòng nhập đầy đủ tất cả các thông số kiểm định chất lượng hạt!");
            return;
        }

        setLoading(true);
        setLoadingStatus("Đang tải dữ liệu kiểm định lên IPFS qua Hệ thống...");
        try {
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

            const ipfsResponse = await axiosInstance.post('/cooperative/batches/approve-ipfs', formDataPayload);
            const serverPayload = ipfsResponse.data.data;

            if (!window.ethereum) throw new Error("Không tìm thấy tiện ích MetaMask!");
            
            setLoadingStatus("Đang yêu cầu chữ ký xác thực từ ví Blockchain...");
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(contractAddress, contractAbi, signer);

            const tx = await contract.updateBatchStatus(lotInfo.id, 4);

            setLoadingStatus("Mạng lưới đang xác thực và khai thác khối giao dịch...");
            const txReceipt = await tx.wait();
            const finalTxHash = txReceipt ? txReceipt.hash : tx.hash;

            setLoadingStatus("Đồng bộ kết quả kiểm định vào cơ sở dữ liệu...");
            try {
                await axiosInstance.post('/cooperative/batches/save-approve-db', {
                    batchId: lotInfo.id,
                    status: 2,
                    moisture: serverPayload.moisture,
                    impurity: serverPayload.impurity,
                    broken_ratio: serverPayload.broken_ratio,
                    cupping_score: serverPayload.cupping_score,
                    ipfsCid: serverPayload.ipfsCid,
                    txHash: finalTxHash
                });

                setShowApproveModal(false);
                triggerNotification("success", "Thành công", `Lô hàng #${lotInfo.id} đã được phê duyệt on-chain và đồng bộ hệ thống thành công!`);
                onRefresh();
            } catch (dbErr) {
                const parsedError = parseWeb3Error(dbErr);
                triggerNotification("error", "Lỗi đồng bộ", `Giao dịch Blockchain thành công nhưng dữ liệu chưa đồng bộ. Chi tiết: ${parsedError.message}`);
            }

        } catch (err) {
            const parsedError = parseWeb3Error(err);
            triggerNotification(parsedError.type, parsedError.title, parsedError.message);
        } finally {
            setLoading(false);
            setLoadingStatus("");
        }
    };

    const handleRejectSubmit = async (e) => {
        if (e && e.preventDefault) e.preventDefault();

        if (!rejectData.reason.trim()) {
            triggerNotification("error", "Yêu cầu dữ liệu", "Vui lòng nhập rõ lý do trả về để nông dân có cơ sở chỉnh sửa!");
            return;
        }

        setLoading(true);
        setLoadingStatus("Đang tải dữ liệu minh chứng lên hệ thống dữ liệu IPFS...");
        try {
            const formDataPayload = new FormData();
            formDataPayload.append("batch_id", lotInfo.id);
            formDataPayload.append("reject_reason", rejectData.reason.trim());
            formDataPayload.append("document_desc", rejectData.document_desc);
            if (rejectData.ipfs_file) {
                formDataPayload.append("ipfs_file", rejectData.ipfs_file);
            }

            const ipfsResponse = await axiosInstance.post('/cooperative/batches/reject-ipfs', formDataPayload);
            const serverPayload = ipfsResponse.data.data;

            if (!window.ethereum) throw new Error("Không tìm thấy tiện ích MetaMask!");
            
            setLoadingStatus("Đang yêu cầu xác nhận hủy bỏ và ký giao dịch...");
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(contractAddress, contractAbi, signer);

            const tx = await contract.updateBatchStatus(lotInfo.id, 3);

            setLoadingStatus("Mạng lưới đang tiến hành xác minh hủy bỏ trạng thái...");
            const txReceipt = await tx.wait();
            const finalTxHash = txReceipt ? txReceipt.hash : tx.hash;

            setLoadingStatus("Đang ghi nhận dữ liệu từ chối vào cơ sở dữ liệu...");
            try {
                await axiosInstance.post('/cooperative/batches/save-reject-db', {
                    batchId: lotInfo.id,
                    status: 3,
                    rejectReason: serverPayload.rejectReason,
                    ipfsCid: serverPayload.ipfsCid,
                    txHash: finalTxHash
                });

                setShowRejectModal(false);
                triggerNotification("success", "Từ chối lô hàng", `Lô hàng #${lotInfo.id} đã bị từ chối và trả về cho nông dân thành công.`);
                onRefresh();
            } catch (dbErr) {
                const parsedError = parseWeb3Error(dbErr);
                triggerNotification("error", "Lỗi hệ thống", `Hủy lô hàng on-chain thành công nhưng lỗi đồng bộ. Chi tiết: ${parsedError.message}`);
            }

        } catch (err) {
            const parsedError = parseWeb3Error(err);
            triggerNotification(parsedError.type, parsedError.title, parsedError.message);
        } finally {
            setLoading(false);
            setLoadingStatus("");
        }
    };

    const handleTransferSubmit = async (targetProcessor) => {
        if (!targetProcessor || !targetProcessor.id || !targetProcessor.wallet_address) {
            triggerNotification("error", "Dữ liệu không hợp lệ", "Vui lòng chọn Nhà chế biến tiếp nhận hợp lệ từ danh sách!");
            return;
        }

        setLoading(true);
        setLoadingStatus("Đang đẩy vận đơn bàn giao lên mạng lưới IPFS...");
        try {
            const formDataPayload = new FormData();
            formDataPayload.append("batch_id", lotInfo.id);
            formDataPayload.append("processor_id", targetProcessor.id);
            formDataPayload.append("document_desc", transferData.document_desc);
            if (transferData.ipfs_file) {
                formDataPayload.append("ipfs_file", transferData.ipfs_file);
            }

            const ipfsResponse = await axiosInstance.post('/cooperative/batches/transfer-ipfs', formDataPayload);
            const serverPayload = ipfsResponse.data.data;

            if (!window.ethereum) throw new Error("Không tìm thấy tiện ích MetaMask!");
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(contractAddress, contractAbi, signer);

            setLoadingStatus("Đang xác thực cập nhật trạng thái thương mại tài sản...");
            const txStatus = await contract.updateBatchStatus(lotInfo.id, 4);
            await txStatus.wait();

            setLoadingStatus("Đang thực hiện chuyển giao quyền sở hữu tài sản on-chain...");
            const txOwnership = await contract.transferBatchOwnership(lotInfo.id, targetProcessor.wallet_address);

            setLoadingStatus("Mạng lưới đang xử lý giao dịch chuyển đổi quyền sở hữu...");
            const receipt = await txOwnership.wait();
            const realTxHash = receipt ? receipt.hash : txOwnership.hash;

            setLoadingStatus("Đồng bộ dữ liệu lịch sử bàn giao...");
            try {
                await axiosInstance.post('/cooperative/batches/save-transfer-db', {
                    batchId: lotInfo.id,
                    status: "TRADING",
                    processorId: targetProcessor.id,
                    ipfsCid: serverPayload.ipfsCid,
                    txHash: realTxHash
                });

                setShowTransferModal(false);
                triggerNotification("success", "Chuyển giao thành công", `Đã bàn giao thành công lô hàng sang Nhà chế biến: ${targetProcessor.name}`);
                onRefresh();
            } catch (dbErr) {
                const parsedError = parseWeb3Error(dbErr);
                triggerNotification("error", "Lỗi đồng bộ local", `On-chain bàn giao thành công nhưng lỗi đồng bộ hệ thống. Chi tiết: ${parsedError.message}`);
            }

        } catch (err) {
            const parsedError = parseWeb3Error(err);
            triggerNotification(parsedError.type, parsedError.title, parsedError.message);
        } finally {
            setLoading(false);
            setLoadingStatus("");
        }
    };

    return (
        <>
            <div className="flex items-center gap-2 animate-fadeIn">
                {lotInfo?.status === "PRE_PROCESSED" && (
                    <>
                        <button
                            disabled={loading}
                            onClick={() => setShowRejectModal(true)}
                            className="px-4 py-2 rounded-xl text-xs font-bold text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 transition-all shadow-xs disabled:opacity-50 focus:outline-none outline-none"
                        >
                            Từ Chối
                        </button>

                        <button
                            disabled={loading}
                            onClick={() => setShowApproveModal(true)}
                            className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md shadow-emerald-900/10 hover:opacity-90 transition-all bg-emerald-600 disabled:opacity-50 focus:outline-none outline-none"
                        >
                            Phê Duyệt
                        </button>
                    </>
                )}

                {lotInfo?.status === "PROCESSED" && lotInfo?.owner.role === "COOPERATIVE" && (
                    <button
                        disabled={loading}
                        onClick={() => setShowTransferModal(true)}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90 shadow-md disabled:opacity-50 focus:outline-none outline-none"
                        style={{ background: COLORS.coffee600 }}
                    >
                        Chuyển giao Nhà chế biến
                    </button>
                )}
            </div>

            {showApproveModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
                    <div className="absolute inset-0" onClick={() => !loading && setShowApproveModal(false)}></div>
                    <div className="relative z-10 bg-white rounded-2xl max-w-md w-full border shadow-xl overflow-hidden animate-scaleUp" style={{ borderColor: COLORS.coffee200 }}>
                        <div className="p-5 border-b flex justify-between items-center bg-gray-50" style={{ borderColor: COLORS.coffee100 }}>
                            <h3 className="font-bold text-base text-emerald-800">Biên Bản Kiểm Định Chất Lượng</h3>
                            <button type="button" disabled={loading} onClick={() => setShowApproveModal(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold p-1 focus:outline-none outline-none">×</button>
                        </div>
                        <form onSubmit={handleApproveSubmit} className="p-6 space-y-4 relative">
                            {loading && (
                                <div className="absolute inset-0 z-20 bg-white/80 backdrop-blur-xs flex flex-col items-center justify-center p-4">
                                    <LoadingSpinner loadingStatus={loadingStatus} />
                                </div>
                            )}
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
                                <button type="button" onClick={() => setShowApproveModal(false)} disabled={loading} className="px-4 py-2 rounded-xl text-xs font-semibold border text-gray-600 bg-white hover:bg-gray-50 focus:outline-none outline-none">Hủy</button>
                                <button type="submit" disabled={loading} className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:opacity-90 disabled:opacity-50 focus:outline-none outline-none">Xác Nhận Phê Duyệt</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showRejectModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
                    <div className="absolute inset-0" onClick={() => !loading && setShowRejectModal(false)}></div>
                    <div className="relative z-10 bg-white rounded-2xl max-w-md w-full border shadow-xl overflow-hidden animate-scaleUp" style={{ borderColor: COLORS.coffee200 }}>
                        <div className="p-5 border-b flex justify-between items-center bg-gray-50" style={{ borderColor: COLORS.coffee100 }}>
                            <h3 className="font-bold text-base text-red-800">Trả Về Lô Hàng Khỏi Chuỗi</h3>
                            <button type="button" disabled={loading} onClick={() => setShowRejectModal(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold p-1 focus:outline-none outline-none">×</button>
                        </div>
                        <form onSubmit={handleRejectSubmit} className="p-6 space-y-4 relative">
                            {loading && (
                                <div className="absolute inset-0 z-20 bg-white/80 backdrop-blur-xs flex flex-col items-center justify-center p-4">
                                    <LoadingSpinner loadingStatus={loadingStatus} />
                                </div>
                            )}
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-700 mb-1.5">Lý do từ chối *</label>
                                <textarea required rows="3" disabled={loading} placeholder="Nhập chi tiết lý do..." value={rejectData.reason} onChange={e => setRejectData(prev => ({ ...prev, reason: e.target.value }))} className="w-full bg-white border text-gray-900 text-sm rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-red-500 resize-none disabled:bg-gray-100" style={{ borderColor: COLORS.coffee300 }} />
                            </div>
                            <FileInput label="Biên bản lỗi hàng" loading={loading} onFileChange={(e) => setRejectData(prev => ({ ...prev, ipfs_file: e.target.files[0] }))} onFileDescChange={e => setRejectData(prev => ({ ...prev, document_desc: e.target.value }))} value={rejectData.document_desc} />
                            <div className="pt-4 flex items-center justify-end gap-3 border-t" style={{ borderColor: COLORS.coffee100 }}>
                                <button type="button" onClick={() => setShowRejectModal(false)} disabled={loading} className="px-4 py-2 rounded-xl text-xs font-semibold border text-gray-600 bg-white hover:bg-gray-50 focus:outline-none outline-none">Hủy</button>
                                <button type="submit" disabled={loading || !rejectData.reason.trim()} className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 focus:outline-none outline-none">Xác Nhận Trả Về</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showTransferModal && (
                <div className="relative">
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
                    {loading && (
                        <div className="fixed inset-0 z-[60] bg-white/80 backdrop-blur-xs flex flex-col items-center justify-center p-4">
                            <LoadingSpinner loadingStatus={loadingStatus} />
                        </div>
                    )}
                </div>
            )}

            <NotificationModal
                isOpen={notification.isOpen}
                type={notification.type}
                title={notification.title}
                message={notification.message}
                onClose={() => setNotification(prev => ({ ...prev, isOpen: false }))}
            />
        </>
    );
}