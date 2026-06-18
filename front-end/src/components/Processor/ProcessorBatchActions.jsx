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

export default function ProcessorBatchActions({ lotInfo, onRefresh }) {
    const [loading, setLoading] = useState(false);
    const [loadingStatus, setLoadingStatus] = useState("");

    const [showRoastModal, setShowRoastModal] = useState(false);
    const [showTransferModal, setShowTransferModal] = useState(false);

    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        title: "",
        message: "",
        type: "success",
        callback: null
    });

    const [roastData, setRoastData] = useState({
        roasting_temperature: "",
        roasting_duration: "",
        roast_batch_size: "",
        moisture: "12", 
        cupping_score: "80", 
        document_desc: "Hồ sơ kỹ thuật mẻ rang & Kết quả Cupping đánh giá chất lượng hạt",
        ipfs_file: null
    });

    const [transferData, setTransferData] = useState({
        document_desc: "Vận đơn thương mại bàn giao tài sản sang Nhà Xuất Khẩu đạt chuẩn",
        ipfs_file: null
    });

    const handleCloseModal = () => {
        setModalConfig(prev => ({ ...prev, isOpen: false }));
        if (modalConfig.callback) {
            modalConfig.callback();
        }
    };

    const handleRoastSubmit = async (e) => {
        if (e && e.preventDefault) e.preventDefault();

        if (!roastData.roasting_temperature || !roastData.roasting_duration || !roastData.roast_batch_size || !roastData.cupping_score) {
            setModalConfig({
                isOpen: true,
                title: "Cảnh Báo",
                message: "Vui lòng nhập đầy đủ các thông số lò rang và điểm số Cupping cảm quan!",
                type: "error"
            });
            return;
        }

        setLoading(true);
        try {
            setLoadingStatus("Đang đẩy nhật ký mẻ rang nhà máy lên IPFS...");
            const formDataPayload = new FormData();
            formDataPayload.append("batch_id", lotInfo.id);
            formDataPayload.append("roasting_temperature", parseInt(roastData.roasting_temperature));
            formDataPayload.append("roasting_duration", parseInt(roastData.roasting_duration));
            formDataPayload.append("roast_batch_size", parseInt(roastData.roast_batch_size));
            formDataPayload.append("moisture", parseInt(roastData.moisture));
            formDataPayload.append("cupping_score", parseFloat(roastData.cupping_score));
            formDataPayload.append("document_desc", roastData.document_desc);
            if (roastData.ipfs_file) {
                formDataPayload.append("ipfs_file", roastData.ipfs_file);
            }

            const ipfsResponse = await axiosInstance.post('/processor/batches/roast-ipfs', formDataPayload);
            const serverPayload = ipfsResponse.data.data;

            if (!window.ethereum) throw new Error("Không tìm thấy ví MetaMask!");

            setLoadingStatus("Vui lòng ký xác thực trạng thái mẻ rang trên MetaMask...");
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(contractAddress, contractAbi, signer);

            const tx = await contract.updateBatchStatus(lotInfo.id, 5);

            setLoadingStatus("Đang chờ mạng lưới xác thực khối dữ liệu mẻ rang...");
            const txReceipt = await tx.wait();
            const finalTxHash = txReceipt ? txReceipt.hash : tx.hash;

            setLoadingStatus("Đang đồng bộ dữ liệu mẻ rang về hệ thống...");
            await axiosInstance.post('/processor/batches/save-roast-db', {
                batchId: lotInfo.id,
                status: "ASSESSED",
                roastingTemperature: serverPayload.roasting_temperature,
                roastingDuration: serverPayload.roasting_duration,
                roastBatchSize: serverPayload.roast_batch_size,
                moisture: serverPayload.moisture,
                cuppingScore: serverPayload.cupping_score,
                ipfsCid: serverPayload.ipfsCid,
                txHash: finalTxHash
            });

            setShowRoastModal(false);
            setModalConfig({
                isOpen: true,
                title: "Xử Lý Thành Công",
                message: `Lô hàng #${lotInfo.id} đã hoàn tất công đoạn chế biến sâu và phân hạng thành công!`,
                type: "success",
                callback: () => {
                    if (onRefresh) onRefresh();
                }
            });

        } catch (err) {
            const parsedError = parseWeb3Error(err);
            setModalConfig({
                isOpen: parsedError.isOpen,
                title: parsedError.title || "Xử Lý Thất Bại",
                message: parsedError.message,
                type: parsedError.type,
                callback: parsedError.callback
            });
        } finally {
            setLoading(false);
            setLoadingStatus("");
        }
    };

    const handleTransferSubmit = async (targetExporter) => {
        if (!targetExporter || !targetExporter.id || !targetExporter.wallet_address) {
            setModalConfig({
                isOpen: true,
                title: "Cảnh Báo",
                message: "Vui lòng chỉ định chính xác Nhà xuất khẩu đối tác nhận lô hàng!",
                type: "error"
            });
            return;
        }

        setLoading(true);
        try {
            setLoadingStatus("Đang đẩy dữ liệu vận đơn thương mại lên IPFS...");
            const formDataPayload = new FormData();
            formDataPayload.append("batch_id", lotInfo.id);
            formDataPayload.append("exporter_id", targetExporter.id);
            formDataPayload.append("document_desc", transferData.document_desc);
            if (transferData.ipfs_file) {
                formDataPayload.append("ipfs_file", transferData.ipfs_file);
            }

            const ipfsResponse = await axiosInstance.post('/processor/batches/transfer-ipfs', formDataPayload);
            const serverPayload = ipfsResponse.data.data;

            if (!window.ethereum) throw new Error("Không tìm thấy ví MetaMask!");

            setLoadingStatus(`Vui lòng ký bàn giao lô hàng sang địa chỉ ví Exporter: ${targetExporter.wallet_address}...`);
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(contractAddress, contractAbi, signer);

            const txOwnership = await contract.transferBatchOwnership(lotInfo.id, targetExporter.wallet_address);

            setLoadingStatus("Đang chờ mạng lưới xác thực giao dịch chuyển quyền sở hữu...");
            const receipt = await txOwnership.wait();
            const finalTxHash = receipt ? receipt.hash : txOwnership.hash;

            setLoadingStatus("Đang cập nhật trạng thái bàn giao thương mại về hệ thống...");
            await axiosInstance.post('/processor/batches/save-transfer-exporter-db', {
                batchId: lotInfo.id,
                status: "EXPORTED",
                exporterId: targetExporter.id,
                ipfsCid: serverPayload.ipfsCid,
                txHash: finalTxHash
            });

            setShowTransferModal(false);
            setModalConfig({
                isOpen: true,
                title: "Bàn Giao Thành Công",
                message: `Đã ký chuyển giao thành công chủ quyền sở hữu sang Nhà xuất khẩu: ${targetExporter.name}`,
                type: "success",
                callback: () => {
                    if (onRefresh) onRefresh();
                }
            });

        } catch (err) {
            const parsedError = parseWeb3Error(err);
            setModalConfig({
                isOpen: parsedError.isOpen,
                title: parsedError.title || "Bàn Giao Thất Bại",
                message: parsedError.message,
                type: parsedError.type,
                callback: parsedError.callback
            });
        } finally {
            setLoading(false);
            setLoadingStatus("");
        }
    };

    return (
        <>
            <div className="flex items-center gap-2 animate-fadeIn">
                {lotInfo?.status === "PROCESSED" && (
                    <button
                        disabled={loading}
                        onClick={() => setShowRoastModal(true)}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md shadow-amber-900/10 hover:opacity-90 transition-all bg-amber-600 disabled:opacity-50"
                    >
                        Khởi Tạo Mẻ Rang
                    </button>
                )}

                {lotInfo?.status === "ASSESSED" && lotInfo?.owner.role === "PROCESSOR" && (
                    <button
                        disabled={loading}
                        onClick={() => setShowTransferModal(true)}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90 shadow-md disabled:opacity-50"
                        style={{ background: COLORS.forest900 }}
                    >
                        Bàn Giao Xuất Khẩu
                    </button>
                )}
            </div>

            {showRoastModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
                    <div className="absolute inset-0" onClick={() => !loading && setShowRoastModal(false)}></div>
                    <div className="relative z-10 bg-white rounded-2xl max-w-md w-full border shadow-xl overflow-hidden animate-scaleUp" style={{ borderColor: COLORS.coffee200 }}>
                        {loading && <LoadingSpinner loadingStatus={loadingStatus} />}
                        <div className="p-5 border-b flex justify-between items-center bg-gray-50" style={{ borderColor: COLORS.coffee100 }}>
                            <h3 className="font-bold text-base text-amber-800">Nhật Ký Vận Hành Mẻ Rang</h3>
                            <button type="button" disabled={loading} onClick={() => setShowRoastModal(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold p-1">×</button>
                        </div>
                        <form onSubmit={handleRoastSubmit} className="p-6 space-y-4">

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-bold uppercase text-gray-700 mb-1">Nhiệt độ rang (°C) *</label>
                                    <input type="number" required placeholder="200" value={roastData.roasting_temperature} onChange={e => setRoastData(prev => ({ ...prev, roasting_temperature: e.target.value }))} disabled={loading} className="w-full bg-white border text-sm rounded-xl p-2.5 outline-none focus:ring-1 focus:ring-amber-600 disabled:bg-gray-100" style={{ borderColor: COLORS.coffee300 }} />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold uppercase text-gray-700 mb-1">Thời gian rang (phút) *</label>
                                    <input type="number" required placeholder="15" value={roastData.roasting_duration} onChange={e => setRoastData(prev => ({ ...prev, roasting_duration: e.target.value }))} disabled={loading} className="w-full bg-white border text-sm rounded-xl p-2.5 outline-none focus:ring-1 focus:ring-amber-600 disabled:bg-gray-100" style={{ borderColor: COLORS.coffee300 }} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-bold uppercase text-gray-700 mb-1">Khối lượng mẻ (kg) *</label>
                                    <input type="number" required placeholder="60" value={roastData.roast_batch_size} onChange={e => setRoastData(prev => ({ ...prev, roast_batch_size: e.target.value }))} disabled={loading} className="w-full bg-white border text-sm rounded-xl p-2.5 outline-none focus:ring-1 focus:ring-amber-600 disabled:bg-gray-100" style={{ borderColor: COLORS.coffee300 }} />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold uppercase text-gray-700 mb-1">Độ ẩm sau rang (%) *</label>
                                    <input type="number" required placeholder="3" value={roastData.moisture} onChange={e => setRoastData(prev => ({ ...prev, moisture: e.target.value }))} disabled={loading} className="w-full bg-white border text-sm rounded-xl p-2.5 outline-none focus:ring-1 focus:ring-amber-600 disabled:bg-gray-100" style={{ borderColor: COLORS.coffee300 }} />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold uppercase text-gray-700 mb-1">Điểm Thử Nếm Cảm Quan (Cupping Score) *</label>
                                <input type="number" step="0.25" required value={roastData.cupping_score} onChange={e => setRoastData(prev => ({ ...prev, cupping_score: e.target.value }))} disabled={loading} className="w-full bg-white border text-sm rounded-xl p-2.5 outline-none focus:ring-1 focus:ring-amber-600 font-bold text-amber-900 disabled:bg-gray-100" style={{ borderColor: COLORS.coffee300 }} />
                            </div>

                            <FileInput
                                label="Hồ sơ kỹ thuật mẻ rang (PDF/Hình ảnh)"
                                loading={loading}
                                onFileChange={(e) => setRoastData(prev => ({ ...prev, ipfs_file: e.target.files[0] }))}
                                onFileDescChange={e => setRoastData(prev => ({ ...prev, document_desc: e.target.value }))}
                                value={roastData.document_desc}
                            />

                            <div className="pt-4 flex items-center justify-end gap-3 border-t" style={{ borderColor: COLORS.coffee100 }}>
                                <button type="button" onClick={() => setShowRoastModal(false)} disabled={loading} className="px-4 py-2 rounded-xl text-xs font-semibold border text-gray-600 bg-white hover:bg-gray-50">Hủy</button>
                                <button type="submit" disabled={loading} className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:opacity-90 disabled:opacity-50">{loading ? "Đang xử lý..." : "Xác Nhận Đóng Mẻ"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showTransferModal && (
                <TransferNextOwnerModal
                    lotInfo={lotInfo}
                    loading={loading}
                    onClose={() => setShowTransferModal(false)}
                    onSuccess={handleTransferSubmit}
                    title="Bàn Giao Lô Hàng Cho Nhà Xuất Khẩu"
                    fetchTargetUrl="/users?role=EXPORTER"
                    targetLabel="Chọn Nhà Xuất Khẩu Đối Tác"
                    placeholder="-- Chọn Nhà Xuất Khẩu --"
                    primaryColor={COLORS.forest900}
                    onFileChange={(file) => setTransferData(prev => ({ ...prev, ipfs_file: file }))}
                    onFileDescChange={(desc) => setTransferData(prev => ({ ...prev, document_desc: desc }))}
                    fileDescValue={transferData.document_desc}
                />
            )}

            <NotificationModal
                isOpen={modalConfig.isOpen}
                onClose={handleCloseModal}
                title={modalConfig.title}
                message={modalConfig.message}
                type={modalConfig.type}
            />
        </>
    );
}