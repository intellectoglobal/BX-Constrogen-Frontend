//@ts-nocheck
import React, { useEffect, useState } from 'react';
import { ListLayout, Datacolumn } from '@igblsln/control';
import { PAGE_SIZE, useActiveProjectQuery, useActiveVendorsQuery } from '@igblsln/store';
import { Divider } from 'primereact/divider';
import { Dropdown } from 'primereact/dropdown';
import { useDeleteInvoiceMutation, useListInvoiceQuery } from '../invoiceApi';

type Props = {}

const Main = (props: Props) => {
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(PAGE_SIZE)
  const [allVendors, setAllVendors] = useState<any>([])
  const [allProjects, setAllProjects] = useState<any>([])
  const [selectedProjectKey, setSelectedProjectKey] = useState<any>(null)
  const [selectedVendorKey, setSelectedVendorKey] = useState<any>(null)

  const { data, isFetching: isLoading } = useListInvoiceQuery({ page: page, size: size, project: selectedProjectKey, vendor: selectedVendorKey })
  const [deleteDataAction, { isLoading: isDeleting }] = useDeleteInvoiceMutation()
  const deleteAction = (id: number) => deleteDataAction(id).unwrap();
  const { data: projects } = useActiveProjectQuery()
  const { data: vendors } = useActiveVendorsQuery()

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

  useEffect(() => {
    if (vendors) {
      setAllVendors([
        {
          key: null,
          name: 'All'
        },
        ...vendors
      ])
    }
  }, [vendors])

  const getStatus = (row: any) => {
    return row.status.docstatus === "FP" ? "Paid" : row.status.descr
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
          <label className={'col-3'}>Material Vendor Name</label>
          <Dropdown
            style={{ width: '30%' }}
            optionLabel={"name"}
            optionValue={"key"}
            value={selectedVendorKey}
            onChange={(e) => {
              setSelectedVendorKey(e.value)
            }}
            options={allVendors}
            placeholder='All'
          />
        </div>
      </div>

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
        // hideAddButton={true}
        // hideActionColumn
        showExport={"vendorinvoice"}
        baseRoute="/vendor/vendorinvoice"
        description="Item Vendor Invoice"
        isLoading={isLoading || isDeleting}
        data={data?.results}
        deleteAction={deleteAction}
        newTable
        showHeader
      >
        <Datacolumn field="invoiceno" header="Invoice No" filteringType='number' />
        <Datacolumn field="invoicedate" header="Invoice Date" filteringType='date' />
        <Datacolumn field="vendor.name" header="Material Vendor" filteringType='number' />
        <Datacolumn field="vouchno" header="Voucher No" filteringType='text' />
        <Datacolumn field="duedate" header="Due Date" filteringType='date' />
        <Datacolumn field="invamt" type='currency' header="Invoice Amt" filteringType='currency' />
        <Datacolumn field="balamt" type='currency' header="Balance Amt" filteringType='currency' />
        <Datacolumn field="paymentstatus" header="Payment Status" filteringType='text' />
        <Datacolumn field="status.descr" displayValueGetter={getStatus} header="Status" filteringType='text' />
      </ListLayout>
    </>

  );
}

export default Main