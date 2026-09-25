import React, { Component, useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { UseFormRegister, FieldErrors, FieldValues, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Dialog } from 'primereact/dialog';
import { Calendar } from 'primereact/calendar';
import { ManageLayout, useToast, FormField } from '@igblsln/control';
import { useGetFollowUpQuery, useGetFollowUpStatusQuery, useUpdateFollowUpDataMutation } from './api';
import { useGetFeedbacksQuery, useGetFeedbackDetailsQuery } from '../FeedbackDetails/api';
import { AFTER_API_TIME, convertDateValue, defaultDateFormat, getClientProps, useActiveProjectQuery, useGetModeOfPaymentsQuery, useGetNextDocNoQuery, useListBankQuery, formatDate } from '@igblsln/store'


type Props = {
  displayModal: boolean,
  customDiscard: any,
  id?: any,
  initialData?: any
}

export default function ManageModal({ displayModal, customDiscard, id, initialData }: Props) {
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
    follow_notes:'',
    days_since_enquiry:'',
    lead_key:'',
    last_followup_date: ''
  })

  const formatFollowUpDate = (dateStr: string) => {
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

  const { data: statuses } = useGetFollowUpStatusQuery()
  const { data: feedbacks } = useGetFeedbacksQuery()
  const { data: feedbackDetails } = useGetFeedbackDetailsQuery()

  // State to track selected feedback for filtering feedback details
  const [selectedFeedback, setSelectedFeedback] = useState<any>(null)

  const { data, isLoading } = useGetFollowUpQuery(id, {
    skip: isNew || !!initialData
  })

  useEffect(() => {
    let formDataToSet;
    if (initialData) {
      formDataToSet = {
        ...initialData,
        lead_name: initialData.lead_name || '',
        contact_1: initialData.contact_1 || '',
        status_key: initialData.status_key || '',
        follow_notes: initialData.follow_notes || '',
        leadno: initialData.leadno || '',
        feedback_key: initialData.feedback_key?.key || initialData.feedback_key || null,
        followup_details_key: initialData.followup_details_key?.key || initialData.followup_details_key || null,
        last_followup_date: initialData.last_followup_date ? formatFollowUpDate(initialData.last_followup_date) : ''
      };
        // Set selected feedback for filtering - extract the key from the object
        const feedbackKey = typeof initialData.feedback_key === 'object' && initialData.feedback_key?.key 
          ? initialData.feedback_key.key 
          : initialData.feedback_key || null;
        setSelectedFeedback(feedbackKey)
    } else {
      formDataToSet = data || {
        ...clientProps,
      };
        // Set selected feedback for filtering - extract the key from the object
        const feedbackKey = typeof data?.feedback_key === 'object' && data?.feedback_key?.key 
          ? data.feedback_key.key 
          : data?.feedback_key || null;
        setSelectedFeedback(feedbackKey)
    }
    setFormData(formDataToSet);
  }, [data, initialData])


  const [updateLead, { isLoading: isUpdating }] = useUpdateFollowUpDataMutation()



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
        last_followup_date: values.last_followup_date
          ? convertDateForAPI(values.last_followup_date)
          : null
      }

      console.log('ManageModal - Submit body:', body);
      console.log('ManageModal - clientProps:', clientProps);

      resp = await updateLead({ ...body, ...clientProps }).unwrap();

      showSuccess('Success', resp.detail);
      setShowingToast(true);
      setTimeout(() => {
        customDiscard()
      }, AFTER_API_TIME);
    } catch (error: any) {
      console.error('ManageModal - Error:', error);
      showError('An error occurred', error?.data?.detail || "We couldn't save your post, try again!");
    }
  }


  const renderForm = useCallback((control: any, _register: UseFormRegister<FieldValues>, errors: FieldErrors<FieldValues>, watch: UseFormWatch<FieldValues>) => {
    // Get the currently selected feedback value
    const selectedFeedbackKey = watch('feedback_key');
    
    // Filter feedback details based on selected feedback
    const filteredFeedbackDetails = selectedFeedbackKey && feedbackDetails 
      ? feedbackDetails.filter((detail: any) => detail.feedback_id === selectedFeedbackKey)
      : (feedbackDetails || []);

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
            }
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

        {/* <FormField label="Status" name="status_key" className="col-12 md:col-6" control={control} errors={errors}
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
          }} /> */}

        <FormField label="Follow Up Date" name="last_followup_date"
          leftSpan={4}
          rightSpan={6}
          className="col-12 md:col-6"
          control={control} errors={errors}
          useExplicit
          formItem={{
            component: Calendar,
            componentProps: {
              style: { width: '100%' },
              className: "p-inputtext-sm",
              showIcon: true,
              dateFormat: "dd-M-yy"
            }
          }} />  

        <FormField label="Contact" name="contact_1"
          leftSpan={4}
          rightSpan={6}
          className="col-12 md:col-6"
          control={control} errors={errors} formItem={{
            component: InputText,
            componentProps: {
              maxLength: 25
            }
          }} />

        <FormField label="Feedback" name="feedback_key" className="col-12 md:col-6" control={control} errors={errors}
          leftSpan={4}
          rightSpan={6}
          useExplicit
          formItem={{
            component: Dropdown,
            componentProps: {
              showClear: true,
              optionLabel: "descr",
              optionValue: "key",
              filter: true,
              filterBy: "descr",
              options: feedbacks || []
            }
          }} />

        <FormField label="Feedback Details" name="followup_details_key" className="col-12 md:col-6" control={control} errors={errors}
          leftSpan={4}
          rightSpan={6}
          useExplicit
          formItem={{
            component: Dropdown,
            componentProps: {
              showClear: true,
              optionLabel: "descr",
              optionValue: "key",
              filter: true,
              filterBy: "descr",
              options: filteredFeedbackDetails,
              disabled: !selectedFeedbackKey
            }
          }} />

        <FormField label="Follow Up Notes" name="follow_notes"
          leftSpan={2}
          rightSpan={9}
          // required
          className="col-12 pl-0"
          control={control} errors={errors} formItem={{
            component: InputText,
            componentProps: {
              maxLength: 500,
              rows: 8
            }
          }} />
      </div>
    );
  }, []);

  return (
    <>
      <Dialog
        header={isNew ? `Add FollowUp` : 'Update FollowUp'}
        visible={displayModal}
        position={'center'}
        modal
        style={{ width: '70vw' }}
        onHide={() => {
          let element =  document.getElementById('discard-btn')
          if(element) {
            element.click()
          } else {
            customDiscard()
          }
        }}
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
