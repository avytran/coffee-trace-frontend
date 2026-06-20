import { useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import {
  getEthersProvider,
  getEthersSigner,
  createContract,
} from "../../utils/web3Utils";
import { getContractAddress, getContractABI } from "../../config/contracts";
import { ROLE_INDEX_MAP } from "../../constants/roleIndex";
import { parseWeb3Error } from "../../utils/errorHandler";
import { NotificationModal } from "../Common/NotificationModal";
import LoadingSpinner from "../Common/LoadingSpinner";

const USER_REGISTRY_ADDRESS = getContractAddress("USER_REGISTRY");
const USER_REGISTRY_ABI = getContractABI("USER_REGISTRY");

const CreateUserForm = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    wallet_address: "",
    role: "FARMER",
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState("");

  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "success",
    callback: null,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCloseModal = () => {
    setModalConfig((prev) => ({ ...prev, isOpen: false }));
    if (modalConfig.callback) {
      modalConfig.callback();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    const walletAddress = formData.wallet_address.trim();
    const walletRegex = /^0x[a-fA-F0-9]{40}$/;
    
    if (!walletAddress.match(walletRegex)) {
      setModalConfig({
        isOpen: true,
        title: "Dữ Liệu Không Hợp Lệ",
        message: "Địa chỉ ví chuẩn EVM phải bắt đầu bằng 0x và có tổng độ dài 42 ký tự.",
        type: "error"
      });
      return;
    }

    if (!window.ethereum) {
      setModalConfig({
        isOpen: true,
        title: "Thiếu Tiện Ích Mở Rộng",
        message: "Không tìm thấy MetaMask! Vui lòng cài đặt Extension ví để tiếp tục ký duyệt.",
        type: "error"
      });
      return;
    }

    setSubmitting(true);
    let createdUserId = null;

    try {
      setLoadingStatus("Bước 1: Đang khởi tạo tài khoản tạm thời trên hệ thống...");
      const backendRes = await axiosInstance.post("/admin/users/create-pending", {
        name: formData.name,
        wallet_address: walletAddress, 
        role: formData.role
      });
      createdUserId = backendRes.data.userId; 

      setLoadingStatus("Bước 2: Đang kết nối ví và kiểm tra cấu hình mạng MetaMask...");
      
      const provider = getEthersProvider();
      if (provider && (provider.pollingInterval === 4000 || !provider.pollingInterval)) {
        provider.pollingInterval = 15000; 
      }

      const signer = await getEthersSigner(provider);
      const contract = createContract(USER_REGISTRY_ADDRESS, USER_REGISTRY_ABI, signer);
      const roleIndex = ROLE_INDEX_MAP[formData.role];
      
      setLoadingStatus("Vui lòng mở ví MetaMask và xác nhận giao dịch đăng ký...");
      const tx = await contract.registerUser(walletAddress, roleIndex, {
        gasLimit: 300000 
      });

      setLoadingStatus("Giao dịch đang được xử lý trên Blockchain... Vui lòng đợi block xác nhận.");
      const receipt = await tx.wait();

      setLoadingStatus("Bước 3: Đang kích hoạt đồng bộ trạng thái tài khoản về Cơ sở dữ liệu...");
      const syncResponse = await axiosInstance.post("/admin/users/sync-success", {
        userId: createdUserId,
        txHash: tx.hash
      });
      
      setSubmitting(false); 

      if (syncResponse.data.success) {
        setModalConfig({
          isOpen: true,
          title: "Cấp Quyền Thành Công! ",
          message: `Tài khoản của đối tác "${formData.name}" đã được kích hoạt đồng bộ trên Blockchain & DB thành công.`,
          type: "success",
          callback: () => {
            setFormData({ name: "", wallet_address: "", role: "FARMER" });
            if (onSuccess) onSuccess(syncResponse.data);
          }
        });
      }

    } catch (err) {
      console.error(err);
      setSubmitting(false); 
      setModalConfig(parseWeb3Error(err));
    }
  };

  return (
    <div className="relative glass-panel p-8 rounded-[2rem] border border-coffee-200 bg-white/95 max-w-xl mx-auto shadow-md overflow-hidden">
      {submitting && <LoadingSpinner loadingStatus={loadingStatus} />}

      <div className="mb-6">
        <h2 className="text-xl font-serif font-bold text-forest-900 flex items-center gap-2">
          <i className="fa-solid fa-signature text-forest-600"></i> Cấp Quyền
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold text-forest-700 uppercase tracking-wider mb-2">
            Họ và Tên / Tên cơ sở đại diện <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            required
            disabled={submitting} 
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Nhập tên hiển thị hoặc tên cơ sở..."
            className="w-full px-4 py-3 rounded-xl border border-coffee-200 text-sm focus:ring-2 focus:ring-forest-500 bg-white text-forest-900 disabled:bg-coffee-100 disabled:text-forest-400"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-forest-700 uppercase tracking-wider mb-2">
            Địa chỉ Ví Khách Hàng<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="wallet_address"
            required
            disabled={submitting} 
            value={formData.wallet_address}
            onChange={handleInputChange}
            placeholder="0x..."
            className="w-full px-4 py-3 rounded-xl border border-coffee-200 font-mono text-sm focus:ring-2 focus:ring-forest-500 bg-white text-forest-900 disabled:bg-coffee-100 disabled:text-forest-400"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-forest-700 uppercase tracking-wider mb-2">
            Vai trò Chuỗi Cung Ứng<span className="text-red-500">*</span>
          </label>
          <select
            name="role"
            required
            disabled={submitting} 
            value={formData.role}
            onChange={handleInputChange}
            className="w-full px-4 py-3 rounded-xl border border-coffee-200 text-sm font-semibold focus:ring-2 focus:ring-forest-500 bg-white text-forest-900 disabled:bg-coffee-100 disabled:text-forest-400"
          >
            <option value="FARMER">Nông Dân (FARMER)</option>
            <option value="COOPERATIVE">Hợp Tác Xã (COOPERATIVE)</option>
            <option value="PROCESSOR">Nhà Máy Chế Biến (PROCESSOR)</option>
            <option value="EXPORTER">Doanh Nghiệp Xuất Khẩu (EXPORTER)</option>
            <option value="RECEIVER">Bên Nhập Khẩu / Thu Mua (RECEIVER)</option>
            <option value="ADMIN">Quản Trị Viên (ADMIN)</option>
          </select>
        </div>

        <div className="pt-4 flex items-center justify-end gap-3 border-t border-coffee-100">
          {onClose && (
            <button
              type="button"
              disabled={submitting}
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-forest-700 bg-coffee-100 hover:bg-coffee-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Hủy bỏ
            </button>
          )}
          <button
            type="submit"
            disabled={submitting} 
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-forest-800 hover:bg-forest-900 transition-all flex items-center gap-2 disabled:bg-forest-400 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <i className="fa-solid fa-circle-notch animate-spin"></i> Đang ghi chuỗi...
              </>
            ) : (
              <>
                <i className="fa-solid fa-wallet"></i> Lưu
              </>
            )}
          </button>
        </div>
      </form>

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

export default CreateUserForm;