import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';

const Web3Context = createContext(null);

export const Web3Provider = ({ children }) => {
  const [walletAddress, setWalletAddress] = useState("");
  const [signer, setSigner] = useState(null);
  const [currentRole, setCurrentRole] = useState("");
  const [loading, setLoading] = useState(false);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Metamask is not installed!");
      return null;
    }
    try {
      setLoading(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const web3Signer = provider.getSigner();
      
      setWalletAddress(accounts[0]);
      setSigner(web3Signer);
      return { address: accounts[0], signer: web3Signer };
    } catch (error) {
      console.error("Error connecting wallet:", error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = () => {
    setWalletAddress("");
    setSigner(null);
    setCurrentRole("");
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
        } else {
          disconnectWallet();
        }
      });
    }
  }, []);

  return (
    <Web3Context.Provider value={{ walletAddress, signer, currentRole, setCurrentRole, connectWallet, disconnectWallet, loading }}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error("useWeb3 must be used within a Web3Provider");
  }
  return context;
};