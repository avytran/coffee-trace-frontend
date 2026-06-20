import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';

const Web3AuthContext = createContext(null);

export function Web3AuthProvider({ children }) {
  const [account, setAccount] = useState(null);
  const [network, setNetwork] = useState('Chưa kết nối');
  const [role, setRole] = useState('ANONYMOUS');
  const [userData, setUserData] = useState(null);
  const [authStatus, setAuthStatus] = useState(''); 
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState('');

  const parseChainId = (chainId) => {
    if (chainId === '0x1') return 'Ethereum Mainnet';
    if (chainId === '0xaa36a7') return 'Sepolia Testnet';
    if (chainId === '0x5') return 'Goerli Testnet';
    if (chainId === '0x7a69' || chainId === '31337') return 'Hardhat Localhost';
    return `Chain ID: ${chainId}`;
  };

  const checkExistingAuth = async (walletAddress) => {
    const localToken = localStorage.getItem('token');
    const localAddress = localStorage.getItem('user_address');

    if (localToken && localAddress && localAddress.toLowerCase() === walletAddress.toLowerCase()) {
      try {
        const response = await axiosInstance.get('/auth/profile'); 
        const data = response.data;

        setRole(data.user.role);
        setUserData(data.user);
        setAuthStatus('ACTIVE');
        return true; 
      } catch (err) {
        logout();
      }
    }
    return false; 
  };

  const verifyWalletWithJwt = async (walletAddress) => {
    try {
      const nonceMessage = `Chào mừng bạn đến với ROBUSTRACE!\n\nNhấn ký để xác thực quyền truy cập vào hệ thống với địa chỉ ví:\n${walletAddress.toLowerCase()}\n\nThời gian: ${new Date().toISOString()}`;
      
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [nonceMessage, walletAddress],
      });

      const response = await axiosInstance.post('/auth/verify-wallet', {
        wallet_address: walletAddress,
        signature: signature,
        message: nonceMessage
      });

      const data = response.data;

      if (data.isAuthenticated && data.token) {
        setRole(data.user.role);
        setUserData(data.user);
        setAuthStatus('ACTIVE');
        
        localStorage.setItem('token', data.token);
        localStorage.setItem('user_role', data.user.role);
        localStorage.setItem('user_address', walletAddress.toLowerCase());
      } else {
        handleUnauthenticated(data);
      }
    } catch (err) {
      if (err?.code === 4001) {
        setError('Bạn đã hủy bỏ yêu cầu ký thông điệp xác thực trên MetaMask.');
      } else if (err.response) {
        handleUnauthenticated(err.response.data);
      } else {
        setError('Không thể thiết lập liên kết bảo mật với máy chủ.');
      }
    }
  };

  const handleUnauthenticated = (responseData) => {
    setRole('ANONYMOUS');
    setUserData(null);
    setAuthStatus(responseData?.status || 'UNREGISTERED');
    setError(responseData?.message || 'Tài khoản không được phép truy cập vào không gian làm việc.');
  };

  const logout = () => {
    setRole('ANONYMOUS');
    setUserData(null);
    setAuthStatus('');
    setAccount(null);
    localStorage.clear();
  };

  const connectMetaMask = async () => {
    setError('');
    setAuthStatus('');
    if (!window.ethereum) {
      setError('Không tìm thấy MetaMask. Vui lòng cài đặt MetaMask.');
      return;
    }

    try {
      setConnecting(true);
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const [selected] = accounts;
      
      if (selected) {
        setAccount(selected);
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        setNetwork(parseChainId(chainId));
        
        const isAuthenticated = await checkExistingAuth(selected);
        if (!isAuthenticated) {
          await verifyWalletWithJwt(selected);
        }
      }
    } catch (err) {
      if (err?.code === 4001) {
        setError('Yêu cầu bị từ chối. Vui lòng xác nhận kết nối trong MetaMask.');
      } else {
        setError('Không thể kết nối MetaMask.');
      }
    } finally {
      setConnecting(false);
    }
  };

  useEffect(() => {
    if (!window.ethereum) return;

    let isSubscribed = true;

    const initWeb3Auth = async () => {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (!isSubscribed) return;

        if (accounts.length > 0) {
          const currentAccount = accounts[0];
          setAccount(currentAccount);
          
          const chainId = await window.ethereum.request({ method: 'eth_chainId' });
          setNetwork(parseChainId(chainId));
          
          await checkExistingAuth(currentAccount);
        }
      } catch (err) {
        console.error(err);
      }
    };

    initWeb3Auth();

    const handleAccountsChanged = async (accounts) => {
      if (!isSubscribed) return;
      
      const newAccount = accounts[0] || null;
      if (newAccount?.toLowerCase() === account?.toLowerCase()) return;

      setAccount(newAccount);
      setError('');
      setAuthStatus('');
      
      if (newAccount) {
        const isAuthenticated = await checkExistingAuth(newAccount);
        if (!isAuthenticated) {
          await verifyWalletWithJwt(newAccount);
        }
      } else {
        setNetwork('Chưa kết nối');
        logout();
      }
    };

    const handleChainChanged = (chainId) => {
      if (!isSubscribed) return;
      setNetwork(parseChainId(chainId));
      window.location.reload(); 
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      isSubscribed = false;
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, [account]);

  return (
    <Web3AuthContext.Provider value={{
      account, network, role, userData, authStatus, connecting, error,
      connectMetaMask, logout, setError
    }}>
      {children}
    </Web3AuthContext.Provider>
  );
}

export const useWeb3Auth = () => useContext(Web3AuthContext);