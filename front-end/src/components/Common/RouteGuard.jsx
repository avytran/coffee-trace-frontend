import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useWeb3 } from '../../Web3Context';

export default function RouteGuard({ allowedRoles }) {
  const { currentRole } = useWeb3();

  if (currentRole === 'GUEST') {
    return <Navigate to="/wallet-connect" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentRole)) {
    return <Navigate to="/select-role" replace />;
  }

  return <Outlet />;
}