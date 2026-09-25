import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import { Button } from 'primereact/button';
import { confirmDialog } from 'primereact/confirmdialog';
import { Dropdown } from 'primereact/dropdown';
import { Datacolumn, ListLayout } from '@igblsln/control';
import { PAGE_NAME, PAGE_ROUTE } from '../constants';
// import { GridData } from '../itemsApi';
// import { useGetItemSubTypesQuery } from '../../ItemSubType/itemSubTypesApi';

type Props = {
  data: any[];
  selectedItemSubType?: any;
  isLoading?: boolean;
  disableTable?: boolean;
  onChange?: Function;
}

const ManageItem = ({ data, selectedItemSubType = null, isLoading, disableTable = false, onChange = () => { } }: Props, selfRef: React.Ref<any>) => {
  const [items, setItems] = useState<any[]>([])
  const ref = useRef(items);
  const pItemRef = useRef<any[]>([]);


  // const { data: selectedSubTypeData } = useGetItemSubTypesQuery(selectedItemSubType, { skip: !selectedItemSubType });

  useEffect(() => {
    // Dummy data for labour options
    pItemRef.current = [
      { key: 1, descr: "Civil Labour" },
      { key: 2, descr: "Mason" },
      { key: 3, descr: "Store Cutter" },
      { key: 4, descr: "Electrician" },
      { key: 5, descr: "Plumber" },
      { key: 6, descr: "Carpenter" },
      { key: 7, descr: "Painter" },
      { key: 8, descr: "Welder" }
    ];
  }, [])

  // const selectedSubTypeData = {
  //   "key": 9,
  //   "createddttm": "2024-08-19T19:43:57Z",
  //   "itemtyp": {
  //     "key": 3,
  //     "descr": "Plumbing"
  //   },
  //   "specifications": [
  //     {
  //       "key": 20,
  //       "createddttm": "2024-08-19T19:43:57Z",
  //       "descr": "new1",
  //       "createdby": "Unknown",
  //       "lastmodifiedby": null,
  //       "lastmodifieddttm": null,
  //       "item_subtype_key": 9,
  //       "client_id": 1
  //     },
  //     {
  //       "key": 21,
  //       "createddttm": "2024-08-19T19:43:57Z",
  //       "descr": "new3",
  //       "createdby": "Unknown",
  //       "lastmodifiedby": null,
  //       "lastmodifieddttm": null,
  //       "item_subtype_key": 9,
  //       "client_id": 1
  //     },
  //     {
  //       "key": 24,
  //       "createddttm": "2024-08-20T16:52:15Z",
  //       "descr": "spec name",
  //       "createdby": "Unknown",
  //       "lastmodifiedby": null,
  //       "lastmodifieddttm": null,
  //       "item_subtype_key": 9,
  //       "client_id": 1
  //     }
  //   ],
  //   "uoms": [
  //     {
  //       "key": 13,
  //       "createddttm": "2024-08-19T19:43:57Z",
  //       "createdby": "Unknown",
  //       "lastmodifiedby": null,
  //       "lastmodifieddttm": null,
  //       "item_subtype_key": 9,
  //       "item_uom_key": 4,
  //       "client_id": 1
  //     },
  //     {
  //       "key": 14,
  //       "createddttm": "2024-08-19T19:43:57Z",
  //       "createdby": "Unknown",
  //       "lastmodifiedby": null,
  //       "lastmodifieddttm": null,
  //       "item_subtype_key": 9,
  //       "item_uom_key": 3,
  //       "client_id": 1
  //     }
  //   ],
  //   "descr": "Newer",
  //   "gst": 5,
  //   "createdby": "Unknown",
  //   "lastmodifiedby": null,
  //   "lastmodifieddttm": null,
  //   "itemtyp_key": 3,
  //   "client_id": 1
  // }

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
      style={{ height: '35px', width: '20px'}}
      type="button"
      onClick={() => {
        confirmDialog({
          message: 'Are you sure you want to Delete Material Item?',
          header: 'Confirmation',
          icon: 'pi pi-exclamation-triangle',
          accept: () => removeItem(value),
          reject: () => { }
        });
      }}
      className="p-button-rounded p-button-text"
      icon="pi pi-trash"></Button>
  }

  const shouldAllowAdd = (items: any[]) => {
    if (items.length === 0) return true
    let temp = items[items.length - 1]
    return temp?.name && temp?.value
  }

  const getOptionsEditor = ({ row, column, onRowChange, onClose }: any) => {
    return <Dropdown autoFocus className="p-inputtext-sm editor-dropdown-style"
      value={row[column.key]}
      optionLabel="descr"
      optionValue="key"
      filter
      filterBy={"descr"}
      options={pItemRef.current.filter(d => {
        return !ref.current.filter(p => p.key === d.key).length
      })}
      onChange={(e: any) => {
        let clone = { ...row, ...pItemRef.current.find(x => x.key === e.value) }
        clone[column.key] = e.value;
        onRowChange(clone, true)
      }}
      tabIndex={-1} 
      />
  };

  // if (!selectedSubTypeData?.specifications?.length) {
  //   return null
  // }

  return (
    <ListLayout baseRoute={`/project/${PAGE_ROUTE}`} description={PAGE_NAME} isLoading={isLoading}
      data={[{}]}
      newTable
      tableLayoutClass='h-full'
      allowFilters={false}
      hideActionColumn={disableTable}
      actionColumnInFirst
      actionColumnWidth={"20%"}
      actionBodyTemplate={actionBodyTemplate}
      gridProps={{
        allowAdd: true,
        disableAdd: !shouldAllowAdd(items),
        OnRowsChanged: (rows: any[]) => {
          let temp = rows
          setItems(temp);
          ref.current = temp;
          onChange(true)
        },
      }}>

      {/* <Datacolumn field="name" header="Specification Parameter" editorType="text" /> */}
      <Datacolumn
        field="name"
        header="Labour"
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
      <Datacolumn field="value" header="Count" editorType="text" />
    </ListLayout>
  );
}

export type ManageItemHandle = {
  getItems: () => any[];
};


export default forwardRef(ManageItem);
