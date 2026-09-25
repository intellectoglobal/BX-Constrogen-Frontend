import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ListLayout, Datacolumn, useToast } from '@igblsln/control';
import { PAGE_SIZE, formatDate } from '@igblsln/store';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { useDeleteLeadMutation, useListLeadQuery, useGetJunkLeadsQuery } from '../../Leads/api';
import { useGetFeedbacksQuery } from '../../FeedbackDetails/api';
import { MODULE_NAME } from '../../../constants';
import { PAGE_NAME, PAGE_ROUTE } from '../constants';
import ManageModal from '../ManageModal';
import FollowUpModal from '../../Leads/Modals/FollowUpModal';

type Props = {}

const Main = (props: Props) => {
  const location = useLocation();
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(PAGE_SIZE)
  const [showModal, setShowModal] = useState<boolean>(false)
  const [showFollowUpModal, setShowFollowUpModal] = useState<boolean>(false)
  const [selectedData, setSelectedData] = useState<any>(null)
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null)
  const [selectedFeedbackType, setSelectedFeedbackType] = useState(null)
  const [leadNameInput, setLeadNameInput] = useState('')
  const [leadNameSearch, setLeadNameSearch] = useState('')
  const [contactInput, setContactInput] = useState('')
  const [contactSearch, setContactSearch] = useState('')
  const [needsRefresh, setNeedsRefresh] = useState<boolean>(false)
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0)
  const { showError } = useToast()
  const navigate = useNavigate()

  const { data: feedbacks, isLoading: isFeedbacksLoading, error: feedbacksError } = useGetFeedbacksQuery()
  
  const feedbackRef = useRef<any[]>([]);

  useEffect(() => {
    feedbackRef.current = feedbacks || [];
  }, [feedbacks])

  const { data, isFetching: isLoading, error, refetch } = useGetJunkLeadsQuery({
    page: page,
    size: size,
    lead_name: leadNameSearch?.trim() || undefined,
    contact_1: contactSearch?.trim() || undefined
  })

  useEffect(() => {
    setPage(1);
  }, [leadNameSearch, contactSearch])

  const applyLeadNameSearch = () => {
    const trimmed = leadNameInput.trim();
    setLeadNameSearch(trimmed);
  }

  const clearLeadNameSearch = () => {
    setLeadNameInput('');
    setLeadNameSearch('');
  }

  const applyContactSearch = () => {
    const trimmed = contactInput.trim();
    setContactSearch(trimmed);
  }

  const clearContactSearch = () => {
    setContactInput('');
    setContactSearch('');
  }


  // Handle API errors
  React.useEffect(() => {
    if (error) {
      showError('Error', 'Failed to load junk leads. Please try again later.');
    }
  }, [error, showError])

  // Refresh data when modal is closed and refresh is needed
  React.useEffect(() => {
    if (!showModal && needsRefresh) {
      // Force refetch with cache invalidation and trigger re-render
      refetch();
      setNeedsRefresh(false);
      setRefreshTrigger(prev => prev + 1);
    }
  }, [showModal, needsRefresh, refetch])

  // Filter data based on selected feedback type
  const filteredData = React.useMemo(() => {
    if (!data?.results) return data;

    // Get feedback types for Irrelevant call and Un Answered calls
    const junkLeadFeedbacks = feedbacks?.filter(fb => 
      fb.descr?.toLowerCase().includes('irrelevant call') || 
      fb.descr?.toLowerCase().includes('un answered calls')
    ) || [];

    // Apply dropdown filter if a specific feedback type is selected
    const activeFeedbackKeys = selectedFeedbackType 
      ? [selectedFeedbackType]
      : junkLeadFeedbacks.map(fb => fb.key);

    // Filter junk lead records based on feedback keys
    // Handle both object and ID formats for feedback
    const filteredResults = data.results.filter((junkLead: any) => {
      const feedbackData = junkLead.feedback;
      if (!feedbackData) return false;

      // If feedback is an object with key property (API response format)
      if (typeof feedbackData === 'object' && feedbackData.key) {
        return activeFeedbackKeys.includes(feedbackData.key);
      }
      
      // If feedback is an ID directly
      return activeFeedbackKeys.includes(feedbackData);
    });

    return {
      ...data,
      results: filteredResults,
      count: data.count
    };
  }, [data, feedbacks, selectedFeedbackType, refreshTrigger])

  const [deleteDataAction] = useDeleteLeadMutation()
  const deleteAction = (id: number) => deleteDataAction(id).unwrap();

  // Check if main data is loaded
  const isDataReady = Boolean(data?.results);

  useEffect(() => {
    if (location.state?.fromFeedbackDetails === true) {
      if (location.state?.leadKey) {
        const resolvedLeadKey = Number(location.state.leadKey);
        if (!Number.isNaN(resolvedLeadKey) && resolvedLeadKey > 0) {
          setSelectedLeadId(resolvedLeadKey);
          setShowFollowUpModal(true);
          navigate(location.pathname, { replace: true, state: null });
          return;
        }
      }

      const firstRow = data?.results?.[0];
      const fallbackLeadKey = Number(
        firstRow?.lead_key ?? firstRow?.lead?.key ?? firstRow?.leadKey ?? firstRow?.key
      );

      if (!Number.isNaN(fallbackLeadKey) && fallbackLeadKey > 0) {
        setSelectedLeadId(fallbackLeadKey);
        setShowFollowUpModal(true);
        navigate(location.pathname, { replace: true, state: null });
      }
    }
  }, [location.state, location.pathname, navigate, data]);


  // Format contact number with +91 prefix
  const formatContact = (contact: string) => {
    if (!contact) return '';
    if (contact.startsWith('+91')) {
      const digits = contact.slice(3);
      const formatted = digits.replace(/(.{5})/g, '$1 ').trim();
      return '+91 ' + formatted;
    }
    return contact;
  }

  // Handle different response formats from backend
  const responseData = Array.isArray(data) ? data : (data?.results || []);
  const totalCount = Array.isArray(data) ? data.length : (data?.count || 0);

  return (
    <>
      <Divider />
      <div className="flex" style={{ width: '100%' }}>
        <div className="field col-4">
          <label className={'col-4'}>Feedback Type</label>
          <Dropdown
            style={{ width: '60%' }}
            optionLabel={"descr"}
            optionValue={"key"}
            value={selectedFeedbackType}
            filterBy={"descr"}
            showClear
            onChange={(e) => {
              setSelectedFeedbackType(e.value)
            }}
            options={feedbacks?.filter(fb => 
              fb.descr?.toLowerCase().includes('irrelevant call') || 
              fb.descr?.toLowerCase().includes('un answered calls')
            )}
            placeholder="All Junk Leads"
          />
        </div>
        <div className="field col-4">
          <label className={'col-4'}>Lead Name</label>
          <span className="p-input-icon-right" style={{ width: '60%' }}>
            <InputText
              style={{ width: '100%' }}
              value={leadNameInput}
              onChange={(e) => {
                const value = e.target.value;
                setLeadNameInput(value);
                if (!value.trim()) {
                  setLeadNameSearch('');
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  applyLeadNameSearch();
                }
              }}
              placeholder="Search by lead name"
            />
            {!!leadNameInput && (
              <i
                className="pi pi-times cursor-pointer"
                onClick={clearLeadNameSearch}
              />
            )}
          </span>
        </div>
        <div className="field col-4">
          <label className={'col-4'}>Contact</label>
          <span className="p-input-icon-right" style={{ width: '60%' }}>
            <InputText
              style={{ width: '100%' }}
              value={contactInput}
              onChange={(e) => {
                const value = e.target.value;
                setContactInput(value);
                if (!value.trim()) {
                  setContactSearch('');
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  applyContactSearch();
                }
              }}
              placeholder="Search by contact"
            />
            {!!contactInput && (
              <i
                className="pi pi-times cursor-pointer"
                onClick={clearContactSearch}
              />
            )}
          </span>
        </div>
      </div>
      <ListLayout
        pagination={{
          pageSize: size,
          loading: isLoading || !isDataReady,
          currentPage: page,
          total: filteredData?.count,
          onChange: (page, size) => {
            setPage(page);
            setSize(size)
          }
        }}
        baseRoute={`/${MODULE_NAME}/${PAGE_ROUTE}`}
        description={PAGE_NAME}
        isLoading={isLoading || !isDataReady}
        data={filteredData?.results}
        hideDeleteInActionColumn
        hideActionColumn
        newTable
        emptyRowMessage="No junk leads found. Leads with 'Irrelevant call' or 'Un Answered calls' feedback will appear here."
      >
        <Datacolumn
          field="last_followup_date"
          header="Follow Up Date"
          width="10%"
          filteringType='text'
          displayValueGetter={(row: any) => {
            if (!row.last_followup_date) return '';

            if (typeof row.last_followup_date === 'string' && /^\d{1,2}-[A-Za-z]{3}-\d{4}$/.test(row.last_followup_date)) {
              return row.last_followup_date;
            }

            let date: Date | null = null;

            if (/^\d{4}-\d{2}-\d{2}$/.test(row.last_followup_date)) {
              const [year, month, day] = row.last_followup_date.split('-').map(Number);
              date = new Date(year, month - 1, day);
            } else {
              const parsed = new Date(row.last_followup_date);
              if (!isNaN(parsed.getTime())) {
                date = parsed;
              }
            }

            if (!date) return row.last_followup_date;

            return formatDate(date, "dd-MMM-yyyy");
          }}
        />
        <Datacolumn field="lead_name" header="Name" filteringType='text' />
        <Datacolumn 
          field="contact_1" 
          header="Contact" 
          // width="15%" 
          filteringType='text'
          displayValueGetter={(row: any) => formatContact(row.contact_1)}
        />
        <Datacolumn
          field="project_pref"
          header="Property Preference"
          width="30%"
          filteringType='text'
          displayValueGetter={(row: any) => {
            // Use project_pref from lead data
            if (!row?.project_pref || !Array.isArray(row.project_pref)) return '';
            return row.project_pref.map((p: any) => p.descr || p).join(', ');
          }}
        />
        <Datacolumn
          field="lead_src"
          header="Lead Source"
          // width="15%"
          filteringType='text'
          displayValueGetter={(row: any) => {
            // Use lead_src from lead data
            if (typeof row?.lead_src === 'object' && row.lead_src?.descr) {
              return row.lead_src.descr;
            }
            return row?.lead_src || '';
          }}
        />
        <Datacolumn
          field="feedback"
          header="Feedback"
          // width="15%"
          filteringType='text'
          displayValueGetter={(row: any) => {
            // Handle the feedback object structure
            if (typeof row?.feedback === 'object' && row.feedback?.descr) {
              return row.feedback.descr;
            }
            // If feedback is an ID, look it up in feedbacks
            const feedbackId = row?.feedback;
            const allFeedbacks = feedbacks && feedbacks.length > 0 ? feedbacks : feedbackRef.current;
            const temp = allFeedbacks?.find((fb: any) => fb.key === feedbackId);
            return temp?.descr || '';
          }}
        />
        <Datacolumn
          field="action"
          header=""
          type="custom"
          // width={"15%"}
          displayValueGetter={(row: any) => {
            const leadKey = row?.key || row?.leadKey;
            return (
              <div className="flex justify-content-center gap-2">
                <Button
                  style={{ height: 25, marginBottom: 3, marginTop: 3 }}
                  onClick={() => {
                    const resolvedLeadKey = Number(
                      row?.lead_key ?? row?.lead?.key ?? row?.leadKey ?? row?.key
                    );

                    if (!resolvedLeadKey || Number.isNaN(resolvedLeadKey)) {
                      showError('Error', 'Lead details are unavailable for this record.');
                      return;
                    }

                    setSelectedLeadId(resolvedLeadKey);
                    setShowFollowUpModal(true);
                  }}
                >
                  View
                </Button>
                <Button
                  style={{ height: 25, marginBottom: 3, marginTop: 3 }}
                  onClick={async () => {
                    setSelectedData(row)
                    setShowModal(true)
                  }}
                >
                  Edit
                </Button>
              </div>
            )
          }}
        />
      </ListLayout>
      <ManageModal 
        id={selectedData?.key} 
        junkLeadData={selectedData}
        displayModal={showModal} 
        customDiscard={() => { setShowModal(false) }} 
        onEditSuccess={() => setNeedsRefresh(true)}
      />
      <FollowUpModal
        id={selectedLeadId || undefined}
        displayModal={showFollowUpModal}
        customDiscard={() => {
          setShowFollowUpModal(false);
          setSelectedLeadId(null);
        }}
      />
    </>
  );
}

export default Main 
