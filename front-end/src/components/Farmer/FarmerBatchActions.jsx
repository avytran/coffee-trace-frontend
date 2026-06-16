import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import axiosInstance from "../../utils/axiosInstance";
import { COLORS } from "../../constants/colors";
import { getContractABI, getContractAddress } from "../../config/contracts";

import { FileInput } from "../Common/FileInput";

const contractAbi = getContractABI("BATCH_REGISTRY");
const contractAddress = getContractAddress("BATCH_REGISTRY");

export default function FarmerBatchActions({ lotInfo, extendedDetails, onRefresh }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHarvestModal, setShowHarvestModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);

  const [cooperatives, setCooperatives] = useState([]);
  const [selectedCoop, setSelectedCoop] = useState({ id: "", name: "", wallet_address: "" });
  const [cooperativeName, setCooperativeName] = useState("");

  const [harvestData, setHarvestData] = useState({
    harvest_time: new Date().toISOString().slice(0, 16),
    harvest_method: "Hái tỉa thủ công (Hand-picking)"
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

  const handleConfirmHarvest = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      if (!window.ethereum) throw new Error("Không tìm thấy ví Blockchain (Metamask)!");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractAbi, signer);

      const tx = await contract.updateBatchStatus(lotInfo.id, 1);
      const receipt = await tx.wait();
      const realTxHash = receipt.hash || receipt.transactionHash;

      const response = await axiosInstance.post(`/farmer/batches/harvest-batch`, {
        batch_id: lotInfo.id,
        harvest_time: harvestData.harvest_time.replace("T", " "),
        harvest_method: harvestData.harvest_method,
        tx_hash: realTxHash
      });

      if (response.data.success) {
        setShowHarvestModal(false);
        onRefresh();
      }
    } catch (err) {
      alert(`Lỗi nghiệp vụ: ${err.reason || err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmTransfer = async (e) => {
    e.preventDefault();
    if (!selectedCoop.wallet_address) return alert("Vui lòng chọn Hợp Tác Xã!");
    try {
      setIsSubmitting(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractAbi, signer);
      const coopWalletAddress = selectedCoop.wallet_address.toLowerCase();

      const tx = await contract.transferBatchOwnership(lotInfo.id, coopWalletAddress);
      const receipt = await tx.wait();
      const realTxHash = receipt.hash || receipt.transactionHash;

      const response = await axiosInstance.post(`/farmer/batches/transfer-to-coop`, {
        batch_id: lotInfo.id,
        cooperative_name: cooperativeName.trim(),
        coop_wallet_address: coopWalletAddress,
        tx_hash: realTxHash
      });

      if (response.data.success) {
        setShowTransferModal(false);
        onRefresh();
      }
    } catch (err) {
      alert(`Lỗi bàn giao: ${err.reason || err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {lotInfo?.status === "INITIAL" && (
          <button
            onClick={() => setShowHarvestModal(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:opacity-90 transition-all"
          >
            Xác nhận Thu Hoạch
          </button>
        )}

        {lotInfo?.status === "HARVESTED" && !extendedDetails?.technicalInfo.cooperative && (
          <button
            onClick={() => setShowTransferModal(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white default-transition hover:opacity-90"
            style={{ background: COLORS.coffee600 }}
          >
            Chuyển giao Hợp Tác Xã
          </button>
        )}
      </div>

      {/* ================= MODAL FORM 1: THU HOẠCH ================= */}
      {showHarvestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full border p-6 space-y-4 shadow-xl">
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
                  className="w-full bg-white border text-sm rounded-xl p-2.5 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Phương Pháp</label>
                <select
                  value={harvestData.harvest_method}
                  onChange={(e) => setHarvestData(prev => ({ ...prev, harvest_method: e.target.value }))}
                  disabled={isSubmitting}
                  className="w-full bg-white border text-sm rounded-xl p-2.5 outline-none"
                >
                  <option value="Hái tỉa thủ công">Hái tỉa thủ công</option>
                  <option value="Hái tuốt cành">Hái tuốt cành</option>
                  <option value="Thu hoạch bằng máy">Thu hoạch bằng máy</option>
                </select>
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t">
                <button type="button" onClick={() => setShowHarvestModal(false)} className="px-4 py-2 text-xs font-semibold border rounded-xl">Hủy</button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2 text-xs font-bold text-white rounded-xl bg-emerald-600">
                  {isSubmitting ? "Đang xử lý..." : "Lưu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL FORM 2: CHUYỂN GIAO HTX ================= */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full border p-6 space-y-4 shadow-xl">
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
                  className="w-full bg-white border text-sm rounded-xl p-2.5 outline-none"
                >
                  <option value="">-- Chọn Hợp Tác Xã --</option>
                  {cooperatives.map(coop => (
                    <option key={coop.id} value={coop.id}>{coop.name}</option>
                  ))}
                </select>
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t">
                <button type="button" onClick={() => setShowTransferModal(false)} className="px-4 py-2 text-xs font-semibold border rounded-xl">Hủy</button>
                <button type="submit" disabled={isSubmitting || !selectedCoop.wallet_address} className="px-5 py-2 text-xs font-bold text-white rounded-xl" style={{ background: COLORS.forest600 }}>
                  {isSubmitting ? "Đang ký Blockchain..." : "Xác Nhận Bàn Giao"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}