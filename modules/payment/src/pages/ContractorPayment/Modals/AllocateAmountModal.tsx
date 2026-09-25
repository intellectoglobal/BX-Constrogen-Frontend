import React, { useEffect, useState } from 'react'
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { ListLayout, Datacolumn, useToast } from '@igblsln/control';
import { useAllocateInvoiceAmountForContractorMutation, useGetInvoicesByContractorQuery } from '../contractorPaymentApi';
import { AFTER_API_TIME, getClientProps, setPromptNavigate, useAppDispatch } from '@igblsln/store';
import { confirmDialog } from 'primereact/confirmdialog';

type Props = {
  displayModal: boolean,
  id: any;
  contractor: any;
  customDiscard: any,
}

export default function AllocateAmountModal({ displayModal, id, contractor, customDiscard }: Props) {

  const { showSuccess, showError } = useToast();
  const { data: invoices, isLoading } = useGetInvoicesByContractorQuery({ contractor: id }, { skip: !id, refetchOnMountOrArgChange: true })

  const [tableData, setTableData] = useState<any[]>([])
  const [tableKey, setTableKey] = useState<any>(1)
  const clientProps = getClientProps();
  const [updateInvoice, { isLoading: isUpdating }] = useAllocateInvoiceAmountForContractorMutation()
  const dispatch = useAppDispatch()
  const [isTableRowChanged, setIsTableRowChanged] = useState<boolean>(false)

  useEffect(() => {
    if (invoices) {
      setTableData(invoices)
    }
  }, [invoices])

  const allocateAmount = async () => {
    try {

      const allocatedAmount = tableData.map(d => d.allocated_amount).reduce((total, amt) => total + amt, 0)


      if (!allocatedAmount) {
        showError("No Amount Allocated", "Please Allocate Some Amount")
        return
      }

      let body = {
        key: id,
        invoices: tableData.map(t => {
          return {
            ...t,
            invoice_id: t.key,
            allocated_amount_details: t?.allocated_amount ? {
              ...t.allocated_amount_details || {},
              allocated_amount: t?.allocated_amount
            } : null
          }
        }),
        total_amount: allocatedAmount
      }
      console.log(body)
      // return
      let resp: any;
      resp = await updateInvoice({ ...body, ...clientProps }).unwrap();
      showSuccess('Success', resp.detail);
      dispatch(setPromptNavigate({promptNavigate: false}))
      setTimeout(() => {
        customDiscard(true)
      }, AFTER_API_TIME);
    } catch (error: any) {
      showError('An error occurred', error?.data?.detail || "We couldn't save your post, try again!");
    }
  }

  return (
    <Dialog
      header={contractor?.contractor_details?.name}
      visible={displayModal}
      position={'center'}
      modal
      style={{
        width: '70vw',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column'
      }}
      onHide={() => {
        if (isTableRowChanged) {
          confirmDialog({
            message: 'Are you sure you want to discard?',
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                customDiscard()
            },
            reject: () => { }
          });
        } else {
          customDiscard()
        }
      }}
      draggable={false} resizable={false} closable={true}
    >
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        overflow: 'hidden',
      }}>
      
        <div style={{
          flex: 1,
          overflowY: 'auto',
          minHeight: 200,
        }}>
          <ListLayout
            hideAddButton
            data={tableData}
            newTable
            isLoading={isLoading}
            tableLayoutClass='h-full'
            allowFilters={false}
            hideActionColumn
            gridProps={{
              OnRowsChanged: (rows: any[]) => {
                try {
                  const exceeded = rows.some(element => {
                    if (element?.allocated_amount > element?.pending_amount) {
                      showError("Amount Exceeds the Pending Amount", `Max Allowed for this invoice is ₹.${element.pending_amount}`);
                      return true;
                    }
                    return false;
                  });

                  if (exceeded) {
                    throw new Error("Exceeded Amount");
                  }

                  setTableData(rows);
                  setIsTableRowChanged(true)
                } catch (error) {
                  setTableData([...tableData])
                  setTableKey(Math.random())
                }
              }
            }}
          >
            <Datacolumn className='disabled' field="project_name" header="Project Name" />
            <Datacolumn className='disabled' field="invoice_id" header="Invoice No" />
            <Datacolumn className='disabled' field="invoice_date" header="Invoice Date" />
            <Datacolumn className='disabled' field="invoice_amount" header="Invoice Amount" type="currency" />
            <Datacolumn className='disabled' field="pending_amount" header="Pending Amount" type="currency" />
            <Datacolumn field="allocated_amount" header="Allocated Amount" type="currency" editorType={"currency"} />
          </ListLayout>
        </div>

        <div style={{
          paddingTop: '1rem',
          display: 'flex',
          justifyContent: 'flex-end',
          borderTop: '1px solid #ddd',
          marginTop: '1rem',
          background: 'white'
        }}>
          <Button
            style={{ width: 150 }}
            onClick={() => allocateAmount()}
            label="Allocate"
          />
        </div>

    </div>
    </Dialog>
  )
}
