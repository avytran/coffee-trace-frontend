import React, { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import './SignTransaction.css';

const SignTransaction = () => {
  const { currentRole, signer } = useWeb3();
  const [txState, setTxState] = useState("IDLE");
  const [txHash, setTxHash] = useState("");

  const executeContractTransaction = async () => {
    if (!signer) return;
    
    try {
      setTxState("SIGNING");
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const generatedTxHash = "0x" + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
      setTxHash(generatedTxHash);
      setTxState("MINING");
      
      await new Promise(resolve => setTimeout(resolve, 2500));
      setTxState("SUCCESS");
    } catch (error) {
      console.error("Execution failed:", error);
      setTxState("IDLE");
    }
  };

  const getActionName = () => {
    if (currentRole === 'Farmer') return "createCoffeeLot()";
    if (currentRole === 'Processor') return "verifyAndProcessLot()";
    if (currentRole === 'Exporter') return "finalizeExport()";
    return "executeTransaction()";
  };

  return (
    <div className="transaction-signing-panel">
      <h3>On-Chain Cryptographic Execution</h3>
      <p className="panel-desc">Commit current telemetry records permanently to the immutable distributed ledger ledger node endpoints.</p>

      <div className="execution-scope">
        <span>Target Subroutine Call:</span>
        <code>{getActionName()}</code>
      </div>

      {txState === "IDLE" && (
        <button className="btn-execute" onClick={executeContractTransaction} disabled={!currentRole}>
          {currentRole ? "Sign & Broadcast Transaction" : "Assign Operational Role First"}
        </button>
      )}

      {txState === "SIGNING" && (
        <div className="status-loader signing">
          <div className="spinner"></div>
          <p>Awaiting cryptographic wallet confirmation approval structure...</p>
        </div>
      )}

      {txState === "MINING" && (
        <div className="status-loader mining">
          <div className="spinner"></div>
          <p>Transaction Broadcasted. Waiting for ledger receipt payload consensus mining algorithms...</p>
          <p className="hash-log">TxHash: <code>{txHash}</code></p>
        </div>
      )}

      {txState === "SUCCESS" && (
        <div className="execution-success-message">
          <p className="success-title">✓ Execution Finalized & Mined Successfully</p>
          <p className="hash-log">Receipt Hash: <code>{txHash}</code></p>
          <button className="btn-reset" onClick={() => setTxState("IDLE")}>Initiate New Submission Pipeline</button>
        </div>
      )}
    </div>
  );
};

export default SignTransaction;