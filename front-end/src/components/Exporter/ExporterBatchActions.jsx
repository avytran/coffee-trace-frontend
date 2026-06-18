import React, { useState } from "react";
import { ethers } from "ethers";
import axiosInstance from "../../utils/axiosInstance";
import { COLORS } from "../../constants/colors";
import { getContractABI, getContractAddress } from "../../config/contracts";
import { FileInput } from "../Common/FileInput";
import TransferNextOwnerModal from "../Common/TransferNextOwnerModal";

const contractAbi = getContractABI("BATCH_REGISTRY");
const contractAddress = getContractAddress("BATCH_REGISTRY");

export default function ExporterBatchActions({ lotInfo, onRefresh }) {
    const [loading, setLoading] = useState(false);

    console.log(lotInfo);
    

    // Trạng thái hiển thị Modals chuyên biệt cho Nhà Xuất Khẩu
    const [showShipmentModal, setShowShipmentModal] = useState(false);
    const [showTransferModal, setShowTransferModal] = useState(false);

    // Form dữ liệu thông tin vận chuyển đường biển/hàng không quốc tế
    const [shipmentData, setShipmentData] = useState({
        carrier: "",
        departure_date: "",
        destination: "",
        container_number: "",
        document_desc: "Bộ chứng từ xuất khẩu, Vận đơn tàu (Bill of Lading) & Tờ khai hải quan",
        ipfs_file: null
    });

    // Form dữ liệu chứng từ bàn giao thương mại sang Nhà Nhập Khẩu (Importer)
    const [transferData, setTransferData] = useState({
        document_desc: "Biên bản bàn giao chủ quyền lô hàng xuất khẩu sang Nhà Nhập Khẩu",
        ipfs_file: null
    });

    // =========================================================================
    // 🚢 LUỒNG 1: KHAI BÁO THÔNG TIN VẬN CHUYỂN QUỐC TẾ (DECLARATION)
    // =========================================================================
    const handleShipmentSubmit = async (e) => {
        if (e && e.preventDefault) e.preventDefault();

        if (!shipmentData.carrier || !shipmentData.departure_date || !shipmentData.destination || !shipmentData.container_number) {
            alert("Vui lòng nhập đầy đủ các thông tin vận chuyển hàng hải / logistics!");
            return;
        }

        setLoading(true);
        try {
            // Bước 1: Đẩy dữ liệu logistics & chứng từ đính kèm lên IPFS
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

            console.log("📡 1. Đang đẩy hồ sơ vận đơn xuất khẩu lên IPFS...");
            const ipfsResponse = await axiosInstance.post('/exporter/batches/shipment-ipfs', formDataPayload);
            const serverPayload = ipfsResponse.data.data;

            // Khởi tạo Web3 Provider để ký giao dịch Ethereum / EVM Network
            if (!window.ethereum) throw new Error("Không tìm thấy ví MetaMask!");
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(contractAddress, contractAbi, signer);

            // Bước 2: Đẩy trạng thái lô hàng lên Blockchain (Ví dụ trạng thái EXPORTED/SHIPPED giữ nguyên hoặc cập nhật tùy cấu trúc Smart Contract)
            // Giữ nguyên cập nhật trạng thái số hiệu của luồng (Ví dụ: trạng thái EXPORTED giữ nguyên hoặc tiến tới phân hệ hải quan)
            console.log("🔗 2. Đang mở MetaMask xác thực cập nhật thông tin vận tải lên On-chain...");
            const tx = await contract.updateBatchStatus(lotInfo.id, 6); // Index 6 khớp với EXPORTED

            console.log(`⏳ Giao dịch vận tải đang được khai thác... TxHash: ${tx.hash}`);
            const txReceipt = await tx.wait();
            console.log("⛏️ Đã đóng gói thông tin vận chuyển vào Block thành công!");

            const finalTxHash = txReceipt ? txReceipt.hash : tx.hash;

            // Bước 3: Lưu trữ đồng bộ các tham số vận tải sâu xuống PostgreSQL
            console.log("💾 3. Tiến hành lưu nhật ký vận chuyển vào cơ sở dữ liệu local...");
            console.log(serverPayload.ipfsCid, serverPayload.ipfs_cid, ipfsResponse.data?.ipfsCid);
            
            try {
                await axiosInstance.post('/exporter/batches/save-shipment-db', {
                    batchId: lotInfo.id,
                    carrier: serverPayload.carrier,
                    departureDate: serverPayload.departure_date,
                    destination: serverPayload.destination,
                    containerNumber: serverPayload.container_number,
                    ipfsCid: serverPayload.ipfsCid || serverPayload.ipfs_cid || ipfsResponse.data?.ipfsCid,
                    txHash: finalTxHash
                });

                alert(`🎉 Lô hàng #${lotInfo.id} đã hoàn tất khai báo thông tin vận chuyển đường biển!`);
                setShowShipmentModal(false);
                onRefresh();
            } catch (dbErr) {
                console.error("❌ Thất bại khi ghi nhận vào PostgreSQL:", dbErr);
                alert(`Giao dịch Web3 thành công (${finalTxHash}) nhưng lỗi đồng bộ DB cục bộ.`);
            }

        } catch (err) {
            console.error("❌ Lỗi luồng xử lý vận tải:", err);
            alert(`❌ Lỗi khai báo: ${err.response?.data?.message || err.message}`);
        } finally {
            setLoading(false);
        }
    };

    // =========================================================================
    // 🤝 LUỒNG 2: CHUYỂN GIAO QUYỀN SỞ HỮU SANG NHÀ NHẬP KHẨU (TRANSFER TO IMPORTER / RECEIVER)
    // =========================================================================
    const handleTransferSubmit = async (targetExporter) => {
        if (!targetExporter || !targetExporter.id || !targetExporter.wallet_address) {
            alert("Vui lòng chỉ định chính xác Nhà xuất khẩu đối tác nhận lô hàng!");
            return;
        }

        setLoading(true);
        try {
            // ── BƯỚC 1: ĐÓNG GÓI BIÊN BẢN VẬN ĐƠN ĐẨY LÊN IPFS ──
            const formDataPayload = new FormData();
            formDataPayload.append("batch_id", lotInfo.id);
            formDataPayload.append("exporter_id", targetExporter.id);
            formDataPayload.append("document_desc", transferData.document_desc);
            if (transferData.ipfs_file) {
                formDataPayload.append("ipfs_file", transferData.ipfs_file);
            }

            console.log("📡 1. Đang đẩy dữ liệu vận đơn thương mại lên IPFS...");
            const ipfsResponse = await axiosInstance.post('/exporter/batches/transfer-ipfs', formDataPayload);
            const serverPayload = ipfsResponse.data.data;

            if (!window.ethereum) throw new Error("Không tìm thấy ví MetaMask!");
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(contractAddress, contractAbi, signer);

            // ── BƯỚC 2: THỰC THI BLOCKCHAIN (UPDATE STATUS + TRANSFER OWNERSHIP) ──
            // Ký bàn giao đứt quyền sở hữu On-chain sang ví Nhà xuất khẩu
            console.log(`🔗 2b. Yêu cầu ví ký bàn giao lô hàng sang địa chỉ ví: ${targetExporter.wallet_address}...`);
            const txOwnership = await contract.transferBatchOwnership(lotInfo.id, targetExporter.wallet_address);

            console.log(`⏳ Giao dịch đổi chủ xuất khẩu đang được khai thác... TxHash: ${txOwnership.hash}`);
            const receipt = await txOwnership.wait();
            console.log("⛏️ Khai thác khối chuyển giao quyền sở hữu thành công!");

            const realTxHash = receipt ? receipt.hash : txOwnership.hash;

            // ── BƯỚC 3: ĐỒNG BỘ DỮ LIỆU GIAO DỊCH VỀ POSTGRESQL LOCAL ──
            console.log("💾 3. Ghi vết dữ liệu bàn giao thương mại vào PostgreSQL...");
            try {
                await axiosInstance.post('/exporter/batches/save-transfer-exporter-db', {
                    batchId: lotInfo.id,
                    status: "EXPORTED",
                    exporterId: targetExporter.id,
                    ipfsCid: serverPayload.ipfsCid,
                    txHash: realTxHash
                });

                alert(`🎉 Đã ký chuyển giao thành công chủ quyền sở hữu sang Nhà xuất khẩu: ${targetExporter.name}`);
                setShowTransferModal(false);
                onRefresh();
            } catch (dbErr) {
                console.error("❌ Thất bại khi ghi nhận vào PostgreSQL:", dbErr);
                alert(`On-chain đổi chủ thành công (${realTxHash}) nhưng DB lỗi đồng bộ.`);
            }

        } catch (err) {
            console.error("❌ Lỗi luồng bàn giao thương mại:", err);
            alert(`❌ Lỗi chuyển giao xuất khẩu: ${err.response?.data?.message || err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* ── THANH BẤM HÀNH ĐỘNG CỦA NHÀ XUẤT KHẨU ── */}
            <div className="flex items-center gap-2 animate-fadeIn">
                {/* 1. Lô hàng từ Nhà chế biến chuyển sang (Chưa khai báo vận chuyển) */}
                {lotInfo?.status === "ASSESSED" && (
                    <button
                        disabled={loading}
                        onClick={() => setShowShipmentModal(true)}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md shadow-emerald-900/10 hover:opacity-90 transition-all bg-emerald-600 disabled:opacity-50"
                    >
                        🚢 Khai Báo Vận Chuyển
                    </button>
                )}

                {/* 2. Đã điền thông tin tàu và hàng, nút chuyển giao chủ quyền sang Receiver hiện lên */}
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

            {/* ================= 🚢 MODAL: THIẾT LẬP THÔNG TIN VẬN CHUYỂN QUỐC TẾ ================= */}
            {showShipmentModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
                    <div className="absolute inset-0" onClick={() => !loading && setShowShipmentModal(false)}></div>
                    <div className="relative z-10 bg-white rounded-2xl max-w-md w-full border shadow-xl overflow-hidden animate-scaleUp" style={{ borderColor: COLORS.coffee200 }}>
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
                                <button type="submit" disabled={loading} className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:opacity-90 disabled:opacity-50">{loading ? "Đang ký Blockchain..." : "Xác Nhận Khai Báo"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ================= 🤝 MODAL: CHUYỂN GIAO SỞ HỮU SANG NHÀ NHẬP KHẨU (IMPORTER) ================= */}
            {showTransferModal && (
                <TransferNextOwnerModal
                    lotInfo={lotInfo}
                    loading={loading}
                    onClose={() => setShowTransferModal(false)}
                    onSuccess={handleTransferSubmit}
                    title="Bàn Giao Toàn Diện Lô Hàng Cho Nhà Nhập Khẩu"
                    fetchTargetUrl="/users?role=RECEIVER" // Tự động fetch đúng danh sách Importer / Receiver từ Hệ thống
                    targetLabel="Chọn Nhà Nhập Khẩu / Đối Tác Tiếp Nhận"
                    placeholder="-- Chọn Nhà Nhập Khẩu (Receiver) --"
                    primaryColor={COLORS.forest900}
                    onFileChange={(file) => setTransferData(prev => ({ ...prev, ipfs_file: file }))}
                    onFileDescChange={(desc) => setTransferData(prev => ({ ...prev, document_desc: desc }))}
                    fileDescValue={transferData.document_desc}
                />
            )}
        </>
    );
}