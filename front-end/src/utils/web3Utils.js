import { ethers } from "ethers";

/**
 * Thông tin cấu hình cho các mạng blockchain
 */
export const NETWORKS = {
  HARDHAT: {
    chainId: "0x7a69", // 31337 in hex
    chainName: "Hardhat Local",
    rpcUrl: "http://127.0.0.1:8545",
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
    },
  },
  GANACHE: {
    chainId: "0x539", // 1337 in hex
    chainName: "Ganache Local",
    rpcUrl: "http://127.0.0.1:7545",
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
    },
  },
};

/**
 * Yêu cầu MetaMask chuyển sang mạng Hardhat Local
 * Nếu mạng chưa được thêm, tự động thêm vào ví
 * @throws {Error} Nếu không thể chuyển mạng hoặc thêm mạng mới
 */
export const ensureHardhatNetwork = async () => {
  if (!window.ethereum) {
    throw new Error("MetaMask không được cài đặt hoặc không được hỗ trợ.");
  }

  const { chainId, chainName, rpcUrl, nativeCurrency } = NETWORKS.HARDHAT;

  try {
    // Thử chuyển sang mạng Hardhat
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId }],
    });
  } catch (switchError) {
    // Error code 4902 = mạng chưa được thêm vào ví
    if (switchError.code === 4902) {
      try {
        // Tự động thêm mạng Hardhat vào ví
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId,
              chainName,
              rpcUrls: [rpcUrl],
              nativeCurrency,
            },
          ],
        });
      } catch (addError) {
        throw new Error(
          "Không thể tự động thêm mạng Hardhat vào ví. Vui lòng thêm thủ công!"
        );
      }
    } else {
      throw new Error(
        "Bạn bắt buộc phải chuyển sang mạng Hardhat Local để tiếp tục ký lệnh."
      );
    }
  }
};

/**
 * Yêu cầu MetaMask chuyển sang mạng Ganache Local
 * Nếu mạng chưa được thêm, tự động thêm vào ví
 * @throws {Error} Nếu không thể chuyển mạng hoặc thêm mạng mới
 */
export const ensureGanacheNetwork = async () => {
  if (!window.ethereum) {
    throw new Error("MetaMask không được cài đặt hoặc không được hỗ trợ.");
  }

  const { chainId, chainName, rpcUrl, nativeCurrency } = NETWORKS.GANACHE;

  try {
    // Thử chuyển sang mạng Ganache
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId }],
    });
  } catch (switchError) {
    // Error code 4902 = mạng chưa được thêm vào ví
    if (switchError.code === 4902) {
      try {
        // Tự động thêm mạng Ganache vào ví
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId,
              chainName,
              rpcUrls: [rpcUrl],
              nativeCurrency,
            },
          ],
        });
      } catch (addError) {
        throw new Error(
          "Không thể tự động thêm mạng Ganache vào ví. Vui lòng thêm thủ công!"
        );
      }
    } else {
      throw new Error(
        "Bạn bắt buộc phải chuyển sang mạng Ganache Local để tiếp tục ký lệnh."
      );
    }
  }
};

/**
 * Lấy BrowserProvider từ MetaMask
 * @returns {ethers.BrowserProvider} Provider instance
 * @throws {Error} Nếu MetaMask không có sẵn
 */
export const getEthersProvider = () => {
  if (!window.ethereum) {
    throw new Error("MetaMask không được cài đặt hoặc không được hỗ trợ.");
  }
  return new ethers.BrowserProvider(window.ethereum);
};

/**
 * Lấy Signer từ MetaMask
 * @param {ethers.BrowserProvider} provider - Ethers provider instance
 * @returns {Promise<ethers.Signer>} Signer instance
 */
export const getEthersSigner = async (provider) => {
  return await provider.getSigner();
};

/**
 * Yêu cầu kết nối MetaMask và trả về danh sách tài khoản
 * @returns {Promise<string[]>} Danh sách địa chỉ tài khoản
 * @throws {Error} Nếu người dùng từ chối hoặc MetaMask không có sẵn
 */
export const requestEthereumAccounts = async () => {
  if (!window.ethereum) {
    throw new Error("MetaMask không được cài đặt hoặc không được hỗ trợ.");
  }
  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts",
  });
  return accounts;
};

/**
 * Tạo Contract instance từ address và ABI
 * @param {string} contractAddress - Địa chỉ hợp đồng
 * @param {Array} contractABI - ABI của hợp đồng
 * @param {ethers.Signer} signer - Signer để ký giao dịch
 * @returns {ethers.Contract} Contract instance
 */
export const createContract = (contractAddress, contractABI, signer) => {
  return new ethers.Contract(contractAddress, contractABI, signer);
};
