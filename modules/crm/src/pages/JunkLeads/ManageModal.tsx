import React, { useEffect, useState, useCallback } from 'react'
import { UseFormRegister, FieldErrors, FieldValues, UseFormWatch } from 'react-hook-form'
import { InputText } from 'primereact/inputtext'
import { Dropdown } from 'primereact/dropdown'
import { Dialog } from 'primereact/dialog'
import { ManageLayout, useToast, FormField } from '@igblsln/control'
import { useUpdateJunkLeadMutation } from '../Leads/api'
import { useGetFeedbacksQuery, useGetFeedbackDetailsQuery } from '../FeedbackDetails/api'
import { getClientProps, useActiveProjectQuery, useAppDispatch, setFeedbackNeedsRefresh } from '@igblsln/store'

type Props = {
  displayModal: boolean,
  customDiscard: any,
  id?: any,
  junkLeadData?: any,
  onEditSuccess?: () => void
}

export default function ManageModal({ displayModal, customDiscard, id, junkLeadData, onEditSuccess }: Props) {
  const { showSuccess, showError } = useToast()
  const dispatch = useAppDispatch()
  const [showingToast, setShowingToast] = useState(false)

  const isNew = isNaN(id) || id <= 0

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
    leadno: '',
    visit_date: '',
    follow_notes: '',
    agent_name: '',
    lead_key: '',
    location_pref_keys: [],
    project_pref_keys: []
  })

  const clientProps = getClientProps()
  const { data: projects } = useActiveProjectQuery()
  
  // Feedback queries for dropdown options
  const { data: feedbacks, isFetching: isFeedbacksLoading } = useGetFeedbacksQuery()
  const { data: feedbackDetails, isFetching: isFeedbackDetailsLoading } = useGetFeedbackDetailsQuery()
  
  // State to track selected feedback for filtering feedback details
  const [selectedFeedback, setSelectedFeedback] = useState<any>(null)

  // Reset form data when modal opens with new ID
  useEffect(() => {
    if (displayModal && !junkLeadData) {
      setFormData({
        lead_name: '',
        email: '',
        enquiry_date: '',
        contact_1: '',
        contact_2: '',
        budget: '',
        budget_range: '',
        source: '',
        property_interest: '',
        leadno: '',
        visit_date: '',
        follow_notes: '',
        agent_name: '',
        lead_key: '',
        location_pref_keys: [],
        project_pref_keys: []
      })
    } else if (displayModal && junkLeadData) {
      setFormData({
        ...junkLeadData,
        ...clientProps,
      })
    }
  }, [displayModal, junkLeadData, clientProps])


  const [updateJunkLead, { isLoading: isUpdating }] = useUpdateJunkLeadMutation()

  const onSubmit = async (values: any) => {
    try {
      let resp: any

      // Include all form data in the API call, including project_pref_keys and location_pref_keys
      const body = { ...values, ...clientProps }

      resp = await updateJunkLead(body).unwrap()

      // Update form data with the response data
      setFormData({
        ...resp,
        ...clientProps,
        // Transform location and project preferences to array of keys
        location_pref_keys: resp.location_pref_keys?.map((loc: any) => loc.key || loc) || [],
        project_pref_keys: resp.project_pref_keys?.map((proj: any) => proj.key || proj) || []
      })

      // Trigger feedback refresh
      dispatch(setFeedbackNeedsRefresh(true))
      
      // Note: Parent component will handle refetching the junk leads list
      // since the data is passed down and we don't make API calls here

      showSuccess('Success', resp.detail || 'Lead updated successfully')
      setShowingToast(true)
      setTimeout(() => {
        setShowingToast(false) // Reset showingToast after success
        customDiscard()
        // Trigger refresh callback if provided
        if (onEditSuccess) {
          onEditSuccess()
        }
      }, 1000)
    } catch (error: any) {
      showError('An error occurred', error?.data?.detail || "We couldn't save the lead, try again!")
    }
  }

  // Get the latest feedback from followups for display with descriptive text
  const getLatestFeedback = () => {
    if (!formData?.followup || !Array.isArray(formData.followup) || formData.followup.length === 0) {
      return '';
    }
    // Sort followups by createddttm to get the latest one
    const sortedFollowups = [...formData.followup].sort((a, b) => 
      new Date(b.createddttm).getTime() - new Date(a.createddttm).getTime()
    );
    const latestFollowup = sortedFollowups[0];
    const feedbackKey = latestFollowup?.feedback_key || '';
    
    // Return the feedback description if it's an object with descr property
    if (typeof feedbackKey === 'object' && feedbackKey?.descr) {
      return feedbackKey.descr;
    }
    
    return feedbackKey || '';
  }

  // Get source category from followups or visits
  const getSourceCategory = () => {
    if (formData?.followup && Array.isArray(formData.followup) && formData.followup.length > 0) {
      return formData.followup[0]?.source_category || '';
    }
    if (formData?.visit && Array.isArray(formData.visit) && formData.visit.length > 0) {
      return formData.visit[0]?.source_category || '';
    }
    return '';
  }

  const renderForm = useCallback((control: any, _register: UseFormRegister<FieldValues>, errors: FieldErrors<FieldValues>, watch: UseFormWatch<FieldValues>, setValue?: any) => {
    // Get the currently selected feedback value
    const selectedFeedbackKey = watch('feedback_key');
    
    // Filter feedback details based on selected feedback (handle loading state)
    const filteredFeedbackDetails = selectedFeedbackKey && feedbackDetails 
      ? feedbackDetails.filter((detail: any) => detail.feedback_id === selectedFeedbackKey)
      : (feedbackDetails || []);

    return (
      <div className='pl-4 pt-4 grid p-fluid h-full'>
        <FormField label="Lead Name" name="lead_name"
          leftSpan={4}
          rightSpan={6}
          required
          className="col-12 md:col-6"
          control={control} errors={errors} formItem={{
            component: InputText,
            componentProps: {
              maxLength: 25,
              value: formData?.lead_name || '',
              disabled: true
            }
          }} />

        <FormField label="Contact 1" name="contact_1"
          leftSpan={4}
          rightSpan={6}
          className="col-12 md:col-6"
          control={control} errors={errors} formItem={{
            component: InputText,
            componentProps: {
              value: formData?.contact_1 || '',
              disabled: true
            }
          }} />

        <FormField label="Budget" name="budget"
          leftSpan={4}
          rightSpan={6}
          className="col-12 md:col-6"
          control={control} errors={errors} formItem={{
            component: InputText,
            componentProps: {
              value: formData?.budget ? `₹${Number(formData.budget).toLocaleString('en-IN')}` : '',
              disabled: true
            }
          }} />

        <FormField label="Property Preference" name="project_pref"
          leftSpan={4}
          rightSpan={6}
          className="col-12 md:col-6"
          control={control} errors={errors} formItem={{
            component: InputText,
            componentProps: {
              value: formData?.project_pref?.map((p: any) => p.descr).join(', ') || '',
              disabled: true
            }
          }} />

        <FormField label="Lead Source Category" name="lead_src_ctgry"
          leftSpan={4}
          rightSpan={6}
          className="col-12 md:col-6"
          control={control} errors={errors} formItem={{
            component: InputText,
            componentProps: {
              value: typeof formData?.lead_src_ctgry === 'object' && formData.lead_src_ctgry?.descr 
                ? formData.lead_src_ctgry.descr 
                : formData?.lead_src_ctgry || '',
              disabled: true
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
              options: feedbacks || [],
              value: formData?.feedback_key || (typeof formData?.feedback === 'object' && formData.feedback?.key) || formData?.feedback || '',
              loading: isFeedbacksLoading, // Show loading state when feedbacks are being fetched
              onChange: (e: any) => {
                // Update the form data immediately when feedback is changed
                setFormData((prev: any) => ({
                  ...prev,
                  feedback_key: e.value,
                  feedback: e.value
                }));
              }
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
              disabled: !selectedFeedbackKey || isFeedbackDetailsLoading, // Disable if no feedback selected or feedback details are loading
              value: formData?.followup_details_key || (typeof formData?.followup_details === 'object' && formData.followup_details?.key) || formData?.followup_details || '',
              loading: isFeedbackDetailsLoading, // Show loading state when feedback details are being fetched
              onChange: (e: any) => {
                // Update the form data immediately when feedback details is changed
                setFormData((prev: any) => ({
                  ...prev,
                  followup_details_key: e.value,
                  followup_details: e.value
                }));
              }
            }
          }} />

        <FormField label="Status" name="status_name"
          leftSpan={4}
          rightSpan={6}
          className="col-12 md:col-6"
          control={control} errors={errors} formItem={{
            component: InputText,
            componentProps: {
              value: formData?.status_name || '',
              disabled: true
            }
          }} />

      </div>
    )
  }, [projects, formData, feedbacks, feedbackDetails])

  return (
    <>
      <Dialog
        header={isNew ? `Add Lead` : 'View Junk Lead Details'}
        visible={displayModal}
        position={'center'}
        modal
        style={{ width: '70vw' }}
        onHide={() => customDiscard()}
        draggable={false} resizable={false} closable
      >
        <ManageLayout 
          baseRoute="/crm/leads" 
          id={id} 
          data={formData}
          isUpdating={isUpdating}
          bottomControl
          hideHeader
          customDiscard={customDiscard}
          onSubmit={onSubmit} 
          renderForm={renderForm} />
      </Dialog>
    </>
  )
}