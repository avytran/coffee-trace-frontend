/**
 * Tập trung quản lý địa chỉ Smart Contract hệ thống Coffee Traceability
 */

export const CONTRACT_ADDRESSES = {
  // 1️⃣ Contract Quản lý danh tính và phân quyền đối tác
  USER_REGISTRY: {
    address: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    name: "User Registry Contract",
    description: "Quản lý đăng ký tài khoản, vai trò (Role) và trạng thái (Status) chuỗi cung ứng.",
  },
  // 2️⃣ Contract Quản lý vòng đời và quyền sở hữu lô hàng cà phê
  BATCH_REGISTRY: {
    address: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
    name: "Batch Registry Contract",
    description: "Khởi tạo lô hàng, cập nhật trạng thái chuỗi cung ứng và chuyển giao quyền sở hữu.",
  },
  // 3️⃣ Contract Sổ cái ghi vết nhật ký bất biến (Audit Log)
  BATCH_EVENT_REGISTRY: {
    address: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
    name: "Batch Event Registry Contract",
    description: "Lưu vết lịch sử tác động, mã băm đối soát bảo mật dữ liệu thô chống giả mạo.",
  }
};

export const CONTRACT_ABIS = {
  // ABI cho UserRegistry.sol
  USER_REGISTRY: [
    "function registerUser(address _wallet, uint8 _role)",
    "function updateUserRole(address _wallet, uint8 _newRole)",
    "function updateUserStatus(address _wallet, uint8 _newStatus)",
    "function getUser(address _wallet) view returns (address wallet, uint8 role, uint8 status, uint256 createdAt)",
    "function hasRole(address _wallet, uint8 _role) view returns (bool)",
    "function isActive(address _wallet) view returns (bool)",
    "event UserRegistered(address indexed wallet, uint8 indexed role, uint8 status, uint256 createdAt)",
    "event UserRoleUpdated(address indexed wallet, uint8 oldRole, uint8 newRole, address indexed updatedBy)",
    "event UserStatusUpdated(address indexed wallet, uint8 oldStatus, uint8 newStatus, address indexed updatedBy)"
  ],

  // ABI cho BatchRegistry.sol
  BATCH_REGISTRY: [
    "function createBatch(string _batchId, string _traceabilityCode, string _ipfsCid, uint256 _weight)",
    "function updateBatchStatus(string _batchId, uint8 _newStatus)",
    "function transferBatchOwnership(string _batchId, address _to)",
    "function getBatch(string _batchId) view returns (string batchId, uint8 status, address currentOwner, string traceabilityCode, string ipfsCid, uint256 weight, uint256 createdAt)",
    "event BatchCreated(string batchId, string traceabilityCode, address indexed creator)",
    "event BatchStatusUpdated(string batchId, uint8 status)",
    "event BatchOwnershipTransferred(string batchId, address indexed from, address indexed to)"
  ],

  // ABI cho BatchEventRegistry.sol
  BATCH_EVENT_REGISTRY: [
    "function addBatchEvent(string _batchId, uint8 _action, string _ipfsCid, bytes32 _eventHash)",
    "function getBatchEvents(string _batchId) view returns (tuple(string batchId, uint8 action, address actor, string ipfsCid, bytes32 eventHash, uint256 timestamp)[])",
    "function verifyEventHash(string _batchId, uint256 _index, bytes32 _checkHash) view returns (bool)",
    "event BatchEventAdded(string batchId, uint8 action, address indexed actor, string ipfsCid)"
  ]
};

/**
 * Lấy địa chỉ contract công khai
 */
export const getContractAddress = (contractName) => {
  const contract = CONTRACT_ADDRESSES[contractName];
  if (!contract) {
    throw new Error(`[Web3 Config Error] Contract với tên "${contractName}" không tồn tại.`);
  }
  return contract.address;
};

/**
 * Lấy danh sách ABI (Human-Readable Format)
 */
export const getContractABI = (contractName) => {
  const abi = CONTRACT_ABIS[contractName];
  if (!abi) {
    throw new Error(`[Web3 Config Error] ABI cho contract "${contractName}" không tồn tại.`);
  }
  return abi;
};

/**
 * Xác thực địa chỉ ví hoặc contract chuẩn EVM
 */
export const isValidContractAddress = (address) => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};