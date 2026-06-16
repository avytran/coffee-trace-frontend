import React, { useState } from "react";
import { ethers } from "ethers";
import axiosInstance from "../../utils/axiosInstance";
import { COLORS } from "../../constants/colors";
import { getContractABI, getContractAddress } from "../../config/contracts";
import { FileInput } from "../Common/FileInput";
import TransferNextOwnerModal from "../Common/TransferNextOwnerModal";

const contractAbi = getContractABI("BATCH_REGISTRY");
const contractAddress = getContractAddress("BATCH_REGISTRY");

export default function ProcessorBatchActions({ lotInfo, onRefresh }) {
    const [loading, setLoading] = useState(false);

    // Trạng thái hiển thị Modals chuyên biệt cho Nhà chế biến
    const [showRoastModal, setShowRoastModal] = useState(false);
    const [showTransferModal, setShowTransferModal] = useState(false);

    // Form dữ liệu kỹ thuật mẻ rang & đánh giá cảm quan sau rang
    const [roastData, setRoastData] = useState({
        roasting_temperature: "",
        roasting_duration: "",
        roast_batch_size: "",
        moisture: "12", // Độ ẩm hạt thường được kiểm soát lại sau rang
        cupping_score: "80", // Ghi nhận điểm Sensory chất lượng mới
        document_desc: "Hồ sơ kỹ thuật mẻ rang & Kết quả Cupping đánh giá chất lượng hạt",
        ipfs_file: null
    });

    // Form dữ liệu chứng từ bàn giao thương mại sang Nhà xuất khẩu
    const [transferData, setTransferData] = useState({
        document_desc: "Vận đơn thương mại bàn giao tài sản sang Nhà Xuất Khẩu đạt chuẩn",
        ipfs_file: null
    });

    // =========================================================================
    // 🔥 LUỒNG 1: THIẾT LẬP THÔNG SỐ MỀ RANG & PHÂN HẠNG CẢM QUAN (PROCESS / ASSESS)
    // =========================================================================
    const handleRoastSubmit = async (e) => {
        if (e && e.preventDefault) e.preventDefault();

        if (!roastData.roasting_temperature || !roastData.roasting_duration || !roastData.roast_batch_size || !roastData.cupping_score) {
            alert("Vui lòng nhập đầy đủ các thông số lò rang và điểm số Cupping cảm quan!");
            return;
        }

        setLoading(true);
        try {
            // Bước 1: Đẩy dữ liệu kỹ thuật nhà máy lên mạng IPFS phi tập trung
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

            console.log("📡 1. Đang đẩy nhật ký mẻ rang nhà máy lên IPFS...");
            const ipfsResponse = await axiosInstance.post('/processor/batches/roast-ipfs', formDataPayload);
            const serverPayload = ipfsResponse.data.data;

            if (!window.ethereum) throw new Error("Không tìm thấy ví MetaMask!");
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(contractAddress, contractAbi, signer);

            console.log("🔗 2. Đang mở MetaMask ký xác thực trạng thái mẻ rang (ASSESSED)...");
            const tx = await contract.updateBatchStatus(lotInfo.id, 5);

            console.log(`⏳ Giao dịch chế biến đang được khai thác... TxHash: ${tx.hash}`);
            const txReceipt = await tx.wait(); // Đồng bộ đợi mine xong khối để tránh lỗi đồng bộ ngược
            console.log("⛏️ Khối dữ liệu mẻ rang đã được đào thành công!");

            const finalTxHash = txReceipt ? txReceipt.hash : tx.hash;

            console.log("💾 3. Tiến hành lưu nhật ký mẻ rang vào PostgreSQL...");
            try {
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

                alert(`🎉 Lô hàng #${lotInfo.id} đã hoàn tất công đoạn chế biến sâu và phân hạng thành công!`);
                setShowRoastModal(false);
                onRefresh();
            } catch (dbErr) {
                console.error("❌ Thất bại khi ghi nhận vào PostgreSQL:", dbErr);
                alert(`Giao dịch Web3 thành công (${finalTxHash}) nhưng lỗi đồng bộ DB cục bộ.`);
            }

        } catch (err) {
            console.error("❌ Lỗi luồng xử lý mẻ rang:", err);
            alert(`❌ Lỗi chế biến: ${err.response?.data?.message || err.message}`);
        } finally {
            setLoading(false);
        }
    };

    // =========================================================================
    // 🤝 LUỒNG 2: CHUYỂN GIAO QUYỀN SỞ HỮU SANG NHÀ XUẤT KHẨU (TRANSFER)
    // =========================================================================
    const handleTransferSubmit = async (targetExporter) => {
        if (!targetExporter || !targetExporter.id || !targetExporter.wallet_address) {
            alert("Vui lòng chỉ định chính xác Nhà xuất khẩu đối tác nhận lô hàng!");
            return;
        }

        setLoading(true);
        try {
            // ── Bước 1: Đóng gói biên bản vận đơn đẩy lên IPFS ──
            const formDataPayload = new FormData();
            formDataPayload.append("batch_id", lotInfo.id);
            formDataPayload.append("exporter_id", targetExporter.id);
            formDataPayload.append("document_desc", transferData.document_desc);
            if (transferData.ipfs_file) {
                formDataPayload.append("ipfs_file", transferData.ipfs_file);
            }

            console.log("📡 1. Đang đẩy dữ liệu vận đơn thương mại lên IPFS...");
            const ipfsResponse = await axiosInstance.post('/processor/batches/transfer-ipfs', formDataPayload);
            const serverPayload = ipfsResponse.data.data;

            if (!window.ethereum) throw new Error("Không tìm thấy ví MetaMask!");
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(contractAddress, contractAbi, signer);

            // ── Bước 2: Thực thi giao dịch trên Blockchain (Quyền sở hữu) ──

            // Ký bàn giao đứt quyền sở hữu On-chain sang địa chỉ ví Nhà xuất khẩu
            console.log(`🔗 2. Yêu cầu ví ký bàn giao lô hàng sang địa chỉ ví Exporter: ${targetExporter.wallet_address}...`);
            const txOwnership = await contract.transferBatchOwnership(lotInfo.id, targetExporter.wallet_address);

            console.log(`⏳ Giao dịch đổi chủ xuất khẩu đang được khai thác... TxHash: ${txOwnership.hash}`);
            const receipt = await txOwnership.wait(); // Đồng bộ đợi xác thực giao dịch thành công
            console.log("⛏️ Khai thác khối chuyển giao quyền sở hữu thành công!");

            const finalTxHash = receipt ? receipt.hash : txOwnership.hash;

            // ── Bước 3: Đồng bộ toàn bộ dữ liệu giao dịch về PostgreSQL local ──
            console.log("💾 3. Ghi vết dữ liệu bàn giao thương mại vào PostgreSQL...");
            try {
                await axiosInstance.post('/processor/batches/save-transfer-exporter-db', {
                    batchId: lotInfo.id,
                    status: "EXPORTED",
                    exporterId: targetExporter.id,
                    ipfsCid: serverPayload.ipfsCid,
                    txHash: finalTxHash
                });

                alert(`🎉 Đã ký chuyển giao thành công chủ quyền sở hữu sang Nhà xuất khẩu: ${targetExporter.name}`);
                setShowTransferModal(false);
                onRefresh();
            } catch (dbErr) {
                console.error("❌ Thất bại khi ghi nhận vào PostgreSQL:", dbErr);
                alert(`On-chain đổi chủ thành công (${finalTxHash}) nhưng DB lỗi đồng bộ: ${dbErr.response?.data?.message || dbErr.message}`);
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
            {/* ── THANH BẤM HÀNH ĐỘNG CỦA NHÀ CHẾ BIẾN ── */}
            <div className="flex items-center gap-2 animate-fadeIn">
                {/* 1. Lô hàng vừa được HTX bàn giao qua (Chờ xử lý) */}
                {lotInfo?.status === "PROCESSED" && (
                    <button
                        disabled={loading}
                        onClick={() => setShowRoastModal(true)}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md shadow-amber-900/10 hover:opacity-90 transition-all bg-amber-600 disabled:opacity-50"
                    >
                        Khởi Tạo Mẻ Rang
                    </button>
                )}

                {/* 2. Lô hàng đã rang xong, đang nằm trong kho của Processor, chờ bàn giao xuất khẩu */}
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

            {/* ================= 🔥 MODAL: THIẾT LẬP THÔNG SỐ MỀ RANG ================= */}
            {showRoastModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
                    <div className="absolute inset-0" onClick={() => !loading && setShowRoastModal(false)}></div>
                    <div className="relative z-10 bg-white rounded-2xl max-w-md w-full border shadow-xl overflow-hidden animate-scaleUp" style={{ borderColor: COLORS.coffee200 }}>
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
                                <button type="submit" disabled={loading} className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:opacity-90 disabled:opacity-50">{loading ? "Đang ghi chuỗi..." : "Xác Nhận Đóng Mẻ"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ================= 🤝 MODAL: BÀN GIAO SANG NHÀ XUẤT KHẨU ================= */}
            {showTransferModal && (
                <TransferNextOwnerModal
                    lotInfo={lotInfo}
                    loading={loading}
                    onClose={() => setShowTransferModal(false)}
                    onSuccess={handleTransferSubmit}
                    title="Bàn Giao Lô Hàng Cho Nhà Xuất Khẩu"
                    fetchTargetUrl="/users?role=EXPORTER" // Tự động fetch đúng danh sách Exporter
                    targetLabel="Chọn Nhà Xuất Khẩu Đối Tác"
                    placeholder="-- Chọn Nhà Xuất Khẩu --"
                    primaryColor={COLORS.forest900}
                    onFileChange={(file) => setTransferData(prev => ({ ...prev, ipfs_file: file }))}
                    onFileDescChange={(desc) => setTransferData(prev => ({ ...prev, document_desc: desc }))}
                    fileDescValue={transferData.document_desc}
                />
            )}
        </>
    );
}