import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useWeb3Auth } from '../../context/Web3AuthContext';

export function MemberRoute() {
    const { role, authStatus } = useWeb3Auth();

    if (authStatus !== 'ACTIVE' || role === 'ANONYMOUS') {
        return <Navigate to="/connect" replace />;
    }

    return <Outlet />;
}

export function AdminRoute() {
    const { role, authStatus } = useWeb3Auth();

    if (authStatus !== 'ACTIVE' || role === 'ANONYMOUS') {
        return <Navigate to="/connect" replace />;
    }

    if (role !== 'ADMIN') {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}