import React from 'react';
import { COLORS } from '../../constants/colors';

export default function LoadingSpinner ({loadingStatus}) {
  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-md rounded-2xl p-6 transition-all duration-300">
      <div className="relative flex items-center justify-center w-20 h-20 mb-4">
        <div className="absolute w-16 h-16 border-4 border-dashed rounded-full animate-spin" style={{ borderColor: COLORS.forest900, animationDuration: '3s' }}></div>
        <div className="absolute w-12 h-12 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: COLORS.coffee600 }}></div>
        <div className="w-4 h-4 rounded-full animate-pulse" style={{ background: COLORS.forest900 }}></div>
      </div>
      <p className="text-sm font-semibold tracking-wide text-center max-w-md animate-pulse" style={{ color: COLORS.forest900 }}>
        {loadingStatus || "Hệ thống đang xử lý..."}
      </p>
      <span className="text-xs text-gray-400 mt-2">Vui lòng không tắt trình duyệt hoặc tải lại trang</span>
    </div>
  )
}
