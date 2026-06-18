import { useState } from "react";
import { ethers } from "ethers";
import axiosInstance from "../../utils/axiosInstance";
import {
  ensureHardhatNetwork,
  getEthersProvider,
  getEthersSigner,
  createContract,
} from "../../utils/web3Utils";
import { getContractAddress, getContractABI } from "../../config/contracts";

// 🌟 THAY ĐỔI 1: Trỏ chính xác tới cấu hình của UserRegistry Contract mới
const USER_REGISTRY_ADDRESS = getContractAddress("USER_REGISTRY");
const USER_REGISTRY_ABI = getContractABI("USER_REGISTRY");

// 🌟 THAY ĐỔI 2: Đồng bộ chuẩn chỉ số enum uint8 của UserRegistry.sol mới
const ROLE_INDEX_MAP = {
  ADMIN: 0,
  FARMER: 1,
  COOPERATIVE: 2,
  PROCESSOR: 3,
  EXPORTER: 4,
  RECEIVER: 5,
  ANONYMOUS: 6
};

const CreateUserForm = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    wallet_address: "",
    role: "FARMER", // Đồng bộ key mặc định mới
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    // 1. Kiểm tra định dạng địa chỉ ví cơ bản
    const walletAddress = formData.wallet_address.trim();
    const walletRegex = /^0x[a-fA-F0-9]{40}$/;
    
    if (!walletAddress.match(walletRegex)) {
      setErrorMessage("Địa chỉ ví không hợp lệ! Chuỗi chuẩn EVM phải bắt đầu bằng 0x và có tổng độ dài 42 ký tự.");
      return;
    }

    // 2. Kiểm tra sự tồn tại của môi trường Web3 (MetaMask)
    if (!window.ethereum) {
      setErrorMessage("Không tìm thấy MetaMask! Vui lòng cài đặt Extension ví để tự trả phí Gas.");
      return;
    }

    setSubmitting(true);
    let createdUserId = null;

    try {
      setErrorMessage("Bước 1: Đang khởi tạo tài khoản tạm thời trên hệ thống...");

      // ── BƯỚC 1: Gọi API tạo User lưu vào DB với trạng thái tạm thời PENDING
      const backendRes = await axiosInstance.post("/admin/users/create-pending", {
        name: formData.name,
        wallet_address: walletAddress, 
        role: formData.role
      });
      createdUserId = backendRes.data.userId; 

      setErrorMessage("Bước 2: Đang kiểm tra cấu hình mạng trên MetaMask...");

      // ── BƯỚC 2: Kết nối MetaMask & Ép buộc chuyển đổi sang mạng Hardhat Local
      await ensureHardhatNetwork();
      
      const provider = getEthersProvider();
      const signer = await getEthersSigner(provider);
      
      // 🌟 THAY ĐỔI 3: Khởi tạo thực thể Contract thông qua cấu hình UserRegistry mới
      const contract = createContract(USER_REGISTRY_ADDRESS, USER_REGISTRY_ABI, signer);
      const roleIndex = ROLE_INDEX_MAP[formData.role];
      
      setErrorMessage("Vui lòng mở ví MetaMask và ký xác nhận giao dịch (Admin trả Gas)...");
      
      // Kích hoạt MetaMask Popup để Admin ký lệnh On-chain đăng ký user vào UserRegistry.sol
      const tx = await contract.registerUser(walletAddress, roleIndex);

      setErrorMessage("Giao dịch đang được xử lý trên mạng lưới... Vui lòng đợi block xác nhận.");

      // Đợi block được đào thành công trên Hardhat Ledger
      const receipt = await tx.wait();
      console.log("Giao dịch đã đóng block thành công:", receipt);

      setErrorMessage("Bước 3: Đang kích hoạt trạng thái tài khoản về Cơ sở dữ liệu...");

      // ── BƯỚC 3: Sau khi block thành công, gọi API Webhook chuyển đổi trạng thái thành ACTIVE
      const syncResponse = await axiosInstance.post("/admin/users/sync-success", {
        userId: createdUserId,
        txHash: tx.hash
      });
      
      if (syncResponse.data.success) {
        alert("Admin đã trả Gas thành công! Tài khoản đối tác đã được kích hoạt (ACTIVE) trên Blockchain & DB.");
        
        // Reset form sau khi hoàn tất chuỗi hành động hỗn hợp
        setFormData({ name: "", wallet_address: "", role: "FARMER" });
        setErrorMessage("");
        
        if (onSuccess) onSuccess(syncResponse.data);
      }

    } catch (err) {
      console.error("Lỗi hệ thống trong luồng xử lý hỗn hợp:", err);
      
      if (err.code === "ACTION_REJECTED" || err.message?.includes("user rejected action")) {
        setErrorMessage("Giao dịch bị hủy! Admin đã từ chối ký và thanh toán Gas trên MetaMask.");
      } else {
        setErrorMessage(
          err.response?.data?.message || 
          err.message || 
          "Đã xảy ra lỗi hệ thống trong quá trình thực thi On-chain."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="glass-panel p-8 rounded-[2rem] border border-coffee-200 bg-white/95 max-w-xl mx-auto shadow-md">
      <div className="mb-6">
        <h2 className="text-xl font-serif font-bold text-forest-900 flex items-center gap-2">
          <i className="fa-solid fa-signature text-forest-600"></i> Cấp Quyền & Tạo Đối Tác (Admin Trả Gas)
        </h2>
        <p className="text-xs text-forest-600 mt-1">
          Hệ thống lưu thông tin tạm thời, sau đó ứng dụng sẽ kích hoạt ví <span className="font-semibold text-blue-600">MetaMask</span> để ký duyệt hàm <code className="font-mono bg-coffee-100 px-1 rounded text-red-600">registerUser</code> trên <span className="font-semibold">UserRegistry</span> contract.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-start gap-2">
          <i className="fa-solid fa-circle-exclamation mt-0.5"></i> 
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Trường: name */}
        <div>
          <label className="block text-xs font-semibold text-forest-700 uppercase tracking-wider mb-2">
            Họ và Tên / Tên cơ sở đại diện <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Nhập tên hiển thị hoặc tên cơ sở..."
            className="w-full px-4 py-3 rounded-xl border border-coffee-200 text-sm focus:ring-2 focus:ring-forest-500 bg-white text-forest-900"
          />
        </div>

        {/* Trường: wallet_address */}
        <div>
          <label className="block text-xs font-semibold text-forest-700 uppercase tracking-wider mb-2">
            Địa chỉ Ví Khách Hàng (wallet_address) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="wallet_address"
            required
            value={formData.wallet_address}
            onChange={handleInputChange}
            placeholder="0x..."
            className="w-full px-4 py-3 rounded-xl border border-coffee-200 font-mono text-sm focus:ring-2 focus:ring-forest-500 bg-white text-forest-900"
          />
        </div>

        {/* Trường: role */}
        <div>
          <label className="block text-xs font-semibold text-forest-700 uppercase tracking-wider mb-2">
            Vai trò Chuỗi Cung Ứng (role) <span className="text-red-500">*</span>
          </label>
          <select
            name="role"
            required
            value={formData.role}
            onChange={handleInputChange}
            className="w-full px-4 py-3 rounded-xl border border-coffee-200 text-sm font-semibold focus:ring-2 focus:ring-forest-500 bg-white text-forest-900"
          >
            <option value="FARMER">Nông Dân (FARMER)</option>
            <option value="COOPERATIVE">Hợp Tác Xã (COOPERATIVE)</option>
            <option value="PROCESSOR">Nhà Máy Chế Biến (PROCESSOR)</option>
            <option value="EXPORTER">Doanh Nghiệp Xuất Khẩu (EXPORTER)</option>
            <option value="RECEIVER">Bên Nhập Khẩu / Thu Mua (RECEIVER)</option>
            <option value="ADMIN">Quản Trị Viên (ADMIN)</option>
          </select>
        </div>

        {/* Khu vực nút bấm điều khiển */}
        <div className="pt-4 flex items-center justify-end gap-3 border-t border-coffee-100">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-forest-700 bg-coffee-100 hover:bg-coffee-200 transition-colors"
            >
              Hủy bỏ
            </button>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-forest-800 hover:bg-forest-900 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <i className="fa-solid fa-circle-notch fa-spin"></i> Đang ghi sổ cái...
              </>
            ) : (
              <>
                <i className="fa-solid fa-wallet"></i> Ký MetaMask & Trả Gas
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateUserForm;