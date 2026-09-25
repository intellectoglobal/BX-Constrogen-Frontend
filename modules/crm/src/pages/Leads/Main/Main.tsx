import React, { useState, useEffect } from 'react';
import { ListLayout, Datacolumn, useToast } from '@igblsln/control';
import { getMonthsFor, getPreviousYears, PAGE_SIZE } from '@igblsln/store';
import { Divider } from 'primereact/divider';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { confirmDialog } from 'primereact/confirmdialog';
import { RadioButton } from 'primereact/radiobutton';
import { useDeleteLeadMutation, useGetLeadStatusQuery, useListLeadQuery, useLazyListCrmReportsToExportQuery } from '../api';
import { useActiveProjectQuery, formatDate } from '@igblsln/store';
import ManageModal from '../Modals/ManageModal';
import FollowUpModal from '../Modals/FollowUpModal';
import CommentsModal from '../Modals/CommentsModal';
import ExcelJS from 'exceljs';

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
  const [showReportModal, setShowReportModal] = useState<boolean>(false)
  const years = getPreviousYears(5)
  const [selectedYear, setSelectedYear] = useState<any>(years[0])
  var months = getMonthsFor(selectedYear)
  const [selectedMonth, setSelectedMonth] = useState<any>(null)
  const [selectedMonthName, setSelectedMonthName] = useState<any>(null)
  const [showCommentsModal, setShowCommentsModal] = useState<boolean>(false)
  const [showFollowUpModal, setShowFollowUpModal] = useState<boolean>(false)
  const [showOperateModal, setShowOperateModal] = useState<boolean>(false)
  const [deleteDataAction] = useDeleteLeadMutation()
  const deleteAction = (id: number) => deleteDataAction(id).unwrap();

  useEffect(() => {
    months = getMonthsFor(selectedYear)
    setSelectedMonth(months[months.length - 1].value)
    setSelectedMonthName(months[months.length - 1].name)
  }, [selectedYear])

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

  const { data, isFetching: isLoading } = useListLeadQuery({ page: page, size: size, status: selectedStatus, lead_name: leadNameSearch?.trim() || undefined, contact_1: contactSearch?.trim() || undefined }, { refetchOnMountOrArgChange: true })
  const [triggerFetchReports, { data: reportsData, isFetching }] = useLazyListCrmReportsToExportQuery();

  const { data: leadStatuses } = useGetLeadStatusQuery()
  const { data: projects } = useActiveProjectQuery()

  useEffect(() => {
    if (location.state?.openModal && location.state?.openModal === true) {
      setShowModal(true);

      if (location.state.leadKey) {
        setSelectedLead({ key: location.state.leadKey });
      }

      navigate(location.pathname, { replace: true, state: null });
      return;
    }

    if (location.state?.fromFeedbackDetails === true) {
      if (location.state?.leadKey) {
        setSelectedLead({ key: location.state.leadKey });
        setShowFollowUpModal(true);
        navigate(location.pathname, { replace: true, state: null });
        return;
      }

      if (data?.results && data.results.length > 0) {
        setSelectedLead(data.results[0]);
        setShowFollowUpModal(true);
        navigate(location.pathname, { replace: true, state: null });
      }
    }
  }, [location.state, navigate, location.pathname, data]);

  const handleExportClick = () => {
    triggerFetchReports({ year: selectedYear, month: selectedMonth });
    setShowReportModal(true);
  };

  useEffect(() => {
      if (showReportModal) {
        triggerFetchReports({ year: selectedYear, month: selectedMonth });
      }
    }, [selectedYear, selectedMonth]);

  const exportToExcel = async () => {
    const leads = Array.isArray(reportsData) ? reportsData : [];
    if (leads.length === 0) return;


    const formatContact = (contact: string) => {
      if (!contact) return '';
      if (contact.startsWith('+91')) {
        const digits = contact.slice(3);
        const formatted = digits.replace(/(.{5})/g, '$1 ').trim();
        return '+91 ' + formatted;
      } else if (contact.startsWith('+1')) {
        const digits = contact.slice(2);
        const formatted = digits.replace(/(.{3})/g, '$1 ').trim();
        return '+1 ' + formatted;
      }
      return contact;
    };

      const workbook = new ExcelJS.Workbook();
      const formatDate = (d: any) =>
        d ? new Date(d).toLocaleDateString("en-GB") : "";
      const toText = (value: any) => {
        if (value === null || value === undefined) return "";
        if (typeof value === "string") return value;
        if (typeof value === "number" || typeof value === "boolean") return String(value);
        if (typeof value === "object") return value?.name || value?.descr || "";
        return "";
      };

    // Utility: Merge rows for parent data with multiple sub-items
    const addMergedSheet = <T extends Record<string, any>>(
    sheet: any,
    leadColumns: any,
    subKey: string,
    subColumns: any,
    getSubRows: (subItems: any[], lead: T) => any[],
    leadsToProcess: T[] = leads as T[]
  ) => {
    const allColumns = [...leadColumns, ...subColumns];
    sheet.columns = allColumns;

    let currentRow = 2;

    leadsToProcess.forEach((lead) => {
      const subItems = getSubRows(lead[subKey] || [], lead);
      const rowCount = Math.max(subItems.length, 1);

      for (let i = 0; i < rowCount; i++) {
        const row = sheet.getRow(currentRow + i);

        if (i === 0) {
          leadColumns.forEach((col: any, idx: number) => {
            row.getCell(idx + 1).value = lead[col.key] || "";
          });
        }

        const subItem = subItems[i] || {};
        subColumns.forEach((col: any, idx: number) => {
          row.getCell(leadColumns.length + idx + 1).value = subItem[col.key] || "";
        });

        row.commit();
      }

      if (rowCount > 1) {
        leadColumns.forEach((_: any, idx: number) => {
          sheet.mergeCells(currentRow, idx + 1, currentRow + rowCount - 1, idx + 1);
        });

        const subItemKeys = subColumns.map((col: any) => col.key);
        for (let colIdx = 0; colIdx < subColumns.length; colIdx++) {
          const key = subItemKeys[colIdx];
          const isConstant = subItems.every((item: any) => item[key] === subItems[0][key]);

          if (isConstant && subItems[0][key]) {
            const startCol = leadColumns.length + colIdx + 1;
            sheet.mergeCells(currentRow, startCol, currentRow + rowCount - 1, startCol);
          }
        }
      }

      currentRow += rowCount;
    });
  };


    // ===== LEADS Sheet =====
    const leadsSheet = workbook.addWorksheet("Leads");

    const projectMap = projects?.reduce((acc, proj) => {
      acc[proj.key] = proj.name;
      return acc;
    }, {} as Record<string | number, string>) || {};

    const processedLeads = leads.map((lead: any) => ({
      ...lead,
      budget_formatted: lead.budget ? `₹${Number(lead.budget).toLocaleString('en-IN')}` : '',
      contact_1_formatted: formatContact(lead.contact_1),
      contact_2_formatted: formatContact(lead.contact_2),
      project_preferences_formatted: lead.project_preferences || '',
    }));

    const leadColumns = [
      { header: "Lead No", key: "lead_no" },
      { header: "Enquiry Date", key: "enquiry_date" },
      { header: "Lead Name", key: "lead_name" },
      { header: "Contact 1", key: "contact_1_formatted" },
      { header: "Contact 2", key: "contact_2_formatted" },
      { header: "Source Category", key: "source_category" },
      { header: "Source", key: "source" },
      { header: "Budget", key: "budget_formatted" },
      { header: "Budget Range", key: "budget_range" },
      { header: "Location Preferences", key: "location_preferences" },
      { header: "Property Preference", key: "project_preferences_formatted" },
      { header: "Property Interest", key: "property_interest" },
      { header: "Floor Preference", key: "floor_preference" },
      { header: "Facing Preference", key: "facing_preference" },
      { header: "Occupancy", key: "occupancy" },
      { header: "Occupancy Sub Type", key: "occupancy_sub_type" },
      { header: "Status", key: "status" },
      // { header: "Follow Up Stage", key: "follow_up_stage" },
      { header: "Email", key: "email" },
      { header: "Created By", key: "createdby" },
    ];

    const commentColumns = [
      { header: "Comment", key: "comment" },
      { header: "Commented By", key: "createdby" },
      { header: "Commented At", key: "createddttm" },
    ];

    addMergedSheet(
      leadsSheet,
      leadColumns,
      "comments",
      commentColumns,
      (comments: any[]) =>
        comments.length > 0
          ? comments.map((c: any) => ({
              comment: c.comment || "",
              createdby: c.createdby || "",
              createddttm: formatDate(c.createddttm),
            }))
          : [{ comment: "", createdby: "", createddttm: "" }],
      processedLeads
    );

    // ===== FOLLOW UPS Sheet =====
    const followUpSheet = workbook.addWorksheet("Follow Ups");

    const followLeadCols = [
      { header: "Followup Date", key: "last_followup_date" },
      { header: "Followup Time", key: "followup_time" },
      { header: "Feedback", key: "feedback" },
      {header: "Feedback Details", key: "followup_details" },
      { header: "Remarks", key: "follow_notes" },
      { header: "Created By", key: "follow_createdby" },
      // { header: "Followup Status", key: "follow_status" },
    ];

    const filteredLeadsWithFollowups = leads.filter(
      (l: any) => l.follow_up?.length > 0
    );

    addMergedSheet(
      followUpSheet,
      [{ header: "Lead No", key: "lead_no" }, { header: "Lead Name", key: "lead_name" }],
      "follow_up",
      [...followLeadCols, ...commentColumns],
      (followups: any[], lead: any) =>
        followups.flatMap((f: any) => {
          const comments = f.comments?.length > 0 ? f.comments : [{}];
          return comments.map((c: any) => ({
            lead_no: lead.lead_no,
            lead_name: lead.lead_name || "",
            last_followup_date: formatDate(f.last_followup_date),
            followup_time: f.followup_time || "",
            feedback: f.feedback?.descr || "",
            followup_details: f.followup_details?.descr || "",
            follow_notes: f.follow_notes || "",
            follow_createdby: f.createdby || "",
            // follow_status: f.status?.name || "",
            comment: c.comment || "",
            createdby: c.createdby || "",
            createddttm: formatDate(c.createddttm),
          }));
        }),
      filteredLeadsWithFollowups
    );

    // ===== SITE VISITS Sheet =====
    const siteVisitSheet = workbook.addWorksheet("Site Visits");

    const siteVisitCols = [
      { header: "Visit Date", key: "visit_date" },
      { header: "Visit Time", key: "visit_time" },
      { header: "Property Preference", key: "project_preferences_formatted" },
      { header: "Source Category", key: "source_category" },
      { header: "Source", key: "source" },
      // { header: "Project Name", key: "project_name" },
      // { header: "Agent Name", key: "agent_name" },
      // { header: "Agent Phone", key: "agent_phone_formatted" },

      { header: "Created By", key: "visit_createdby" },
      { header: "Visit Status", key: "visit_status" },
    ];

    const filteredLeadsWithVisits = leads.filter(
      (l: any) => l.site_visit?.length > 0
    );

    addMergedSheet(
      siteVisitSheet,
      [{ header: "Lead No", key: "lead_no" }, { header: "Lead Name", key: "lead_name" }],
      "site_visit",
      [...siteVisitCols, ...commentColumns],
      (visits: any[], lead: any) =>
        visits.flatMap((v: any) => {
          const comments = v.comments?.length > 0 ? v.comments : [{}];
          return comments.map((c: any) => ({
            lead_no: lead.lead_no,
            lead_name: lead.lead_name || "",
            visit_date: formatDate(v.visit_date),
            visit_time: v.visit_time || "",
            project_preferences_formatted: lead.project_preferences || "",
            source_category: lead.source_category || "",
            source: lead.source || "",
            // project_name: v.project_name || "",
            // agent_name: v.agent_name || "",
            // agent_phone_formatted: formatContact(v.agent_phone),
            visit_createdby: v.createdby || "",
            visit_status: v.status?.name || "",
            comment: c.comment || "",
            createdby: c.createdby || "",
            createddttm: formatDate(c.createddttm),
          }));
        }),
      filteredLeadsWithVisits
    );

    // ===== JUNK LEADS Sheet =====
    const junkLeadsSheet = workbook.addWorksheet("Junk Leads");

      const normalizeFeedback = (value: any) =>
        toText(value).toLowerCase().replace(/[^a-z0-9]/g, "");

    const junkFeedbackValues = new Set([
      "irrelevantcall",
      "unansweredcalls",
    ]);

    const junkLeadRows = leads.flatMap((lead: any) => {
      const explicitJunkLeads = Array.isArray(lead.junk_leads)
        ? lead.junk_leads
        : Array.isArray(lead.junk_lead)
          ? lead.junk_lead
          : [];

      if (explicitJunkLeads.length > 0) {
        return explicitJunkLeads.map((junk: any) => ({
          lead_no: junk.lead_no || lead.lead_no || "",
          lead_name: junk.lead_name || lead.lead_name || "",
          followup_date: formatDate(junk.followup_date),
          followup_time: junk.followup_time || "",
          feedback: junk.feedback || "",
          feedback_details: junk.feedback_details || "",
          remarks: junk.remarks || "",
        }));
      }

      const followUps = Array.isArray(lead.follow_up) ? lead.follow_up : [];
      return followUps
        .filter((followUp: any) => {
          const feedbackDescr = followUp?.feedback?.descr || "";
          return junkFeedbackValues.has(normalizeFeedback(feedbackDescr));
        })
        .map((followUp: any) => ({
          lead_no: lead.lead_no || "",
          lead_name: lead.lead_name || "",
          followup_date: formatDate(followUp.last_followup_date),
          followup_time: followUp.followup_time || "",
          feedback: followUp?.feedback?.descr || "",
          feedback_details: followUp?.followup_details?.descr || "",
          remarks: followUp.follow_notes || "",
        }));
    });

    junkLeadsSheet.columns = [
      { header: "Lead No", key: "lead_no" },
      { header: "Lead Name", key: "lead_name" },
      { header: "Followup Date", key: "followup_date" },
      { header: "Followup Time", key: "followup_time" },
      { header: "Feedback", key: "feedback" },
      { header: "Feedback Details", key: "feedback_details" },
      { header: "Remarks", key: "remarks" },
    ];
    junkLeadsSheet.addRows(junkLeadRows);

    // ===== ACTIVE FOLLOW UP Sheet =====
    const activeFollowUpSheet = workbook.addWorksheet("Active Follow Up");

      const normalizeStatus = (value: any) =>
        toText(value).toLowerCase().replace(/[^a-z0-9]/g, "");

    const activeStatusValues = new Set([
      "open",
      "potential",
    ]);

    const formatPreference = (value: any) => {
      if (Array.isArray(value)) {
        return value.map((item: any) => item?.descr || item?.name || item).join(", ");
      }
      return value || "";
    };

    const activeFollowUpRows = leads.flatMap((lead: any) => {
      const explicitActiveFollowUps = Array.isArray(lead.active_followup)
        ? lead.active_followup
        : Array.isArray(lead.active_followups)
          ? lead.active_followups
          : [];

      if (explicitActiveFollowUps.length > 0) {
        return explicitActiveFollowUps.map((active: any) => ({
          lead_no: active.lead_no || lead.lead_no || "",
          lead_name: active.lead_name || lead.lead_name || "",
          enquiry_date: formatDate(active.enquiry_date),
          contact_1: active.contact_1 || lead.contact_1 || "",
          contact_2: active.contact_2 || lead.contact_2 || "",
          budget: active.budget || lead.budget || "",
          budget_range: active.budget_range || lead.budget_range || "",
          email: active.email || lead.email || "",
          property_interest: active.property_interest || lead.property_interest || "",
          source: active.source || lead.source || "",
          source_category: active.source_category || lead.source_category || "",
          floor_preference: active.floor_preference || lead.floor_preference || "",
          facing_preference: active.facing_preference || lead.facing_preference || "",
          occupancy: active.occupancy || lead.occupancy || "",
          occupancy_sub_type: active.occupancy_sub_type || lead.occupancy_sub_type || "",
          follow_up_stage: active.follow_up_stage || "",
          location_preferences: active.location_preferences || "",
          project_preferences: active.project_preferences || "",
          project_name: active.project_name || "",
          createdby: active.createdby || lead.createdby || "",
          status: active.status || (lead.status?.name || lead.status || ""),
        }));
      }

      const statusName = toText(lead.status?.name || lead.status);
      if (!activeStatusValues.has(normalizeStatus(statusName))) {
        return [];
      }

      return [{
        lead_no: lead.lead_no || "",
        lead_name: lead.lead_name || "",
        enquiry_date: formatDate(lead.enquiry_date),
        contact_1: lead.contact_1 || "",
        contact_2: lead.contact_2 || "",
        budget: lead.budget || "",
        budget_range: lead.budget_range || "",
        email: lead.email || "",
        property_interest: lead.property_interest || "",
        source: lead.source || "",
        source_category: lead.source_category || "",
        floor_preference: lead.floor_preference || "",
        facing_preference: lead.facing_preference || "",
        occupancy: lead.occupancy || "",
        occupancy_sub_type: lead.occupancy_sub_type || "",
        follow_up_stage: lead.follow_up_stage || "",
        location_preferences: formatPreference(lead.location_preferences || lead.location_pref_keys),
        project_preferences: formatPreference(lead.project_preferences || lead.project_pref_keys),
        project_name: lead.project_name || "",
        createdby: lead.createdby || "",
        status: statusName,
      }];
    });

    activeFollowUpSheet.columns = [
      { header: "Lead No", key: "lead_no" },
      { header: "Lead Name", key: "lead_name" },
      { header: "Enquiry Date", key: "enquiry_date" },
      { header: "Contact 1", key: "contact_1" },
      { header: "Contact 2", key: "contact_2" },
      { header: "Budget", key: "budget" },
      { header: "Budget Range", key: "budget_range" },
      { header: "Email", key: "email" },
      { header: "Property Interest", key: "property_interest" },
      { header: "Source", key: "source" },
      { header: "Source Category", key: "source_category" },
      { header: "Floor Preference", key: "floor_preference" },
      { header: "Facing Preference", key: "facing_preference" },
      { header: "Occupancy", key: "occupancy" },
      { header: "Occupancy Sub Type", key: "occupancy_sub_type" },
      { header: "Follow Up Stage", key: "follow_up_stage" },
      { header: "Location Preferences", key: "location_preferences" },
      { header: "Project Preferences", key: "project_preferences" },
      { header: "Project Name", key: "project_name" },
      { header: "Created By", key: "createdby" },
      { header: "Status", key: "status" },
    ];
    activeFollowUpSheet.addRows(activeFollowUpRows);

    // ===== Styling =====
    workbook.worksheets.forEach((sheet) => {
      sheet.getRow(1).font = { bold: true };
      sheet.columns.forEach((col) => {
        col.alignment = { vertical: "top", wrapText: true };
        col.width = 20;
      });
    });

    // ===== Download =====
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `CRM_Report_${selectedMonthName}_${selectedYear}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <Divider />
      <div className="flex align-items-center flex-nowrap gap-3">
        <div className="field col-3 flex align-items-center gap-2 mb-0">
          <label className="m-0 w-5rem">Status</label>
          <Dropdown
            className="w-full"
            optionLabel={"name"}
            optionValue={"key"}
            value={selectedStatus}
            filterBy={"name"}
            showClear
            onChange={(e) => {
              setSelectedStatus(e.value)
            }}
            options={leadStatuses}
          />
        </div>
        <div className="field col-3 flex align-items-center gap-2 mb-0">
          <label className="m-0 w-7rem">Lead Name</label>
          <span className="p-input-icon-right w-full">
            <InputText
              className="w-full"
              style={{ boxShadow: 'none', outline: 'none' }}
              value={leadNameInput}
              onChange={(e) => {
                const value = e.target.value;
                setLeadNameInput(value);
                if (!value.trim()) {
                  // Keep status filter active while removing name filter immediately.
                  setLeadNameSearch('');
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  applyLeadNameSearch();
                }
              }}
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.outline = 'none';
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
        <div className="field col-3 flex align-items-center gap-2 mb-0">
          <label className="m-0 w-7rem">Contact</label>
          <span className="p-input-icon-right w-full">
            <InputText
              className="w-full"
              style={{ boxShadow: 'none', outline: 'none' }}
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
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.outline = 'none';
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

        <div className="field mb-0 ml-auto">
          <Button
            label='Export Report'
            className='p-button-plain'
            onClick={handleExportClick}
          />
        </div>

        <div className="field mb-0">
          <Button
            label='Add Lead'
            className='p-button-plain'
            onClick={() => {
              setSelectedLead(null)
              setShowModal(true)
            }}
          />
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
        description="Leads"
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
        <Datacolumn field="enquiry_date" header="Enquiry Date" filteringType='text' width ='8%'
          displayValueGetter={(row: any) => {
            if (!row.enquiry_date) return '';
            
            // Handle already formatted dates (dd-MMM-yyyy)
            if (typeof row.enquiry_date === 'string' && /^\d{1,2}-[A-Za-z]{3}-\d{4}$/.test(row.enquiry_date)) {
              return row.enquiry_date;
            }
            
            // Handle Date objects or other date formats
            let date: Date | null = null;
            
            // Case 1: yyyy-mm-dd (API / DB format)
            if (/^\d{4}-\d{2}-\d{2}$/.test(row.enquiry_date)) {
                const [year, month, day] = row.enquiry_date.split('-').map(Number);
                date = new Date(year, month - 1, day);
            }
            
            // Case 2: already a Date-compatible string
            else {
                const parsed = new Date(row.enquiry_date);
                if (!isNaN(parsed.getTime())) {
                    date = parsed;
                }
            }
            
            if (!date) return row.enquiry_date;
            
            return formatDate(date, "dd-MMM-yyyy");
          }}
        />
        <Datacolumn field="lead_name" header="Name" filteringType='text' width = '15%' />
        <Datacolumn
          field="contact_1"
          header="Contact"
          filteringType='text'
          width = '10%'
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
          width = '10%'
          displayValueGetter={(row: any) => row.budget ? `₹${Number(row.budget).toLocaleString('en-IN')}` : ''}
        />
        {/* <Datacolumn field="email" header="Email" filteringType='text' /> */}
        <Datacolumn field="status_name" header="Status" filteringType='text' width = '10%' />
        {/*<Datacolumn field="property_interest" header="Property Interest" filteringType='text' /> */}
        {/* <Datacolumn field="source" header="Source" filteringType='text' /> */}
        <Datacolumn
          field="action"
          header=""
          type="custom"
          width={"30%"}
          displayValueGetter={(row: any) => {
            return (
              <div className="flex justify-content-center">
                <Button
                  style={{ height: 25, marginRight: 'auto', marginLeft: 'auto', marginBottom: 3, marginTop: 3 }}
                  onClick={async () => {
                    setSelectedLead(row)
                    setShowOperateModal(true)
                  }}
                >
                  Operate
                </Button>
                <Button
                  style={{ height: 25, marginRight: 'auto', marginLeft: 'auto', marginBottom: 3, marginTop: 3 }}
                  onClick={async () => {
                    setSelectedLead(row)
                    setShowCommentsModal(true)
                  }}
                >
                  Comments
                </Button>
                <Button
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
                </Button>
              </div>
            )
          }
          }
        />
      </ListLayout>
      {
        showModal &&
        <ManageModal id={selectedLead?.key} displayModal={showModal} customDiscard={() => { setShowModal(false) }} />
      }

      {
        showReportModal &&
        <Dialog
          header={`Export Monthly Report`}
          visible={showReportModal}
          position={'center'}
          modal
          style={{ width: '60vw' }}
          onHide={() => setShowReportModal(false)}
          draggable={false} resizable={false}
          closeOnEscape={false}
        >
          <div className="pl-5 flex">
            <div className="field" style={{ width: '50%' }}>
              <label className={'col-4'}>Financial Year</label>
              <Dropdown
                  style={{ width: '60%' }}
                  options={years}
                  onChange={(e) => setSelectedYear(e.value)}
                  value={selectedYear}
                  placeholder={'Select an Year'}
              />
            </div>
            <div className="field" style={{ width: '50%' }}>
              <label className={'col-4'}>Select Month</label>
              <Dropdown
                style={{ width: '60%' }}
                value={selectedMonth}
                placeholder='Select a Month'
                options={months}
                onChange={(e) => {
                  //@ts-ignore
                  setSelectedMonthName(e.originalEvent?.nativeEvent?.target?.innerText)
                  setSelectedMonth(e.value)
                }}
                optionLabel='name'
                optionValue='value'
              />
            </div>
          </div>
          <div>
            <Button
              style={{
                marginLeft: 'auto',
                marginRight: 30,
                marginTop: 10,
                display: 'flex',
                width: 150,
              }}
              onClick={exportToExcel}
              loading={isFetching}
              disabled={isFetching}
              label="Export"
            />
          </div>

        </Dialog>
      }

      {
        showFollowUpModal &&
        <FollowUpModal id={selectedLead?.key} displayModal={showFollowUpModal} customDiscard={() => { setShowFollowUpModal(false) }} />
      }

      {
        showCommentsModal &&
        <CommentsModal id={selectedLead?.key} displayModal={showCommentsModal} customDiscard={() => { setShowCommentsModal(false) }} />
      }

      {
        showOperateModal &&
        <Dialog
          header={`Edit Lead / Create or Edit Follow Ups & Site Visits`}
          visible={showOperateModal}
          position={'center'}
          modal
          style={{ width: '60vw' }}
          onHide={() => setShowOperateModal(false)}
          draggable={false} resizable={false}
          closeOnEscape={false}
        >
          <div className="pl-5 flex">
            <div className="field" style={{ width: '50%' }}>
              <div className="field-radiobutton">
                <RadioButton
                  // checked={withItemList}
                  onChange={() => {
                    setShowOperateModal(false)
                    setShowModal(true)
                  }} />
                <label
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    setShowOperateModal(false)
                    setShowModal(true)
                  }}>
                  Edit Lead
                </label>
              </div>
            </div>
            <div className="field" style={{ width: '50%' }}>
              <div className="field-radiobutton">
                <RadioButton
                  // checked={withItemList}
                  onChange={() => {
                    setShowOperateModal(false)
                    setShowFollowUpModal(true)
                  }} />
                <label
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    setShowOperateModal(false)
                    setShowFollowUpModal(true)
                  }}>
                  Create or Edit Follow Ups & Site Visits
                </label>
              </div>
            </div>
          </div>

        </Dialog>
      }

    </>

  );
}

export default Main
