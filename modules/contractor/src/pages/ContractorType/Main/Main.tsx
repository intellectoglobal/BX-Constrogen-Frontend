import React, { useState } from 'react';
import { ListLayout, Datacolumn } from '@igblsln/control';
import { PAGE_SIZE } from '@igblsln/store';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { useAddContractorTypeMutation, useDeleteContractorTypeMutation, useListContractorTypeQuery, useUpdateContractorTypeMutation } from '../contractorTypeApi';
import { AFTER_API_TIME, getClientProps } from '@igblsln/store'
import { ManageLayout, useToast } from '@igblsln/control';

type Props = {}

const Main = (props: Props) => {
  const { showSuccess, showError } = useToast();
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(PAGE_SIZE)
  const [displayModal, setDisplayModal] = useState(false);
  const [isFormChanged, setIsFormChanged] = useState(false);
  const [selectedContractorType, setSelectedContractorType] = useState<any>({});
  const [isNew, setIsNew] = useState(true);

  const clientProps = getClientProps()

  const { data, isFetching: isLoading } = useListContractorTypeQuery({ page: page, size: size })
  const [addContractorType, { isLoading: isAdding }] = useAddContractorTypeMutation();
  const [updateContractorType, { isLoading: isUpdating }] = useUpdateContractorTypeMutation();
  const [deleteDataAction, { isLoading: isDeleting }] = useDeleteContractorTypeMutation()
  const deleteAction = (id: number) => deleteDataAction(id).unwrap();

  const onSubmit = async () => {
    try {
      let resp: any;
      if (!!!selectedContractorType?.descr) {
        showError("Description Field is Empty", "Please Enter a Description")
        return
      }
      if (isNew) {
        resp = await addContractorType({ ...selectedContractorType, ...clientProps, contractor: "Y" }).unwrap();
      } else {
        resp = await updateContractorType({ ...selectedContractorType, ...clientProps, contractor: "Y" }).unwrap();
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
    label="Create Contractor Type"
    onClick={() => {
      setIsNew(true)
      setSelectedContractorType({})
      setDisplayModal(true)
    }}
  />

  const customEditOnClick = (value: any) => {
    setIsNew(false)
    setSelectedContractorType(value)
    setDisplayModal(true)
  }

  return (
    <>
      <ListLayout
        pagination={{
          pageSize: size,
          loading: isLoading,
          currentPage: page,
          total: data?.count,
          onChange: (page, size) => {
            setPage(page);
            setSize(size)
          }
        }}
        hideAddButton
        customEditOnClick={customEditOnClick}
        customAddBtn={customAddBtn}
        baseRoute="/contract/contractortype"
        description="Contractor Type"
        isLoading={isLoading || isDeleting}
        data={data?.results}
        newTable
        showHeader
        deleteAction={deleteAction}>
        <Datacolumn filteringType="text" field="id" header="Type Code" sortable filter dataType="numeric" style={{ minWidth: '8rem' }} />
        <Datacolumn filteringType="text" field="descr" header="Type Description" sortable filter style={{ minWidth: '12rem' }} />
      </ListLayout>

      <Dialog header={`${isNew ? "Create" : "Edit"} Contractor Type`} visible={displayModal} footer={renderFooter} position={'center'} modal style={{ width: '50vw' }} onHide={() => setDisplayModal(false)}
        draggable={false} resizable={false} closable={false}
      >
        <div style={{ padding: 15 }}>
          <div className="field">
            <label style={{ fontSize: 18 }} className={'col-2'}>Description*</label>
            <InputText
              style={{ width: '30%' }}
              defaultValue={selectedContractorType?.descr}
              onChange={(e) => {
                !isFormChanged && setIsFormChanged(true)
                setSelectedContractorType({
                  ...selectedContractorType,
                  descr: e.target.value
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