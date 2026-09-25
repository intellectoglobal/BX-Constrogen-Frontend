import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Datacolumn, ListLayout, CurrencyFormatter } from '@igblsln/control';
import { UOMs, useGetAllUOMsQuery } from '@igblsln/store';
import { PAGE_NAME, PAGE_ROUTE } from '../constants';
import { ContractTask, ContractTaskPost } from '../contractTasksApi';

type Props = {
    data: ContractTask[];
    isLoading?: boolean;
    disableTable?: boolean;
    onChange?: Function;
}

const ManageTask = ({ data, isLoading, disableTable = false, onChange = () => { } }: Props, selfRef: React.Ref<any>) => {
    const [items, setTasks] = useState<ContractTask[]>([])
    // const { data, isLoading } = useListContractTaskQuery({})
    const ref = useRef(items);
    const UOMTasksRef = useRef<UOMs[]>([]);
    const { data: UOMTasks } = useGetAllUOMsQuery({});

    useImperativeHandle(selfRef, () => ({
        getItems() {
            return items
        }
    }));

    useEffect(() => {
        setTasks(data);
        ref.current = data;
    }, [data])

    useEffect(() => {
        UOMTasksRef.current = UOMTasks || []
    }, [UOMTasks])

    const summaryRenderer = (value: any) => {
        return <CurrencyFormatter value={value || 0} />;
    }

    const removeTask = (val: any) => {
        const updValue = ref.current.filter(x => x !== val)
        ref.current = updValue;
        setTasks(updValue);
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
        return temp?.item_descr &&
            temp?.itemuom_key
    }

    return (
        <ListLayout baseRoute={`/contract/${PAGE_ROUTE}`} description={PAGE_NAME} isLoading={isLoading}
            data={items}
            newTable
            tableLayoutClass='h-full'
            allowFilters={false}
            hideActionColumn={disableTable}
            actionBodyTemplate={actionBodyTemplate}
            gridProps={{
                allowAdd: true,
                disableAdd : disableTable || !shouldAllowAdd(items),
                newRowDefaults: {
                    netamt: 0,
                    qty: 0,
                    unitprice: 0
                },
                OnRowsChanged: (rows: any[]) => {
                    let temp = rows.map(d => {
                        return {
                            ...d,
                            netamt: d.qty * d.unitprice
                        }
                    })
                    setTasks(temp);
                    ref.current = temp;
                    onChange(true)
                },
                getBottomSummaryRows: (rows: any) => {
                    return [{
                        netamt: rows.map((x: any) => parseFloat(x.netamt || 0)).reduce((partialSum: number, a: number) => partialSum + a, 0),
                    }];
                }
            }}>
            <Datacolumn field="service_descr" header="Service Description *" type='text' editorType={!disableTable && "text"} />
            <Datacolumn field="service_qty" header="Service Quantity" type='text' editorType={!disableTable && "text"} />
            {/* <Datacolumn field="item_descr" header="Calculation Method*" type='text' editorType={!disableTable && "text"} /> */}
            <Datacolumn
                field="itemuom_key"
                header="UOM*"
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
            {/* <Datacolumn field="qty" header="Quantity" type="number" editorType={!disableTable && "number"} /> */}
            <Datacolumn field="unitprice" header="Rate Per Unit" type="number" editorType={!disableTable && "number"} />
            <Datacolumn field="netamt" header="Service Cost" type="currency" defaultValue={0} summaryFormatter={({ row }: any) => summaryRenderer(row?.netamt)} />
        </ListLayout>
    );
}

export type ManageTaskHandle = {
    saveTask: (postData: ContractTaskPost) => Promise<void>;
    getItems: () => ContractTask[];
};


export default forwardRef(ManageTask);