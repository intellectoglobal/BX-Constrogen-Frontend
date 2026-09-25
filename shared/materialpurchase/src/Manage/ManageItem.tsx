import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Datacolumn, ListLayout, CurrencyFormatter } from '@igblsln/control';
import { Items, UOMs, useGetAllItemQuery, useGetAllUOMsQuery, useSettingsQuery, shouldAllowAdd } from '@igblsln/store';
import { PAGE_NAME, PAGE_ROUTE } from '../constants';
import { Modules } from '../modules';
import { TransactionItem } from '../transactionItemApi';

type Props = {
    moduleName: Modules;
    data: TransactionItem[];
    isLoading?: boolean;
    disableTable?: boolean;
    onChange?: Function;
}

const ManageItem = ({ moduleName, data, isLoading, disableTable = false, onChange = () => { } }: Props, selfRef: React.Ref<any>) => {
    const [items, setItems] = useState<TransactionItem[]>([])
    const { data: userData} = useSettingsQuery("admin");
    const userId = userData && userData[0]?.user
    const ref = useRef(items);
    const pItemRef = useRef<Items[]>([]);
    const UOMItemsRef = useRef<UOMs[]>([]);
    const { data: pItems} = useGetAllItemQuery({});
    const { data: UOMItems } = useGetAllUOMsQuery({});

    useImperativeHandle(selfRef, () => ({
        getItems(): TransactionItem[] {
            return items;
        }
    }));

    useEffect(() => {
        setItems(data);
        ref.current = data;
    }, [data])

    useEffect(() => {
        pItemRef.current = pItems || [];
        UOMItemsRef.current = UOMItems || []
    }, [pItems, UOMItems])

    const summaryRenderer = (value: number) => {
        return <CurrencyFormatter value={value || 0} />;
    }

    const removeItem = (val: any) => {
        const updValue = ref.current.filter(x => x !== val)
        ref.current = updValue;
        setItems(updValue);
    }

    const actionBodyTemplate = (value: any) => {
        return <Button style={{ height: '35px', width: '20px', marginLeft: 20 }} type="button" onClick={() => removeItem(value)} className="p-button-rounded p-button-text" icon="pi pi-trash"></Button>
    }


    const getOptionsEditor = ({ row, column, onRowChange, onClose }: any) => {
        return <Dropdown autoFocus className="p-inputtext-sm editor-dropdown-style"
            value={row[column.key]}
            optionLabel="descr"
            optionValue="key"
            filter
            filterBy={"descr"}
            options={pItemRef.current}
            onChange={(e: any) => {
                let clone = { ...row }
                clone[column.key] = e.value;
                clone.items = UOMItemsRef.current.find(x => x.key === e.value)
                // let uom = pItemRef.current.filter(x => x.key === e.value)[0]?.itemuom_key
                // clone['itemuom_key'] = uom;
                onRowChange(clone, true)
            }}
            tabIndex={-1} />
    };

    const getUomOptionsEditor = ({ row, column, onRowChange, onClose }: any) => {
        return <Dropdown autoFocus className="p-inputtext-sm editor-dropdown-style"
            value={row[column.key]}
            optionLabel="descr"
            optionValue="key"
            filter
            filterBy={"descr"}
            options={UOMItemsRef.current.filter(d => row?.selectedItem?.itemuom_list?.includes(d.key))}
            onChange={(e: any) => {
                let clone = { ...row }
                clone[column.key] = e.value;
                clone.items_uoms = UOMItemsRef.current.find(x => x.key === e.value)
                onRowChange(clone, true)
            }}
            tabIndex={-1} />
    };

    const displayAmountFields = () => {
        return moduleName !== 'projects' || userId === 3
    }

    return (
        <ListLayout baseRoute={`/${moduleName}/${PAGE_ROUTE}`} description={PAGE_NAME} isLoading={isLoading}
            data={items}
            newTable
            tableLayoutClass='h-full'
            allowFilters={false}
            hideActionColumn={disableTable}
            actionBodyTemplate={actionBodyTemplate}
            gridProps={{
                allowAdd: true,
                disableAdd: disableTable || !shouldAllowAdd(items),
                newRowDefaults: {
                    qty: 0,
                    // unitprice:0,
                    netamt: 0,
                    taxamt: 0,
                    totalamt: 0
                },
                OnRowsChanged: (rows: any[]) => {
                    let temp = rows.map(d => {
                        let tax = 0
                        let selectedItem = null
                        let temp = pItemRef.current?.filter(data => data.key === d.item_key)
                        if(temp.length){
                          tax = parseInt(temp[0].gst)
                          selectedItem = temp[0]
                        }
                        let totalamt = d.totalamt;
                        let netamt = parseFloat((totalamt / (1 + (tax * 0.01))).toFixed(2))
                        let taxamt = parseFloat((netamt * (tax * 0.01)).toFixed(2))
                        return {
                            ...d,
                            netamt: netamt,
                            taxamt: taxamt,
                            selectedItem : selectedItem
                          }
                    })
                    setItems(temp);
                    ref.current = temp;
                    onChange(true)
                },
                getBottomSummaryRows: (rows: any) => {
                    return [{
                        netamt: rows.map((x: any) => parseFloat(x.netamt || 0)).reduce((partialSum: number, a: number) => partialSum + a, 0),
                        taxamt: rows.map((x: any) => parseFloat(x.taxamt || 0)).reduce((partialSum: number, a: number) => partialSum + a, 0),
                        totalamt: rows.map((x: any) => parseFloat(x.totalamt || 0)).reduce((partialSum: number, a: number) => partialSum + a, 0),
                    }];
                }
            }}>
            <Datacolumn
                field="item_key"
                width="25%"
                header="Item*"
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
                editorType={!disableTable && getOptionsEditor}
            />
            <Datacolumn
                field="itemuom_key"
                width="20%"
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
                editorType={!disableTable && getUomOptionsEditor}
            />
            <Datacolumn field="qty" header="Quantity" type="number" editorType={!disableTable && "number"} />
            {/* {displayAmountFields() && <Datacolumn field="unitprice" header="Unit Price" type="number" editorType={!disableTable && "number"} />} */}
            {displayAmountFields() && <Datacolumn field="netamt" header="Net Amt" type="currency" defaultValue={0} summaryFormatter={({ row }: any) => summaryRenderer(row?.netamt)} />}
            {displayAmountFields() && <Datacolumn field="taxamt" header="Tax Amt" type="currency" defaultValue={0} summaryFormatter={({ row }: any) => summaryRenderer(row?.taxamt)} />}
            {displayAmountFields() && <Datacolumn field="totalamt" header="Total Amt" type="currency" defaultValue={0} editorType={!disableTable && "currency"} summaryFormatter={({ row }: any) => summaryRenderer(row?.totalamt)} />}

        </ListLayout>
    );
}

export type ManageItemHandle = {
    // saveItem: (postData: TransactionItemPost) => Promise<void>;
    getItems(): TransactionItem[]
};


export default forwardRef(ManageItem);