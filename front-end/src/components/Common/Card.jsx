import React from 'react'

export const Card = ({ children, className = "", onClick }) => (
  <div className={`rounded-2xl ${className}`}
    style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(221,184,146,0.3)",
      boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}
    onClick={onClick}  
    >
    {children}
  </div>
);
