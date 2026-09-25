import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import { Button } from 'primereact/button';
import { confirmDialog } from 'primereact/confirmdialog';
import { Datacolumn, ListLayout } from '@igblsln/control';
import { PAGE_NAME, PAGE_ROUTE } from '../constants';
import { StageData } from '../taskApi';

type Props = {
  data: StageData[];
  isLoading?: boolean;
  disableTable?: boolean;
  onChange: Function;
  selectedStage?:any;
  onSelectedRowChange: Function;
  editMode: boolean;
}

const ManageStage = ({ data, isLoading, disableTable = false, onChange,selectedStage, onSelectedRowChange, editMode }: Props, selfRef: React.Ref<any>) => {
  const [items, setItems] = useState<StageData[]>([])
  const [selectedRow, setSelectedRow] = useState<any>(selectedStage)
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
    onChange(updValue)
  }

  const actionBodyTemplate = (value: any) => {
    return <Button
      style={{ height: '35px', width: '20px', marginLeft: 20 }}
      type="button"
      onClick={(e) => {
        onSelectedRowChange(-1)
        confirmDialog({
          message: 'Are you sure you want to Delete Item?',
          header: 'Confirmation',
          icon: 'pi pi-exclamation-triangle',
          accept: () => {
            removeItem(value)
          },
          reject: () => { }
        });
        e.stopPropagation()
      }}
      className="p-button-rounded p-button-text"
      icon="pi pi-trash"></Button>
  }

  return (
    <ListLayout baseRoute={`/purchase/${PAGE_ROUTE}`} description={PAGE_NAME} isLoading={isLoading}
      data={items}
      newTable
      allowFilters={false}
      actionBodyTemplate={actionBodyTemplate}
      gridProps={{
        allowAdd: !disableTable,
        newRowDefaults: {
          indexKey: Math.random(),
          id: `Stage ${items.length + 1}`,
          descr: `Stage ${items.length + 1}`,
          tasks: []
        },
        style: {
          cursor: 'pointer'
        },
        OnRowsChanged: (rows: any[]) => {
          setItems(rows);
          ref.current = rows;
          onChange(rows)
        },
        rowClass: (row: any) => ((row.indexKey && selectedStage !== -1 && (row.indexKey == selectedStage || row.indexKey == selectedRow)) ? 'selectedrow' : undefined),
        onRowClick: (row: any) => { setSelectedRow(row.indexKey); onSelectedRowChange(row.indexKey) }
      }}>
      <Datacolumn field="id" header="Stage" type='text' editOnDoubleClick editorType={'custom'} />
      <Datacolumn field="descr" header="Stage Description" editOnDoubleClick type="text" editorType={'text'} />
    </ListLayout>
  );
}

export type ManageStageHandle = {
  getItems: () => StageData[];
};


export default forwardRef(ManageStage);