import React, { useState } from 'react';
import { ListLayout, Datacolumn, CreateButton } from '@igblsln/control';
import { formatDate, PAGE_SIZE, useActiveProjectQuery, useActiveVendorsQuery } from '@igblsln/store';
import { Divider } from 'primereact/divider';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Tooltip } from 'primereact/tooltip';
import { Button } from 'primereact/button';
import { useDeletePurchaseOrderMutation, useListPurchaseOrderQuery } from '../purchaseOrderApi';
import ViewModal from '../ViewModal';
import { generateWordFromData} from "./ExportToWord";

type Props = {}

const Main = (props: Props) => {
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(PAGE_SIZE)
  const { data: projects } = useActiveProjectQuery()
  const { data: vendors } = useActiveVendorsQuery()
  const [showModal, setShowModal] = useState<boolean>(false)
  const [selectedProjectKey, setSelectedProjectKey] = useState<any>(null)
  const [selectedVendorKey, setSelectedVendorKey] = useState<any>(null)
  const [fromDate, setFromDate] = useState<any>(null);
  const [toDate, setToDate] = useState<any>(null);

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

  const [selectedPO, setSelectedPO] = useState<any>(null)
  // Prepare base params
  const invoiceQueryParams: any = {
    page: page,
    size: size,
    project: selectedProjectKey,
    vendor: selectedVendorKey,
  };

  // Conditionally add date filters
  if (fromDate) {
    invoiceQueryParams.from = formatDate(fromDate, "yyyy-MM-dd");
  }
  if (toDate) {
    invoiceQueryParams.to = formatDate(toDate, "yyyy-MM-dd");
  }

  const { data, isFetching: isLoading } = useListPurchaseOrderQuery(invoiceQueryParams, {
    refetchOnMountOrArgChange: true,
  });
  const [deleteDataAction, { isLoading: isDeleting }] = useDeletePurchaseOrderMutation()
  const deleteAction = (id: number) => deleteDataAction(id).unwrap();

  const customDiscard = () => {
    setShowModal(false)
  }

  return (
    <>
      <Divider />

      <div className="flex" style={{ width: '100%' }}>
        <div className="field col-3 flex align-items-center">
          <label className={'col-4'}>Project</label>
          {!!selectedProjectName && (
            <Tooltip
              mouseTrack
              mouseTrackLeft={24}
              mouseTrackTop={18}
              target="#purchaseorder-project"
              position="bottom"
              content={selectedProjectName}
              className="my-tooltip-plain"
            />
          )}
          <Dropdown
            id="purchaseorder-project"
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
              target="#purchaseorder-vendor"
              position="bottom"
              content={selectedVendorName}
              className="my-tooltip-plain"
            />
          )}
          <Dropdown
            id="purchaseorder-vendor"
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
          maxDate={toDate} // prevent selecting fromDate greater than toDate
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
          minDate={fromDate} // prevent selecting toDate smaller than fromDate
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

      <CreateButton to={"/purchase/purchaseorder/new"} label='Purchase Order' />

      <ListLayout
        enableView
        onViewClick={(key: any) => {
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
        baseRoute="/purchase/purchaseorder"
        hideAddButton
        description="View Projectwise Purchase Order List"
        addBtnLabel='Create Purchase Order'
        isLoading={isLoading || isDeleting}
        data={data?.results}
        newTable
        showHeader
        deleteAction={deleteAction}
      >

        <Datacolumn field="date" header="Date" filteringType='date' />
        <Datacolumn field="number" header="PO Number" filteringType='number' />
        <Datacolumn field="vendor.name" header="Vendor Name" filteringType='text' />
        <Datacolumn field="project.name" header="Project" filteringType='text' />
        <Datacolumn field="netamt" header="Net Amount" type='currency' filteringType='currency' />
        <Datacolumn
          field="view"
          header="Export"
          type="custom"
          width={"10%"}
          displayValueGetter={(row: any) =>
            <Button
              style={{ height: 25, marginRight: 'auto', marginLeft: 'auto', marginBottom: 3 }}
              onClick={async () => {
                generateWordFromData(row)
              }}
            >
              Export
            </Button>}
        />
      </ListLayout>

      {
        showModal &&
        <ViewModal displayModal={showModal} poId={selectedPO} customDiscard={customDiscard} />
      }
    </>

  );
}

export default Main
