import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { UseFormRegister, FieldErrors, FieldValues, UseFormGetValues } from 'react-hook-form';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Dialog } from 'primereact/dialog';
import { ManageLayout, useToast, FormField } from '@igblsln/control';
import { useGetExpenseQuery, useAddExpenseMutation, useUpdateExpenseMutation } from '../apis';
import { AFTER_API_TIME, convertDateValue, defaultDateFormat, getClientProps, inputNumberProps, setPromptNavigate, useActiveProjectQuery, useAppDispatch, useGetModeOfPaymentsQuery, useListBankQuery } from '@igblsln/store'
import { useListExpenseTypeQuery } from '../../ExpenseType/api';
import { useGetExpenseVendorsQuery } from '../../ExpenseVendor/api';

type Props = {
  displayModal: boolean,
  customDiscard: any,
  id?: any
}

interface DropdownChangeEvent {
  value: string;
  originalEvent: Event;
}

export default function ManageModal({ displayModal, customDiscard, id }: Props) {
  const { showSuccess, showError } = useToast()
  const [showingToast, setShowingToast] = useState(false)
  const [formData, setFormData] = useState<any>({})
  const isNew = isNaN(id) || id <= 0;
  const { data: modeOfPayments } = useGetModeOfPaymentsQuery({})
  const { data: banks } = useListBankQuery()
  const [selectedModeOfPay, setSelectedModeOfPay] = useState<any>(null)
  const { data: expenseTypes } = useListExpenseTypeQuery({ page: 1, size: 1000 })
  const dispatch = useAppDispatch()
  const navigate = useNavigate();



  const clientProps = getClientProps();
  const { data: projects } = useActiveProjectQuery()
  const { data: expenseVendors } = useGetExpenseVendorsQuery()

  const { data, isLoading } = useGetExpenseQuery(id, {
    skip: isNew
  })

  useEffect(() => {
    setFormData(data || {
      ...clientProps,
      date: handleConvertDateValue(new Date(), true),
    })
    if(data){
      setSelectedModeOfPay(data?.payment_mode_descr?.toLowerCase())
    }

  }, [data])


  const [updateExpense, { isLoading: isUpdating }] = useUpdateExpenseMutation()
  const [addExpense, { isLoading: isAdding }] = useAddExpenseMutation()

  const handleConvertDateValue = (value: any, reverse?: boolean): Date | string | null => {
      try {
          if (!value) return null;

          if (reverse) {
              let dateObj: Date | null = null;

              // If it's already a Date object
              if (value instanceof Date) {
                  dateObj = value;
              }
              // If it's a string, try to parse both formats
              else if (typeof value === 'string') {
                  let dateParts;
                  
                  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
                      dateParts = value.split('-').map(Number);
                      dateObj = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
                  } 
                  else if (/^\d{2}-\d{2}-\d{4}$/.test(value)) {
                      dateParts = value.split('-').map(Number);
                      dateObj = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
                  }
              }

              // If we successfully got date object, format it as yyyy-MM-dd
              if (dateObj instanceof Date) {
                  const yyyy = dateObj.getFullYear();
                  const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
                  const dd = String(dateObj.getDate()).padStart(2, '0');
                  return `${yyyy}-${mm}-${dd}`;
              }

              return value;
          }

          // NORMAL conversion (for setting initial data to Calendar)
          if (value instanceof Date) {
              return value;
          }

          if (typeof value === 'string') {
              let dateParts;

              if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
                  dateParts = value.split('-').map(Number);
                  return new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
              }

              if (/^\d{2}-\d{2}-\d{4}$/.test(value)) {
                  dateParts = value.split('-').map(Number);
                  return new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
              }
          }

          return null;
      } catch (error) {
          console.error("Date parsing error:", error);
          return null;
      }
  };

  const onSubmit = async (values: any) => {
    try {
      let resp: any;
      let body = {
        ...values,
         date: handleConvertDateValue(values.date, true)
      }
      console.log(body)
      if (isNew) {
        resp = await addExpense({ ...body, ...clientProps }).unwrap();
      } else {
        resp = await updateExpense({ ...body, ...clientProps }).unwrap();
      }
      showSuccess('Success', resp.detail);
      dispatch(setPromptNavigate({promptNavigate:false}))
      setShowingToast(true);
      setTimeout(() => {
        customDiscard()
      }, AFTER_API_TIME);
    } catch (error: any) {
      showError('An error occurred', error?.data?.detail || "We couldn't save your post, try again!");
    }
  }

  dispatch(setPromptNavigate({promptNavigate:false}))

  const expenseVendorOptions = [
    {
      label: 'Add',
      items: expenseVendors || []
    }
  ]

  const renderForm = (control: any, _register: UseFormRegister<FieldValues>, errors: FieldErrors<FieldValues>, getValues: UseFormGetValues<any>) => {
    return (
      <div className='pl-4 pt-4 grid p-fluid h-full'>


        <FormField label="Project" name="project_key"
          className="col-12 md:col-6" control={control} errors={errors}
          required
          leftSpan={4}
          rightSpan={6}
          formItem={{
            component: Dropdown,
            componentProps: {
              options: projects,
              optionLabel: 'name',
              optionValue: 'key',
              filter: true,
              filterBy: 'name'
            }
          }}
        />

        <FormField label="Date" name="date"
          className="col-12 md:col-6"
          useExplicit control={control} errors={errors}
          convertValue={handleConvertDateValue}
          required={"Select a Date"}
          leftSpan={4}
          rightSpan={6}
          formItem={{
            component: Calendar,
            componentProps: {
              showIcon: true,
              dateFormat: defaultDateFormat
            }
          }} />

        <FormField label="Amount" name="amount"
          leftSpan={4}
          rightSpan={6}
          className="col-12 md:col-6"
          required
          control={control} errors={errors} formItem={{
            component: InputNumber,
            componentProps: {
              ...inputNumberProps
            }
          }} />

        <FormField
          label="Expense Type"
          name="expense_type"
          className="col-12 md:col-6"
          control={control}
          errors={errors}
          required
          leftSpan={4}
          rightSpan={6}
          formItem={{
            component: Dropdown,
            componentProps: {
              options: expenseTypes?.results,
              optionLabel: 'descr',
              optionValue: 'key',
              filter: true,
              filterBy: 'descr'
            }
          }} />

          <FormField
            label="Payment Mode"
            name="payment_mode"
            className="col-12 md:col-6"
            control={control}
            errors={errors}
            required
            leftSpan={4}
            rightSpan={6}
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
                optionValue: 'modeofpay',
              },
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
        
         <FormField
            label="Expense Vendor"
            name="exp_vendor_id"
            className="col-12 md:col-6"
            control={control}
            errors={errors}
            // required
            leftSpan={4}
            rightSpan={6}
            formItem={{
              component: Dropdown,
              componentProps: {
                showClear: true,
                optionGroupTemplate:
                  <div
                    style={{ cursor: 'pointer', textAlign: 'center', backgroundColor: '#e6e1e1', color: 'black', lineHeight: 2.5 }}
                    onClick={() => navigate('/payment/expensevendor', {
                      state: {
                        url: isNew ? "/payment/expenses" : `/payment/expenses/${data?.key}/edit`,
                        data: getValues()
                      }
                    })
                    }
                  >
                    -- Create And Edit --
                  </div>
                ,
                optionLabel: "name",
                optionValue: "key",
                filter: true,
                filterBy: "name",
                optionGroupLabel: "label",
                optionGroupChildren: "items",
                options: expenseVendorOptions
              }
            }} />

        {/* <FormField
          label="Notes"
          name="desc"
          control={control}
          errors={errors}
          className="col-12 md:col-6"
          leftSpan={4}
          rightSpan={6}
          formItem={{
            component: InputText,
            componentProps: {
              maxLength: 100
            }
          }} /> */}

        <FormField
          label="Payment Description"
          name="payment_desc"
          className="col-12 pl-0"
          control={control}
          errors={errors}
          // required
          leftSpan={2}
          rightSpan={9}
          formItem={{
            component: InputTextarea,
            componentProps: {
              maxLength: 255,
              rows: 3,
            }
          }} />

      </div>

    )
  }

  return (
    <>
      <Dialog
        header={id? "Edit Expense" : `Add Expense`}
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
        <ManageLayout baseRoute="/payment/expenses" id={id} data={formData}
          isUpdating={isAdding || isUpdating || showingToast}
          bottomControl
          hideHeader
          customDiscard={customDiscard}
          isLoading={isLoading} onSubmit={onSubmit} renderForm={renderForm} />

      </Dialog>
    </>
  )
}
