import React, { useState, useEffect } from 'react';
import { ListLayout, Datacolumn } from '@igblsln/control';
import { PAGE_SIZE, useActiveProjectQuery, useGetAllCompaniesQuery } from '@igblsln/store';
import { Divider } from 'primereact/divider';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { useDeleteInvoiceMutation, useListInvoiceQuery } from '../api';
import {
  useToast,
} from '@igblsln/control';
import { Dialog } from 'primereact/dialog';
import AdditionalInvoiceDetailModal from './AdditionalInvoiceDetailModal';

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

  return (
    <>
      <Dialog
        header={`Generate GST Invoice Screen`}
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
          <div className="field col-6">
          <div className="field">
            <label className={'col-3'}>Company Name</label>
            <Dropdown
              style={{ width: '30%' }}
              value={selectedStatus}
              placeholder='All'
              onChange={(e) => {
                setSelectedStatus(e.value)
              }}
              optionLabel={"id"}
              optionValue={"id"}
              options={companies}
            />
          </div>
        </div>
          </div>

          <div className="col-12 " style={{ height: 'calc(100% - 183px)', minHeight: 200 }}>

            <ListLayout
              hideActionColumn
              baseRoute="/invoice/gstinvoice"
              description="Unpaid GST Entries"
              hideAddButton
              allowFilters={false}
              isLoading={isLoading || isDeleting}
              data={data?.results}
              newTable
              showHeader
              deleteAction={deleteAction}
            >
              
              <Datacolumn field="text1" header="Date" filteringType='text' />
              <Datacolumn field="text2" header="Project Name" filteringType='text' />
              <Datacolumn field="text3" header="Customer Name" filteringType='text' />
              <Datacolumn field="text4" header="Flat Name" filteringType='text' />
              <Datacolumn field="text5" header="Received Amount" type='currency' filteringType='currency' />
              <Datacolumn field="text6" header="Receipt No" filteringType='text' />
              <Datacolumn field="text7" header="GST" filteringType='text' />
            </ListLayout>
          </div>

          <div className='grid p-fluid h-full'>
            <div className="field col-12 md:col-6">
              <label className={'col-5'}>GST Amount</label>
              <InputText
                style={{ width: '50%' }}
                disabled
              />
            </div>
            <div className="field col-12 md:col-6">
              <label className={'col-5'}>Additional Amount </label>
              <InputText
                style={{ width: '50%' }}
              />
            </div>
            <div className="field col-12 md:col-6">
              <label className={'col-5'}>Additional Charges Description </label>
              <InputText
                style={{ width: '50%' }}
              />
            </div>
            <div className="field col-12 md:col-6">
              <label className={'col-5'}>GST Invoice Amount </label>
              <InputText
                style={{ width: '50%' }}
                disabled
              />
            </div>
          </div>

          <div style={{ display: 'flex', margin: 'auto', justifyContent: 'center' }}>
            <Button
              label='Save'
              className='p-button-warning mr-3'
              onClick={() => {
                customDiscard(true)
              }}
            />
            <Button
              label='Close'
              className='p-button-plain'
              onClick={() => {
                customDiscard(true)
              }}
            />
          </div>
        </>
      </Dialog>
      <AdditionalInvoiceDetailModal displayModal={showAdditionalInvoiceDetailModal} customDiscard={customDiscard1} />
    </>
  )
}
