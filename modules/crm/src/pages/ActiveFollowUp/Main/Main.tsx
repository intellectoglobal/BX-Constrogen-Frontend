import React, { useState, useEffect } from 'react';
import { ListLayout, Datacolumn, useToast } from '@igblsln/control';
import { PAGE_SIZE } from '@igblsln/store';
import { Divider } from 'primereact/divider';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { confirmDialog } from 'primereact/confirmdialog';
import { useDeleteLeadMutation, useGetLeadStatusQuery, useListLeadQuery } from '../../Leads/api';
import ManageModal from '../../Leads/Modals/ManageModal';

import { useLocation, useNavigate } from 'react-router-dom';

type Props = {}

const Main = (props: Props) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast()
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(PAGE_SIZE);
  const [selectedStatus, setSelectedStatus] = useState<any>(null)
  const [leadNameInput, setLeadNameInput] = useState('')
  const [leadNameSearch, setLeadNameSearch] = useState('')
  const [contactInput, setContactInput] = useState('')
  const [contactSearch, setContactSearch] = useState('')
  const [selectedLead, setSelectedLead] = useState<any>(null)
  const [showModal, setShowModal] = useState<boolean>(false)
  const [deleteDataAction] = useDeleteLeadMutation()
  const deleteAction = (id: number) => deleteDataAction(id).unwrap();

useEffect(() => {
  if (location.state?.openModal && location.state?.openModal === true) {
    setShowModal(true);

    if (location.state.leadKey) {
      setSelectedLead({ key: location.state.leadKey });
    }

    // Clear the location state to prevent it from persisting on reload
    navigate(location.pathname, { replace: true, state: null });
  }
}, [location.state, navigate, location.pathname]);

  const { data: leadStatuses } = useGetLeadStatusQuery()

  // Filter for Open and Potential statuses dynamically for the dropdown
  const activeStatuses = leadStatuses?.filter((status: any) =>
    ['Open', 'Potential', 'Re-Open'].includes(status.name)
  ) || []

  // Fetch leads with server-side filtering for Open and Potential statuses
  // The backend now handles this automatically when active_followup=true is passed
  const { data, isFetching: isLoading } = useListLeadQuery(
    { page: page, size: size, status: selectedStatus, active_followup: true, lead_name: leadNameSearch?.trim() || undefined, contact_1: contactSearch?.trim() || undefined },
    { refetchOnMountOrArgChange: true }
  )

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
      <div className="flex">
        <div className="field col-4">
          <label className={'col-4'}>Status</label>
          <Dropdown
            style={{ width: '60%' }}
            optionLabel={"name"}
            optionValue={"key"}
            value={selectedStatus}
            filterBy={"name"}
            showClear
            onChange={(e) => {
              setSelectedStatus(e.value)
            }}
            options={activeStatuses}
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
        hideAddButton
        baseRoute="/payment/expenses"
        description="Active Follow Up Leads (Open and Potential Status)"
        hideActionColumn
        isLoading={isLoading}
        data={data?.results || [{}]}
        customEditOnClick={(value: any) => {
          setSelectedLead(value)
          setShowModal(true)
        }}
        newTable
        showHeader
      >
        {/* <Datacolumn field="lead_no" header="Lead No" filteringType='text' /> */}
        <Datacolumn field="lead_name" header="Name" filteringType='text' />
        {/* <Datacolumn field="enquiry_date" header="Next Follow Up Date" filteringType='text' /> */}
        <Datacolumn
          field="contact_1"
          header="Contact"
          filteringType='text'
          displayValueGetter={(row: any) => {
            const contact = row.contact_1;
            if (!contact) return '';
            if (contact.startsWith('+91')) {
              const digits = contact.slice(3);
              const formatted = digits.replace(/(.{5})/g, '$1 ').trim();
              return '+91 ' + formatted;
            }
            return contact;
          }}
        />
        <Datacolumn
          field="project_pref_keys"
          header="Project Preference"
          filteringType='text'
          displayValueGetter={(row: any) => {
            if (!row.project_pref_keys || !Array.isArray(row.project_pref_keys)) return '';
            return row.project_pref_keys.map((p: any) => p.descr || p).join(', ');
          }}
        />
        <Datacolumn
          field="budget"
          header="Budget"
          filteringType='currency'
          displayValueGetter={(row: any) => row.budget ? `₹${Number(row.budget).toLocaleString('en-IN')}` : ''}
        />
        {/* <Datacolumn field="email" header="Email" filteringType='text' /> */}
        <Datacolumn field="status_name" header="Status" filteringType='text' />
        {/*<Datacolumn field="property_interest" header="Property Interest" filteringType='text' /> */}
        {/* <Datacolumn field="source" header="Source" filteringType='text' /> */}
        <Datacolumn
          field="action"
          header=""
          type="custom"
          width={"15%"}
          displayValueGetter={(row: any) => {
            return (
              <div className="flex justify-content-center">
                <Button
                  style={{ height: 25, marginRight: 'auto', marginLeft: 'auto', marginBottom: 3, marginTop: 3 }}
                  onClick={async () => {
                    setSelectedLead(row)
                    setShowModal(true)
                  }}
                >
                  Edit
                </Button>
                {/* <Button
                  style={{ height: 25, marginRight: 'auto', marginLeft: 'auto', marginBottom: 3, marginTop: 3 }}
                  onClick={async () => {
                    confirmDialog({
                      message: 'Are you sure you want to delete?',
                      header: 'Confirmation',
                      icon: 'pi pi-exclamation-triangle',
                      accept: async () => {
                        try {
                          const resp = await deleteAction(row.key);
                          showSuccess('Success', "Deleted Successfully");
                        } catch (error: any) {
                          showError("Failed", error?.data?.detail)
                        }
                      },
                      reject: () => { }
                    });
                  }}
                >
                  Delete
                </Button> */}
              </div>
            )
          }}
        />
      </ListLayout>
      {
        showModal &&
        <ManageModal id={selectedLead?.key} displayModal={showModal} customDiscard={() => { setShowModal(false) }} />
      }


    </>
  );
}

export default Main
