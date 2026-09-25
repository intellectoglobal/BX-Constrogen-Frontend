import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { confirmDialog } from 'primereact/confirmdialog';
import { Datacolumn, ListLayout, CurrencyFormatter } from '@igblsln/control';
import { shouldAllowAdd, useGetAllVendorTypeQuery, useActiveVendorsQuery } from '@igblsln/store';
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
  const pVendorRef = useRef<any[]>([]);
  const { data: vendors, isLoading: vendorsFetching } = useActiveVendorsQuery()


  useImperativeHandle(selfRef, () => ({
    getItems() {
      return items
    }
  }));

  useEffect(() => {
    pVendorRef.current = vendors || [];
  }, [vendors])

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

  const summaryRenderer = (descr: string, value: number) => {
    return <strong> {descr} : <CurrencyFormatter value={value || 0} /> </strong>;
  }


  const getOptionsEditor = ({ row, column, onRowChange, onClose }: any) => {
    return <Dropdown autoFocus style={{ width: '100%' }} className="p-inputtext-sm"
      value={row[column.key]}
      optionLabel="descr"
      optionValue="key"
      filter
      filterBy={"descr"}
      options={pVendorRef.current}
      onChange={(e: any) => {
        let clone = { ...row }
        clone[column.key] = e.value;
        onRowChange(clone, true)
      }}
      tabIndex={-1} />
  };


  return (
    <ListLayout baseRoute={`/tds/${PAGE_ROUTE}`} description={PAGE_NAME} isLoading={isLoading}
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
          sno: items.length + 1,
          qty: 0,
          netamt: 0,
          taxamt: 0,
          totalamt: 0
        },
        OnRowsChanged: (rows: any[]) => {
          let temp = rows
          setItems(temp);
          ref.current = temp;
          onChange(true)
        },
        getBottomSummaryRows: (rows: any) => {
          return [{
            qty: 0,
            itemuom_key: 0,
            netamt: rows.map((x: any) => parseFloat(x.netamt || 0)).reduce((partialSum: number, a: number) => partialSum + a, 0),

          }];
        }
      }}>
      

      <Datacolumn
        field="item_key"
        header="Vendor Name*"
        displayValueGetter={(row, field) => {
          if (!Array.isArray(row)) {
            let temp = pVendorRef.current?.filter(d => d.key === row[field])
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

      <Datacolumn field="pan" header="PAN No" type="text" editorType={!disableTable && "text"} />
      <Datacolumn field="tds" header="TDS Amount*" type="number" editorType={!disableTable && "number"} />
      <Datacolumn
        field="makepayment"
        header=""
        type="custom"
        displayValueGetter={(row: any) =>
          <Button label='Detail' onClick={(e)=>e.preventDefault()}></Button>
        }
      />
    </ListLayout>
  );
}

export type ManageItemHandle = {
  getItems: () => any[];
};


export default forwardRef(ManageItem);