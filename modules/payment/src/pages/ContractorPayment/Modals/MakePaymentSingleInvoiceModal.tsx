import React, { useEffect, useRef, useState } from 'react'
import { Controller, UseFormRegister, FieldErrors, FieldValues, UseFormSetValue } from 'react-hook-form';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { classNames } from 'primereact/utils';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { RadioButton } from 'primereact/radiobutton';
import {
  ManageLayout,
  getFormErrorMessage,
  useToast,
  ManageLayoutHandle,
  FormField,
  ListLayout,
  Datacolumn,
} from '@igblsln/control';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { useAddContractorPaymentMutation, } from '../contractorPaymentApi';
import {
  AFTER_API_TIME,
  getClientProps,
  useGetModeOfPaymentsQuery,
  ViewModalBorderRadius,
  useGetNextDocNoQuery,
  useListBankQuery,
  convertDateValue,
  defaultDateFormat,
  useAppDispatch,
  setPromptNavigate
} from '@igblsln/store';
import { Dialog } from 'primereact/dialog';

type Props = {
  displayModal: boolean,
  id: any;
  contractor: any;
  customDiscard: any,
}

interface DropdownChangeEvent {
  value: string;
  originalEvent: Event;
}

export default function ContractorPaymentModal({ displayModal, id, contractor, customDiscard }: Props) {

  const { showSuccess, showError } = useToast();
  const [showingToast, setShowingToast] = useState(false)
  const [selectedModeOfPay, setSelectedModeOfPay] = useState<any>(null)
  const manageLayoutRef = useRef<ManageLayoutHandle>();
  const dispatch = useAppDispatch()
  const [isTableRowChanged, setIsTableRowChanged] = useState<boolean>(false)

  const clientProps = getClientProps();

  const [formData, setFormData] = useState<any>({
    contract_voucher_dt: convertDateValue(new Date(), true)
  })
  const [tableData, setTableData] = useState<any[]>([{ ...contractor }])
  const [tableKey, setTableKey] = useState<any>(1)

  const { data: modeOfPayments } = useGetModeOfPaymentsQuery({})
  const { data: banks } = useListBankQuery()

  const { data: docData } = useGetNextDocNoQuery("VN", { refetchOnMountOrArgChange: true })


  const [addContractorPayment, { isLoading: isAdding }] = useAddContractorPaymentMutation()


  const onSubmit = async (values: any) => {
    try {

      const allocatedAmount = tableData.map(d => d.allocated_amount).reduce((total, amt) => total + amt, 0)

      if (!allocatedAmount) {
        showError("No Amount Allocated", "Please Allocate Some Amount")
        return
      }

      let body = {
        ...values,
        contractor_id: id,
        voucher_number: docData?.next_doc_id,
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
      resp = await addContractorPayment({ ...body, ...clientProps }).unwrap();
      showSuccess('Success', resp.detail);
      dispatch(setPromptNavigate({promptNavigate: false}))
      setShowingToast(true);
      setTimeout(() => {
        customDiscard(true)
      }, AFTER_API_TIME);
    } catch (error: any) {
      showError('An error occurred', error?.data?.detail || "We couldn't save your post, try again!");
    }
  }

  const renderForm = (control: any, _register: UseFormRegister<FieldValues>, errors: FieldErrors<FieldValues>) => {
    return (<div className='pl-4 pt-4 grid p-fluid h-full'>

      <div style={{ border: '2px solid', width: '100%', borderRadius: ViewModalBorderRadius }} className='mb-4 mr-6 pl-4 pt-4 grid p-fluid h-full'>


        <FormField label="Contractor Type" name="contractor_type" className="col-12 md:col-4" control={control} errors={errors}
          // required
          leftSpan={4}
          rightSpan={6}
          formItem={{
            component: InputText,
            componentProps: {
              disabled: true,
              maxLength: 50,
              value: contractor?.contractor_details?.name
            }
          }}
        />

        <FormField label="Contractor Name" name="contractor_id" className="col-12 md:col-4" control={control} errors={errors}
          // required
          leftSpan={4}
          rightSpan={6}
          formItem={{
            component: InputText,
            componentProps: {
              disabled: true,
              maxLength: 50,
              value: contractor?.contractor_details?.type?.descr
            }
          }}
        />

        <FormField label="Date" name="contract_voucher_dt" useExplicit control={control} errors={errors}
          leftSpan={4}
          rightSpan={6}
          required
          className="col-12 md:col-4"
          convertValue={convertDateValue}
          formItem={{
            component: Calendar,
            componentProps: {
              showIcon: true,
              dateFormat: defaultDateFormat
            }
          }} />

      </div>

      <div style={{ border: '2px solid', width: '100%', borderRadius: ViewModalBorderRadius }} className='mb-4 mr-6 pl-4 pt-4 grid p-fluid h-full'>


        <FormField label="Amount" name="total_amount" className="col-12 md:col-6" control={control} errors={errors}
          // required
          leftSpan={4}
          rightSpan={6}
          formItem={{
            component: InputText,
            componentProps: {
              maxLength: 50,
              disabled: true,
              value: tableData.map(d => d.allocated_amount).reduce((total, amt) => total + amt, 0)?.toFixed(2)
            }
          }}
        />

        <FormField label="Payment Mode" name="payment_mode_id" className="col-12 md:col-6" control={control} errors={errors}
          required
          leftSpan={4}
          rightSpan={6}
          useExplicit
          onChange={(e: DropdownChangeEvent) => {
              const selectedOption = modeOfPayments?.find(
                (option) => option.modeofpay === e.value
              );
              setSelectedModeOfPay(selectedOption?.descr?.toLowerCase() || e.value);
            }}
          formItem={{
            component: Dropdown,
            componentProps: {
              options: modeOfPayments,
              optionLabel: 'descr',
              optionValue: 'modeofpay'
            }
          }}
        />

        {
          selectedModeOfPay != "cash" &&
          <FormField label="Account Name" name="account_id" className="col-12 md:col-6" control={control} errors={errors}
            required
            leftSpan={4}
            rightSpan={6}
            formItem={{
              component: Dropdown,
              componentProps: {
                options: banks,
                optionLabel: 'acc_name',
                optionValue: 'key'
              }
            }}
          />
        }

        <FormField label="Transaction Detail" name="transaction_detail" className="col-12 md:col-6" control={control} errors={errors}
          leftSpan={4}
          rightSpan={6}
          formItem={{
            component: InputText,
            componentProps: {
              maxLength: 50
            }
          }}
        />

        <FormField label="Notes" name="notes" className="col-12" control={control} errors={errors}
          leftSpan={2}
          rightSpan={9}
          formItem={{
            component: InputText,
            componentProps: {
              maxLength: 255
            }
          }}
        />

      </div>

      <div key={tableKey} className="col-12 " style={{ height: 'calc(100% - 383px)', minHeight: 200 }}>
        {/* <h3 className={'m-0 my-auto'} >{"Selected Invoices To Be Paid"}</h3> */}
        <ListLayout description="Selected Invoices To Be Paid"
          data={tableData}
          newTable
          showHeader
          hideAddButton
          hideActionColumn
          tableLayoutClass='h-full'
          allowFilters={false}
          gridProps={{
            allowAdd: false,
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
                console.log(tableData)
                setTableData([...tableData])
                setTableKey(Math.random())
              }

            }
          }}>
          <Datacolumn className='disabled' field="invoice_id" header="Invoice No" type="text" />
          <Datacolumn className='disabled' field="invoice_date" header="Invoice Date" type="text" />
          <Datacolumn className='disabled' field="project_name" header="Project Name" type="text" />
          <Datacolumn className='disabled' field="invoice_amount" header="Invoice Amount" type="currency" />
          <Datacolumn className='disabled' field="pending_amount" header="Pending Amount" type="currency" />
          <Datacolumn field="allocated_amount" header="Allocated Amount" type="currency" editorType={"currency"} />
        </ListLayout>
      </div>


    </div>)
  }


  return (
    <>
      <Dialog
        header={`Make Payment`}
        visible={displayModal}
        position={'center'}
        modal
        style={{ width: '70vw' }}
        onHide={() => {
          let element = document.getElementById('discard-btn')
          if (element) {
            element.click()
          } else {
            customDiscard()
          }
        }}
        draggable={false} resizable={false} closable
      >
        <ManageLayout
          baseRoute="/payment/contractorpayment"
          id={id}
          bottomControl
          data={formData}
          hideHeader
          saveBtnLabel='Pay'
          customDiscard={customDiscard}
          isItemsTableChanged={isTableRowChanged}
          ref={manageLayoutRef}
          isUpdating={isAdding || showingToast}
          onSubmit={onSubmit}
          renderForm={renderForm}
        />
      </Dialog>
    </>
  )
}
