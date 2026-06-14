import React from 'react';
import { COLORS } from '../../constants/colors';
import { getRoleName } from '../../utils/getRoleName';

export const WorkspaceHeader = ({role, desc}) => {
    return (
        <div className="border-b border-coffee-100 pb-6">
            <h1 className="text-2xl font-bold" style={{ color: COLORS.forest900, fontFamily: "'Inter', 'sans-serif'" }}>
                Không Gian Làm Việc {getRoleName(role)}
            </h1>
            <p className="text-sm mt-1" style={{ color: COLORS.coffee600 }}>
                {desc}
            </p>
        </div>
    )
}
