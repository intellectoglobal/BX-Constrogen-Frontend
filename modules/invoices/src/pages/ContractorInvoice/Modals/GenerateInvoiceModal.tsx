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

  return (
    <>
      <Dialog
        header={`Generate Invoice From Contract`}
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
              <label className={'col-4'}>Project Name</label>
              <Dropdown
                style={{ width: '40%' }}
                optionLabel={"name"}
                optionValue={"key"}
                value={selectedProjectKey}
                onChange={(e) => {
                  setSelectedProjectKey(e.value)
                }}
                options={allProjects}
                placeholder='All'
              />
            </div>
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
          <div style={{ display: 'flex' }}>
            <div className="field col-4">
              <label className={'col-5'}>Contractor Name</label>
              <Dropdown
                style={{ width: '50%' }}
                optionLabel={"name"}
                optionValue={"key"}
                value={selectedProjectKey}
                onChange={(e) => {
                  setSelectedProjectKey(e.value)
                }}
                options={allProjects}
                placeholder='All'
              />
            </div>
            <div className="field col-4">
              <label className={'col-4'}>Contract ID</label>
              <Dropdown
                style={{ width: '60%' }}
                value={selectedStatus}
                placeholder='All'
                onChange={(e) => {
                  setSelectedStatus(e.value)
                }}
                optionLabel={"descr"}
                optionValue={"key"}
                options={[
                  {
                    key: null,
                    descr: "All"
                  },
                  {
                    key: "S",
                    descr: "Saved"
                  },
                  {
                    key: "U",
                    descr: "Submitted"
                  },
                  {
                    key: "C",
                    descr: "Cancelled"
                  }
                ]}
              />
            </div>
            <div className="field col-4">
              <label className={'col-5'}>Company Name</label>
              <InputText
                style={{ width: '50%' }}
                disabled
              />
            </div>
          </div>
          <div className="col-12 " style={{ height: 'calc(100% - 183px)', minHeight: 200 }}>

            <ListLayout
              hideActionColumn
              baseRoute="/invoice/contractorinvoice"
              description="Milestones created under Contract"
              hideAddButton
              allowFilters={false}
              isLoading={isLoading || isDeleting}
              data={data?.results}
              newTable
              showHeader
              deleteAction={deleteAction}
            >
              
              <Datacolumn field="text" header="Milestone Description" filteringType='text' />
              <Datacolumn field="amount" header="Invoice Amount" type='currency' filteringType='currency' />
              <Datacolumn field="tds" header="TDS" filteringType='text' />
              <Datacolumn
                width={'20%'}
                field="makepayment"
                header=""
                type="custom"
                displayValueGetter={(row: any) =>
                  <div style={{ display: 'flex' }}>
                    {/* <Button
                      label='View'
                      style={{ fontSize: 16, height: 30 }}
                      onClick={() => {
                        setShowModal(true)
                      }}
                    ></Button> */}
                    <Button
                      style={{ marginLeft: 10, fontSize: 16, height: 30 }}
                      label='Generate'
                      onClick={() => {
                        setShowAdditionalInvoiceDetailModal(true)
                      }}
                    ></Button>
                  </div>
                }
              />
            </ListLayout>
          </div>

          <div>
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
      <ViewPOModal poId={1001} displayModal={showModal} customDiscard={customDiscard1} />
      <AdditionalInvoiceDetailModal displayModal={showAdditionalInvoiceDetailModal} customDiscard={customDiscard1} />
    </>
  )
}
