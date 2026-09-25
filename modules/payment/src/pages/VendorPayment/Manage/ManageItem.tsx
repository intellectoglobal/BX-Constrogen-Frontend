import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import { Checkbox } from 'primereact/checkbox';
import { Button } from 'primereact/button';
import { Datacolumn, ListLayout } from '@igblsln/control';

type Props = {
  data: any[];
  isLoading?: boolean;
  onChange:Function
}

const ManageItem = ({ data, isLoading, onChange }: Props, selfRef: React.Ref<any>) => {
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
    return <Button style={{ height: '35px', width: '20px', marginLeft: 20 }} type="button" onClick={() => removeItem(value)} className="p-button-rounded p-button-text" icon="pi pi-trash"></Button>
  }

  const getCheckboxEditor = ({ row, column, onRowChange, onClose }: any) => {
    return <Checkbox style={{ width: '100%', display: 'flex', margin: '10px auto', justifyContent: 'center' }}
      checked={row[column.key]}
      onChange={(e: any) => {
        let updValue = []
        let selectedRow = row
        if (e.checked) {
          updValue = ref.current.map(x => {
            if (x.vendinv_key === row.vendinv_key) {
              selectedRow = {
                ...x,
                allocamt: row['balamt'],
                prev_allocamt : row['allocamt'],
                apply: true
              }
              return selectedRow
            }
            else return x
          })
        }
        else {
          updValue = ref.current.map(x => {
            if (x.vendinv_key === row.vendinv_key) {
              selectedRow = {
                ...x,
                allocamt: row['prev_allocamt'] || 0,
                apply: false
              }
              return selectedRow
            }
            else return x
          })
        }
        ref.current = updValue;
        setItems(updValue);
        row[column.key] = e.checked;
        onRowChange({ ...selectedRow}, true)
        onClose(true)
      }}
      tabIndex={-1} />
  };


  return (
    <ListLayout
      baseRoute={`/payment/vendorpayment`}
      description={"Vendor Payment"}
      isLoading={isLoading}
      data={items}
      newTable
      hideActionColumn
      tableLayoutClass='h-full'
      allowFilters={false}
      actionBodyTemplate={actionBodyTemplate}
      gridProps={{
        allowAdd: false,
        // allowAdd: true,
        newRowDefaults: {
          
        },
        OnRowsChanged: (rows: any[]) => {
          setItems(rows);
          ref.current = rows;
          onChange(rows)
        }

      }}>
      <Datacolumn field="invoicedate" header="Invoice Date" type="text" />
      <Datacolumn field="vendinv_key" header="Invoice No" type="text" />
      <Datacolumn field="invamt" header="Invoice Total" type="currency" />
      <Datacolumn field="balamt" header="Still Due" type="currency" />
      <Datacolumn field="allocamt" header="Amt Allocated" type="currency" defaultValue={0} editorType="currency" />
      <Datacolumn field="apply" defaultValue={false} header="Apply" type="checkbox" editorType={getCheckboxEditor} />
      <Datacolumn field="status" header="Status" type="text" />
    </ListLayout>
  );
}

export type ManageItemHandle = {
  getItems: () => any[];
};


export default forwardRef(ManageItem);