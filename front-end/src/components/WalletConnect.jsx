import React, { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import './WalletConnect.css';

const WalletConnect = () => {
  const { connectWallet, walletAddress, disconnectWallet, loading } = useWeb3();
  const [jwtToken, setJwtToken] = useState("");
  const [signing, setSigning] = useState(false);

  const handleAuthentication = async () => {
    const connection = await connectWallet();
    if (!connection) return;

    try {
      setSigning(true);
      const message = `Authentication request for Coffee Trace Framework at timestamp: ${Date.now()}`;
      
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, connection.address],
      });

      if (signature) {
        const mockJwtToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mockDataTokenForCoffeeTraceLotTransactionSecuritySignatureVerification";
        setJwtToken(mockJwtToken);
        localStorage.setItem("authToken", mockJwtToken);
      }
    } catch (error) {
      console.error("Signature rejected or failed:", error);
    } finally {
      setSigning(false);
    }
  };

  return (
    <div className="wallet-connect-card">
      <div className="card-header">
        <h2>Metamask Authentication</h2>
        <p>Establish cryptographic connection to interact with Coffee Trace contracts.</p>
      </div>

      {!walletAddress ? (
        <button className="btn-connect" onClick={handleAuthentication} disabled={loading || signing}>
          {loading || signing ? "Processing Session..." : "Connect Metamask Wallet"}
        </button>
      ) : (
        <div className="session-details">
          <div className="status-badge">Connected</div>
          <p className="address-display">Address: <code>{walletAddress}</code></p>
          {jwtToken && <p className="jwt-status">JWT Auth Verified successfully.</p>}
          <button className="btn-disconnect" onClick={disconnectWallet}>Disconnect Session</button>
        </div>
      )}
    </div>
  );
};

export default WalletConnect;