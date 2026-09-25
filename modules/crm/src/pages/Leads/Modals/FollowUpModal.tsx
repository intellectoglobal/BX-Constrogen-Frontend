import React, { useEffect, useState } from 'react'
import { UseFormRegister, FieldErrors, FieldValues } from 'react-hook-form';
import { TabView, TabPanel } from 'primereact/tabview';
import { Dialog } from 'primereact/dialog';
import { ManageLayout, useToast } from '@igblsln/control';
import { useGetLeadQuery, useAddLeadMutation, useUpdateLeadMutation, useGetLeadStatusQuery, useAddFollowUpMutation, useUpdateFollowUpMutation } from '../api';
import { useGetLeadSourcesQuery } from '../../LeadSource/leadSourceApi';
import { useGetLeadsourceCategoriesQuery } from '../../LeadSourceCategory/leadSourceCategoryApi';
import { useActiveProjectQuery } from '@igblsln/store';
import { AFTER_API_TIME, getClientProps, setPromptNavigate, updateDateFormate, useAppDispatch } from '@igblsln/store'
import ManageFollowUpTable from './ManageFollowUpTable';
import ManageSiteVisitTable from './ManageSiteVisitTable';
import { formatDate } from  "@igblsln/store"
import { useAppSelector } from "@igblsln/store"
import { selectFeedbackNeedsRefresh } from "@igblsln/store"



type Props = {
  displayModal: boolean,
  customDiscard: any,
  id?: any
}

