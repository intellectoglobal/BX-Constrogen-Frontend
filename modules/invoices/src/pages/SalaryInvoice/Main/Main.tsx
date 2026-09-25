import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'
import { ListLayout, Datacolumn } from '@igblsln/control';
import { PAGE_SIZE, useActiveProjectQuery, useGetAllCompaniesQuery } from '@igblsln/store';
import { Divider } from 'primereact/divider';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { useDeleteInvoiceMutation, useListInvoiceQuery } from '../api';
import GenerateSalaryInvoiceModal from '../Modals/GenerateSalaryInvoiceModal';
import ViewModal from '../Modals/ViewModal';
import GenerateAllowanceInvoiceModal from '../Modals/GenerateAllowanceInvoiceModal';

type Props = {}

const Main = (props: Props) => {
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(PAGE_SIZE)
  const navigate = useNavigate();
  const { data: projects } = useActiveProjectQuery()
  const [showModal, setShowModal] = useState<boolean>(false)
  const [showGenerateAllowanceInvoiceModal, setShowGenerateAllowanceInvoiceModal] = useState<boolean>(false)
  const [showGenerateSalaryInvoiceModal, setShowGenerateSalaryInvoiceModal] = useState<boolean>(false)
  const [selectedProjectKey, setSelectedProjectKey] = useState<any>(null)
  const [selectedStatus, setSelectedStatus] = useState<any>(null)
  const [selectedPO, setSelectedPO] = useState<any>(null)
  const [allProjects, setAllProjects] = useState<any>([])
  const { data, isFetching: isLoading } = useListInvoiceQuery({ page: page, size: size, project: selectedProjectKey, status: selectedStatus })
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

  const customDiscard = () => {
    setShowModal(false)
    setShowGenerateAllowanceInvoiceModal(false)
    setShowGenerateSalaryInvoiceModal(false)
  }

  return (
    <>
      <Divider />
      <div style={{ display: 'flex' }}>
        <div className="field col-6">
          <label className={'col-3'}>Project Name</label>
          <Dropdown
            style={{ width: '30%' }}
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

      <div className="col-12 " style={{ height: 'calc(100% - 183px)', minHeight: 200 }}>
        <ListLayout
          enableView
          disableEdit
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
          baseRoute="/invoice/tdsinvoice"
          description="Salary/Allowance Invoice"
          hideActionColumn
          hideAddButton
          allowFilters={false}
          isLoading={isLoading || isDeleting}
          data={data?.results}
          newTable
          showHeader
          deleteAction={deleteAction}
        >
          
          <Datacolumn field="number" header="Invoice No" filteringType='number' />
          <Datacolumn field="date" header="Date" filteringType='date' />
          <Datacolumn field="company" header="Company Name" filteringType='text' />
          <Datacolumn field="company" header="Employee Name" filteringType='text' />
          <Datacolumn field="amount" header="Amount" type='currency' filteringType='currency' />
          <Datacolumn field="status.descr" header="Payment Type" filteringType='text' />
          <Datacolumn field="status.descr" header="TDS" filteringType='text' />
          <Datacolumn field="status.descr" header="Payment Status" filteringType='text' />
          <Datacolumn
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
                  // navigate(`/payment/allowancepayment/new`, { state: { vendor: row.vendor?.key } })
                }}
              ></i>}
          />
        </ListLayout>
      </div>

      <div>
        <Button
          label='Generate Salary Invoice'
          className='p-button-plain'
          style={{ margin: '0 20px' }}
          onClick={() => {
            setShowGenerateSalaryInvoiceModal(true)
          }}
        />
        <Button
          label='Generate Allowance Invoice'
          className='p-button-plain'
          style={{ margin: '0 20px' }}
          onClick={() => {
            setShowGenerateAllowanceInvoiceModal(true)
          }}
        />
      </div>
      <ViewModal displayModal={showModal} poId={selectedPO} customDiscard={customDiscard} />
      <GenerateSalaryInvoiceModal displayModal={showGenerateSalaryInvoiceModal} customDiscard={customDiscard} />
      <GenerateAllowanceInvoiceModal displayModal={showGenerateAllowanceInvoiceModal} customDiscard={customDiscard} />
    </>

  );
}

export default Main