import { Button } from 'primereact/button'
import { ListBox } from 'primereact/listbox';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Fieldset } from 'primereact/fieldset';
import React, { useEffect, useRef, useState } from 'react'
import { Filters, SavedFilterType } from '../DGTable';
import { classNames } from 'primereact/utils';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { useToast } from '../../Toast';

type Props = {
    filters: Filters;
    setFilters(e: Filters): void;
    selectedFilters?: SavedFilterType;
    setSelectedFilters(e: SavedFilterType): void;
    savedFilters: SavedFilterType[];
    setSavedFilters(e: SavedFilterType[]): void
}

const SavedFilter = ({ filters, setFilters,
    selectedFilters, setSelectedFilters,
    savedFilters, setSavedFilters }: Props) => {
    const { showError } = useToast();
    const menu = useRef<OverlayPanel>(null);
    const [showDialog, setShowDialog] = useState(false)
    const [showRemoveDialog, setShowRemoveDialog] = useState(false)
    const [filterToBeRemoved, setFilterToBeRemoved] = useState<any>(null)
    const [name, setName] = useState('')

    const filteTemplate = (option: SavedFilterType) => {
        return (
            <div className="filter-item">
                <i className="pi pi-star px-1"></i>
                <div>{option.name}</div>
                <i style={{ marginLeft: 'auto' }} onClick={(e) => {
                    setFilterToBeRemoved(option)
                    setShowRemoveDialog(true)
                    e.stopPropagation()
                }} className="pi pi-trash px-1"></i>
            </div>
        );
    }

    const deleteFilter = () => {
        let temp = savedFilters.filter(d => d.name !== filterToBeRemoved?.name)
        setSavedFilters(temp);
        setShowRemoveDialog(false)

    }

    const showSaveFilter = () => {
        if (filters && Object.keys(filters).length > 0) {
            setShowDialog(true);
        }
    }

    const saveFilter = () => {
        if (savedFilters.find(x => x.name === name)) {
            showError("Save search", "name already exists!!")
            return;
        }
        const filter: SavedFilterType = {
            name,
            filters,
            selected: true
        }
        setSavedFilters([...savedFilters.map(x => ({ ...x, selected: false })), filter]);
        setSelectedFilters(filter);
        setShowDialog(false);
    }

    const selectSavedFilter = (val: SavedFilterType) => {
        // val.selected = true;
        // const selfil = savedFilters.find(x => x === val);
        setSavedFilters([...savedFilters.map(x => ({ ...x, selected: x === val }))]);
        setFilters(val.filters);
        setSelectedFilters(val);
        menu.current?.hide();
    }

    useEffect(() => {

        if (savedFilters && savedFilters.length > 0) {
            const sel = savedFilters.find(x => x.selected);
            if (sel) {
                // sel.selected = true;
                setFilters(sel.filters);
                setSelectedFilters(sel);
            }
        }
    }, [savedFilters])

    const renderFooter = () => {
        return (
            <div>
                <Button label="Cancel" icon="pi pi-times" onClick={() => setShowDialog(false)} className="p-button-text" />
                <Button label="Ok" icon="pi pi-check" onClick={() => saveFilter()} autoFocus />
            </div>
        );
    }

    const renderRemoveFooter = () => {
        return (
            <div>
                <Button label="No" icon="pi pi-times" onClick={() => setShowRemoveDialog(false)} className="p-button-text" />
                <Button label="Yes" icon="pi pi-check" onClick={() => deleteFilter()} autoFocus />
            </div>
        );
    }

    return (<>

        <Dialog header="Search name" visible={showDialog} onHide={() => setShowDialog(false)}
            breakpoints={{ '960px': '75vw' }} style={{ width: '40vw', alignItem: 'center' }} footer={renderFooter()}>
            <InputText value={name} onChange={(e) => setName(e.target.value)} />
        </Dialog>

        <Dialog header="Are you sure to delete?" visible={showRemoveDialog} onHide={() => setShowRemoveDialog(false)}
            breakpoints={{ '960px': '75vw' }} style={{ width: '40vw', alignItem: 'center' }} footer={renderRemoveFooter()}>
        </Dialog>

        <div className='saved-filter-control p-splitbutton p-button-outlined mr-2 mb-2'>
            <Button className="p-button p-component p-button-sm p-splitbutton-defaultbutton" aria-label="Filter"
                onClick={showSaveFilter}>
                <i className={classNames("pi px-1", { 'pi-star-fill': !!selectedFilters, 'pi-star': !selectedFilters })} ></i>
                {/* <i className="pi pi-filter saved-filter-btn-icon"></i> */}
            </Button>
            <Button className="p-button p-component p-splitbutton-menubutton p-button-icon-only" aria-label="Filter" onClick={(event) => menu.current?.toggle(event)}>
                <i className="pi pi-chevron-down px-1"></i>
            </Button>
            <OverlayPanel ref={menu} dismissable className="overlaypanel-filter">
                <div>
                    <Button label="Save this search as" className="p-button-link" />
                </div>
                <Fieldset className='mt-1' legend={<>My Searches<i className="pi pi-star px-2"></i></>}>
                    <ListBox options={savedFilters} value={selectedFilters} onChange={(e) => selectSavedFilter(e.value)}
                        itemTemplate={filteTemplate} filterBy="name"
                        style={{ border: 'none', width: '15rem' }} virtualScrollerOptions={{ itemSize: 38 }}
                        listStyle={{ height: '200px', maxHeight: '250px' }} filter filterPlaceholder="Search in filters" />
                </Fieldset>
            </OverlayPanel>
        </div>
    </>
    )
}

export default SavedFilter