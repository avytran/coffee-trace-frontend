import React from 'react';
import { COLORS } from '../../constants/colors';

export const FileInput = ({ label, onFileChange, onFileDescChange, loading, value }) => {
    return (
        <div className="p-4 rounded-xl border-dashed border-2 bg-gray-50/50" style={{ borderColor: COLORS.coffee300 }}>
            <label className="block text-xs font-bold uppercase mb-2 text-emerald-900">{label}</label>
            <input
                disabled={loading}
                type="file"
                onChange={onFileChange}
                className="text-xs text-gray-500 mb-3 block file:mr-4 file:py-1.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-white file:text-emerald-900 hover:file:bg-gray-100 file:cursor-pointer disabled:opacity-50"
            />
            <input
                disabled={loading}
                type="text"
                value={value}
                onChange={onFileDescChange}
                placeholder="Mô tả tài liệu (Ví dụ: Chứng thư chất lượng SGS...)"
                className="w-full px-3 py-2 rounded-xl text-xs border outline-none bg-white disabled:bg-gray-100"
                style={{ borderColor: COLORS.coffee200 }}
            />
        </div>
    )
}
