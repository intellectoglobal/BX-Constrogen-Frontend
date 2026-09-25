import React, { useState, useEffect } from 'react';
import { ListLayout, Datacolumn } from '@igblsln/control';
import { PAGE_SIZE, useActiveProjectQuery, useGetAllCompaniesQuery } from '@igblsln/store';
import { Divider } from 'primereact/divider';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { useDeleteInvoiceMutation, useListInvoiceQuery } from '../api';
import { Dialog } from 'primereact/dialog';
import AdditionalInvoiceDetailModal from './AdditionalInvoiceDetailModal';
import ViewPOModal from './ViewPOModal';

type Props = {
  displayModal: boolean,
  customDiscard: any,
}

export default function GenerateInvoiceModal({ displayModal, customDiscard }: Props) {
  const { data: projects } = useActiveProjectQuery()
  const [showModal, setShowModal] = useState<boolean>(false)
  const [showAdditionalInvoiceDetailModal, setShowAdditionalInvoiceDetailModal] = useState<boolean>(false)
  const [selectedProjectKey, setSelectedProjectKey] = useState<any>(null)
  const [selectedStatus, setSelectedStatus] = useState<any>(null)
  const [selectedPO, setSelectedPO] = useState<any>(null)
  const [allProjects, setAllProjects] = useState<any>([])
  const { data, isFetching: isLoading } = useListInvoiceQuery({ page: 1, size: 100, project: selectedProjectKey, status: selectedStatus })
  const [deleteDataAction, { isLoading: isDeleting }] = useDeleteInvoiceMutation()
  const deleteAction = (id: number) => deleteDataAction(id).unwrap();

  const { data: companies, isFetching: companiesFetching } = useGetAllCompaniesQuery()


  useEffect(() => {
    if (projects) {
      setAllProjects([
        {
          key: null,
          name: 'All'
        },
        ...projects
      ])
    }
  }, [projects])

  const customDiscard1 = () => {
    setShowModal(false)
    setShowAdditionalInvoiceDetailModal(false)
  }

  const getCheckboxEditor = ({ row, column, onRowChange, onClose }: any) => {
    return <Checkbox style={{ width: '100%', display: 'flex', margin: '10px auto', justifyContent: 'center' }}
      checked={row[column.key]}
      onChange={(e: any) => {
        onRowChange({ ...row, [column.key]: e.checked }, true)
        onClose(true)
      }}
      tabIndex={-1} />
  };

  return (
    <>
      <Dialog
        header={`Generate Invoice From Purchase Order`}
        visible={displayModal}
        position={'center'}
        modal
        style={{ width: '80vw' }}
        onHide={() => customDiscard()}
        draggable={false} resizable={false} closable
      >
        <>
          <Divider />
          <div style={{ display: 'flex' }}>
            <div className="field col-4">
              <label className={'col-4'}>Vendor Name</label>
              <InputText
                style={{ width: '60%' }}
                disabled
              />
            </div>
            <div className="field col-4">
              <label className={'col-4'}>Project Name</label>
              <InputText
                style={{ width: '60%' }}
                disabled
              />
            </div>
            <div className="field col-4">
              <label className={'col-4'}>Creation Method</label>
              <InputText
                style={{ width: '60%' }}
                value={"Generated from PO"}
                disabled
              />
            </div>

          </div>
          <div style={{ display: 'flex' }}>
            <div className="field col-4">
              <label className={'col-4'}>Invoice Amount</label>
              <InputText
                style={{ width: '60%' }}
                disabled
              />
            </div>
            <div className="field col-4">
              <label className={'col-4'}>TDS</label>
              <InputText
                style={{ width: '60%' }}
                disabled
              />
            </div>
            <div className="field col-4">
              <label className={'col-4'}>GST</label>
              <InputText
                style={{ width: '60%' }}
                disabled
              />
            </div>

          </div>

          <div className="col-12 " style={{ height: 'calc(100% - 183px)', minHeight: 200 }}>

            <ListLayout
              hideActionColumn
              baseRoute="/invoice/vendorinvoice"
              description="PO's Under Project"
              hideAddButton
              allowFilters={false}
              isLoading={isLoading || isDeleting}
              data={data?.results}
              newTable
              showHeader
              deleteAction={deleteAction}
            >
              {/*  */}
              <Datacolumn field="date" header="PO Date" filteringType='date' />
              <Datacolumn field="text" header="PO Number" filteringType='text' />
              <Datacolumn field="text" header="No Of Items" filteringType='text' />
              <Datacolumn field="vendor.name" header="Description" filteringType='text' />
              <Datacolumn field="amount" header="Amount" type='currency' filteringType='currency' />
              <Datacolumn width={"10%"} field="selected" header="Select" defaultValue={false} type="checkbox" editorType={getCheckboxEditor} />

              {/* <Datacolumn
                width={'20%'}
                field="makepayment"
                header=""
                type="custom"
                displayValueGetter={(row: any) =>
                  <div style={{ display: 'flex' }}>
                    <Button
                      label='View'
                      style={{ fontSize: 16, height: 30 }}
                      onClick={() => {
                        setShowModal(true)
                      }}
                    ></Button>
                    <Button
                      style={{ marginLeft: 10, fontSize: 16, height: 30 }}
                      label='Generate'
                      onClick={() => {
                        setShowAdditionalInvoiceDetailModal(true)
                      }}
                    ></Button>
                  </div>
                }
              /> */}
            </ListLayout>
          </div>

          <div>
            <Button
              label='Generate Invoice'
              style={{
                margin: 'auto',
                marginTop: 10,
                display: 'flex',
              }}
              className='p-button-plain'
              onClick={() => {
                customDiscard(true)
              }}
            />
          </div>
        </>
      </Dialog>
      <ViewPOModal poId={1001} displayModal={showModal} customDiscard={customDiscard1} />
      <AdditionalInvoiceDetailModal displayModal={showAdditionalInvoiceDetailModal} customDiscard={customDiscard1} />
    </>
  )
}
