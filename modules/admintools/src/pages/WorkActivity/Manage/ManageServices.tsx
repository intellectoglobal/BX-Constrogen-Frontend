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
    disableTable?: boolean;
    onChange?: Function;
    onTableChange?: Function;
}

const ManageServices = ({ data, isLoading, disableTable = false, onChange = () => { }, onTableChange = () => { } }: Props, selfRef: React.Ref<any>) => {
    const [items, setTasks] = useState<any[]>([])
    // const { data, isLoading } = useListContractTaskQuery({})
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

    const summaryRenderer = (value: any) => {
        return <strong> Total Contract Amount : <CurrencyFormatter value={value || 0} /> </strong>;
    }

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
            temp?.quantity &&
            temp?.uom &&
            temp?.rate_per_unit &&
            temp?.cost
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
            hideActionColumn={disableTable}
            actionColumnInFirst
            actionColumnWidth={'11%'}
            actionBodyTemplate={actionBodyTemplate}
            gridProps={{
                allowAdd: true,
                disableAdd: disableTable || !shouldAllowAdd(items),
                newRowDefaults: {
                    cost: 0,
                    quantity: 0,
                    rate_per_unit: 0
                },
                OnRowsChanged: async (rows: any[]) => {
                    let temp = rows.map(d => {
                        return {
                            ...d,
                            cost: (d.quantity * d.rate_per_unit).toFixed(2)
                        }
                    })
                    ref.current = temp;
                    await setTasks(temp);
                    onChange(temp)
                    onTableChange(true);
                },
                getBottomSummaryRows: (rows: any) => {
                    return [{
                        // cost: rows.map((x: any) => parseFloat(x.cost || 0)).reduce((partialSum: number, a: number) => partialSum + a, 0),
                    }];
                }
            }}>
            <Datacolumn width={"40%"} field="service_desc" header="Service Description *" type='text' editorType={!disableTable && "text"} />
            <Datacolumn width={"20%"}
                field="uom"
                header="UOM *"
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
                editorType={!disableTable && getUomOptionsEditor}
            />
            <Datacolumn width={"10%"} field="quantity" header="Quantity" type='number' editorType={!disableTable && "text"} />
            <Datacolumn width={"10%"} field="rate_per_unit" header="Rate Per Unit" type="number" editorType={!disableTable && "number"} />
            <Datacolumn width={"10%"}
                field="cost"
                header="Amount"
                type="currency"
                defaultValue={0}
            />

        </ListLayout>
    );
}

export default forwardRef(ManageServices);