//@ts-nocheck1
import React, { useEffect, useState } from 'react';
import { ListLayout, Datacolumn } from '@igblsln/control';
import { PAGE_SIZE, useActiveProjectQuery, useActiveContractorsQuery, ViewModalBorderRadius, useGetAllContractorTypeQuery, formatDate } from '@igblsln/store';
import { Divider } from 'primereact/divider';
import { confirmDialog } from 'primereact/confirmdialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { useDeleteContractInvoiceMutation, useListContractInvoiceQuery, useContractorsForProjectAndCtypeQuery, useContractorAgreementsForParamsQuery } from '../contractInvoiceApi';
import CreateDirectInvoiceModal from '../Modals/CreateDirectInvoiceModal';
import routes from '../../../main/routes';

type Props = {}

const Main = (props: Props) => {
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(PAGE_SIZE)
  const [selectedProjectKey, setSelectedProjectKey] = useState<any>(null)
  const [selectedContractorInfo, setSelectedContractorInfo] = useState<any>(null)
  const [selectedContractorKey, setSelectedContractorKey] = useState<any>(null)
  const [selectedContractorTypeKey, setSelectedContractorTypeKey] = useState<any>(null)
  const [selectedAgreement, setSelectedAgreement] = useState<any>(null)
  const [selectedInvoice, setSelectedInvoice] = useState<any>({})
  const [showCreateDirectInvoiceModal, setShowCreateDirectInvoiceModal] = useState<boolean>(false)
  const [viewOnly, setShowViewOnly] = useState<boolean>(false)
  const [fromDate, setFromDate] = useState<any>(null);
  const [toDate, setToDate] = useState<any>(null);

  const { data: projects } = useActiveProjectQuery()
  const [deleteDataAction, { isLoading: isDeleting }] = useDeleteContractInvoiceMutation()
  const deleteAction = (id: number) => deleteDataAction(id).unwrap();

  // Prepare base params
  const invoiceQueryParams: any = {
    page: page,
    size: size,
    project: selectedProjectKey,
    agreement: selectedAgreement?.key,
    contractor: selectedContractorInfo?.inhouse === "Y" ? selectedContractorKey : '',
    cTypeId: (selectedContractorInfo?.inhouse === "N" && !selectedAgreement?.key) ? selectedContractorTypeKey : '',
    inhouse: selectedContractorInfo?.inhouse === "Y" ? 1 : ''
  };

  // Conditionally add date filters
  if (fromDate) {
    invoiceQueryParams.from = formatDate(fromDate, "yyyy-MM-dd").trim();
  }
  if (toDate) {
    invoiceQueryParams.to = formatDate(toDate, "yyyy-MM-dd").trim();
  }

  const { data, isFetching: isLoading } = useListContractInvoiceQuery(invoiceQueryParams, { skip: !selectedProjectKey || !selectedContractorKey, refetchOnMountOrArgChange: true })

  const { data: contractors } = useContractorsForProjectAndCtypeQuery({
    projectId: selectedProjectKey,
    cTypeId: selectedContractorTypeKey,
  }, { refetchOnMountOrArgChange: true, skip: !selectedContractorTypeKey || !selectedProjectKey })

  const { data: agreements } = useContractorAgreementsForParamsQuery({
    projectId: selectedProjectKey,
    cTypeId: selectedContractorTypeKey,
    contractorId: selectedContractorKey
  }, { skip: /*selectedContractorInfo?.inhouse === "Y" ||*/ !selectedContractorTypeKey || !selectedProjectKey || !selectedContractorKey, refetchOnMountOrArgChange: true })

  const { data: contractorType } = useGetAllContractorTypeQuery(undefined, { refetchOnMountOrArgChange: true });

  useEffect(() => {
    if (projects?.length) {
      setSelectedProjectKey(projects[0]?.key)
    }
  }, [projects])

  useEffect(() => {
    if (agreements?.length) {
      setSelectedAgreement(agreements[0])
    }
    else {
      setSelectedAgreement(null)
    }
  }, [agreements])

  // useEffect(()=>{
  //   if(contractors?.length){
  //     setSelectedContractorKey(contractors[0]?.key)
  //   }
  // },[contractors])

  useEffect(() => {
    if (contractorType?.length) {
      setSelectedContractorTypeKey(contractorType[0]?.key)
    }
  }, [contractorType])


  const customDiscard = () => {
    setShowCreateDirectInvoiceModal(false)
  }

  const getPaymentStatus = (row: any) => {
    switch (row?.invoice_status) {
      case "O":
        return "Not Paid"
      case "A":
        return "Partially Paid"
      case "P":
        return "Paid"
      default:
        return "NA"
    }
  }


  return (
    <>

      <Divider />
      <div style={{ display: 'flex' }}>
        <div className="field col-4">
          <label className={'col-4'}>Project Name</label>
          <Dropdown
            style={{ width: '60%' }}
            optionLabel={"name"}
            optionValue={"key"}
            value={selectedProjectKey}
            filter
            filterBy='name'
            onChange={(e) => {
              setSelectedProjectKey(e.value)
            }}
            options={projects}
          />
        </div>
        <div className="field col-4">
          <label className={'col-4'}>Contract Type</label>
          <Dropdown
            style={{ width: '60%' }}
            optionLabel={"descr"}
            optionValue={"key"}
            filter
            filterBy='descr'
            value={selectedContractorTypeKey}
            onChange={(e) => {
              setSelectedContractorTypeKey(e.value)
            }}
            options={contractorType}
          />
        </div>
        <div className="field col-4">
          <label className={'col-4'}>Contractor</label>
          <Dropdown
            style={{ width: '60%' }}
            optionLabel={"name"}
            optionValue={"key"}
            value={selectedContractorKey}
            onChange={(e) => {
              setSelectedContractorKey(e.value)
              let temp = contractors?.filter(d => d.key === e.value);
              if (temp?.length) {
                setSelectedContractorInfo(temp[0])
                // setSelectedAgreement(null)
              }

            }}
            options={contractors}
          //@ts-ignore
          // options={contractors?.filter(c => c?.contractortyp_key === selectedContractorTypeKey)}
          />
        </div>
      </div>

        <div style={{ display: 'flex' }}>
          <div className="field col-4">
            <label className={'col-4'}>Agreement No</label>
            {
              agreements?.length ?
                <Dropdown
                  style={{ width: '60%' }}
                  optionLabel={"agreement_no"}
                  optionValue={"key"}
                  value={selectedAgreement?.key}
                  onChange={(e) => {
                    let temp = agreements?.filter(d => d.key === e.value);
                    setSelectedAgreement(temp[0])
                  }}
                  options={agreements}
                />
                :
                <InputText
                  style={{ width: '60%' }}
                  disabled
                // value={selectedAgreement?.agreement_no}
                />
            }
          </div>
          <div className="field col-4">
            <label className={'col-4'}>From</label>
            <Calendar
              style={{ width: '60%' }}
              showIcon
              value={fromDate}
              todayButtonClassName='p-'
              dateFormat={"dd/mm/yy"}
              showButtonBar
              maxDate={toDate}
              onChange={(e) => {
                const newFromDate = e.value as Date | null;
                if (newFromDate === null) {
                  // If cleared, reset both
                  setFromDate(null);
                  setToDate(null);
                } else {
                  setFromDate(newFromDate);
                }
              }}
            />
          </div>
          <div className="field col-4">
            <label className={'col-4'}>To</label>
            <Calendar
              style={{ width: '60%' }}
              showIcon
              value={toDate}
              todayButtonClassName='p-'
              dateFormat={"dd/mm/yy"}
              showButtonBar
              minDate={fromDate}
              onChange={(e) => {
                const newToDate = e.value as Date | null;
                if (newToDate === null) {
                  setToDate(null);
                } else {
                  setToDate(newToDate);
                }
              }}
            />
          </div>
        </div>
        <div style={{ display: 'flex'}}>
          <div className="field col-4">
            <label className={'col-4'}>Paid Amt</label>
            <InputText
              style={{ width: '60%' }}
              disabled
              value={selectedAgreement?.paid_amount || 0}
            />
          </div>
          <div style={{ marginLeft: 'auto'}}>
            <Button
              label='Create Invoice'
              disabled={!selectedProjectKey || !selectedContractorTypeKey || !selectedContractorKey}
              className='p-button-plain'
              style={{ margin: '0 35px' }}
              onClick={() => {
                setSelectedInvoice({})
                setShowCreateDirectInvoiceModal(true)
              }}
            />
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ marginTop: 16, marginRight: 18, fontWeight: 'bold', fontSize: 16 }}>
            Total Net Amount: ₹{data?.total_invoice_amount?.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2}) || "0.00"} of {data?.count} {data?.count === 1 || data?.count === 0 ? "invoice" : "invoices"}
          </div>
        </div>

        <div className="col-12 " style={{ minHeight: 200 }}>
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
            hideActionColumn
            showExport={"contractorinvoice"}
            baseRoute="/contract/contractorinvoice"
            description="Contractor Invoice"
            isLoading={isLoading || isDeleting}
            data={data?.results || []}
            deleteAction={deleteAction}
            newTable
            showHeader
            emptyRowMessage={"No Invoice Created"}
          >
            <Datacolumn field="invoice_date" header="Invoice Date" filteringType='date' />
            <Datacolumn field="invoice_id" header="Invoice No" filteringType='number' />
            <Datacolumn field="invoice_desc" header="Invoice Description" filteringType='text' />
            <Datacolumn field="invoice_amount" type='currency' header="Invoice Amt" filteringType='currency' />
            <Datacolumn field="payment_status" header="Payment Status" displayValueGetter={getPaymentStatus} filteringType='text' />
            <Datacolumn
              field="view"
              header="View"
              type="custom"
              width={"10%"}
              displayValueGetter={(row: any) =>
                <Button
                  style={{ height: 30, marginRight: 10, marginBottom: 3 }}
                  onClick={() => {
                    setSelectedInvoice(row)
                    setShowCreateDirectInvoiceModal(true)
                    setShowViewOnly(true)
                  }}
                >
                  View
                </Button>}
            />
            <Datacolumn
              field="edit"
              header="Edit"
              type="custom"
              width={"10%"}
              displayValueGetter={(row: any) =>
                <Button
                  disabled={row?.invoice_status !== "O"}
                  style={{ height: 30, marginRight: 10, marginBottom: 3 }}
                  onClick={() => {
                    setSelectedInvoice(row)
                    setShowCreateDirectInvoiceModal(true)
                    setShowViewOnly(false)
                  }}
                >
                  Edit
                </Button>}
            />
            <Datacolumn
              field="delete"
              header="Delete"
              type="custom"
              width={"10%"}
              displayValueGetter={(row: any) =>
                <Button
                  disabled={row?.invoice_status !== "O"}
                  style={{ height: 30, marginRight: 10, marginBottom: 3 }}
                  onClick={() => confirmDialog({
                    message: 'Are you sure to delete?',
                    header: 'Confirmation',
                    icon: 'pi pi-exclamation-triangle',
                    accept: () => deleteAction(row.key),
                    reject: () => { }
                  })
                  }
                >
                  Delete
                </Button>}
            />
          </ListLayout>
        </div>

      {
        showCreateDirectInvoiceModal &&
        <CreateDirectInvoiceModal
          displayModal={showCreateDirectInvoiceModal}
          customDiscard={customDiscard}
          id={selectedInvoice?.key}
          defaultValues={{
            ...selectedInvoice,
            project_id: selectedProjectKey,
            project_name: projects?.filter(p => p.key === selectedProjectKey)[0]?.name,
            contractor_id: selectedContractorKey,
            contractor_name: contractors?.filter(p => p.key === selectedContractorKey)[0]?.name,
            agreement_id: selectedAgreement?.key,
            agreement_no: selectedAgreement?.agreement_no,
            max_amount: selectedAgreement?.total_amount
          }}
          readOnly={viewOnly}
        />
      }

    </>

  );
}

export default Main
