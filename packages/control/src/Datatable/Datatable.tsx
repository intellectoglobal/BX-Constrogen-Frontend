import React, { useEffect, useState } from 'react';
import { DataTable, DataTableProps } from 'primereact/datatable';
import { Skeleton } from 'primereact/skeleton';
// import './styles.scss';
import { Button } from 'primereact/button';
import { useDownloadExportedDataQuery } from '@igblsln/store'

interface Props extends DataTableProps {
    children: any;
    pagingOptions?: any;
    showExport?: any
}

const Datatable = ({ children, pagingOptions, showExport = false, ...rest }: Props) => {

    const [startExport, setStartExport] = useState<boolean>(false)

    const { data: downloadedData, isError, isSuccess } = useDownloadExportedDataQuery(showExport, { skip: !showExport || !startExport })

    useEffect(() => {
        setStartExport(false)
    }, [isError, isSuccess])

    const loadingTemplate = (options: any) => {
        return (
            <div className="flex align-items-center" style={{ height: '17px', flexGrow: '1', overflow: 'hidden' }} >
                <Skeleton width={options.cellEven ? (options.field === 'year' ? '30%' : '40%') : '60%'} height="1rem" />
            </div>
        )
    }

    return (
        <>
            {
                showExport &&
                <div style={{ display: 'flex' }}>
                    <Button
                        style={{ marginLeft: 'auto' }}
                        label='Export'
                        onClick={() => {
                            if(confirm("Are you sure to export?"))
                                setStartExport(true)
                        }}
                    />
                </div>
            }
            <DataTable className="p-datatable-igs"
                size="small"
                scrollable scrollHeight="flex"
                resizableColumns columnResizeMode="fit"
                virtualScrollerOptions={{
                    itemSize: 40,
                    loadingTemplate,
                    ...(pagingOptions || {})
                }}
                rowHover
                filterDisplay="menu"
                responsiveLayout="scroll"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
                {...rest}>
                {children}
            </DataTable>
        </>

    )
}

export default Datatable