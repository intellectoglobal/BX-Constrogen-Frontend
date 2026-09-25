import React, { ReactElement, useEffect, useMemo, useState } from 'react'
import DataGrid, { SortColumn, SortIconProps, RowRendererProps, CalculatedColumn } from 'react-data-grid';
import Row from '../DGRow';
import { useAppSelector, selectFilterData, updateGridSetting, useAppDispatch } from '@igblsln/store';
import { IColumn } from '../DGColumn';
import DGFilter from '../DGFilter';
import Dataview from '../../Dataview';
import './DGTable.scss';
import { EmptyRowsRenderer } from './EmptyRowsRenderer';
import { defaultValueGetter, getFormatter } from './Formatter';
import { classNames } from 'primereact/utils';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import { getEditor, onEditorNavigation } from './Editors';
import { Paginator } from 'primereact/paginator';
import PaginationTemplate from './PaginationTemplate'

type ColumnNodes = React.ReactNode | React.ReactNode[];

type Props = {
    gridId: string;
    data?: any[];
    children?: ColumnNodes;
    allowFilters?: boolean;
    filterOptions?: any;
    showGridView?: boolean;
    allowAdd?: boolean;
    disableAdd?: boolean;
    isDataLoading?: boolean;
    newRowDefaults?: any;
    emptyRowMessage?: any;
    showExport?: any;
    customHandleAddRow?:any;
    gridTileRenderer?(item: any): React.ReactNode;
    getBottomSummaryRows?(item: any[]): any[];
    OnRowsChanged?(item: any[]): void;
    // summaryRows?: any[];
    lazyLoad?: {
        pageSize: number;
        loading?: boolean;
        loadData: (page: number, sort?: readonly SortColumn[]) => Promise<any[]>;
    };
    pagination?: {
        pageSize: number;
        loading: boolean;
        currentPage: number;
        total: number | undefined;
        onChange: (page: number, size: number) => any
    }
    selectOptions: {
        [name: string]: any[];
    },
    [name: string]: any;
}

export interface Filters {
    [name: string]: any;
}

export interface SavedFilterType {
    name: string;
    selected: boolean;
    filters: Filters
}

const addRowItem = { addRowItem: true };
const loadingRowItem = { loading: true };
const loadingRows = [loadingRowItem];

const castColumn = (col: ReactElement, columnMap: any): IColumn => {
    const { field, header, editorType, type, defaultValue,
        selectOptions,
        displayValueGetter,
        editOnDoubleClick,
        editOnFocus,
        valueGetter, disableCondition, width, className, ...rest } = col.props || {};
    columnMap[field] = {
        key: field,
        name: header,
        width: width,
        cellClass : className,
        editable: (row : {row : any}) => {
            if (disableCondition?.(row, field, defaultValue)) return false;
            return !!editorType;
        },
        editor: getEditor(editorType),
        selectOptions,
        editorOptions: {
            editOnClick: !editOnDoubleClick,
            editOnDoubleClick: editOnDoubleClick,
            editOnFocus: true,
            onNavigation: onEditorNavigation
        },
        defaultValue,
        type,
        displayValueGetter,
        valueGetter: valueGetter || defaultValueGetter,
        formatter: getFormatter(type, field, valueGetter || defaultValueGetter, defaultValue),
        // headerRenderer: customHeaderRenderer,
        ...rest
    };
    return columnMap[field];
}

const getColumns = (children: ColumnNodes): [IColumn[], any] => {

    const columns = React.Children.toArray(children);
    const columnMap = {};

    if (!columns) {
        return [[], columnMap];
    }

    if (Array.isArray(columns)) {
        return [(columns as ReactElement[])
            .filter(c => {
                return !c.props.header.includes(" Code") ||
                    c.props.header.includes("Project Code")
            })
            .map(c => {
                return castColumn(c, columnMap);
            }), columnMap];
    } else {
        return [[castColumn(columns as ReactElement, columnMap)], columnMap];
    }
};

type Comparator = (a: any, b: any) => number;

