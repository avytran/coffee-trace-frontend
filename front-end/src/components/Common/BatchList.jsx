import React from 'react';
import { Card } from './Card';
import { COLORS } from '../../constants/colors';
import { Badge } from './Badge';

export const BatchList = ({ batches, handleOpenDetail }) => {
    console.log(batches);
    
    return (
        <Card className="overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr style={{ background: COLORS.coffee50, color: COLORS.coffee600 }} className="text-xs uppercase tracking-wider">
                            <th className="p-4 text-left">Mã Truy Xuất (Traceability Code)</th>
                            <th className="p-4 text-left">Giống Cây Trồng</th>
                            <th className="p-4 text-left">Sản Lượng</th>
                            <th className="p-4 text-left">Trạng Thái Vòng Đời</th>
                            <th className="p-4 text-left">Thời Gian Tạo</th>
                            <th className="p-4 text-right"></th>
                        </tr>
                    </thead>
                    <tbody className="text-sm text-forest-800">
                        {batches.map(l => (
                            <tr key={l.id} className="border-b hover:bg-forest-50/50 transition-colors cursor-pointer"
                                style={{ borderColor: COLORS.coffee100 }}
                                onClick={() => handleOpenDetail(l.id)}>
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs"
                                            style={{ background: COLORS.forest100, color: COLORS.forest600 }}>📦</div>
                                        <span className="font-semibold text-sm" style={{ color: COLORS.forest900 }}>{l.traceability_node}</span>
                                    </div>
                                </td>
                                <td className="p-4 text-sm" style={{ color: COLORS.forest700 }}>{l.plant_variety}</td>
                                <td className="p-4 text-sm font-medium" style={{ color: COLORS.forest900 }}>{l.weight}</td>
                                <td className="p-4"><Badge status={l.status} /></td>
                                <td className="p-4 text-xs text-forest-600">{l.created_at}</td>
                                <td className="p-4 text-right" onClick={e => e.stopPropagation()}>
                                    <div className="flex gap-1 justify-end">
                                        <button className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border shadow-sm"
                                            style={{ background: "white", color: COLORS.forest900, borderColor: COLORS.coffee300 }}
                                            onClick={() => handleOpenDetail(l.id)}>Xem Chi Tiết</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    )
}
