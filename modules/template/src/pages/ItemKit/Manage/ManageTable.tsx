import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Datacolumn, ListLayout, CurrencyFormatter, Loader } from '@igblsln/control';
import { Items, UOMs, useGetAllItemQuery, useGetAllUOMsQuery, useGetItemsForVendorQuery } from '@igblsln/store';
import { PAGE_NAME, PAGE_ROUTE } from '../constants';
import { MODULE_NAME } from '../../../constants';

type Props = {
    data: any[];
    isLoading?: boolean;
    onChange?: Function;
    onTableChange?: Function;
}

const ManageTable = ({ data, isLoading, onChange = () => { }, onTableChange = () => { } }: Props) => {
    const [items, setTasks] = useState<any[]>([])
    const ref = useRef(items);
    const pItemRef = useRef<Items[]>([]);
    const UOMItemsRef = useRef<UOMs[]>([]);
    const { data: pItems, isLoading: isItemLoading } = useGetAllItemQuery(null, { refetchOnMountOrArgChange: true })
    const { data: UOMItems } = useGetAllUOMsQuery({});

    useEffect(() => {
        setTasks(data);
        ref.current = data;
    }, [data])

    useEffect(() => {
        pItemRef.current = pItems || [];
        UOMItemsRef.current = UOMItems || []
      }, [pItems, UOMItems])

    const removeTask = (val: any) => {
        const updValue = ref.current.filter(x => x !== val)
        ref.current = updValue;
        setTasks(updValue);
        onChange(updValue)
        onTableChange(true);
    }

    const actionBodyTemplate = (value: any) => {
        return <Button style={{ height: '35px', width: '20px', marginLeft: 20 }} type="button" onClick={() => removeTask(value)} className="p-button-rounded p-button-text" icon="pi pi-trash"></Button>
    }

    const getOptionsEditor = ({ row, column, onRowChange, onClose }: any) => {
        return <Dropdown autoFocus style={{ width: '100%' }} className="p-inputtext-sm"
            value={row[column.key]}
            optionLabel="descr"
            optionValue="key"
            filter
            filterBy={"descr"}
            options={pItemRef.current}
            onChange={(e: any) => {
                let clone = { ...row }
                clone[column.key] = e.value;
                onRowChange(clone, true)
            }}
            tabIndex={-1} />
    };


    const getUomOptionsEditor = ({ row, column, onRowChange, onClose }: any) => {
        return <Dropdown autoFocus className="p-inputtext-sm"
            style={{ width: '100%' }}
            value={row[column.key]}
            optionLabel="descr"
            optionValue="key"
            options={UOMItemsRef.current}
            filter
            filterBy={"descr"}
            onChange={(e: any) => {
                let clone = { ...row }
                clone[column.key] = e.value;
                onRowChange(clone, true)
            }}
            tabIndex={-1} />
    };

    const shouldAllowAdd = (items: any[]) => {
        if (items.length === 0) return true
        let temp = items[items.length - 1]
        return temp?.item_uom_key &&
            temp?.item_key
    }

    if (!UOMItems) {
        return <Loader />
    }

    if (!pItems) {
        return <Loader />
    }

    return (
        <ListLayout baseRoute={`/${MODULE_NAME}/${PAGE_ROUTE}`} description={PAGE_NAME} isLoading={isLoading}
            data={items}
            newTable
            tableLayoutClass='h-full'
            allowFilters={false}
            actionColumnInFirst
            actionColumnWidth={'11%'}
            actionBodyTemplate={actionBodyTemplate}
            gridProps={{
                allowAdd: true,
                disableAdd: !shouldAllowAdd(items),
                newRowDefaults: {
                },
                OnRowsChanged: async (rows: any[]) => {
                    let temp = rows
                    ref.current = temp;
                    await setTasks(temp);
                    onChange(temp)
                    onTableChange(true);
                }
            }}>
            <Datacolumn
                field="item_key"
                header="Item*"
                width={"25%"}
                displayValueGetter={(row, field) => {
                    if (!Array.isArray(row)) {
                        let temp = pItemRef.current?.filter(d => d.key === row[field])
                        if (temp.length) {
                            return temp[0].descr
                        }
                        else {
                            return row?.items?.descr
                        }
                    }
                }}
                editorType={getOptionsEditor}
            />

            <Datacolumn field="brand" header="Brand" type="text" editorType={"text"} />
            <Datacolumn field="model_number" header="Model" type="text" editorType={"text"} />
            <Datacolumn field="qty" header="Quantity" type="number" editorType={"number"} />
            <Datacolumn
                field="item_uom_key"
                header="UOM*"
                displayValueGetter={(row, field) => {
                    if (!Array.isArray(row)) {
                        let temp = UOMItemsRef.current?.filter(d => d.key === row[field])
                        if (temp.length) {
                            return temp[0].descr
                        }
                        else {
                            return row?.items_uoms?.descr
                        }
                    }
                }}
                editorType={getUomOptionsEditor}
            />
            {/* <Datacolumn field="netamt" header="Net Amt" type="currency" defaultValue={0} editorType={"number"} summaryFormatter={({ row }: any) => summaryRenderer("Total", row?.netamt)} /> */}

        </ListLayout>
    );
}

export default forwardRef(ManageTable);