const getComparator = (sortColumn: string, column: IColumn): Comparator => {
    const valueGetter = column?.valueGetter || defaultValueGetter;
    switch (column.type) {
        case "number":
            return (a, b) => {
                const aVal = valueGetter(a, sortColumn, column.defaultValue);
                const bVal = valueGetter(b, sortColumn, column.defaultValue);
                return aVal - bVal;
            };
        case 'bool':
            return (a, b) => {
                const aVal = valueGetter(a, sortColumn, column.defaultValue);
                const bVal = valueGetter(b, sortColumn, column.defaultValue);
                return aVal === bVal ? 0 : aVal ? 1 : -1;
            };
        default:
            return (a, b) => {
                const aVal = valueGetter(a, sortColumn, column.defaultValue);
                const bVal = valueGetter(b, sortColumn, column.defaultValue);
                return aVal?.localeCompare ? aVal?.localeCompare(bVal) : aVal > bVal;
            };
    }
}

const isAtBottom = ({ currentTarget }: React.UIEvent<HTMLDivElement>): boolean => {
    return currentTarget.scrollTop + 10 >= currentTarget.scrollHeight - currentTarget.clientHeight;
}

function sortIcon({ sortDirection }: SortIconProps) {
    return (
        <>
            {sortDirection !== undefined ? (sortDirection === 'ASC' ? <i className='pi pi-fw pi-sort-amount-up-alt'></i> : <i className='pi pi-fw pi-sort-amount-down-alt'></i>) : null}
            {/* <i className='pi pi-fw pi-sort-alt'></i> */}
        </>
    );
}

