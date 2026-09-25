import React, { useEffect, useState } from 'react';
import { ListLayout, Datacolumn } from '@igblsln/control';
import { PAGE_SIZE, useActiveProjectQuery, ViewModalBorderRadius, useUnitsForProjectQuery } from '@igblsln/store';
import { Divider } from 'primereact/divider';
import { confirmDialog } from 'primereact/confirmdialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { useDeleteSaleInvoiceMutation, useGetSaleAgreementForParamsQuery, useGetSaleInvoiceForParamsQuery, } from '../api';
import CreateDirectInvoiceModal from '../Modals/CreateDirectInvoiceModal';

type Props = {}

const Main = (props: Props) => {
  const [selectedProjectKey, setSelectedProjectKey] = useState<any>(null)
  const [selectedUnit, setSelectedUnit] = useState<any>(null)
  const [selectedAgreement, setSelectedAgreement] = useState<any>(null)
  const [selectedInvoice, setSelectedInvoice] = useState<any>({})
  const [showCreateDirectInvoiceModal, setShowCreateDirectInvoiceModal] = useState<boolean>(false)

  const { data: projects } = useActiveProjectQuery()
  const [deleteDataAction, { isLoading: isDeleting }] = useDeleteSaleInvoiceMutation()
  const deleteAction = (id: number) => deleteDataAction(id).unwrap();

  const { data, isFetching: isLoading, refetch } = useGetSaleInvoiceForParamsQuery({
    projectId: selectedProjectKey,
    agreementId: selectedAgreement?.key,
  }, { skip: !selectedProjectKey || !selectedAgreement?.key, refetchOnMountOrArgChange: true })

  const { data: agreements } = useGetSaleAgreementForParamsQuery({
    projectId: selectedProjectKey,
    unitId : selectedUnit
  }, { skip: !selectedUnit || !selectedProjectKey, refetchOnMountOrArgChange: true })

  const { data: allUnits } = useUnitsForProjectQuery({projectId : selectedProjectKey}, { refetchOnMountOrArgChange: true });

  useEffect(() => {
    if (projects?.length) {
      setSelectedProjectKey(projects[0]?.key)
    }
  }, [projects])

  useEffect(() => {
    if (allUnits?.length) {
      setSelectedUnit(allUnits[0]?.key)
    }
  }, [allUnits])

  useEffect(() => {
    if (agreements?.length) {
      setSelectedAgreement(agreements[0])
    }
  }, [agreements])


  const customDiscard = () => {
    setShowCreateDirectInvoiceModal(false)
    refetch()
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
        <div className="field col-6">
          <label className={'col-4'}>Project Name</label>
          <Dropdown
            style={{ width: '60%' }}
            optionLabel={"name"}
            optionValue={"key"}
            value={selectedProjectKey}
            onChange={(e) => {
              setSelectedProjectKey(e.value)
            }}
            filter
            filterBy='name'
            options={projects}
          />
        </div>
        <div className="field col-6">
          <label className={'col-4'}>Unit</label>
          <Dropdown
            style={{ width: '60%' }}
            optionLabel={"descr"}
            optionValue={"key"}
            value={selectedUnit}
            onChange={(e) => {
              setSelectedUnit(e.value)
            }}
            options={allUnits}
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
            <label className={'col-5'}>Agreed Amt</label>
            <InputText
              style={{ width: '50%' }}
              disabled
              value={selectedAgreement?.sale_amount || 0}
            />
          </div>
          <div className="field col-4">
            <label className={'col-4'}>Paid Amt</label>
            <InputText
              style={{ width: '60%' }}
              disabled
              value={selectedAgreement?.paid_amount || 0}
            />
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ marginRight:35 }}>
              <Button
                  label='Create Invoice'
                  disabled={!selectedProjectKey || !selectedUnit || !selectedAgreement?.key}
                  className='p-button-plain'
                  onClick={() => {
                    setSelectedInvoice({})
                    setShowCreateDirectInvoiceModal(true)
                  }}
                />
          </div>
        </div>
        <div className="col-12 " style={{ height: (data?.length || 1) * 46, minHeight: 200 }}>
          <ListLayout
            hideAddButton
            hideActionColumn
            showExport={"contractorinvoice"}
            baseRoute="/contract/contractorinvoice"
            description="Sale Invoice"
            isLoading={isLoading || isDeleting}
            data={data || []}
            deleteAction={deleteAction}
            newTable
            showHeader
            emptyRowMessage={"No Invoice Created"}
          >

            <Datacolumn field="invoice_date" header="Invoice Date" filteringType='date' />
            <Datacolumn field="invoice_id" header="Invoice No" filteringType='number' />
            <Datacolumn field="notes" header="Notes" filteringType='text' />
            <Datacolumn field="invoice_amount" type='currency' header="Invoice Amt" filteringType='currency' />
            <Datacolumn field="payment_status" header="Payment Status" displayValueGetter={getPaymentStatus} filteringType='text' />
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
            agreement_id: selectedAgreement?.key,
            agreement_no: selectedAgreement?.agreement_no,
            max_amount : selectedAgreement?.sale_amount,
          }}
        />
      }

    </>

  );
}

export default Main