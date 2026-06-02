import React from 'react';
import { useWeb3 } from '../context/Web3Context';
import './SelectRole.css';

const SelectRole = () => {
  const { currentRole, setCurrentRole, walletAddress } = useWeb3();

  const roles = [
    { id: 'Farmer', label: 'Coffee Farmer / Producer', desc: 'Create new lots and record harvest telemetry.' },
    { id: 'Processor', label: 'Processing Plant Admin', desc: 'Verify lot quality parameters and moisture levels.' },
    { id: 'Exporter', label: 'International Exporter', desc: 'Finalize custom clearance documentation and shipping.' }
  ];

  if (!walletAddress) {
    return <p className="warning-text">Please authorize and connect your wallet session first.</p>;
  }

  return (
    <div className="role-selection-container">
      <h3>Select Network Identity Role</h3>
      <p className="subtitle">Choose your node operational permission layer for on-chain telemetry submission.</p>
      
      <div className="roles-grid">
        {roles.map((role) => (
          <div 
            key={role.id} 
            className={`role-card ${currentRole === role.id ? 'active' : ''}`}
            onClick={() => setCurrentRole(role.id)}
          >
            <h4>{role.label}</h4>
            <p>{role.desc}</p>
          </div>
        ))}
      </div>

      {currentRole && (
        <div className="active-role-banner">
          Current Active Scope: <strong>{currentRole.toUpperCase()}</strong>
        </div>
      )}
    </div>
  );
};

export default SelectRole;