import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { confirmDialog } from 'primereact/confirmdialog';
import { Datacolumn, ListLayout } from '@igblsln/control';
import { Items, UOMs, shouldAllowAdd, useGetItemsForItemTypeQuery, useGetUOMsForItemTypeQuery} from '@igblsln/store';
import { PAGE_NAME, PAGE_ROUTE } from '../constants';

type Props = {
  data: any[];
  isLoading?: boolean;
  disableTable?: boolean;
  onChange?: Function;
  selectedItemType:any
}

const ManageItem = ({ data, isLoading, disableTable = false,selectedItemType, onChange = () => { } }: Props, selfRef: React.Ref<any>) => {
  const [items, setItems] = useState<any[]>([])

  const ref = useRef(items);
  const pItemRef = useRef<Items[]>([]);
  const UOMItemsRef = useRef<UOMs[]>([]);
  const { data: pItems } = useGetItemsForItemTypeQuery(selectedItemType, { skip: !selectedItemType })
  const { data: UOMItems } = useGetUOMsForItemTypeQuery(selectedItemType, { skip: !selectedItemType });

  useImperativeHandle(selfRef, () => ({
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
        let uom = pItemRef.current.filter(x => x.key === e.value)[0]?.itemuom_key
        clone['itemuom_key'] = uom;
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
      options={UOMItemsRef.current}
      onChange={(e: any) => {
        let clone = { ...row }
        clone[column.key] = e.value;
        onRowChange(clone, true)
      }}
      tabIndex={-1} />
  };

  return (
    <ListLayout baseRoute={`/estimation/${PAGE_ROUTE}`} description={PAGE_NAME} isLoading={isLoading}
      data={items}
      newTable
      tableLayoutClass='h-full'
      allowFilters={false}
      hideActionColumn={disableTable}
      actionBodyTemplate={actionBodyTemplate}
      gridProps={{
        allowAdd: true,
        disableAdd : disableTable || !shouldAllowAdd(items),
        OnRowsChanged: (rows: any[]) => {
          let temp = rows
          setItems(temp);
          ref.current = temp;
          onChange(true)
        },
      }}>
      <Datacolumn
        field="item_key"
        width="25%"
        header="Rod Size in MM*"
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
            <Datacolumn field="qty" header="Rod Length" type="number" editorType={!disableTable && "number"} />
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
        editorType={!disableTable && getUomOptionsEditor}
      />
      <Datacolumn field="qty" header="Quantity" type="number" editorType={!disableTable && "number"} />
      <Datacolumn width="30%" field="purpose" header="Purpose" type="text" editorType={!disableTable && "text"} />
    </ListLayout>
  );
}

export type ManageItemHandle = {
  getItems: () => any[];
};


export default forwardRef(ManageItem);