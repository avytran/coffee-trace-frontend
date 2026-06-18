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

export default function ExporterBatchActions({ lotInfo, onRefresh }) {
    const [loading, setLoading] = useState(false);
    const [loadingStatus, setLoadingStatus] = useState("");

    const [showShipmentModal, setShowShipmentModal] = useState(false);
    const [showTransferModal, setShowTransferModal] = useState(false);

    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        title: "",
        message: "",
        type: "success",
        callback: null
    });

    const [shipmentData, setShipmentData] = useState({
        carrier: "",
        departure_date: "",
        destination: "",
        container_number: "",
        document_desc: "Bộ chứng từ xuất khẩu, Vận đơn tàu (Bill of Lading) & Tờ khai hải quan",
        ipfs_file: null
    });

    const [transferData, setTransferData] = useState({
        document_desc: "Biên bản bàn giao chủ quyền lô hàng xuất khẩu sang Nhà Nhập Khẩu",
        ipfs_file: null
    });

    const handleCloseModal = () => {
        setModalConfig(prev => ({ ...prev, isOpen: false }));
        if (modalConfig.callback) {
            modalConfig.callback();
        }
    };

    const handleShipmentSubmit = async (e) => {
        if (e && e.preventDefault) e.preventDefault();

        if (!shipmentData.carrier || !shipmentData.departure_date || !shipmentData.destination || !shipmentData.container_number) {
            setModalConfig({
                isOpen: true,
                title: "Cảnh Báo",
                message: "Vui lòng nhập đầy đủ các thông tin vận chuyển hàng hải / logistics!",
                type: "error"
            });
            return;
        }

        setLoading(true);
        try {
            setLoadingStatus("Đang đẩy hồ sơ vận đơn xuất khẩu lên IPFS...");
            const formDataPayload = new FormData();
            formDataPayload.append("batch_id", lotInfo.id);
            formDataPayload.append("carrier", shipmentData.carrier);
            formDataPayload.append("departure_date", shipmentData.departure_date);
            formDataPayload.append("destination", shipmentData.destination);
            formDataPayload.append("container_number", shipmentData.container_number);
            formDataPayload.append("document_desc", shipmentData.document_desc);
            if (shipmentData.ipfs_file) {
                formDataPayload.append("ipfs_file", shipmentData.ipfs_file);
            }

            const ipfsResponse = await axiosInstance.post('/exporter/batches/shipment-ipfs', formDataPayload);
            const serverPayload = ipfsResponse.data.data;

            if (!window.ethereum) throw new Error("Không tìm thấy ví MetaMask!");
            
            setLoadingStatus("Vui lòng ký xác nhận cập nhật thông tin vận tải trên MetaMask...");
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(contractAddress, contractAbi, signer);

            const tx = await contract.updateBatchStatus(lotInfo.id, 6);

            setLoadingStatus("Đang chờ mạng lưới xác thực khối dữ liệu vận tải...");
            const txReceipt = await tx.wait();
            const finalTxHash = txReceipt ? txReceipt.hash : tx.hash;

            setLoadingStatus("Đang đồng bộ dữ liệu logistics về hệ thống...");
            await axiosInstance.post('/exporter/batches/save-shipment-db', {
                batchId: lotInfo.id,
                carrier: serverPayload.carrier,
                departureDate: serverPayload.departure_date,
                destination: serverPayload.destination,
                containerNumber: serverPayload.container_number,
                ipfsCid: serverPayload.ipfsCid || serverPayload.ipfs_cid || ipfsResponse.data?.ipfsCid,
                txHash: finalTxHash
            });

            setShowShipmentModal(false);
            setModalConfig({
                isOpen: true,
                title: "Khai Báo Thành Công",
                message: `Lô hàng #${lotInfo.id} đã hoàn tất khai báo thông tin vận chuyển đường biển!`,
                type: "success",
                callback: () => {
                    if (onRefresh) onRefresh();
                }
            });

        } catch (err) {
            const parsedError = parseWeb3Error(err);
            setModalConfig({
                isOpen: parsedError.isOpen,
                title: parsedError.title || "Khai Báo Thất Bại",
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

            const ipfsResponse = await axiosInstance.post('/exporter/batches/transfer-ipfs', formDataPayload);
            const serverPayload = ipfsResponse.data.data;

            if (!window.ethereum) throw new Error("Không tìm thấy ví MetaMask!");

            setLoadingStatus(`Vui lòng ký bàn giao lô hàng quyền sở hữu sang ví: ${targetExporter.wallet_address}...`);
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(contractAddress, contractAbi, signer);

            const txOwnership = await contract.transferBatchOwnership(lotInfo.id, targetExporter.wallet_address);

            setLoadingStatus("Đang chờ mạng lưới xác thực giao dịch chuyển quyền sở hữu...");
            const receipt = await txOwnership.wait();
            const realTxHash = receipt ? receipt.hash : txOwnership.hash;

            setLoadingStatus("Đang cập nhật trạng thái bàn giao thương mại về hệ thống...");
            await axiosInstance.post('/exporter/batches/save-transfer-exporter-db', {
                batchId: lotInfo.id,
                status: "EXPORTED",
                exporterId: targetExporter.id,
                ipfsCid: serverPayload.ipfsCid,
                txHash: realTxHash
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
                {lotInfo?.status === "ASSESSED" && (
                    <button
                        disabled={loading}
                        onClick={() => setShowShipmentModal(true)}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md shadow-emerald-900/10 hover:opacity-90 transition-all bg-emerald-600 disabled:opacity-50"
                    >
                        Khai Báo Vận Chuyển
                    </button>
                )}

                {lotInfo?.status === "EXPORTED" && lotInfo?.owner?.role === "EXPORTER" && (
                    <button
                        disabled={loading}
                        onClick={() => setShowTransferModal(true)}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90 shadow-md disabled:opacity-50"
                        style={{ background: COLORS.forest900 }}
                    >
                        Bàn Giao Nhập Khẩu
                    </button>
                )}
            </div>

            {showShipmentModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
                    <div className="absolute inset-0" onClick={() => !loading && setShowShipmentModal(false)}></div>
                    <div className="relative z-10 bg-white rounded-2xl max-w-md w-full border shadow-xl overflow-hidden animate-scaleUp" style={{ borderColor: COLORS.coffee200 }}>
                        {loading && <LoadingSpinner loadingStatus={loadingStatus} />}
                        <div className="p-5 border-b flex justify-between items-center bg-gray-50" style={{ borderColor: COLORS.coffee100 }}>
                            <h3 className="font-bold text-base text-emerald-800">Khai Báo Thông Tin Vận Chuyển Quốc Tế</h3>
                            <button type="button" disabled={loading} onClick={() => setShowShipmentModal(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold p-1">×</button>
                        </div>
                        <form onSubmit={handleShipmentSubmit} className="p-6 space-y-4">

                            <div>
                                <label className="block text-[11px] font-bold uppercase text-gray-700 mb-1">Đơn vị vận chuyển (Carrier) *</label>
                                <input type="text" required placeholder="Ví dụ: Maersk Line / Evergreen" value={shipmentData.carrier} onChange={e => setShipmentData(prev => ({ ...prev, carrier: e.target.value }))} disabled={loading} className="w-full bg-white border text-sm rounded-xl p-2.5 outline-none focus:ring-1 focus:ring-emerald-600 disabled:bg-gray-100" style={{ borderColor: COLORS.coffee300 }} />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold uppercase text-gray-700 mb-1">Ngày xuất bến (Departure Date) *</label>
                                <input type="datetime-local" required value={shipmentData.departure_date} onChange={e => setShipmentData(prev => ({ ...prev, departure_date: e.target.value }))} disabled={loading} className="w-full bg-white border text-sm rounded-xl p-2.5 outline-none focus:ring-1 focus:ring-emerald-600 disabled:bg-gray-100" style={{ borderColor: COLORS.coffee300 }} />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold uppercase text-gray-700 mb-1">Cảng đích / Điểm đến (Destination) *</label>
                                <input type="text" required placeholder="Ví dụ: Port of Rotterdam, Netherlands" value={shipmentData.destination} onChange={e => setShipmentData(prev => ({ ...prev, destination: e.target.value }))} disabled={loading} className="w-full bg-white border text-sm rounded-xl p-2.5 outline-none focus:ring-1 focus:ring-emerald-600 disabled:bg-gray-100" style={{ borderColor: COLORS.coffee300 }} />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold uppercase text-gray-700 mb-1">Số hiệu Container (Container Number) *</label>
                                <input type="text" required placeholder="Ví dụ: MSCU1234567" value={shipmentData.container_number} onChange={e => setShipmentData(prev => ({ ...prev, container_number: e.target.value }))} disabled={loading} className="w-full bg-white border text-sm rounded-xl p-2.5 outline-none focus:ring-1 focus:ring-emerald-600 disabled:bg-gray-100" style={{ borderColor: COLORS.coffee300 }} />
                            </div>

                            <FileInput
                                label="Hồ sơ Hải quan / Vận đơn đường biển (PDF/Image)"
                                loading={loading}
                                onFileChange={(e) => setShipmentData(prev => ({ ...prev, ipfs_file: e.target.files[0] }))}
                                onFileDescChange={e => setShipmentData(prev => ({ ...prev, document_desc: e.target.value }))}
                                value={shipmentData.document_desc}
                            />

                            <div className="pt-4 flex items-center justify-end gap-3 border-t" style={{ borderColor: COLORS.coffee100 }}>
                                <button type="button" onClick={() => setShowShipmentModal(false)} disabled={loading} className="px-4 py-2 rounded-xl text-xs font-semibold border text-gray-600 bg-white hover:bg-gray-50">Hủy</button>
                                <button type="submit" disabled={loading} className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:opacity-90 disabled:opacity-50">{loading ? "Đang xử lý..." : "Xác Nhận Khai Báo"}</button>
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
                    title="Bàn Giao Toàn Diện Lô Hàng Cho Nhà Nhập Khẩu"
                    fetchTargetUrl="/users?role=RECEIVER"
                    targetLabel="Chọn Nhà Nhập Khẩu / Đối Tác Tiếp Nhận"
                    placeholder="-- Chọn Nhà Nhập Khẩu (Receiver) --"
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