import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Datacolumn, ListLayout, CurrencyFormatter, Loader } from '@igblsln/control';
import { UOMs, useGetAllUOMsQuery } from '@igblsln/store';
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
    const UOMTasksRef = useRef<UOMs[]>([]);
    const { data: UOMTasks } = useGetAllUOMsQuery({});

    useEffect(() => {
        setTasks(data);
        ref.current = data;
    }, [data])

    useEffect(() => {
        UOMTasksRef.current = UOMTasks || []
    }, [UOMTasks])

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


    const getUomOptionsEditor = ({ row, column, onRowChange, onClose }: any) => {
        return <Dropdown autoFocus className="p-inputtext-sm"
            style={{ width: '100%' }}
            value={row[column.key]}
            optionLabel="descr"
            optionValue="key"
            options={UOMTasksRef.current}
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
        return temp?.service_desc &&
            temp?.uom 
    }

    if (!UOMTasks) {
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
                    rate_per_unit: 0
                },
                OnRowsChanged: async (rows: any[]) => {
                    let temp = rows
                    ref.current = temp;
                    await setTasks(temp);
                    onChange(temp)
                    onTableChange(true);
                }
            }}>
            <Datacolumn width={"60%"} field="service_desc" header="Service Description" type='text' editorType={"text"} />
            <Datacolumn
                field="uom"
                header="UOM"
                displayValueGetter={(row, field) => {
                    if (!Array.isArray(row)) {
                        let temp = UOMTasksRef.current?.filter(d => d.key === row[field])
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
            {/* <Datacolumn field="rate_per_unit" header="Rate Per Unit" type="number" editorType={"number"} /> */}


        </ListLayout>
    );
}

export default forwardRef(ManageTable);