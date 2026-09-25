import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ListLayout, Datacolumn, CreateButton } from '@igblsln/control';
import { PAGE_SIZE, useActiveProjectQuery, useGetAllItemTypesQuery } from '@igblsln/store';
import { useGetFollowUpStatusQuery, useListFollowUpQuery } from '../api';
import { useGetFeedbacksQuery, useGetFeedbackDetailsQuery } from '../../FeedbackDetails/api';
import { MODULE_NAME } from '../../../constants';
import { PAGE_NAME, PAGE_ROUTE } from '../constants';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { useLocation, useNavigate } from 'react-router-dom';
import ManageModal from '../ManageModal';
import CommentsModal from '../Modals/CommentsModal';
import FollowUpModal from '../../Leads/Modals/FollowUpModal';

type Props = {}

const Main = (props: Props) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(PAGE_SIZE)
  const [selectedProject, setSelectedProject] = useState(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedStatus, setSelectedStatus] = useState(null)
  const [selectedFeedbackType, setSelectedFeedbackType] = useState(null)
  const [leadNameInput, setLeadNameInput] = useState('')
  const [leadNameSearch, setLeadNameSearch] = useState('')
  const [contactInput, setContactInput] = useState('')
  const [contactSearch, setContactSearch] = useState('')
  const [selectedData, setSelectedData] = useState<any>(null)
  const [isDataReady, setIsDataReady] = useState(false)

  const [showModal, setShowModal] = useState<boolean>(false)
  const [showCommentsModal, setShowCommentsModal] = useState<boolean>(false)
  const [showFollowUpModal, setShowFollowUpModal] = useState<boolean>(false)
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null)

  const { data: feedbacks, isLoading: isFeedbacksLoading, error: feedbacksError } = useGetFeedbacksQuery()
  const { data: feedbackDetails, isLoading: isFeedbackDetailsLoading, error: feedbackDetailsError } = useGetFeedbackDetailsQuery()

  const feedbackRef = useRef<any[]>([]);
  const feedbackDetailsRef = useRef<any[]>([]);

  useEffect(() => {
    feedbackRef.current = feedbacks || [];
  }, [feedbacks])

  useEffect(() => {
    feedbackDetailsRef.current = feedbackDetails || [];
  }, [feedbackDetails])

  const { data, isFetching: isLoading } = useListFollowUpQuery({
    page: page,
    size: size,
    lead_name: leadNameSearch?.trim() || undefined,
    contact_1: contactSearch?.trim() || undefined
  },
    { refetchOnMountOrArgChange: true })

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

  // Filter data to show only Follow-up and Un Answered calls
  const filteredData = React.useMemo(() => {
    if (!data?.results) return data;

    // Get feedback types for Follow-up and Un Answered calls
    const followupFeedbacks = feedbacks?.filter(fb => 
      fb.descr?.toLowerCase().includes('follow-up') || 
      fb.descr?.toLowerCase().includes('un answered calls')
    ) || [];

    // Apply dropdown filter if a specific feedback type is selected
    const activeFeedbackKeys = selectedFeedbackType 
      ? [selectedFeedbackType]
      : followupFeedbacks.map(fb => fb.key);

    // Filter follow-up records based on feedback keys
    // Handle both object and ID formats for feedback_key
    const filteredResults = data.results.filter((followUp: any) => {
      const feedbackData = followUp.feedback_key;
      if (!feedbackData) return false;

      // If feedback_key is an object with key property (API response format)
      if (typeof feedbackData === 'object' && feedbackData.key) {
        return activeFeedbackKeys.includes(feedbackData.key);
      }
      
      // If feedback_key is an ID directly
      return activeFeedbackKeys.includes(feedbackData);
    });

    return {
      ...data,
      results: filteredResults,
      count: data.count
    };
  }, [data, feedbacks, selectedFeedbackType])

  // Check if main data is loaded - we can show data even if feedbacks are still loading
  useEffect(() => {
    // Set data ready as soon as we have the main follow-up data
    const mainDataReady = Boolean(data?.results);
    setIsDataReady(mainDataReady);
    
    // Log for debugging
    if (data?.results) {
      console.log('FollowUp data loaded:', data.results.length, 'records');
      console.log('Sample record:', data.results[0]);
    }
  }, [data])

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

      const firstRow = data?.results?.[0] as any;
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
              fb.descr?.toLowerCase().includes('follow-up') || 
              fb.descr?.toLowerCase().includes('un answered calls')
            )}
            placeholder="All Follow-ups"
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
      >
        {/* <Datacolumn field="leadno" header="Lead No" filteringType='text' /> */}
        <Datacolumn field="last_followup_date" header="Follow Up Date" width = "10%" filteringType='text' />
        <Datacolumn field="lead_name" header="Name" width = "10%" filteringType='text' />
        <Datacolumn field="contact_1" header="Contact" width = "10%" filteringType='text' />
        {/* <Datacolumn field="status.name" header="Status" filteringType='text' /> */}
        <Datacolumn
          field="feedback_key"
          header="Feedback"
          filteringType='text'
          width = "13%"
          displayValueGetter={(row: any) => {
            if (Array.isArray(row)) return '';
            // Handle both object and ID formats
            const feedbackData = row.feedback_key;
            if (!feedbackData) return '';

            // If feedback_key is an object with descr property (API response format)
            if (typeof feedbackData === 'object' && feedbackData.descr) {
              return feedbackData.descr;
            }
            
            // If feedback_key is an ID, look it up in feedbacks
            const feedbackId = feedbackData;
            const allFeedbacks = feedbacks && feedbacks.length > 0 ? feedbacks : feedbackRef.current;
            const temp = allFeedbacks?.find((fb: any) => fb.key === feedbackId);
            return temp?.descr || '';
          }}
        />
        <Datacolumn
          field="followup_details_key"
          header="Feedback Details"
          filteringType='text'
          displayValueGetter={(row: any) => {
            if (Array.isArray(row)) return '';
            // Handle both object and ID formats
            const detailData = row.followup_details_key;
            if (!detailData) return '';

            // If followup_details_key is an object with descr property (API response format)
            if (typeof detailData === 'object' && detailData.descr) {
              return detailData.descr;
            }
            
            // If followup_details_key is an ID, look it up in feedback details
            const detailId = detailData;
            const allDetails = feedbackDetails && feedbackDetails.length > 0 ? feedbackDetails : feedbackDetailsRef.current;
            const temp = allDetails?.find((fd: any) => fd.key === detailId);
            return temp?.descr || '';
          }}
        />
        <Datacolumn field="follow_notes" header="Remarks" filteringType='text' />
        {/* Debug column to see raw data */}
        {/* <Datacolumn field="debug" header="Debug" filteringType='text' displayValueGetter={(row: any) => {
          return `feedback_key: ${JSON.stringify(row.feedback_key)}, followup_details_key: ${JSON.stringify(row.followup_details_key)}`
        }} /> */}
        <Datacolumn
          field="action"
          header=""
          type="custom"
          width={"20%"}
          displayValueGetter={(row: any) => {
            return (
              <div className="flex justify-content-center">
                <Button
                  style={{ height: 25, marginRight: 'auto', marginLeft: 'auto', marginBottom: 3, marginTop: 3 }}
                  onClick={() => {
                    const resolvedLeadKey = Number(
                      row?.lead_key ?? row?.lead?.key ?? row?.leadKey ?? row?.key
                    );

                    if (!resolvedLeadKey || Number.isNaN(resolvedLeadKey)) {
                      return;
                    }

                    setSelectedLeadId(resolvedLeadKey);
                    setShowFollowUpModal(true);
                  }}
                >
                  View
                </Button>
                <Button
                  style={{ height: 25, marginRight: 'auto', marginLeft: 'auto', marginBottom: 3, marginTop: 3 }}
                  onClick={async () => {
                    setSelectedData(row)
                    setShowModal(true)
                  }}
                >
                  Edit
                </Button>
                <Button
                  style={{ height: 25, marginRight: 'auto', marginLeft: 'auto', marginBottom: 3, marginTop: 3 }}
                  onClick={async () => {
                    setSelectedData(row)
                    setShowCommentsModal(true)
                  }}
                >
                  Comments
                </Button>
              </div>
            )
          }}
        />
      </ListLayout>
    

      {
        showModal &&
        <ManageModal id={selectedData?.key} displayModal={showModal} customDiscard={() => { setShowModal(false) }} initialData={selectedData} />
      }

      {
        showCommentsModal &&
        <CommentsModal id={selectedData?.key} displayModal={showCommentsModal} customDiscard={() => { setShowCommentsModal(false)} }/>
      }
      {
        showFollowUpModal &&
        <FollowUpModal
          id={selectedLeadId || undefined}
          displayModal={showFollowUpModal}
          customDiscard={() => {
            setShowFollowUpModal(false);
            setSelectedLeadId(null);
          }}
        />
      }

    </>

  );
}

export default Main
