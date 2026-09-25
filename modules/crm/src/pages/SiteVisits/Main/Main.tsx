import React, { useState, useEffect } from 'react';
import { ListLayout, Datacolumn, CreateButton } from '@igblsln/control';
import { PAGE_SIZE, useActiveProjectQuery, useGetAllItemTypesQuery } from '@igblsln/store';
import { useDeleteSiteVisitMutation, useListSiteVisitQuery } from '../api';
import { MODULE_NAME } from '../../../constants';
import { PAGE_NAME, PAGE_ROUTE } from '../constants';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { useGetSiteVisitStatusQuery } from '../../Leads/api';
import ManageModal from '../ManageModal';
import CommentsModal from '../CommentsModal';
import FollowUpModal from '../../Leads/Modals/FollowUpModal';

type Props = {}

const Main = (props: Props) => {
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(PAGE_SIZE)
  const [selectedProject, setSelectedProject] = useState(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedStatus, setSelectedStatus] = useState(null)
  const [selectedSiteVisitStatus, setSelectedSiteVisitStatus] = useState(null)
  const [leadNameInput, setLeadNameInput] = useState('')
  const [leadNameSearch, setLeadNameSearch] = useState('')
  const [contactInput, setContactInput] = useState('')
  const [contactSearch, setContactSearch] = useState('')
  const [showModal, setShowModal] = useState<boolean>(false)
  const [selectedData, setSelectedData] = useState<any>(null)
  const [showCommentsModal, setShowCommentsModal] = useState<boolean>(false)
  const [showFollowUpModal, setShowFollowUpModal] = useState<boolean>(false)
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null)

  const { data: projects } = useActiveProjectQuery()
  const { data: statuses } = useGetSiteVisitStatusQuery()

  const { data, isFetching: isLoading } = useListSiteVisitQuery({
    page: page,
    size: size,
    date: selectedDate ? `${selectedDate.toLocaleDateString().replace("/", "-").replace("/", "-")}` : undefined,
    project: selectedProject,
    status: selectedSiteVisitStatus,
    lead_name: leadNameSearch?.trim() || undefined,
    contact_1: contactSearch?.trim() || undefined
  },
    { refetchOnMountOrArgChange: true })
  const [deleteDataAction, { isLoading: isDeleting }] = useDeleteSiteVisitMutation()
  const deleteAction = (id: number) => deleteDataAction(id).unwrap();

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


  return (
    <>
      <Divider />
      <div className="flex" style={{ width: '100%' }}>
        <div className="field col-4">
          <label className={'col-4'}>Site Visit Status</label>
          <Dropdown
            style={{ width: '60%' }}
            optionLabel={"name"}
            optionValue={"key"}
            value={selectedSiteVisitStatus}
            filterBy={"name"}
            showClear
            onChange={(e) => {
              setSelectedSiteVisitStatus(e.value)
            }}
            options={statuses}
            placeholder="All Site Visits"
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
          loading: isLoading,
          currentPage: page,
          total: data?.count,
          onChange: (page, size) => {
            setPage(page);
            setSize(size)
          }
        }}
        baseRoute={`/${MODULE_NAME}/${PAGE_ROUTE}`}
        description={PAGE_NAME}
        isLoading={isLoading}
        data={data?.results}
        hideDeleteInActionColumn
        hideActionColumn
        newTable
      >
        {/* <Datacolumn field="leadno" header="Lead No" filteringType='text' /> */}
        <Datacolumn field="visit_date" header="Site Visit Date" width = "10%" filteringType='text' />
        <Datacolumn field="lead_name" header="Name" width = "10%" filteringType='text' />
        <Datacolumn field="contact_1" header="Contact" width = "10%" filteringType='text' />
        {/* <Datacolumn field="project_name" header="Property Name" filteringType='text' /> */}
        <Datacolumn field="project_preferences" header="Property Preference" filteringType='text' />
        <Datacolumn field="source" header="Lead Source" width = "10%" filteringType='text' />
        <Datacolumn field="source_category" header="Source Category" width = "13%" filteringType='text' />
        {/* <Datacolumn field="follow_notes" header="Notes" filteringType='text' /> */}
        <Datacolumn field="status.name" header="Status" filteringType='text' />
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
        showModal && <ManageModal id={selectedData?.key} displayModal={showModal} customDiscard={() => { setShowModal(false) }} />
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
