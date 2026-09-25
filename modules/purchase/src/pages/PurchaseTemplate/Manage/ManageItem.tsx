import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Datacolumn, ListLayout, useToast } from '@igblsln/control';
import { confirmDialog } from 'primereact/confirmdialog';
import { Items, UOMs, useGetItemsForItemTypeQuery, useGetUOMsForItemTypeQuery, useGetAllUOMsQuery } from '@igblsln/store';
import { PAGE_NAME, PAGE_ROUTE } from '../constants';
import { useAddPurchaseTemplateItemsMutation, PurchaseTemplateItem, PurchaseTemplateItemPost, useDeletePurchaseTemplateItemsMutation } from '../purchaseTemplateItemApi';

type Props = {
    data: PurchaseTemplateItem[];
    isLoading?: boolean;
    selectedItemType: any;
}

const ManageItem = ({ data, isLoading, selectedItemType }: Props, selfRef: React.Ref<any>) => {

    const { showSuccess, showError } = useToast()

    const [items, setItems] = useState<PurchaseTemplateItem[]>([])
    const [addDataAction, { isLoading: isAdding }] = useAddPurchaseTemplateItemsMutation()
    const [deleteDataAction] = useDeletePurchaseTemplateItemsMutation()
    const deleteAction = (data: any) => deleteDataAction(data).unwrap();

    const ref = useRef(items);
    const pItemRef = useRef<Items[]>([]);
    const UOMItemsRef = useRef<UOMs[]>([]);
    const { data: pItems } = useGetItemsForItemTypeQuery(selectedItemType, { skip: !selectedItemType })
    const { data: UOMItems } = useGetUOMsForItemTypeQuery(selectedItemType, { skip: !selectedItemType });

    useImperativeHandle(selfRef, () => ({
        async saveItem(postData: PurchaseTemplateItemPost) {
            await addDataAction({ ...postData }).unwrap();
        },
        getItems() {
            return items
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

    const removeItem = async (val: any) => {
        const updValue = ref.current.filter(x => x !== val)
        ref.current = updValue;
        setItems(updValue);
        let temp = {
            key: val.purtmpl_key,
            body: { items: [{ ...val }] }
        }
        const resp = await deleteAction(temp);
        showSuccess('Success', resp);
    }

    const actionBodyTemplate = (value: any) => {
        return <Button
            style={{ height: '35px', width: '20px', marginLeft: 20 }}
            type="button"
            onClick={() => {
                confirmDialog({
                    message: 'Are you sure you want to Delete Item?',
                    header: 'Confirmation',
                    icon: 'pi pi-exclamation-triangle',
                    accept: () => removeItem(value),
                    reject: () => { }
                });
            }}
            className="p-button-rounded p-button-text"
            icon="pi pi-trash"></Button>
    }

    const getOptionsEditor = ({ row, column, onRowChange, onClose }: any) => {
        return <Dropdown autoFocus style={{ width: '100%' }} className="p-inputtext-sm"
            value={row[column.key]}
            optionLabel="descr"
            optionValue="key"
            options={pItemRef.current}
            filter
            filterBy={"descr"}
            onChange={(e: any) => {
                let clone = { ...row }
                clone[column.key] = e.value;
                // let uom = pItemRef.current.filter(x => x.key === e.value)[0]?.itemuom_key
                // clone['itemuom_key'] = uom;
                onRowChange(clone, true)
            }}
            tabIndex={-1} />
    };

    const getUomOptionsEditor = ({ row, column, onRowChange, onClose }: any) => {
        return <Dropdown autoFocus style={{ width: '100%' }} className="p-inputtext-sm"
            value={row[column.key]}
            optionLabel="descr"
            optionValue="key"
            filter
            filterBy={"descr"}
            options={UOMItemsRef.current.filter(d => row?.selectedItem?.itemuom_list?.includes(d.key))}
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
        return temp?.item_key && temp?.itemuom_key
    }

    // if (!pItems || !UOMItems) {
    //     return null
    // }

    return (
        <ListLayout baseRoute={`/purchase/${PAGE_ROUTE}`} description={PAGE_NAME} isLoading={isLoading || isAdding}
            data={items}
            newTable
            tableLayoutClass='h-full'
            allowFilters={false}
            actionBodyTemplate={actionBodyTemplate}
            gridProps={{
                allowAdd: true,
                disableAdd: !shouldAllowAdd(items),
                OnRowsChanged: (rows: any[]) => {
                    let temp = rows.map(d => {
                        let selectedItem = null
                        let temp = pItemRef.current?.filter(data => data.key === d.item_key)
                        if (temp.length) {
                            selectedItem = temp[0]
                        }
                        return {
                            ...d,
                            selectedItem: selectedItem
                        }
                    })
                    setItems(temp);
                    ref.current = temp;
                },
            }}>
            <Datacolumn
                field="item_key"
                width="50%"
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
                editorType={getOptionsEditor}
            />
            <Datacolumn
                field="itemuom_key"
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
        </ListLayout>
    );
}

export type ManageItemHandle = {
    saveItem: (postData: PurchaseTemplateItemPost) => Promise<void>;
    getItems: () => PurchaseTemplateItem[];
};


export default forwardRef(ManageItem);