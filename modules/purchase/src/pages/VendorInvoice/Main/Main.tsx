import React, { useState, useEffect, useRef } from 'react';
import { ListLayout, Datacolumn } from '@igblsln/control';
import { useNavigate, useLocation } from 'react-router-dom'
import { formatDate, PAGE_SIZE, setPromptNavigate, useActiveProjectQuery, useActiveVendorsQuery, useGetAllItemTypesQuery } from '@igblsln/store';
import { Divider } from 'primereact/divider';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { MultiSelect } from 'primereact/multiselect';
import { Calendar } from 'primereact/calendar';
import { Tooltip } from 'primereact/tooltip';
import { confirmDialog } from "primereact/confirmdialog";
import { useDeleteInvoiceMutation, useListInvoiceQuery } from '../api';
import ManageDirectInvoiceModal from '../Modals/ManageDirectInvoiceModal';
import ManageInvoiceFromPOModal from '../Modals/ManageInvoiceFromPOModal';
import ViewModal from '../Modals/ViewModal';
import ViewInvoiceFromPOModal from '../Modals/ViewInvoiceFromPOModal';
import { useDispatch } from "react-redux";

type Props = {}

const Main = (props: Props) => {
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(PAGE_SIZE)

  const { state } = useLocation()

  const location = useLocation();
  const navigate = useNavigate();
  const isFirstLoad = useRef(true);
  const dispatch = useDispatch();

  useEffect(() => {
    if (isFirstLoad.current) {
      // First time this component is loaded
      isFirstLoad.current = false;

      if (performance.navigation.type === 1 || (performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming)?.type === 'reload') {
        // Page was refreshed — clear state
        // navigate(location.pathname, { replace: true, state: null });
      }
    }
  }, [navigate, location]);


  const { data: projects } = useActiveProjectQuery()
  const { data: vendors } = useActiveVendorsQuery()
  const [showModal, setShowModal] = useState<boolean>(false)
  const [showPOModal, setShowPOModal] = useState<boolean>(false)
  const [showCreateDirectInvoiceModal, setShowCreateDirectInvoiceModal] = useState<boolean>(false)
  const [showGenerateInvoiceModal, setShowGenerateInvoiceModal] = useState<boolean>(false)
  const [selectedProjectKey, setSelectedProjectKey] = useState<any>(null)
  const [selectedItemType, setSelectedItemType] = useState<any>(null)
  const [selectedVendorKey, setSelectedVendorKey] = useState<any>(null)
  const [fromDate, setFromDate] = useState<any>(null);
  const [toDate, setToDate] = useState<any>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null)
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

  const selectedProjectName = React.useMemo(() => {
    if (!selectedProjectKey) return '';
    const selectedKey = (selectedProjectKey as any)?.key ?? selectedProjectKey;
    const selectedKeyAsString = String(selectedKey);
    const match = projects?.find?.((p: any) => String(p?.key) === selectedKeyAsString);
    return match?.name ?? (typeof selectedProjectKey === 'object' ? selectedProjectKey?.name : '') ?? '';
  }, [selectedProjectKey, projects]);

  const selectedVendorName = React.useMemo(() => {
    if (!selectedVendorKey) return '';
    const selectedKey = (selectedVendorKey as any)?.key ?? selectedVendorKey;
    const selectedKeyAsString = String(selectedKey);
    const match = vendors?.find?.((v: any) => String(v?.key) === selectedKeyAsString);
    return match?.name ?? (typeof selectedVendorKey === 'object' ? selectedVendorKey?.name : '') ?? '';
  }, [selectedVendorKey, vendors]);

  const status = [
        { name: 'Paid', code: 'P' },
        { name: 'Not paid', code: 'O' },
        { name: 'Partially Paid', code: 'A' }
    ];

  // Prepare base params
  const invoiceQueryParams: any = {
    page: page,
    size: size,
    project: selectedProjectKey,
    vendor: selectedVendorKey,
    status: selectedStatuses?.length ? selectedStatuses.join(',') : undefined,
    item_type: selectedItemType,
  };

  // Conditionally add date filters
  if (fromDate) {
    invoiceQueryParams.from = formatDate(fromDate, "yyyy-MM-dd").trim();
  }
  if (toDate) {
    invoiceQueryParams.to = formatDate(toDate, "yyyy-MM-dd").trim();
  }

  const { data, isFetching: isLoading } = useListInvoiceQuery(invoiceQueryParams, {
    refetchOnMountOrArgChange: true,
  });

  const [deleteDataAction, { isLoading: isDeleting }] = useDeleteInvoiceMutation()
  const deleteAction = (id: number) => deleteDataAction(id).unwrap();
  const {data : allItemTypes} = useGetAllItemTypesQuery()

  const customDiscard = () => {
    if (state) {
      navigate(state?.redirect, { state: state?.filters })
    }
    setShowModal(false)
    setSelectedInvoice(null)
    setShowCreateDirectInvoiceModal(false)
    setShowGenerateInvoiceModal(false)
    setShowPOModal(false)
    dispatch(setPromptNavigate({ promptNavigate: false }))
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

  const handleStateValue = async () => {
    await setSelectedInvoice(state?.invoiceKey)
    if (state?.method == "Direct")
      setShowModal(true)
    else if (state?.method == "FromPO")
      setShowPOModal(true)
  }

  useEffect(() => {
    if (state) {
      handleStateValue()
    }
  }, [state])


  return (
    <>
      <Divider />

      <div style={{ display: 'flex' }}>
        <div className="field col-3 flex align-items-center">
          <label className={'col-4'}>Project</label>
          {!!selectedProjectName && (
            <Tooltip
              mouseTrack
              mouseTrackLeft={24}
              mouseTrackTop={18}
              target="#vendorinvoice-project"
              position="bottom"
              content={selectedProjectName}
              className="my-tooltip-plain"
            />
          )}
          <Dropdown
            id="vendorinvoice-project"
            style={{ width: '75%' }}
            placeholder="All"
            optionLabel={"name"}
            optionValue={"key"}
            value={selectedProjectKey}
            filter
            filterBy='name'
            showClear
            onChange={(e) => {
              setSelectedProjectKey(e.value)
            }}
            options={projects}
          />
        </div>
         <div className="field col-3 flex align-items-center">
          <label className={'col-4'}>Vendor</label>
          {!!selectedVendorName && (
            <Tooltip
              mouseTrack
              mouseTrackLeft={24}
              mouseTrackTop={18}
              target="#vendorinvoice-vendor"
              position="bottom"
              content={selectedVendorName}
              className="my-tooltip-plain"
            />
          )}
          <Dropdown
            id="vendorinvoice-vendor"
            style={{ width: '75%' }}
            placeholder="All"
            optionLabel={"name"}
            optionValue={"key"}
            value={selectedVendorKey}
            filter
            filterBy='name'
            showClear
            onChange={(e) => {
              setSelectedVendorKey(e.value)
            }}
            options={vendors}
          />
        </div>
        <div className="field col-3 flex align-items-center">
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
        <div className="field col-3 flex align-items-center">
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

      <div style={{ display: 'flex' }}>
        <div className="field col-3">
          <label className={'col-4'}>Status</label>
          <MultiSelect 
            value={selectedStatuses} 
            onChange={(e) => setSelectedStatuses(e.value)} 
            options={status} 
            optionLabel="name"
            optionValue="code" 
            placeholder="All" 
            maxSelectedLabels={3}
            showClear
            style={{ width: '60%' }}
            />
        </div>
        <div className="field col-3">
          <label className={'col-4'}>Item Type</label>
          <Dropdown
            style={{ width: '60%' }}
            value={selectedItemType}
            onChange={(e) => {
              setSelectedItemType(e.value)
            }}
            showClear
            filter
            filterBy='descr'
            options={allItemTypes}
            placeholder='All'
            optionLabel='descr'
            optionValue='key'
          />
        </div>
        <div style={{ marginLeft: 'auto', marginTop: 10 }}>
          <Button
            label='Create Direct Invoice'
            className='p-button-plain'
            onClick={() => {
              setShowCreateDirectInvoiceModal(true)
            }}
          />
          <Button
            label='Generate Invoice from PO'
            className='p-button-plain'
            style={{ margin: '0 20px' }}
            onClick={() => {
              setShowGenerateInvoiceModal(true)
            }}
          />
        </div>
      </div>
      {/* <div className="col-12 " style={{ height: 'calc(100% - 283px)', minHeight: 200 }}> */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{ marginTop: 16, marginRight: 18, fontWeight: 'bold', fontSize: 16 }}>
          Total Net Amount: ₹{data?.total_netamt?.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2}) || "0.00"} of {data?.count} {data?.count === 1 || data?.count === 0 ? "invoice" : "invoices"}
        </div>
      </div>
      <ListLayout
        enableView
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
        baseRoute="/invoice/vendorinvoice"
        description="Vendor Invoice"
        hideAddButton
        hideActionColumn
        allowFilters={false}
        isLoading={isLoading || isDeleting}
        data={data?.results}
        newTable
        showHeader
        deleteAction={deleteAction}
      >
        <Datacolumn field="invoiceno" header="Invoice No" width={"8%"} filteringType='number' />
        <Datacolumn field="invoicedate" header="Date" filteringType='date' />
        <Datacolumn field="vendor.name" header="Vendor" filteringType='text' />
        <Datacolumn field="project.name" header="Project" filteringType='text' />
        <Datacolumn field="netamt" header="Net Amount" type='currency' filteringType='currency' />
        {/* <Datacolumn field="method" header="Creation Method" filteringType='text' /> */}
        <Datacolumn field="payment_status" header="Status" displayValueGetter={getPaymentStatus} filteringType='text' />
        <Datacolumn
          field="view"
          header="View"
          type="custom"
          width={"9%"}
          displayValueGetter={(row: any) =>
            <Button
              style={{ height: 30, marginRight: 10, marginBottom: 3 }}
              onClick={async () => {
                await setSelectedInvoice(row.key)
                if (row?.method?.includes("Direct"))
                  setShowModal(true)
                else if (row?.method === "FromPO")
                  setShowPOModal(true)
              }}
            >
              View
            </Button>}
        />
        <Datacolumn
          field="edit"
          header="Edit"
          type="custom"
          width={"8%"}
          displayValueGetter={(row: any) =>
            <Button
              disabled={row?.invoice_status !== "O" || row?.method === "FromPO"}
              style={{ height: 30, marginRight: 10, marginBottom: 3 }}
              onClick={async () => {
                await setSelectedInvoice(row.key)
                if (row?.method?.includes("Direct"))
                  setShowCreateDirectInvoiceModal(true)
                else if (row?.method === "FromPO")
                  setShowGenerateInvoiceModal(true)
              }}
            >
              Edit
            </Button>}
        />
        <Datacolumn
          field="delete"
          header="Delete"
          type="custom"
          width={"8%"}
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
      {/* </div> */}
      {
        showPOModal &&
        <ViewInvoiceFromPOModal displayModal={showPOModal} id={selectedInvoice} customDiscard={customDiscard} />
      }


      {
        showModal &&
        <ViewModal displayModal={showModal} id={selectedInvoice} customDiscard={customDiscard} />
      }
      {
        showCreateDirectInvoiceModal &&
        <ManageDirectInvoiceModal id={selectedInvoice} displayModal={showCreateDirectInvoiceModal} customDiscard={customDiscard} />
      }
      {
        showGenerateInvoiceModal &&
        <ManageInvoiceFromPOModal id={selectedInvoice} displayModal={showGenerateInvoiceModal} customDiscard={customDiscard} />
      }
    </>

  );
}

export default Main