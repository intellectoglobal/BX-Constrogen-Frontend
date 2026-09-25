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
        header={`Generate TDS Invoice Screen`}
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
              baseRoute="/invoice/tdsinvoice"
              description="Unpaid TDS Entries"
              hideAddButton
              allowFilters={false}
              isLoading={isLoading || isDeleting}
              data={data?.results}
              newTable
              showHeader
              deleteAction={deleteAction}
            >
              
              <Datacolumn field="text1" header="Date" filteringType='text' />
              <Datacolumn field="text4" header="TDS Entry NO" filteringType='text' />
              <Datacolumn field="text5" header="TDS Amount" type='currency' filteringType='currency' />
              <Datacolumn field="text6" header="Deducted Invoice No" filteringType='text' />
            </ListLayout>
          </div>

          <div className="col-12 " style={{ height: 'calc(100% - 183px)', minHeight: 200 }}>
            <ListLayout
              hideActionColumn
              baseRoute="/invoice/tdsinvoice"
              description="Vendor wise TDS amount to be paid"
              hideAddButton
              allowFilters={false}
              isLoading={isLoading || isDeleting}
              data={data?.results}
              newTable
              showHeader
              deleteAction={deleteAction}
            >
              
              <Datacolumn field="text3" header="Vendor Name" filteringType='text' />
              <Datacolumn field="text4" header="PAN" filteringType='text' />
              <Datacolumn field="text5" header="TDS Amount" type='currency' filteringType='currency' />
            </ListLayout>
          </div>

          <div className='grid p-fluid h-full'>
            <div className="field col-12 md:col-6">
              <label className={'col-5'}>TDS Amount</label>
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
              <label className={'col-5'}>TDS Invoice Amount </label>
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
