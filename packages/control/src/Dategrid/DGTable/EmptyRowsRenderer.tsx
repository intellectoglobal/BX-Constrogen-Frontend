import React from 'react';

export const EmptyRowsRenderer = (props?: any) => {
    return (
        <div style={{
            textAlign: 'center',
            gridColumn: '1/-1',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: 24
        }}>
            {props.msg || 'No rows to show'}
        </div>

    );
};
