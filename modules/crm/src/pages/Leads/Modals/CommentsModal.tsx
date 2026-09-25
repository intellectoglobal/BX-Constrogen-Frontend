import React, { useEffect, useRef, useState } from 'react'
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { ListLayout, Datacolumn, useToast } from '@igblsln/control';
import { useGetCommentsForLeadsQuery, useUpdateLeadCommentsMutation } from '../api';
import { AFTER_API_TIME, getClientProps, useAuth } from '@igblsln/store';
import { confirmDialog } from 'primereact/confirmdialog';

type Props = {
  displayModal: boolean,
  id: any;
  customDiscard: any,
}

export default function CommentsModal({ displayModal, id, customDiscard }: Props) {

  const auth = useAuth()

  const { showSuccess, showError } = useToast();
  const { data: comments, isLoading } = useGetCommentsForLeadsQuery(id, {skip : !id, refetchOnMountOrArgChange: true})

  const [tableData, setTableData] = useState<any[]>([])
  const ref = useRef(tableData);
  const [tableKey, setTableKey] = useState<any>(1)
  const [isTableRowChanged, setIsTableRowChanged] = useState<boolean>(false)
  const clientProps = getClientProps();
  const [updateComments, { isLoading: isUpdating }] = useUpdateLeadCommentsMutation()


  useEffect(() => {
    if (comments) {
      setTableData(comments)
    }
  }, [comments])

  const removeTask = (val: any) => {
    const updValue = ref.current.filter(x => x !== val)
    ref.current = updValue;
    setTableData(updValue);
    setIsTableRowChanged(true);
    }

  const allocateAmount = async () => {
    try {
      let resp: any;
      let body = {
        key: id,
        comments: tableData,
      }
      console.log(body)

      resp = await updateComments({ ...body, ...clientProps }).unwrap();

      showSuccess('Success', resp.detail);
      customDiscard()

    } catch (error: any) {
      showError('An error occurred', error?.data?.detail || "We couldn't save your post, try again!");
    }
  }

  const actionBodyTemplate = (value: any) => {
    if (value.key) {
      return <></>
    } else {
    return <Button style={{ height: '35px', width: '20px', marginLeft: 20 }} type="button" onClick={() => removeTask(value)} className="p-button-rounded p-button-text" icon="pi pi-trash"></Button>
    }
  }

  const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${day}-${month}-${year}, ${hours}:${minutes}`;
  };


  const shouldAllowAdd = (items: any[]) => {
    if (items.length === 0) return true
    let temp = items[items.length - 1]
    return temp?.comment
  }

  return (
    <Dialog
      header={"Add/Update Comments"}
      visible={displayModal}
      position={'center'}
      modal
      style={{ width: '70vw' }}
      onHide={() => {
        if (isTableRowChanged) {
          confirmDialog({
            message: 'Are you sure you want to discard?',
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                customDiscard()
            },
            reject: () => { }
          });
        } else {
          customDiscard()
        }
      }}
      draggable={true} resizable={false}
    >
      <div key={tableKey} className="col-12" style={{ height: 'calc(100% - 183px)', minHeight: 200 }}>
        <ListLayout
          hideAddButton
          data={tableData}
          newTable
          isLoading={isLoading}
          tableLayoutClass='h-full'
          allowFilters={false}
          actionBodyTemplate={actionBodyTemplate}
          // hideActionColumn
          actionColumnWidth={"11%"}
          gridProps={{
            allowAdd: true,
            disableAdd: !shouldAllowAdd(tableData),
            newRowDefaults: {
              comment: "",
              createddttm: new Date().toLocaleString(),
              createdby: auth.user?.first_name,
            },
            OnRowsChanged: (rows: any[]) => {
              try {
                let temp = rows
                ref.current = temp;
                setIsTableRowChanged(true)
                setTableData([...rows]);
                setTableKey(Math.random())
              } catch (error) {
                setTableData([...tableData])
                setTableKey(Math.random())
              }
            }
          }}
        >
          <Datacolumn field="createddttm" header="Date Time"  displayValueGetter={(row) => formatDateTime(row.createddttm) }/>
          <Datacolumn field="comment" header="Comment" type="text"
          disableCondition={(row) => {
            return !!row.key
          }}
          editorType={"text"}/>
          <Datacolumn field="createdby" header="Entered By" displayValueGetter={(row) => {
            return `${row.createdby}`
          }} />
        </ListLayout>


        <Button
          style={{
            marginLeft: 'auto',
            marginTop: 10,
            display: 'flex',
            width: 150
          }}
          onClick={() => allocateAmount()}
          label="Save"
        />
      </div>
    </Dialog>
  )
}
