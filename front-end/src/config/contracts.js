/**
 * Tập trung quản lý địa chỉ Smart Contract
 * Dễ dàng cập nhật khi deploy contract mới
 */

export const CONTRACT_ADDRESSES = {
  // Registry Contract cho quản lý user và role trên blockchain
  REGISTRY: {
    address: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    name: "Registry Contract",
    description: "Quản lý đăng ký user và phân quyền trên blockchain",
  },
  // Có thể thêm các contract khác sau này
  // COFFEE_BATCH: "0x...",
  // TRACEABILITY: "0x...",
};

export const CONTRACT_ABIS = {
  // ABI cho Registry Contract
  REGISTRY: [
    "function registerUser(address _wallet, uint8 _role) external",
    "event UserRegistered(address indexed wallet, uint8 role)",
  ],
  // Có thể thêm các ABI khác sau này
};

/**
 * Lấy địa chỉ contract
 * @param {string} contractName - Tên contract (ví dụ: 'REGISTRY')
 * @returns {string} Địa chỉ contract
 */
export const getContractAddress = (contractName) => {
  const contract = CONTRACT_ADDRESSES[contractName];
  if (!contract) {
    throw new Error(`Contract ${contractName} không tồn tại trong config.`);
  }
  return contract.address;
};

/**
 * Lấy ABI contract
 * @param {string} contractName - Tên contract (ví dụ: 'REGISTRY')
 * @returns {Array} ABI của contract
 */
export const getContractABI = (contractName) => {
  const abi = CONTRACT_ABIS[contractName];
  if (!abi) {
    throw new Error(`ABI cho contract ${contractName} không tồn tại trong config.`);
  }
  return abi;
};

/**
 * Xác thực địa chỉ contract hợp lệ
 * @param {string} address - Địa chỉ để kiểm tra
 * @returns {boolean} True nếu là địa chỉ Ethereum hợp lệ
 */
export const isValidContractAddress = (address) => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};
