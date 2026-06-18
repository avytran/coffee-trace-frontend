import React, { useState } from 'react';
import { Card } from '../Common/Card';
import LoadingSpinner from '../Common/LoadingSpinner';
import { COLORS } from '../../constants/colors';
import axiosInstance from '../../utils/axiosInstance';
import { getContractABI, getContractAddress } from '../../config/contracts';
import { ethers } from 'ethers';
import { NotificationModal } from '../Common/NotificationModal';

const coreAbi = getContractABI("BATCH_REGISTRY");
const coreAddress = getContractAddress("BATCH_REGISTRY");

const eventLogAbi = getContractABI("BATCH_EVENT_REGISTRY");
const eventLogAddress = getContractAddress("BATCH_EVENT_REGISTRY");

export const CreateBatchForm = ({ lots = [], setLots, setShowCreateForm, onRefresh }) => {
    const initialFormState = {
        traceability_code: "",
        plant_variety: "",
        weight: "",
        latitude: "",
        longitude: "",
        altitude: "",
        cultivation_info: "",
        document_desc: "",
        ipfs_file: null
    };

    const [formData, setFormData] = useState(initialFormState);
    const [loading, setLoading] = useState(false);
    const [loadingStatus, setLoadingStatus] = useState("");
    const [error, setError] = useState("");

    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        title: "",
        message: "",
        type: "success",
        callback: null
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCloseModal = () => {
        setModalConfig(prev => ({ ...prev, isOpen: false }));
        if (modalConfig.callback) {
            modalConfig.callback();
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            setLoadingStatus("Đang đẩy tài liệu minh chứng lên mạng lưu trữ phi tập trung IPFS...");
            const formDataPayload = new FormData();
            formDataPayload.append("traceability_code", formData.traceability_code);
            formDataPayload.append("plant_variety", formData.plant_variety);
            formDataPayload.append("weight", formData.weight);
            formDataPayload.append("latitude", formData.latitude);
            formDataPayload.append("longitude", formData.longitude);
            formDataPayload.append("altitude", formData.altitude);
            formDataPayload.append("cultivation_info", formData.cultivation_info);
            formDataPayload.append("document_desc", formData.document_desc);
            if (formData.ipfs_file) {
                formDataPayload.append("ipfs_file", formData.ipfs_file);
            }

            console.log("1. Đang đẩy dữ liệu lên IPFS và tính toán Event Hash qua BE...");
            const ipfsResponse = await axiosInstance.post('/farmer/batches/create', formDataPayload);
            const serverPayload = ipfsResponse.data.data;

            if (!window.ethereum) throw new Error("Vui lòng cài đặt tiện ích MetaMask!");
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();

            const coffeeCoreContract = new ethers.Contract(coreAddress, coreAbi, signer);
            const eventLogContract = new ethers.Contract(eventLogAddress, eventLogAbi, signer);

            eventLogContract.once("BatchEventAdded", async (batchId, action, actor, ipfsCid, eventDetails) => {
                const txHashFromEvent = eventDetails?.log?.transactionHash || eventDetails?.transactionHash || "0x000000000";
                setLoadingStatus("Khai thác thành công! Đang đồng bộ dữ liệu chuỗi hành trình về Postgres...");
                try {
                    await axiosInstance.post('/farmer/batches/save-db', {
                        batchId: serverPayload.batchId,
                        traceabilityCode: serverPayload.traceabilityCode,
                        ipfsCid: serverPayload.ipfsCid,
                        weight: serverPayload.weight,
                        metadata: serverPayload.metadata,
                        eventHash: serverPayload.eventHash,
                        actionType: 1,
                        txHash: txHashFromEvent
                    });

                    setModalConfig({
                        isOpen: true,
                        title: "Khởi Tạo Thành Công!",
                        message: `Lô hàng [${serverPayload.traceabilityCode}] đã được phân bổ mã định danh và đóng dấu Audit Trail lên sổ cái thành công!`,
                        type: "success",
                        callback: () => {
                            if (onRefresh) onRefresh();
                            if (setShowCreateForm) setShowCreateForm(false);
                        }
                    });
                } catch (dbErr) {
                    console.error("Thất bại khi ghi nhận vào PostgreSQL:", dbErr);
                    setModalConfig({
                        isOpen: true,
                        title: "Sự Cố Đồng Bộ Hệ Thống ⚠️",
                        message: "Giao dịch lưu dữ liệu trên sổ cái Blockchain thành công, nhưng cơ sở dữ liệu nội bộ PostgreSQL gặp trục trặc.",
                        type: "error"
                    });
                }
            });
            
            if (!serverPayload.ipfsCid || !serverPayload.weight || !serverPayload.eventHash) {
                throw new Error("Dữ liệu IPFS, khối lượng hoặc mã băm đối soát (eventHash) không hợp lệ.");
            }

            setLoadingStatus("MetaMask Lần 1: Vui lòng ký xác nhận Khởi tạo trạng thái lô hàng tại Core Contract...");
            const txCore = await coffeeCoreContract.createBatch(
                serverPayload.batchId,
                serverPayload.traceabilityCode,
                serverPayload.ipfsCid,
                serverPayload.weight.toString()
            );

            setLoadingStatus("MetaMask Lần 2: Vui lòng ký đóng dấu mã băm chống giả mạo vào BatchEventRegistry...");
            const ACTION_CREATE_BATCH = 1;

            const txLog = await eventLogContract.addBatchEvent(
                serverPayload.batchId,
                ACTION_CREATE_BATCH,
                serverPayload.ipfsCid,
                serverPayload.eventHash
            );

            setLoadingStatus("Đang đợi các khối xác thực (Miners) đóng dữ liệu lên Blockchain...");
            await Promise.all([
                txCore.wait(),
                txLog.wait()
            ]);
        } catch (error) {
            console.error("Lỗi luồng khởi tạo lô hàng:", error);
            const errorMsg = error.response?.data?.message || error.message || "Có lỗi xảy ra";
            setError(errorMsg);
            
            setModalConfig({
                isOpen: true,
                title: "Thao Tác Thất Bại",
                message: `Quá trình thực thi gặp lỗi: ${errorMsg}`,
                type: "error"
            });
        } finally {
            setLoading(false);
            setLoadingStatus("");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs transition-opacity duration-300 animate-fadeIn">
            <div className="absolute inset-0" onClick={() => !loading && setShowCreateForm && setShowCreateForm(false)}></div>

            <Card
                className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white shadow-2xl border rounded-2xl animate-scaleUp focus:outline-none outline-none"
                style={{ borderColor: COLORS.coffee100 }}
                tabIndex="-1"
            >
                {loading && (
                    <LoadingSpinner 
                        loadingStatus={loadingStatus}
                    />
                )}

                <div className="sticky top-0 bg-white z-10 px-6 pt-6 pb-3 border-b flex justify-between items-center" style={{ borderColor: COLORS.coffee100 }}>
                    <h2 className="text-xl font-bold font-serif flex items-center gap-2" style={{ color: COLORS.forest900 }}>
                        Khởi Tạo Lô Cà Phê Mới
                    </h2>
                    <button
                        type="button"
                        disabled={loading}
                        onClick={() => setShowCreateForm && setShowCreateForm(false)}
                        className="text-gray-400 hover:text-gray-600 text-2xl font-semibold leading-none p-1 transition-colors disabled:opacity-30 focus:outline-none"
                    >
                        ×
                    </button>
                </div>

                {error && (
                    <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
                        {error}
                    </div>
                )}

                <form onSubmit={handleFormSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-bold uppercase mb-2" style={{ color: COLORS.forest700 }}>Mã truy xuất (Traceability Code)</label>
                            <input disabled={loading} required type="text" name="traceability_code" value={formData.traceability_code} onChange={handleInputChange} placeholder="VD: RB-2026-DL-0001" className="w-full px-4 py-2 rounded-xl text-sm border focus:ring-2 focus:outline-none outline-none bg-forest-50/30 disabled:bg-gray-100" style={{ borderColor: COLORS.coffee200 }} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase mb-2" style={{ color: COLORS.forest700 }}>Giống Cà Phê</label>
                            <input disabled={loading} required type="text" name="plant_variety" value={formData.plant_variety} onChange={handleInputChange} placeholder="VD: Robusta TRS1, Arabica" className="w-full px-4 py-2 rounded-xl text-sm border focus:ring-2 focus:outline-none outline-none bg-forest-50/30 disabled:bg-gray-100" style={{ borderColor: COLORS.coffee200 }} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase mb-2" style={{ color: COLORS.forest700 }}>Khối lượng (kg)</label>
                            <input disabled={loading} required type="number" name="weight" value={formData.weight} onChange={handleInputChange} placeholder="VD: 500" className="w-full px-4 py-2 rounded-xl text-sm border focus:ring-2 focus:outline-none outline-none bg-forest-50/30 disabled:bg-gray-100" style={{ borderColor: COLORS.coffee200 }} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-bold uppercase mb-2" style={{ color: COLORS.forest700 }}>Vĩ độ (Latitude)</label>
                            <input disabled={loading} required type="text" name="latitude" value={formData.latitude} onChange={handleInputChange} placeholder="VD: 11.9404" className="w-full px-4 py-2 rounded-xl text-sm border focus:ring-2 focus:outline-none outline-none bg-forest-50/30 disabled:bg-gray-100" style={{ borderColor: COLORS.coffee200 }} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase mb-2" style={{ color: COLORS.forest700 }}>Kinh độ (Longitude)</label>
                            <input disabled={loading} required type="text" name="longitude" value={formData.longitude} onChange={handleInputChange} placeholder="VD: 108.4583" className="w-full px-4 py-2 rounded-xl text-sm border focus:ring-2 focus:outline-none outline-none bg-forest-50/30 disabled:bg-gray-100" style={{ borderColor: COLORS.coffee200 }} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase mb-2" style={{ color: COLORS.forest700 }}>Độ cao (mét)</label>
                            <input disabled={loading} required type="number" name="altitude" value={formData.altitude} onChange={handleInputChange} placeholder="VD: 1500" className="w-full px-4 py-2 rounded-xl text-sm border focus:ring-2 focus:outline-none outline-none bg-forest-50/30 disabled:bg-gray-100" style={{ borderColor: COLORS.coffee200 }} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase mb-2" style={{ color: COLORS.forest700 }}>Thông tin canh tác (Cultivation Info)</label>
                        <textarea disabled={loading} name="cultivation_info" value={formData.cultivation_info} onChange={handleInputChange} rows="2" placeholder="VD: Bón phân hữu cơ vi sinh, tưới nước nhỏ giọt công nghệ Israel..." className="w-full px-4 py-2 rounded-xl text-sm border focus:ring-2 focus:outline-none outline-none bg-forest-50/30 disabled:bg-gray-100" style={{ borderColor: COLORS.coffee200 }}></textarea>
                    </div>

                    <div className="p-4 rounded-xl border-dashed border-2" style={{ borderColor: COLORS.coffee300, background: COLORS.coffee50 }}>
                        <label className="block text-xs font-bold uppercase mb-2" style={{ color: COLORS.forest900 }}>Tài liệu / Hình ảnh minh chứng (Đẩy lên IPFS)</label>
                        <input
                            disabled={loading}
                            type="file"
                            onChange={(e) => setFormData(prev => ({ ...prev, ipfs_file: e.target.files[0] }))}
                            className="text-sm text-forest-700 mb-3 block file:mr-4 file:py-1.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-white file:text-forest-900 hover:file:bg-gray-100 file:cursor-pointer disabled:opacity-50 focus:outline-none"
                        />
                        <input disabled={loading} type="text" name="document_desc" value={formData.document_desc} onChange={handleInputChange} placeholder="Mô tả tài liệu đính kèm (Ví dụ: Chứng nhận VietGAP...)" className="w-full px-4 py-2 rounded-xl text-xs border focus:outline-none outline-none bg-white disabled:bg-gray-100" style={{ borderColor: COLORS.coffee200 }} />
                    </div>

                    <div className="flex justify-end gap-3 pt-3 border-t" style={{ borderColor: COLORS.coffee100 }}>
                        <button
                            type="button"
                            disabled={loading}
                            onClick={() => setShowCreateForm && setShowCreateForm(false)}
                            className="px-5 py-2.5 rounded-xl text-sm font-medium border transition-colors bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:opacity-50 focus:outline-none"
                            style={{ borderColor: COLORS.coffee300, color: COLORS.forest800 }}
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center gap-2 shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none"
                            style={{ background: COLORS.forest900 }}
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    <span>Đang Khởi Tạo...</span>
                                </>
                            ) : (
                                <span>Khởi Tạo Hệ Thống</span>
                            )}
                        </button>
                    </div>
                </form>
            </Card>

            <NotificationModal
                isOpen={modalConfig.isOpen}
                onClose={handleCloseModal}
                title={modalConfig.title}
                message={modalConfig.message}
                type={modalConfig.type}
            />
        </div>
    );
};