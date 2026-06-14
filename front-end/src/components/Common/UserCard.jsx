import React from 'react';
import { COLORS } from '../../constants/colors';
import { getRoleName } from '../../utils/getRoleName';

export const UserCard = ({ userData, role }) => {
    return (
        <aside 
            className="w-full h-fit rounded-[2rem] border p-6 bg-white/95 shadow-xl shadow-coffee-200/20 sticky top-24" 
            style={{ borderColor: COLORS.coffee200 }}
        >
            {/* Header Card */}
            <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: '#E8F5E9' }}>
                    <i className="fa-solid fa-leaf text-xl" style={{ color: COLORS.forest700 }} />
                </div>
                <div>
                    <h2 className="font-bold text-base leading-snug" style={{ color: COLORS.forest900 }}>
                        {userData?.name || "Hợp Tác Xã Cà Phê Cầu Đất"}
                    </h2>
                    <p className="text-xs font-medium mt-1" style={{ color: COLORS.coffee600 }}>
                        Vai trò: <span className="font-semibold text-forest-700">{getRoleName(role)}</span>
                    </p>
                </div>
            </div>

            <div className="h-[1px] bg-gradient-to-r from-transparent via-coffee-200 to-transparent my-4" />

            {/* Body Card */}
            <div className="space-y-4 text-sm">
                <div className="flex items-center justify-between pt-1">
                    <span style={{ color: COLORS.coffee500 }}>Trạng thái ví</span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-50 border border-green-200" style={{ color: COLORS.forest800 }}>
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        Đã kết nối
                    </span>
                </div>
            </div>
        </aside>
    );
};