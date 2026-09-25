import React from 'react'
import { DataViewLayoutOptions } from 'primereact/dataview';

type Props = {
    children?: React.ReactNode;
    allowGrid?: boolean;
    layout: string;
    setLayout: (v: string) => void;
}

const DataHeader = ({ children, allowGrid, layout, setLayout }: Props) => {
    return (
        <div className="grid grid-nogutter">
            <div className="col-6" style={{ textAlign: 'left' }}>
                {children}
            </div>
            {allowGrid && <div className="col-6" style={{ textAlign: 'right' }}>
                <DataViewLayoutOptions layout={layout} onChange={(e) => {
                    sessionStorage.setItem('defaultLayout',e.value)
                    setLayout(e.value)
                }} />
            </div>}
        </div>
    )
}

export default DataHeader