import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { confirmDialog } from 'primereact/confirmdialog';
import { Datacolumn, ListLayout } from '@igblsln/control';
import { Vendor, useGetAllVendorTypeQuery } from '@igblsln/store';
import { PAGE_NAME, PAGE_ROUTE } from '../constants';
import { WorkData } from '../taskApi';

type Props = {
  data: WorkData[];
  isLoading?: boolean;
  onChange: Function;
  selectedWork?: any;
  onSelectedRowChange: Function;
  editMode: boolean;
}

const ManageWork = ({ data, isLoading, onChange, onSelectedRowChange, selectedWork, editMode }: Props, selfRef: React.Ref<any>) => {
  const [items, setItems] = useState<WorkData[]>([])
  const [selectedRow, setSelectedRow] = useState<any>(selectedWork)
  const ref = useRef(items);
  const pItemRef = useRef<Vendor[]>([]);
  const { data: pItems, isFetching } = useGetAllVendorTypeQuery();

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
  }, [pItems])

  const removeItem = (val: any) => {
    const updValue = ref.current.filter(x => x !== val)
    ref.current = updValue;
    setItems(updValue);
  }

  const actionBodyTemplate = (value: any) => {
    return <Button
      style={{ height: '35px', width: '20px', marginLeft: 20 }}
      type="button"
      onClick={(e) => {
        confirmDialog({
          message: 'Are you sure you want to Delete Item?',
          header: 'Confirmation',
          icon: 'pi pi-exclamation-triangle',
          accept: () => {
            removeItem(value)
          },
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
        row[column.key] = e.value;
        onRowChange(row, true)
      }}
      tabIndex={-1} />
  };

  return (
    <ListLayout baseRoute={`/purchase/${PAGE_ROUTE}`} description={PAGE_NAME} isLoading={isLoading || isFetching}
      data={items}
      newTable
      allowFilters={false}
      actionBodyTemplate={actionBodyTemplate}
      gridProps={{
        allowAdd: true,
        newRowDefaults: {
          indexKey: Math.random(),
          id: `Work ${items.length + 1}`,
          descr: `Work ${items.length + 1}`,
          stages: []
        },
        OnRowsChanged: (rows: any[]) => {
          setItems(rows);
          ref.current = rows;
          onChange(true)
        },
        style: {
          cursor: 'pointer'
        },
        rowClass: (row: any) => (row.indexKey && (row.indexKey == selectedRow || row.indexKey == selectedWork) ? 'selectedrow' : undefined),
        onRowClick: (rowData: any, row: any) => {
          if (row.key === 'action') {
            setSelectedRow(-1);
            onSelectedRowChange(-1)
          }
          else {
            setSelectedRow(rowData.indexKey);
            onSelectedRowChange(rowData.indexKey)
          }

        }
      }}>
      <Datacolumn field="id" header="Work" type='text' editOnDoubleClick editorType={'custom'} />
      <Datacolumn field="descr" header="Work Description" type="text" editOnDoubleClick editorType={'text'} />
      <Datacolumn
        field="vendtyp_key"
        header="Contractor Type"
        editOnDoubleClick
        editorType={getOptionsEditor}
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
      />
    </ListLayout>
  );
}

export type ManageWorkHandle = {
  getItems: () => WorkData[];
};


export default forwardRef(ManageWork);