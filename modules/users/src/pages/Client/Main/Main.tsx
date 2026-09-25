import React, { useState } from 'react';
import { ListLayout, Datacolumn } from '@igblsln/control';
import { PAGE_SIZE } from '@igblsln/store';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { useAddClientMutation, useDeleteClientMutation, useListClientQuery, useUpdateClientMutation } from '../clientApi';
import { AFTER_API_TIME, getClientProps } from '@igblsln/store'
import { ManageLayout, useToast } from '@igblsln/control';

type Props = {}

const Main = (props: Props) => {
  const { showSuccess, showError } = useToast();
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(PAGE_SIZE)
  const [displayModal, setDisplayModal] = useState(false);
  const [isFormChanged, setIsFormChanged] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>({});
  const [isNew, setIsNew] = useState(true);

  const clientProps = getClientProps()

  const { data, isFetching: isLoading } = useListClientQuery({ page: page, size: size })
  const [addClient, { isLoading: isAdding }] = useAddClientMutation();
  const [updateClient, { isLoading: isUpdating }] = useUpdateClientMutation();
  const [deleteDataAction, { isLoading: isDeleting }] = useDeleteClientMutation()
  const deleteAction = (id: any) => {
    console.log(id)
    return deleteDataAction(id).unwrap();
  }

  const onSubmit = async () => {
    try {
      let resp: any;
      if (!!!selectedClient?.name) {
        showError("Name Field is Empty", "Please Enter a Name")
        return
      }
      if (isNew) {
        resp = await addClient({ ...selectedClient, ...clientProps }).unwrap();
      } else {
        resp = await updateClient({ ...selectedClient, ...clientProps }).unwrap();
      }
      showSuccess('Success', resp.detail);
      setTimeout(() => {
        setIsFormChanged(false)
        setDisplayModal(false)
      }, AFTER_API_TIME);
    } catch (error: any) {
      showError('An error occurred', error?.data?.detail || "We couldn't save your post, try again!");
    }
  }

  const renderFooter = () => {
    return (
      <div>
        <Button label="Save" loading={isAdding || isUpdating} className="p-button-warning mr-3" onClick={() => onSubmit()} />
        <Button label="Discard" loading={isAdding || isUpdating} className='p-button-plain' onClick={() => {
          if (isFormChanged) {
            if (confirm("Are You Sure to Discard?")) {
              setDisplayModal(false)
            }
          }
          else {
            setDisplayModal(false)
          }

        }} />
      </div>
    );
  }

  const customAddBtn = <Button
    className="ml-0"
    label="Create Client"
    onClick={() => {
      setIsNew(true)
      setSelectedClient({})
      setDisplayModal(true)
    }}
  />

  const customEditOnClick = (value: any) => {
    setIsNew(false)
    setSelectedClient(value)
    setDisplayModal(true)
  }

  return (
    <>
      <ListLayout
        pagination={{
          pageSize: size,
          loading: isLoading,
          currentPage: page,
          total: data?.length,
          onChange: (page, size) => {
            setPage(page);
            setSize(size)
          }
        }}
        hideAddButton
        customEditOnClick={customEditOnClick}
        customAddBtn={customAddBtn}
        baseRoute="/clients/client"
        description="Clients"
        isLoading={isLoading || isDeleting}
        data={data}
        newTable
        showHeader
        delKey={'id'}
        deleteAction={deleteAction}>
        <Datacolumn filteringType="text" field="id" header="Client Code" sortable filter dataType="numeric" style={{ minWidth: '8rem' }} />
        <Datacolumn filteringType="text" field="name" header="Client Name" sortable filter style={{ minWidth: '12rem' }} />
      </ListLayout>

      <Dialog header={`${isNew ? "Create" : "Edit"} Client`} visible={displayModal} footer={renderFooter} position={'center'} modal style={{ width: '50vw' }} onHide={() => setDisplayModal(false)}
        draggable={false} resizable={false} closable={false}
      >
        <div style={{ padding: 15 }}>
          <div className="field">
            <label style={{ fontSize: 18 }} className={'col-2'}>Name*</label>
            <InputText
              style={{ width: '30%' }}
              defaultValue={selectedClient?.name}
              onChange={(e) => {
                !isFormChanged && setIsFormChanged(true)
                setSelectedClient({
                  ...selectedClient,
                  name: e.target.value
                })
              }}
            />
          </div>
        </div>
      </Dialog>
    </>

  );
}

export default Main