import React, { useRef, useState } from 'react'
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { classNames } from "primereact/utils";
import { Skeleton } from 'primereact/skeleton';
import { confirmDialog } from 'primereact/confirmdialog';
import { Ripple } from 'primereact/ripple';
import Datatable from '../Datatable';
import { Link } from 'react-router-dom'
import { headerIconStyle, newTableDefaultStyle } from '@igblsln/themes';
import { Datacolumn, Datagrid } from '../Dategrid';
import { useToast } from '../Toast';

type Props = {
    baseRoute?: string;
    description?: string;
    stateValue?: any;
    title?: string;
    newTable?: boolean;
    lazyload?: any;
    showExport?: any;
    actionColumnWidth?: any
    hideAddButton?: boolean;
    editLabel?: string;
    pagination?: {
        pageSize: number;
        loading: boolean;
        currentPage: number;
        total: number | undefined;
        onChange: (page: number, size: number) => any
    }
    actionColumnInFirst?: boolean
    enableView?: boolean;
    viewOnly?: boolean;
    disableEdit?: boolean;
    onViewClick?: any;
    customAddBtn?: JSX.Element | null;
    topRightElem?: JSX.Element | null;
    customEditOnClick?: any;
    tableLayoutClass?: string;
    data?: any[];
    addBtnLabel?: string;
    addParams?: any;
    isLoading?: boolean;
    showHeader?: boolean;
    allowFilters?: boolean;
    filterOptions?: any;
    showGridView?: boolean;
    hideActionColumn?: boolean;
    hideDeleteInActionColumn?: boolean;
    customHandleAddRow?:any;
    children: any;
    gridProps?: any;
    navKey?: any;
    delKey?: any;
    customBaseRoute?: {
        directUrl?: string,
        additionalText?: any,
        key?: any,
        args?: any[],
        suffix?: any
    };
    emptyRowMessage?: any
    gridTileRenderer?(item: any): React.ReactNode;
    actionBodyTemplate?: (value: any) => JSX.Element;
    deleteAction?: (id: any) => Promise<any>;
}

const buttonStyle = {
    height: 25,
    marginRight: 6,
    fontSize: 'smaller',
    marginBottom: 3
}

