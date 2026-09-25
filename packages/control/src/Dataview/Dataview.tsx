import React, { useRef } from 'react';
import { DataView, DataViewProps } from 'primereact/dataview';
import './Dataview.scss';

interface Props extends DataViewProps {
    [name: string]: any;
}

const Dataview = ({ onScroll, ...rest }: Props) => {
    const viewBody = useRef<HTMLDivElement>(null);
    return (
        <div ref={viewBody} className="data-view-body" onScroll={onScroll}>
            <DataView {...rest} />
        </div>
    )
}

export default Dataview