import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { UseFormRegister, FieldErrors, FieldValues } from 'react-hook-form';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Dialog } from 'primereact/dialog';
import { ManageLayout, useToast, FormField } from '@igblsln/control';
import { useGetSiteVisitQuery, useUpdateSiteVisitMutation } from './api';
import { AFTER_API_TIME, convertDateValue, defaultDateFormat, getClientProps, useActiveProjectQuery, useGetModeOfPaymentsQuery, useGetNextDocNoQuery, useListBankQuery, formatDate } from '@igblsln/store'
import { useGetSiteVisitStatusQuery } from '../Leads/api';


type Props = {
  displayModal: boolean,
  customDiscard: any,
  id?: any
}

export default function ManageModal({ displayModal, customDiscard, id }: Props) {
  const { showSuccess, showError } = useToast()
  const [showingToast, setShowingToast] = useState(false)

  const isNew = isNaN(id) || id <= 0;

  const [formData, setFormData] = useState<any>({
    lead_name: '',
    email: '',
    enquiry_date: '',
    contact_1: '',
    contact_2: '',
    budget: '',
    budget_range: '',
    source: '',
    property_interest: '',
    leadno:'',
    visit_date:'',
    follow_notes:'',
    agent_name:'',
    lead_key:''
  })

  const formatVisitDate = (dateStr: string) => {
    if (!dateStr) return dateStr;
    let date: Date | null = null;

    // Case 1: yyyy-mm-dd (API / DB format)
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        const [year, month, day] = dateStr.split('-').map(Number);
        date = new Date(year, month - 1, day);
    }
    // Case 2: already a Date-compatible string
    else {
        const parsed = new Date(dateStr);
        if (!isNaN(parsed.getTime())) {
            date = parsed;
        }
    }

    if (!date) {
        return dateStr;
    }

    // Return Date object for Calendar component, not formatted string
    return date;
  };


  const clientProps = getClientProps();

  const { data: statuses } = useGetSiteVisitStatusQuery()

  const { data, isLoading } = useGetSiteVisitQuery(id, {
    skip: isNew
  })

  console.log("api response for the site visite ::", data)
  useEffect(() => {
    let formDataToSet = data || {
      ...clientProps,
    };

    // Use optional chaining and type assertion to handle potential type mismatch
    if ((data as any)?.visit_date) {
      formDataToSet = {
        ...formDataToSet,
        visit_date: formatVisitDate((data as any).visit_date)
      };
    }

    setFormData(formDataToSet);
  }, [data])


  const [updateLead, { isLoading: isUpdating }] = useUpdateSiteVisitMutation()



  const onSubmit = async (values: any) => {
    try {
      let resp: any;

      // Convert date from Calendar component format to DD-[Jan-Dec]-YYYY for API
      const convertDateForAPI = (dateValue: any) => {
        if (!dateValue) return null;

        // If it's already in DD-[Jan-Dec]-YYYY format, return as-is
        if (typeof dateValue === 'string' && /^\d{1,2}-[A-Za-z]{3}-\d{4}$/.test(dateValue)) {
          return dateValue;
        }

        // If it's a Date object from Calendar component
        if (dateValue instanceof Date) {
          return formatDate(dateValue, "dd-MMM-yyyy");
        }

        // Try to parse string date (handles "dd-M-yy" format from Calendar)
        const date = new Date(dateValue);
        if (isNaN(date.getTime())) {
          return null;
        }

        return formatDate(date, "dd-MMM-yyyy");
      };

      let body = {
        ...values,
        visit_date: values.visit_date
          ? convertDateForAPI(values.visit_date)
          : null
      }

      console.log(body)

      resp = await updateLead({ ...body, ...clientProps }).unwrap();

      showSuccess('Success', resp.detail);
      setShowingToast(true);
      setTimeout(() => {
        customDiscard()
      }, AFTER_API_TIME);
    } catch (error: any) {
      console.error('SiteVisit - Error:', error);
      showError('An error occurred', error?.data?.detail || "We couldn't save your post, try again!");
    }
  }


  const renderForm = (control: any, _register: UseFormRegister<FieldValues>, errors: FieldErrors<FieldValues>) => {
    return (
      <div className='pl-4 pt-4 grid p-fluid h-full'>

        <FormField label="Lead No" name="leadno"
        leftSpan={4}
        rightSpan={6}
        required
        className="col-12 md:col-6"
        control={control} errors={errors} formItem={{
          component: InputText,
          componentProps: {
            disabled:true,
            maxLength:25
          },
          
        }}
        />

        <FormField label="Lead Name" name="lead_name"
          leftSpan={4}
          rightSpan={6}
          required
          className="col-12 md:col-6"
          control={control} errors={errors} formItem={{
            component: InputText,
            componentProps: {
              maxLength: 25,
              disabled: true
            }
          }} />

        {/* <FormField label="Agent Name" name="agent_name"
          leftSpan={4}
          rightSpan={6}
          required
          className="col-12 md:col-6"
          control={control} errors={errors} formItem={{
            component: InputText,
            componentProps: {
              maxLength: 25,
              disabled: true
            }
          }} /> */}


        <FormField label="Visit Date" name="visit_date" className="col-10 md:col-6" useExplicit control={control} errors={errors}
          required={"Select a Date"}
          leftSpan={4}
          rightSpan={6}
          formItem={{
            component: Calendar,
            componentProps: {
              style: { width: '100%' },
              className: "p-inputtext-sm",
              showIcon: true,
              dateFormat: "dd-M-yy"
            }
          }} />

        <FormField label="Property Preference" name="project_preferences"
          leftSpan={4}
          rightSpan={6}
          className="col-12 md:col-6"
          control={control} errors={errors} formItem={{
            component: InputText,
            componentProps: {
              disabled: true
            }
          }} />

        <FormField label="Lead Source" name="source"
          leftSpan={4}
          rightSpan={6}
          className="col-12 md:col-6"
          control={control} errors={errors} formItem={{
            component: InputText,
            componentProps: {
              disabled: true
            }
          }} />

        <FormField label="Lead Source Category" name="source_category"
          leftSpan={4}
          rightSpan={6}
          className="col-12 md:col-6"
          control={control} errors={errors} formItem={{
            component: InputText,
            componentProps: {
              disabled: true
            }
          }} />
{/* 
        <FormField label="Budget" name="budget"
          leftSpan={4}
          rightSpan={6}
          required
          className="col-12 md:col-6"
          control={control} errors={errors} formItem={{
            component: InputText,
            componentProps: {
              maxLength: 25
            }
          }} />

        <FormField label="Budget Range" name="budget_range"
          leftSpan={4}
          rightSpan={6}
          required
          className="col-12 md:col-6"
          control={control} errors={errors} formItem={{
            component: InputText,
            componentProps: {
              maxLength: 25
            }
          }} />


        <FormField label="Property Interest" name="property_interest"
          leftSpan={4}
          rightSpan={6}
          required
          className="col-12 md:col-6"
          control={control} errors={errors} formItem={{
            component: InputText,
            componentProps: {
              maxLength: 25
            }
          }} /> */}

        <FormField label="Status" name="status_key" className="col-12 md:col-6" control={control} errors={errors}
          required={"Select a Status"}
          leftSpan={4}
          rightSpan={6}
          useExplicit
          formItem={{
            component: Dropdown,
            componentProps: {
              showClear: true,
              optionLabel: "name",
              optionValue: "key",
              filter: true,
              filterBy: "name",
              options: statuses || []
            }
          }} />


      </div>

    )
  }

  return (
    <>
      <Dialog
        header={isNew ? `Add FollowUp` : 'Update FollowUp'}
        visible={displayModal}
        position={'center'}
        modal
        style={{ width: '70vw' }}
        onHide={() => customDiscard()}
        draggable={false} resizable={false} closable
      >
        <ManageLayout baseRoute="/payment/expenses" id={id} data={formData}
          isUpdating={isUpdating || showingToast}
          bottomControl
          hideHeader
          customDiscard={customDiscard}
          isLoading={isLoading} onSubmit={onSubmit} renderForm={renderForm} />

      </Dialog>
    </>
  )
}
