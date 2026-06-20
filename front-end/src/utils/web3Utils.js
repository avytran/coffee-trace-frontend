import { ethers } from "ethers";

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

export const ensureHardhatNetwork = async () => {
  if (!window.ethereum) {
    throw new Error("MetaMask không được cài đặt hoặc không được hỗ trợ.");
  }

  const { chainId, chainName, rpcUrl, nativeCurrency } = NETWORKS.HARDHAT;

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId }],
    });
  } catch (switchError) {
    if (switchError.code === 4902) {
      try {
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

export const ensureGanacheNetwork = async () => {
  if (!window.ethereum) {
    throw new Error("MetaMask không được cài đặt hoặc không được hỗ trợ.");
  }

  const { chainId, chainName, rpcUrl, nativeCurrency } = NETWORKS.GANACHE;

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId }],
    });
  } catch (switchError) {
    if (switchError.code === 4902) {
      try {
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

export const getEthersProvider = () => {
  if (!window.ethereum) {
    throw new Error("MetaMask không được cài đặt hoặc không được hỗ trợ.");
  }
  return new ethers.BrowserProvider(window.ethereum);
};

export const getEthersSigner = async (provider) => {
  return await provider.getSigner();
};

export const requestEthereumAccounts = async () => {
  if (!window.ethereum) {
    throw new Error("MetaMask không được cài đặt hoặc không được hỗ trợ.");
  }
  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts",
  });
  return accounts;
};

export const createContract = (contractAddress, contractABI, signer) => {
  return new ethers.Contract(contractAddress, contractABI, signer);
};
