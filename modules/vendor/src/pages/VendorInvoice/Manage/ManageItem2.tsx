import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { confirmDialog } from 'primereact/confirmdialog';
import { Datacolumn, ListLayout, CurrencyFormatter } from '@igblsln/control';
import { Items, UOMs, shouldAllowAdd, useGetItemsForItemTypeQuery, useGetUOMsForItemTypeQuery } from '@igblsln/store';
import { useAddInvoiceItemMutation, InvoiceItem, InvoiceItemPost, getInvoiceItem } from '../invoiceItemApi';

type Props = {
  data: InvoiceItem[];
  isLoading?: boolean;
  disableTable?: boolean;
  onChange?: Function;
  selectedItemType:any
}

const ManageItem2 = ({ data, isLoading, disableTable = false,selectedItemType, onChange = () => { } }: Props, selfRef: React.Ref<any>) => {
  const [items, setItems] = useState<InvoiceItem[]>([])
  const [addDataAction, { isLoading: isAdding }] = useAddInvoiceItemMutation()
  const ref = useRef(items);
  const pItemRef = useRef<Items[]>([]);
  const UOMItemsRef = useRef<UOMs[]>([]);
  const { data: pItems } = useGetItemsForItemTypeQuery(selectedItemType, { skip: !selectedItemType })
  const { data: UOMItems } = useGetUOMsForItemTypeQuery(selectedItemType, { skip: !selectedItemType });


  useImperativeHandle(selfRef, () => ({
    async saveItem(postData: InvoiceItemPost) {
      await addDataAction({ ...postData, items }).unwrap();
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

  const removeItem = (val: any) => {
    const updValue = ref.current.filter(x => x !== val)
    ref.current = updValue;
    setItems(updValue);
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

  const summaryRenderer = (value: number) => {
    return <CurrencyFormatter value={value || 0} />;
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
        let clone = { ...row}
        clone[column.key] = e.value;
        onRowChange(clone, true)
      }}
      tabIndex={-1} />
  };

  return (
    <ListLayout baseRoute={`/vendor/invoice`} 
      description={"Invoice"} 
      isLoading={isLoading || isAdding}
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
          qty :0,
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
            let netamt = parseFloat((totalamt / ( 1 + (tax*0.01))).toFixed(2))
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

      <Datacolumn field="id" header="Payment ID" type="number" editorType={!disableTable && "number"} />
      <Datacolumn field="date" header="Payment Date" type="date" editorType={!disableTable && "date"} />
      <Datacolumn field="mode" header="Mode of Payment" type="text" editorType={!disableTable && "text"} />
      <Datacolumn field="receipt" header="Receipt No" type="number" editorType={!disableTable && "number"} />
    </ListLayout>
  );
}

export type ManageItemHandle = {
  saveItem: (postData: InvoiceItemPost) => Promise<void>;
  getItems: () => InvoiceItem[];
};


export default forwardRef(ManageItem2);