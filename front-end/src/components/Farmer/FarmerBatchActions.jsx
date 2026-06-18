import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import axiosInstance from "../../utils/axiosInstance";
import { COLORS } from "../../constants/colors";
import { getContractABI, getContractAddress } from "../../config/contracts";
import { FileInput } from "../Common/FileInput";
import { NotificationModal } from "../Common/NotificationModal";
import LoadingSpinner from "../Common/LoadingSpinner";
import { parseWeb3Error } from "../../utils/errorHandler";

const contractAbi = getContractABI("BATCH_REGISTRY");
const contractAddress = getContractAddress("BATCH_REGISTRY");

export default function FarmerBatchActions({ lotInfo, extendedDetails, onRefresh }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState("");
  const [showHarvestModal, setShowHarvestModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);

  const [cooperatives, setCooperatives] = useState([]);
  const [selectedCoop, setSelectedCoop] = useState({ id: "", name: "", wallet_address: "" });
  const [cooperativeName, setCooperativeName] = useState("");

  const [harvestData, setHarvestData] = useState({
    harvest_time: new Date().toISOString().slice(0, 16),
    harvest_method: "Hái tỉa thủ công (Hand-picking)"
  });

  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "success",
    callback: null
  });

  const fetchCooperativesData = async () => {
    try {
      const response = await axiosInstance.get("/users?role=COOPERATIVE");
      if (response.data.success) setCooperatives(response.data.data);
    } catch (err) {
      console.error("Không thể tải danh sách Hợp Tác Xã:", err);
    }
  };

  useEffect(() => {
    if (showTransferModal) fetchCooperativesData();
  }, [showTransferModal]);

  const handleCloseModal = () => {
    setModalConfig(prev => ({ ...prev, isOpen: false }));
    if (modalConfig.callback) {
      modalConfig.callback();
    }
  };

  const handleConfirmHarvest = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setLoadingStatus("Vui lòng xác nhận giao dịch cập nhật trạng thái thu hoạch trên MetaMask...");
      
      if (!window.ethereum) throw new Error("Không tìm thấy ví Blockchain (Metamask)!");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractAbi, signer);

      const tx = await contract.updateBatchStatus(lotInfo.id, 1);
      setLoadingStatus("Đang chờ xác thực khối dữ liệu thu hoạch trên Blockchain...");
      const receipt = await tx.wait();
      const realTxHash = receipt.hash || receipt.transactionHash;

      setLoadingStatus("Đang đồng bộ dữ liệu thu hoạch về hệ thống...");
      const response = await axiosInstance.post(`/farmer/batches/harvest-batch`, {
        batch_id: lotInfo.id,
        harvest_time: harvestData.harvest_time.replace("T", " "),
        harvest_method: harvestData.harvest_method,
        tx_hash: realTxHash
      });

      if (response.data.success) {
        setShowHarvestModal(false);
        setModalConfig({
          isOpen: true,
          title: "Cập Nhật Thành Công",
          message: "Thông tin thu hoạch lô hàng đã được ghi nhận trên Blockchain và hệ thống thành công.",
          type: "success",
          callback: () => {
            if (onRefresh) onRefresh();
          }
        });
      }
    } catch (err) {
      const parsedError = parseWeb3Error(err);
      setModalConfig({
        isOpen: parsedError.isOpen,
        title: parsedError.title,
        message: parsedError.message,
        type: parsedError.type,
        callback: parsedError.callback
      });
    } finally {
      setIsSubmitting(false);
      setLoadingStatus("");
    }
  };

  const handleConfirmTransfer = async (e) => {
    e.preventDefault();
    if (!selectedCoop.wallet_address) {
      setModalConfig({
        isOpen: true,
        title: "Cảnh Báo",
        message: "Vui lòng chọn Hợp Tác Xã tiếp nhận trước khi bàn giao.",
        type: "error"
      });
      return;
    }
    try {
      setIsSubmitting(true);
      setLoadingStatus("Vui lòng ký xác nhận chuyển giao quyền sở hữu lô hàng trên MetaMask...");
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractAbi, signer);
      const coopWalletAddress = selectedCoop.wallet_address.toLowerCase();

      const tx = await contract.transferBatchOwnership(lotInfo.id, coopWalletAddress);
      setLoadingStatus("Đang chờ mạng lưới xác thực giao dịch chuyển giao...");
      const receipt = await tx.wait();
      const realTxHash = receipt.hash || receipt.transactionHash;

      setLoadingStatus("Đang cập nhật trạng thái bàn giao vào cơ sở dữ liệu...");
      const response = await axiosInstance.post(`/farmer/batches/transfer-to-coop`, {
        batch_id: lotInfo.id,
        cooperative_name: cooperativeName.trim(),
        coop_wallet_address: coopWalletAddress,
        tx_hash: realTxHash
      });

      if (response.data.success) {
        setShowTransferModal(false);
        setModalConfig({
          isOpen: true,
          title: "Chuyển Giao Thành Công",
          message: `Lô hàng đã được bàn giao quyền sở hữu tới Hợp Tác Xã ${cooperativeName} thành công.`,
          type: "success",
          callback: () => {
            if (onRefresh) onRefresh();
          }
        });
      }
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
      setIsSubmitting(false);
      setLoadingStatus("");
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {lotInfo?.status === "INITIAL" && (
          <button
            onClick={() => setShowHarvestModal(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:opacity-90 transition-all focus:outline-none outline-none"
          >
            Xác nhận Thu Hoạch
          </button>
        )}

        {lotInfo?.status === "HARVESTED" && !extendedDetails?.technicalInfo.cooperative && (
          <button
            onClick={() => setShowTransferModal(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white default-transition hover:opacity-90 focus:outline-none outline-none"
            style={{ background: COLORS.coffee600 }}
          >
            Chuyển giao Hợp Tác Xã
          </button>
        )}
      </div>

      {showHarvestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full border p-6 space-y-4 shadow-xl focus:outline-none outline-none" tabIndex="-1">
            {isSubmitting && <LoadingSpinner loadingStatus={loadingStatus} />}
            <h3 className="font-bold text-base text-emerald-800">Cập Nhật Thông Tin Thu Hoạch</h3>
            <form onSubmit={handleConfirmHarvest} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Ngày Giờ Thu Hoạch</label>
                <input
                  type="datetime-local"
                  required
                  value={harvestData.harvest_time}
                  onChange={(e) => setHarvestData(prev => ({ ...prev, harvest_time: e.target.value }))}
                  disabled={isSubmitting}
                  className="w-full bg-white border text-sm rounded-xl p-2.5 outline-none focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Phương Pháp</label>
                <select
                  value={harvestData.harvest_method}
                  onChange={(e) => setHarvestData(prev => ({ ...prev, harvest_method: e.target.value }))}
                  disabled={isSubmitting}
                  className="w-full bg-white border text-sm rounded-xl p-2.5 outline-none focus:outline-none"
                >
                  <option value="Hái tỉa thủ công">Hái tỉa thủ công</option>
                  <option value="Hái tuốt cành">Hái tuốt cành</option>
                  <option value="Thu hoạch bằng máy">Thu hoạch bằng máy</option>
                </select>
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t">
                <button type="button" disabled={isSubmitting} onClick={() => setShowHarvestModal(false)} className="px-4 py-2 text-xs font-semibold border rounded-xl focus:outline-none">Hủy</button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2 text-xs font-bold text-white rounded-xl bg-emerald-600 focus:outline-none">
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full border p-6 space-y-4 shadow-xl focus:outline-none outline-none" tabIndex="-1">
            {isSubmitting && <LoadingSpinner loadingStatus={loadingStatus} />}
            <h3 className="font-bold text-base" style={{ color: COLORS.forest900 }}>Chuyển Giao Cho Hợp Tác Xã</h3>
            <form onSubmit={handleConfirmTransfer} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Chọn Hợp Tác Xã Tiếp Nhận</label>
                <select
                  required
                  value={selectedCoop.id}
                  onChange={(e) => {
                    const coop = cooperatives.find(c => c.id === e.target.value);
                    setSelectedCoop(coop || { id: "", name: "", wallet_address: "" });
                    setCooperativeName(coop ? coop.name : "");
                  }}
                  disabled={isSubmitting}
                  className="w-full bg-white border text-sm rounded-xl p-2.5 outline-none focus:outline-none"
                >
                  <option value="">-- Chọn Hợp Tác Xã --</option>
                  {cooperatives.map(coop => (
                    <option key={coop.id} value={coop.id}>{coop.name}</option>
                  ))}
                </select>
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t">
                <button type="button" disabled={isSubmitting} onClick={() => setShowTransferModal(false)} className="px-4 py-2 text-xs font-semibold border rounded-xl focus:outline-none">Hủy</button>
                <button type="submit" disabled={isSubmitting || !selectedCoop.wallet_address} className="px-5 py-2 text-xs font-bold text-white rounded-xl focus:outline-none" style={{ background: COLORS.forest600 }}>
                  Xác Nhận Bàn Giao
                </button>
              </div>
            </form>
          </div>
        </div>
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