export default function FollowUpModal({ displayModal, customDiscard, id }: Props) {
  const { showSuccess, showError } = useToast()
  const dispatch = useAppDispatch();
  const [showingToast, setShowingToast] = useState(false)
  const [tableChanged, setTableChanged] = useState(false);
  const [followUpData, setFollowUpData] = useState<any[]>([])
  const [siteVisitData, setSiteVisitData] = useState<any[]>([])
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const needsRefresh = useAppSelector(selectFeedbackNeedsRefresh);

  // Only force re-render when returning from FeedbackDetails (needsRefresh changes)
  // Don't re-render on normal data changes to preserve active tab
  const tabKey = needsRefresh ? `refresh-${Date.now()}` : `normal-${activeTabIndex}`;

  const isNew = isNaN(id) || id <= 0;

  const clientProps = getClientProps();

  // Add console logging for debugging
  console.log("FollowUpModal - Props:", { displayModal, id, isNew });
  console.log("FollowUpModal - needsRefresh:", needsRefresh);
  console.log("FollowUpModal - tabKey:", tabKey);

  const { data, isLoading, refetch } = useGetLeadQuery(id, {
    skip: isNew
  })

  // Fetch required data for ManageSiteVisitTable
  const { data: leadSources } = useGetLeadSourcesQuery()
  const { data: leadSourceCategories } = useGetLeadsourceCategoriesQuery()
  const { data: projects } = useActiveProjectQuery()

  // Add debugging and force refresh when needed
  useEffect(() => {
    console.log("FollowUpModal - needsRefresh changed:", needsRefresh);
    if (needsRefresh && !isNew && id) {
      console.log("Force refreshing lead data...");
      refetch();
    }
  }, [needsRefresh, isNew, id, refetch]);



  const [updateLead, { isLoading: isUpdating }] = useUpdateFollowUpMutation()
  const [addLead, { isLoading: isAdding }] = useAddFollowUpMutation()

  useEffect(()=>{
    const loadData = async () => {
      if(data){
        setFollowUpData(await updateDateFormate(data?.followup || [], "last_followup_date"))
        setSiteVisitData(await updateDateFormate(data?.visit || [], "visit_date"))
      }
    }
    loadData()
  },[data])

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

    if (!date) return dateStr;

    console.log("Formatted Date:", formatDate(date, "dd-MMM-yyyy"));

    // ✅ Final backend-expected format
    return formatDate(date, "dd-MMM-yyyy");
};

  const onSubmit = async (values: any) => {
  try {
    let resp: any;

    const formattedVisit = siteVisitData.map((v: any) => ({
      ...v,
      visit_date: formatFollowUpDate(v.visit_date)
    }));

    const formattedFollowUp = followUpData.map((f: any) => ({
      ...f,
      last_followup_date: formatFollowUpDate(f.last_followup_date)
    }));

    const body = {
      ...data,
      visit: formattedVisit,
      followup: formattedFollowUp
    };

    console.log("Formatted body", body);

    if (isNew) {
      resp = await addLead({ ...body, ...clientProps }).unwrap();
    } else {
      resp = await updateLead({ ...body, ...clientProps }).unwrap();
    }

    showSuccess('Success', resp.detail);
    setShowingToast(true);
    dispatch(setPromptNavigate({ promptNavigate: false }));

    setTimeout(() => {
      customDiscard();
    }, AFTER_API_TIME);

  } catch (error: any) {
    showError(
      'An error occurred',
      error?.data?.detail || "We couldn't save your post, try again!"
    );
  }
};


  const renderForm = (control: any, _register: UseFormRegister<FieldValues>, errors: FieldErrors<FieldValues>, getValues?: any) => {
    // Get current form values to pass as leadFormData
    const currentFormValues = getValues ? getValues() : data || {};

    const normalizeProjectKeys = (projectPrefs: any[] = []) => {
      return projectPrefs
        .map((pref: any) => {
          if (typeof pref === 'object' && pref !== null) {
            if (pref.key !== undefined) return pref.key;
            if (pref.project_pref_key && typeof pref.project_pref_key === 'object') return pref.project_pref_key.key;
            if (pref.project_pref_key !== undefined) return pref.project_pref_key;
          }
          return pref;
        })
        .filter((key: any) => key !== undefined && key !== null);
    };
    
    // Prepare leadFormData structure for ManageSiteVisitTable
    const leadFormData = {
      lead_src_ctgry_key: currentFormValues.lead_src_ctgry_key || data?.lead_src_ctgry_key,
      lead_src_key: currentFormValues.lead_src_key || data?.lead_src_key,
      project_pref_keys: (() => {
        const currentKeys = normalizeProjectKeys(currentFormValues.project_pref_keys || []);
        if (currentKeys.length > 0) return currentKeys;
        return normalizeProjectKeys(data?.project_pref_keys || []);
      })(),
      leadSourceCategories: leadSourceCategories || [],
      leadSources: leadSources || [],
      projects: projects || []
    };

    return (
      <div className='pl-4 pt-4 grid p-fluid h-full'>
        {/* Display data in single line */}
        <div className="col-12 flex flex-column md:flex-row gap-2"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '1rem',
            marginBottom: '1rem',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            padding: '0 1rem',
            backgroundColor: '#f9f9f9',
            height: 50
          }}
        >
          <span style={{ fontWeight: 'bold' }} className="flex flex-column md:flex-row gap-2">
            {data?.lead_no}
          </span>
          <span style={{ fontWeight: 'bold' }} className="flex flex-column md:flex-row gap-2">
            {data?.lead_name}
          </span>
          <span style={{ fontWeight: 'bold' }} className="flex flex-column md:flex-row gap-2">
            {data?.email}
          </span>
          <span style={{ fontWeight: 'bold' }} className="flex flex-column md:flex-row gap-2">
            {data?.enquiry_date}
          </span>
          <span style={{ fontWeight: 'bold' }} className="flex flex-column md:flex-row gap-2">
            {data?.contact_1}
          </span>
          <span style={{ fontWeight: 'bold' }} className="flex flex-column md:flex-row gap-2">
            {data?.budget}
          </span>
          <span style={{ fontWeight: 'bold' }} className="flex flex-column md:flex-row gap-2">
            {data?.status_name}
          </span>
        </div>

        <TabView
          className='custom-tabview'
        >
          <TabPanel header="Follow Up">
            <ManageFollowUpTable
              data={followUpData}
              isLoading={isLoading}
              onTableChange={(value: boolean) => !tableChanged && setTableChanged(value)}
              onChange={(value: any[]) => setFollowUpData(value)}
              leadKey={Number(id)}
            />
          </TabPanel>
          <TabPanel header="Site Visits">
            <ManageSiteVisitTable
              data={siteVisitData}
              isLoading={isLoading}
              onTableChange={(value: boolean) => !tableChanged && setTableChanged(value)}
              onChange={(value: any[]) => setSiteVisitData(value)}
              leadId={Number(id)}
              leadFormData={leadFormData}
            />
          </TabPanel>

        </TabView>

      </div>

    )
  }

  return (
    <>
      <Dialog
        header={'Follow Up/Site Visit'}
        visible={displayModal}
        position={'center'}
        modal
        style={{ width: '70vw' }}
        onHide={() => {
          let element = document.getElementById('discard-btn')
          if(element) {
            element.click()
          } else {
            customDiscard()
          }
        }}
        draggable={false} resizable={false}
      >
        <ManageLayout baseRoute="" id={id} data={{}}
          isUpdating={isAdding || isUpdating || showingToast}
          bottomControl
          hideHeader
          customDiscard={customDiscard}
          isItemsTableChanged={tableChanged}
          isLoading={isLoading} onSubmit={onSubmit} renderForm={renderForm} />

      </Dialog>
    </>
  )
}
