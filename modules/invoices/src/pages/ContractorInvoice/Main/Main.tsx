import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'
import { ListLayout, Datacolumn } from '@igblsln/control';
import { PAGE_SIZE, useActiveProjectQuery, useGetAllCompaniesQuery } from '@igblsln/store';
import { Divider } from 'primereact/divider';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { classNames } from "primereact/utils";
import { useDeleteInvoiceMutation, useListInvoiceQuery } from '../api';
import CreateDirectInvoice from '../Modals/CreateDirectInvoiceModal';
import CreateDirectInvoiceModal from '../Modals/CreateDirectInvoiceModal';
import GenerateInvoiceModal from '../Modals/GenerateInvoiceModal';
import ViewModal from '../Modals/ViewModal';

type Props = {}

const Main = (props: Props) => {
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(PAGE_SIZE)
  const navigate = useNavigate();
  const { data: projects } = useActiveProjectQuery()
  const [showModal, setShowModal] = useState<boolean>(false)
  const [showCreateDirectInvoiceModal, setShowCreateDirectInvoiceModal] = useState<boolean>(false)
  const [showGenerateInvoiceModal, setShowGenerateInvoiceModal] = useState<boolean>(false)
  const [selectedProjectKey, setSelectedProjectKey] = useState<any>(null)
  const [selectedStatus, setSelectedStatus] = useState<any>(null)
  const [selectedPO, setSelectedPO] = useState<any>(null)
  const [allProjects, setAllProjects] = useState<any>([])
  const { data, isFetching: isLoading } = useListInvoiceQuery({ page: page, size: size, project: selectedProjectKey, status: selectedStatus })
  const { data : companies } = useGetAllCompaniesQuery()
  const [deleteDataAction, { isLoading: isDeleting }] = useDeleteInvoiceMutation()
  const deleteAction = (id: number) => deleteDataAction(id).unwrap();

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

  const customDiscard = () => {
    setShowModal(false)
    setShowCreateDirectInvoiceModal(false)
    setShowGenerateInvoiceModal(false)
  }

  return (
    <>
      <Divider />
      <div style={{ display: 'flex' }}>
        <div className="field col-4">
          <div className="field">
            <label className={'col-4'}>Company Name</label>
            <Dropdown
              style={{ width: '60%' }}
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

        <div className="field col-4">
          <div className="field">
            <label className={'col-4'}>Contract Type</label>
            <Dropdown
              style={{ width: '60%' }}
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
        <div className="field col-4">
          <label className={'col-4'}>Project Name</label>
          <Dropdown
            style={{ width: '60%' }}
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

      </div>
      <div className="col-12 " style={{ height: 'calc(100% - 183px)', minHeight: 200 }}>

        <ListLayout
          enableView
          onViewClick={(key: any) => {
            console.log(key)
            setSelectedPO(key)
            setShowModal(true)
          }}
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
          baseRoute="/invoice/contractorinvoice"
          description="Item Contractor Invoice"
          hideAddButton
          allowFilters={false}
          isLoading={isLoading || isDeleting}
          data={data?.results}
          newTable
          showHeader
          deleteAction={deleteAction}
        >
          
                    <Datacolumn field="date" header="Date" filteringType='date' />
          <Datacolumn field="number" header="Invoice No" filteringType='number' />

          <Datacolumn field="contractor.name" header="Description" filteringType='text' />
          <Datacolumn field="amount" header="Invoice Amount" type='currency' filteringType='currency' />
          <Datacolumn field="amount" header="Paid Amount" type='currency' filteringType='currency' />
          {/* <Datacolumn field="created_staus" header="Type" defaultValue={"Generated"} filteringType='text' /> */}
          {/* <Datacolumn
            field="makepayment"
            header="Make Payment"
            type="custom"
            displayValueGetter={(row: any) =>
              <i className="pi pi-credit-card"
                style={{
                  fontSize: '1.8rem',
                  display: row.vendor ? 'flex' : 'none',
                  marginTop: 5,
                  justifyContent: 'center',
                  cursor: 'pointer',
                  pointerEvents: row.vendor ? 'auto' : 'none'
                }}
                onClick={() => {
                  navigate(`/payment/contractorpayment/new`, { state: { vendor: row.vendor?.key } })
                }}
              ></i>}
          /> */}
        </ListLayout>
      </div>

      <div>
        {/* <Button
          label='Generate Invoice from Contract'
          className='p-button-plain'
          style={{ margin: '0 20px' }}
          onClick={() => {
            setShowGenerateInvoiceModal(true)
          }}
        /> */}
        <Button
          label='Create Invoice'
          className='p-button-plain'
          onClick={() => {
            setShowCreateDirectInvoiceModal(true)
          }}
        />
      </div>
      <ViewModal displayModal={showModal} poId={selectedPO} customDiscard={customDiscard} />
      <CreateDirectInvoiceModal displayModal={showCreateDirectInvoiceModal} customDiscard={customDiscard} />
      <GenerateInvoiceModal displayModal={showGenerateInvoiceModal} customDiscard={customDiscard} />
    </>

  );
}

export default Main