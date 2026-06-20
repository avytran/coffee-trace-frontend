const env = import.meta.env?.VITE_NODE_ENV || process.env?.REACT_APP_NODE_ENV || 'local';
const isSepolia = env === 'sepolia';

const USER_REGISTRY_ADDR = isSepolia 
  ? (import.meta.env?.VITE_SEPOLIA_USER_REGISTRY || process.env?.REACT_APP_SEPOLIA_USER_REGISTRY)
  : (import.meta.env?.VITE_LOCAL_USER_REGISTRY || process.env?.REACT_APP_LOCAL_USER_REGISTRY);

const BATCH_REGISTRY_ADDR = isSepolia 
  ? (import.meta.env?.VITE_SEPOLIA_BATCH_REGISTRY || process.env?.REACT_APP_SEPOLIA_BATCH_REGISTRY)
  : (import.meta.env?.VITE_LOCAL_BATCH_REGISTRY || process.env?.REACT_APP_LOCAL_BATCH_REGISTRY);

const EVENT_REGISTRY_ADDR = isSepolia 
  ? (import.meta.env?.VITE_SEPOLIA_EVENT_REGISTRY || process.env?.REACT_APP_SEPOLIA_EVENT_REGISTRY)
  : (import.meta.env?.VITE_LOCAL_EVENT_REGISTRY || process.env?.REACT_APP_LOCAL_EVENT_REGISTRY);

export const CONTRACT_ADDRESSES = {
  USER_REGISTRY: {
    address: USER_REGISTRY_ADDR,
    name: "User Registry Contract",
    description: "Quản lý đăng ký tài khoản, vai trò (Role) và trạng thái (Status) chuỗi cung ứng.",
  },
  BATCH_REGISTRY: {
    address: BATCH_REGISTRY_ADDR,
    name: "Batch Registry Contract",
    description: "Khởi tạo lô hàng, cập nhật trạng thái chuỗi cung ứng và chuyển giao quyền sở hữu.",
  },
  BATCH_EVENT_REGISTRY: {
    address: EVENT_REGISTRY_ADDR,
    name: "Batch Event Registry Contract",
    description: "Lưu vết lịch sử tác động, mã băm đối soát bảo mật dữ liệu thô chống giả mạo.",
  }
};

export const CONTRACT_ABIS = {
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
  BATCH_REGISTRY: [
    "function createBatch(string _batchId, string _traceabilityCode, string _ipfsCid, uint256 _weight)",
    "function updateBatchStatus(string _batchId, uint8 _newStatus)",
    "function transferBatchOwnership(string _batchId, address _to)",
    "function getBatch(string _batchId) view returns (string batchId, uint8 status, address currentOwner, string traceabilityCode, string ipfsCid, uint256 weight, uint256 createdAt)",
    "event BatchCreated(string batchId, string traceabilityCode, address indexed creator)",
    "event BatchStatusUpdated(string batchId, uint8 status)",
    "event BatchOwnershipTransferred(string batchId, address indexed from, address indexed to)"
  ],
  BATCH_EVENT_REGISTRY: [
    "function addBatchEvent(string _batchId, uint8 _action, string _ipfsCid, bytes32 _eventHash)",
    "function getBatchEvents(string _batchId) view returns (tuple(string batchId, uint8 action, address actor, string ipfsCid, bytes32 eventHash, uint256 timestamp)[])",
    "function verifyEventHash(string _batchId, uint256 _index, bytes32 _checkHash) view returns (bool)",
    "event BatchEventAdded(string batchId, uint8 action, address indexed actor, string ipfsCid)"
  ]
};

export const getContractAddress = (contractName) => {
  const contract = CONTRACT_ADDRESSES[contractName];
  if (!contract || !contract.address) {
    throw new Error(`[Web3 Config Error] Địa chỉ Contract "${contractName}" trống hoặc cấu hình lỗi môi trường.`);
  }
  return contract.address;
};

export const getContractABI = (contractName) => {
  const abi = CONTRACT_ABIS[contractName];
  if (!abi) {
    throw new Error(`[Web3 Config Error] ABI cho contract "${contractName}" không tồn tại.`);
  }
  return abi;
};

export const isValidContractAddress = (address) => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

console.log(`[Frontend Web3 Active]: Khởi động dApp trên mạng ${env.toUpperCase()}`);