const DGTable = ({ gridId, data, children, allowAdd, disableAdd,
    isDataLoading,
    newRowDefaults,
    OnRowsChanged,
    getBottomSummaryRows,
    emptyRowMessage,
    pagination,
    showExport,
    filterOptions,
    allowFilters, showGridView, gridTileRenderer, lazyLoad, customHandleAddRow, ...rest }: Props) => {
    const [columns, columnMap] = useMemo(() => getColumns(children), []);
    const [sortColumns, setSortColumns] = useState<readonly SortColumn[]>([]);
    const [filters, setFilters] = useState<Filters>({});
    const [savedFilters, setSavedFilters] = useState<SavedFilterType[]>();
    const [rows, setRows] = useState<any[]>([]);
    const [actualRows, setActualRows] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [first, setFirst] = useState(0);

    const dispatch = useAppDispatch();
    const filterSetting = useAppSelector(selectFilterData);

    const applyRowData = (d: any[]) => {
        setActualRows(d);
        if (allowAdd) {
            setRows([...d, addRowItem]);
        } else {
            setRows(d);
        }

    }

    const applyData = (data?: any[]) => {
        if (!data) {
            applyRowData([]);
            return;
        }

        const filteredData = data?.filter((r) => {
            for (const key in filters) {
                if (!columnMap[key] || !filters[key]) continue;

                const valueGetter = columnMap[key]?.valueGetter;
                const rVal = valueGetter(r, key, columnMap[key]?.defaultValue)

                switch (columnMap[key]?.filteringType) {
                    case 'number':
                        // if (Number(rVal) !== Number(filters[key])) {
                        if (!rVal?.includes(filters[key])) {
                            return false;
                        }
                        break;
                    case 'text':
                        if (!rVal?.includes(filters[key])) {
                            return false;
                        }
                        break;
                    case 'date':
                        if (!rVal?.includes(filters[key])) {
                            return false;
                        }
                        break;
                    default:
                        if (rVal !== filters[key]) {
                            return false;
                        }
                        break;
                }

            }
            return true;
        });

        if (sortColumns.length === 0) {
            applyRowData(filteredData);
        } else {

            applyRowData(filteredData.sort((a, b) => {
                for (const sort of sortColumns) {
                    const comparator = getComparator(sort.columnKey, columnMap[sort.columnKey]);
                    const compResult = comparator(a, b);
                    if (compResult !== 0) {
                        return sort.direction === 'ASC' ? compResult : -compResult;
                    }
                }
                return 0;
            }));
        }
    }

    const applyChangedRowData = (d: any[]) => {
        const r = d?.filter(x => x !== addRowItem);
        applyRowData(r);
        if (OnRowsChanged) {
            OnRowsChanged(r);
        }
    }

    const handleAddRow = () => {
        if(customHandleAddRow){
            customHandleAddRow()
            return;
        }
        if(disableAdd){
            return
        }
        const newRow = { ...(newRowDefaults || {}) };
        const r = [...actualRows, newRow];
        setActualRows(r);
        setRows([r, addRowItem]);
        if (OnRowsChanged) {
            OnRowsChanged(r);
        }
    }

    const bottomSummaryRows = useMemo(() => {
        if (getBottomSummaryRows) {
            return getBottomSummaryRows(actualRows);
        }
        return [];
    }, [actualRows, getBottomSummaryRows]);

    useEffect(() => {
        // if (lazyLoad) {
        //     return;
        // }
        applyData(data);
    }, [data, lazyLoad, allowAdd, sortColumns, filters, disableAdd])

    useEffect(() => {
        if (filterSetting && filterSetting[gridId]) {
            setSavedFilters(filterSetting[gridId])
        }
    }, [gridId, filterSetting])

    useEffect(() => {
        if (savedFilters) {
            dispatch(updateGridSetting({ gridId, value: savedFilters }));
            // localStorage.setItem(gridId, JSON.stringify(savedFilters));
        }
    }, [savedFilters])

    useEffect(() => {
        setIsLoading(isDataLoading || false);
    }, [isDataLoading])

    useEffect(() => {
        filterOptions && filterOptions?.onChange(filters)
    }, [filters])

    async function handleScroll(event: React.UIEvent<HTMLDivElement>) {

        if (!lazyLoad || isLoading || !isAtBottom(event)) return;

        setIsLoading(true);

        const newRows = await lazyLoad.loadData((rows.length / lazyLoad.pageSize) + 1, sortColumns);
        applyData([...rows, ...newRows]);
        setIsLoading(false);
    }

    const rowRenderer = (key: React.Key, props: RowRendererProps<any>) => {
        if (props.row === addRowItem) {
            const { viewportColumns, ...rest } = props;
            const newViewportColumns: readonly CalculatedColumn<any, any>[] = [{
                ...viewportColumns[0],
                minWidth: 160,
                width: 160,
                cellClass: "action-cell-class",
                colSpan: () => viewportColumns.length,
                formatter: () => (<div><Button icon="pi pi-plus" type="button" disabled={disableAdd} label="Add" tabIndex={1} style={{ width: 80 }} onClick={handleAddRow} className="p-button-text" />
                </div>)
            }];
            return (<Row key={key} viewportColumns={newViewportColumns} {...rest} />)
        }

        if (props.row === loadingRowItem) {
            const { viewportColumns, ...rest } = props;
            const newViewportColumns: readonly CalculatedColumn<any, any>[] = [{
                ...viewportColumns[0],
                minWidth: 160,
                width: 160,
                cellClass: "action-cell-class",
                colSpan: () => viewportColumns.length,
                formatter: () => (<div style={{ paddingLeft: '45%' }}>
                    <span >Loading...</span>
                </div>)
            }];
            return (<Row key={key} viewportColumns={newViewportColumns} {...rest} />)
        }

        return (<Row key={key} {...props} />)
    }

    return (<div style={{ minHeight: 'inherit' }} className={classNames('ig-grid', { 'ig-grid-no-filter': !allowFilters, 'ig-grid-filter': allowFilters })}>
        {allowFilters &&
            <DGFilter
                columns={columns}
                filters={filters}
                setFilters={setFilters}
                savedFilters={savedFilters || []}
                setSavedFilters={setSavedFilters}
                showExport={showExport}
            />
        }
    
        {!showGridView && <>
            <DataGrid className='rdg-light fill-grid'
                columns={columns}
                rows={isLoading ? loadingRows : rows}
                defaultColumnOptions={{
                    sortable: true,
                    resizable: true
                }}
                sortColumns={sortColumns}
                onSortColumnsChange={setSortColumns}
                onRowsChange={applyChangedRowData}
                onScroll={handleScroll}
                bottomSummaryRows={bottomSummaryRows}
                renderers={{ sortIcon, rowRenderer, noRowsFallback: <EmptyRowsRenderer msg={emptyRowMessage} /> }}
                {...rest}
            />
            {
                (pagination && pagination.total) ?
                <div className="card">
                    <Paginator
                        first={first}
                        rows={pagination.pageSize}
                        totalRecords={pagination.total}
                        rowsPerPageOptions={[15, 20, 30]}
                        // @ts-ignore
                        template={PaginationTemplate}
                        onPageChange={(e) => {
                            setFirst(e.first)
                            pagination.onChange(e.page + 1, e.rows)
                        }} />
                </div> : null
            }

            {isLoading && <ProgressSpinner className='ig-grid-loader' />}

        </>}
        {showGridView && <Dataview value={rows}
            onScroll={handleScroll}
            itemTemplate={gridTileRenderer}
            totalRecords={rows.length} />}
    </div>
    )
}

export default DGTable;