const ListLayout = ({ baseRoute = "", description, children,
    gridProps,
    stateValue,
    showHeader,
    editLabel = '',
    title,
    newTable,
    lazyload,
    actionColumnWidth,
    actionColumnInFirst = false,
    pagination,
    enableView,
    viewOnly,
    disableEdit,
    onViewClick,
    topRightElem,
    customAddBtn = null,
    customEditOnClick = null,
    hideAddButton = false,
    hideDeleteInActionColumn = false,
    showExport = false,
    tableLayoutClass = 'new-table-height',
    hideActionColumn = false,
    showGridView,
    allowFilters = false,
    gridTileRenderer,
    filterOptions,
    data, isLoading,
    navKey,
    delKey,
    addBtnLabel,
    addParams,
    customBaseRoute,
    emptyRowMessage,
    customHandleAddRow,
    actionBodyTemplate, deleteAction }: Props) => {

    sessionStorage.setItem('stateRef', JSON.stringify(stateValue))
    const sessionKey = `${description} Layout`;
    const { showSuccess, showError } = useToast()
    const [layout, setLayout] = useState<string>(sessionStorage.getItem(sessionKey) || 'list');

    const gridPropsWithStyle = { ...gridProps, style: { ...newTableDefaultStyle, ...gridProps?.style } }

    const deleteData = async (data: any) => {

        if (!deleteAction) {
            return;
        }

        confirmDialog({
            message: 'Are you sure you want to delete?',
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            accept: async () => {
                try {
                    const resp = await deleteAction(data);
                    showSuccess('Success', "Deleted Successfully");
                } catch (error: any) {
                    showError("Failed", error?.data?.detail)
                }
            },
            reject: () => { }
        });
    }

    const actionBodyTemplateWithView = (baseroute: string, deleteData: any, className?: string) => {
        return (value: any) => {
            let url = `${baseroute}/${value[navKey] || value.key}/edit`
            if (customBaseRoute && customBaseRoute.directUrl) {
                let temp;
                if (customBaseRoute.args?.length) {
                    temp = customBaseRoute.directUrl.replace('FIRST_ARG', value[customBaseRoute.args[0]])
                    url = temp + `${value.key}/edit`
                }
                if (customBaseRoute.suffix) {
                    url = url + customBaseRoute.suffix
                }
            }
            return (<>
                <Button
                    style={buttonStyle}
                    onClick={() => { onViewClick && onViewClick(value[delKey] || value.key) }}
                >
                    View
                </Button>
                {
                    !disableEdit && !viewOnly &&
                    (customEditOnClick ? <Button style={buttonStyle} onClick={() => {
                        customEditOnClick(value)
                    }}>{editLabel || 'Edit'}</Button> :
                        <Link
                            to={url}
                            state={navKey ? value : null}
                            style={{ textDecoration: "none" }} >
                            <Button
                                style={buttonStyle}
                            >{editLabel || 'Edit'}</Button>
                        </Link>)
                }
                {
                    !viewOnly &&
                    <Button
                        style={buttonStyle}
                        onClick={() => deleteData(value[delKey] || value.key)}
                    >
                        Delete
                    </Button>
                }
            </>);
        }
    }

    const defaultActionBodyTemplate = (baseroute: string, deleteData: any, className?: string) => {
        return (value: any) => {
            let url = `${baseroute}/${value[navKey] || value.key}/edit`
            if (customBaseRoute && customBaseRoute.directUrl) {
                let temp;
                if (customBaseRoute.args?.length) {
                    temp = customBaseRoute.directUrl.replace('FIRST_ARG', value[customBaseRoute.args[0]])
                    url = temp + `${value.key}/edit`
                }
                if (customBaseRoute.suffix) {
                    url = url + customBaseRoute.suffix
                }
            }
            let stt = sessionStorage.getItem('stateRef')
            return (<>
                {
                    customEditOnClick ? <Button style={buttonStyle} onClick={() => {
                        customEditOnClick(value)
                    }}>{editLabel || 'Edit'}</Button> :
                        <Link
                            to={url}
                            state={(navKey ? value : stt)}
                            style={{ textDecoration: "none" }} >
                            <Button
                                style={hideDeleteInActionColumn ? {
                                    margin: 'auto',
                                    display : 'flex',
                                    marginTop: 5,
                                    height : 25
                                } : buttonStyle}
                            >{editLabel || 'Edit'}</Button>
                        </Link>
                }

                {
                    !hideDeleteInActionColumn &&
                    <Button
                        style={buttonStyle}
                        onClick={() => deleteData(value[delKey] || value.key)}
                    >
                        Delete
                    </Button>
                }

            </>);
        }
    }

    const actionTemplate = actionBodyTemplate ? actionBodyTemplate : (
        enableView ? actionBodyTemplateWithView(baseRoute, deleteData, '')
            : defaultActionBodyTemplate(baseRoute, deleteData, '')
    )


    const changeLayout = (l: string) => {
        sessionStorage.setItem(sessionKey, l);
        setLayout(l);
    };

    const renderLoading = () => (<div className="custom-skeleton p-4">
        <div>
            <Skeleton height="50px" width="80%" className="mb-2"></Skeleton>
            <Skeleton height="50px" width="80%" className="mb-2"></Skeleton>
        </div>
    </div>)

    const buttonListClass = classNames('p-button p-button-icon-only', { 'p-highlight': layout === 'list' });
    const buttonGridClass = classNames('p-button p-button-icon-only', { 'p-highlight': layout === 'grid' });

    return (
        <>
            {!newTable && <Datatable value={data}
                header={(<div className='flex'>
                    <h3 className={classNames('m-0 my-auto')} >{description}</h3>
                    <Link
                        to={`${baseRoute}/new`}
                        state={addParams}
                        style={{ textDecoration: "none" }} >
                        <Button label={`Create ${description}`} className="ml-3" />
                    </Link>
                </div>)} {...(gridProps || {})}>
                <Column headerStyle={headerIconStyle} style={{ maxWidth: enableView ? 200 : 100 }} bodyStyle={{ textAlign: 'center', overflow: 'visible' }} body={actionTemplate} />
                {children}
            </Datatable>}
            {newTable && <div style={{ minHeight: 'inherit', maxHeight: 550 }} className={classNames('w-full', tableLayoutClass)}>

                {
                    title && <div className='flex' style={{ padding: '.5rem' }} >
                        <h3 className={classNames('m-0 my-auto')} >{title}</h3>
                    </div>
                }

                {showHeader && <div className='flex' style={{ padding: '.5rem', paddingLeft: 0, justifyContent: 'end' }} >
                    {/* <h3 className={classNames('m-0 my-auto')} >{description}</h3> */}
                    {
                        !hideAddButton &&
                        <Link
                            to={`${baseRoute}/new`}
                            state={addParams}
                            style={{ textDecoration: "none" }} >
                            <Button label={addBtnLabel || `Create ${description}`} className="ml-0" />
                        </Link>
                    }

                    {
                        !!customAddBtn && customAddBtn
                    }

                    {
                        topRightElem &&
                        <div className='ml-auto'>
                            {topRightElem}
                        </div>
                    }

                    {showGridView && <div className='ml-auto p-selectbutton p-buttonset'>
                        <button type="button" className={buttonListClass} onClick={() => changeLayout('list')}>
                            <i className="pi pi-bars"></i>
                            <Ripple />
                        </button>
                        <button type="button" className={buttonGridClass} onClick={() => changeLayout('grid')}>
                            <i className="pi pi-th-large"></i>
                            <Ripple />
                        </button>
                    </div>}
                </div>}
                <Datagrid gridId={sessionKey} data={data} allowFilters={allowFilters}
                    isDataLoading={isLoading}
                    filterOptions={filterOptions}
                    emptyRowMessage={emptyRowMessage}
                    lazyLoad={lazyload}
                    pagination={pagination}
                    showExport={showExport}
                    customHandleAddRow={customHandleAddRow}
                    gridTileRenderer={gridTileRenderer} showGridView={layout === 'grid'} {...(gridPropsWithStyle)}>
                    {!hideActionColumn && actionColumnInFirst &&
                        <Datacolumn
                            width={actionColumnWidth || (enableView ? (viewOnly ? 60 : 220) : 180)}
                            field="action" header="" sortable={false} formatter={(props: any) => actionTemplate(props.row)} cellClass="action-cell-class" />}
                    {children}
                    {!hideActionColumn && !actionColumnInFirst &&
                        <Datacolumn
                            width={actionColumnWidth || (enableView ? (viewOnly ? 60 : 220) : 180)}
                            field="action" header="" sortable={false} formatter={(props: any) => actionTemplate(props.row)} cellClass="action-cell-class" />}
                </Datagrid>
            </div>}
        </>
    );
}

export default ListLayout