import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { confirmDialog } from 'primereact/confirmdialog';
import { Datacolumn, ListLayout } from '@igblsln/control';
import { Vendor, useActiveContractorsQuery, useGetAllVendorTypeQuery } from '@igblsln/store';
import { PAGE_NAME, PAGE_ROUTE } from '../constants';
import { TaskData } from '../taskApi';

type Props = {
  data: TaskData[];
  isLoading?: boolean;
  disableTable?: boolean;
  onChange: Function;
  editMode: boolean;
}

const ManageTask = ({ data, isLoading, disableTable = false, onChange, editMode }: Props, selfRef: React.Ref<any>) => {
  const [items, setItems] = useState<TaskData[]>([])
  const ref = useRef(items);
  const pItemRef = useRef<Vendor[]>([]);
  const { data: pItems } = useGetAllVendorTypeQuery();

  useImperativeHandle(selfRef, () => ({
    getItems() {
      return items
    }
  }));

  useEffect(() => {
    if (data) {
      let temp = data.map(d => {
        return {
          ...d,
          startdate: d.startdate ? new Date(d.startdate) : '',
          enddate: d.enddate ? new Date(d.enddate) : '',
        }
      })
      setItems(temp);
      ref.current = temp;
    }

  }, [data])

  useEffect(() => {
    pItemRef.current = pItems || [];
  }, [pItems])

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
      allowFilters={false}
      actionBodyTemplate={actionBodyTemplate}
      gridProps={{
        allowAdd: !disableTable,
        newRowDefaults: {
          startdate: new Date(),
          enddate: new Date(),
          id: `Task ${items.length + 1}`,
          descr: `Task ${items.length + 1}`,
        },
        OnRowsChanged: (rows: any[]) => {
          setItems(rows);
          ref.current = rows;
          onChange(rows)
        },
      }}>
      <Datacolumn field="id" header="Task" type='text' editorType={'custom'} />
      <Datacolumn field="descr" header="Task Description" type="text" editorType={'text'} />
      <Datacolumn field="startdate" header="Start Date" type="date" editorType={'date'} />
      <Datacolumn field="enddate" header="End Date" type="date" editorType={'date'} />
    </ListLayout>
  );
}

export type ManageTaskHandle = {
  getItems: () => TaskData[];
};


export default forwardRef(ManageTask);