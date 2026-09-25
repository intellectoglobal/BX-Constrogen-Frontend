import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { confirmDialog } from 'primereact/confirmdialog';
import { Datacolumn, ListLayout, CurrencyFormatter } from '@igblsln/control';
import { Items, UOMs, shouldAllowAdd, useGetItemsForItemTypeQuery, useGetUOMsForItemTypeQuery } from '@igblsln/store';
import { PAGE_NAME, PAGE_ROUTE } from '../constants';

type Props = {
  data: any[];
  isLoading?: boolean;
  disableTable?: boolean;
  onChange?: Function;
}

const ManageItem = ({ data, isLoading, disableTable = false, onChange = () => { } }: Props, selfRef: React.Ref<any>) => {
  const [items, setItems] = useState<any[]>([])
  const ref = useRef(items);

  useImperativeHandle(selfRef, () => ({
    getItems() {
      return items
    }
  }));

  useEffect(() => {
    setItems(data);
    ref.current = data;
  }, [data])

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


  return (
    <ListLayout baseRoute={`/purchase/${PAGE_ROUTE}`} description={PAGE_NAME} isLoading={isLoading}
      data={items}
      newTable
      tableLayoutClass='h-full'
      allowFilters={false}
      hideActionColumn={disableTable}
      actionBodyTemplate={actionBodyTemplate}
      gridProps={{
        allowAdd: true,
        // disableAdd: disableTable || !shouldAllowAdd(items),
        newRowDefaults: {
          sno: items.length + 1,
        },
        OnRowsChanged: (rows: any[]) => {
          setItems(rows);
          ref.current = rows;
          onChange(true)
        },
      }}>

      {/* <Datacolumn width={"10%"} field="sno" header="S.No" type="number" /> */}
      <Datacolumn field="acc_name" header="Account Name" type="text" editorType={!disableTable && "text"} />
      <Datacolumn field="Bank Name" header="Bank Name" type="text" editorType={!disableTable && "text"} />
      <Datacolumn field="acc_no" header="Account No" type="number" editorType={!disableTable && "number"} />
    </ListLayout>
  );
}

export type ManageItemHandle = {
  getItems: () => any[];
};


export default forwardRef(ManageItem);