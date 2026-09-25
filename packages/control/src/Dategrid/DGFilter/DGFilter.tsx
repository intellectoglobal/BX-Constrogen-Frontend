import React, { useEffect, useRef, useState } from 'react'
import { Button } from 'primereact/button';
import { ListBox } from 'primereact/listbox';
import { OverlayPanel } from 'primereact/overlaypanel';
import { IColumn } from '../DGColumn';
import FilterChip from './FilterChip';
import { MenuItem } from 'primereact/menuitem';
import { Filters, SavedFilterType } from '../DGTable';
import './DGFilter.scss';
import SavedFilter from './SavedFilter';
import { useDownloadExportedDataQuery } from '@igblsln/store'

type Props = {
    columns?: IColumn[];
    filters: Filters;
    setFilters(e: Filters): void;
    savedFilters: SavedFilterType[];
    setSavedFilters(e: SavedFilterType[]): void,
    showExport: boolean

}

const DGFilter = ({ columns, filters, setFilters, savedFilters, setSavedFilters, showExport }: Props) => {
    const [filterColumns, setFilterColumns] = useState<MenuItem[] | undefined>();
    const [nonActiveColumns, setNonActiveColumns] = useState<MenuItem[]>([]);
    const [selectedFilters, setSelectedFilters] = useState<SavedFilterType>()
    const menu = useRef<OverlayPanel>(null);
    const [startExport, setStartExport] = useState<boolean>(false)

    const { data: downloadedData, isError, isSuccess } = useDownloadExportedDataQuery({ name: showExport, filter: JSON.stringify(filters) }, { skip: !showExport || !startExport })

    useEffect(() => {
        setStartExport(false)
    }, [isError, isSuccess])

    const selectColumn = (val: any) => {
        if (val.data.active) {
            delete val.data['tempValue'];
            const mfilters = { ...filters };
            delete mfilters[val.id];
            setFilters(mfilters);
        }

        val.data.active = !val.data.active;
        setSelectedFilters(undefined);
        // setFilterColumns(filterColumns?.filter(x => x.data?.active) || []);
        setNonActiveColumns(filterColumns?.filter(x => !x.data?.active) || []);
        menu.current?.hide();
    }

    useEffect(() => {
        const cols = columns?.filter(x => !!x.filteringType)
            .map(x => ({
                id: x.key, label: x.name,
                data: {
                    filterType: x.filteringType,
                    value: filters[x.key],
                    tempValue: filters[x.key],
                    active: `${x.key}` in filters
                }
            } as MenuItem));
        setFilterColumns(cols);
        setNonActiveColumns(cols?.filter(x => !x.data?.active) || []);

    }, [columns])

    useEffect(() => {
        filterColumns?.map(x => {
            if (x.id) {
                x.data.tempValue = x.data.value = filters[x.id];
                x.data.active = `${x.id}` in filters
            }
        });
        setNonActiveColumns(filterColumns?.filter(x => !x.data?.active) || []);
    }, [filterColumns, filters])

    return (
        <div className="flex align-items-center flex-wrap " style={{ padding: '.5rem' }} >
            <SavedFilter filters={filters} setFilters={setFilters} savedFilters={savedFilters} setSavedFilters={setSavedFilters}
                selectedFilters={selectedFilters} setSelectedFilters={setSelectedFilters} />
            {/* <i className="pi pi-filter mr-2 mb-2" aria-label="Filter"></i> */}
            {filterColumns && filterColumns.map((col, idx) =>
            (col.data.active && <FilterChip key={idx} item={col}
                removeItem={selectColumn}
                onChange={(val) => col.id && setFilters({ ...filters, [col.id]: val })} />))}
            <OverlayPanel ref={menu} dismissable className="overlaypanel-filter">
                <ListBox options={nonActiveColumns} onChange={(e) => selectColumn(e.value)} style={{ border: 'none' }} />
            </OverlayPanel>
            <Button className='p-button-text ml-3 mb-2' icon="pi pi-plus"
                disabled={nonActiveColumns.length < 1} onClick={(event) => menu.current?.toggle(event)} aria-controls="popup_menu" aria-haspopup >
                <i className="pi pi-filter add-filter"></i>
            </Button>
            {
                showExport &&
                <Button
                    style={{ marginLeft: 'auto' }}
                    label='Generate Report'
                    onClick={() => {
                        if (confirm("Are you sure to export?"))
                            setStartExport(true)
                    }}
                />
            }
        </div>
    )
}

export default DGFilter;