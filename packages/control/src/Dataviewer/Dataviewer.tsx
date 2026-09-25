import { DataViewLayoutType } from 'primereact/dataview';
import React, { useState } from 'react';
import Datatable from '../Datatable';
import Dataview from '../Dataview';
import DataHeader from './DataHeader';

interface Props {
    header?: React.ReactNode;
    children: any;
    defaultLayout?: string;
    allowGrid?: boolean;
    allowPaging?: boolean;
    totalRecords?: number;
    loading?: boolean;
    data: any[];
    setPage?: (page: number) => void;
    itemTemplate?(item: any, layout: DataViewLayoutType): React.ReactNode;
}

const Dataviewer = ({ data, header, allowGrid, allowPaging, loading,
    setPage: setPageNumber,
    defaultLayout, totalRecords, children, itemTemplate }: Props) => {
        const [first, setFirst] = useState(0);
    // const [page, setPage] = useState(1);
    // const [virtualData, setVirtualData] = useState<any[]>([]);
    const [layout, setLayout] = useState(defaultLayout || (allowGrid ? 'grid' : 'list'));
    // const [lazyParams, setLazyParams] = useState({
    //     first: 0,
    //     rows: 10,
    //     page: 1,
    //     sortField: null,
    //     sortOrder: null,
    //     filters: {}
    // });

    const renderHeader = () => (<DataHeader allowGrid={allowGrid} layout={layout} setLayout={setLayout}>{header}</DataHeader>);

    // const loadLazy = (evt: { first: number, last: number }) => {
    //     if (totalRecords && evt.first && evt.last) {
    //         const pageNum = Math.floor(totalRecords / (evt.last - evt.first));
    //         setVirtualData(data.slice(evt.first, evt.last));
    //         if (setPageNumber) {
    //             setPage(pageNum);
    //             if (page != pageNum) {
    //                 setPageNumber(pageNum);
    //             }
    //         }
    //     }
    // }


    const headerWrap = renderHeader();

    // let pagingProps = {};

    // if (allowPaging) {
    //     //lazy: true, onLazyLoad: loadCarsLazy, itemSize: 46, delay: 200, showLoader: true, loading: lazyLoading, loadingTemplate 
    //     pagingProps = {
    //         // totalRecords,
    //         lazy: true,
    //         delay: 200,
    //         itemSize: 40,
    //         loading,
    //         onLazyLoad: loadLazy,
    //         showLoader: true
    //     };
    // }

    const onPage = (event: any) => {
        setFirst(event.first);
        if (setPageNumber)
            setPageNumber(event.page + 1);

    }

    return (<>
        {layout === 'list' && <Datatable value={data} header={headerWrap} paginator rows={50} totalRecords={totalRecords}
            lazy first={first} onPage={onPage} loading={loading} >{children}</Datatable>}
        {allowGrid && layout === 'grid' && <Dataview value={data} header={headerWrap} itemTemplate={itemTemplate} paginator rows={10} totalRecords={totalRecords} />}
    </>);
}

export default Dataviewer