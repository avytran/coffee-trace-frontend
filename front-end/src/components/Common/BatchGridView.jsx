import React from 'react';
import { COLORS } from '../../constants/colors';
import { Card } from './Card';
import { Badge } from './Badge';

export const BatchGridView = ({ batches, handleOpenDetail }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {batches.map(l => (
                <Card key={l.id} className="p-5 cursor-pointer hover:shadow-md transition-shadow flex flex-col justify-between h-48"
                    onClick={() => handleOpenDetail(l.id)}>
                    <div>
                        <div className="flex items-start justify-between mb-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                                style={{ background: COLORS.forest100 }}>📦</div>
                            <Badge status={l.status} />
                        </div>
                        <div className="font-bold text-sm mb-1" style={{ color: COLORS.forest900 }}>{l.traceability_code}</div>
                        <div className="text-xs mb-2" style={{ color: COLORS.coffee600 }}>Giống: {l.plant_variety}</div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: COLORS.coffee100 }}>
                        <span className="text-sm font-bold" style={{ color: COLORS.forest900 }}>{l.weight}</span>
                        <span className="text-[11px]" style={{ color: COLORS.coffee500 }}>{l.created_at.slice(0, 10)}</span>
                    </div>
                </Card>
            ))}
        </div>
    )
}
