import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import { Button } from 'primereact/button';
import { Datacolumn, EditableTable, ListLayout } from '@igblsln/control';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { useNavigate } from 'react-router-dom';
import { useGetFollowUpStatusQuery, useGetLeadStatusQuery } from '../api';
import { useGetFeedbacksQuery, useGetFeedbackDetailsQuery, Feedback, FeedbackDetail } from '../../FeedbackDetails/api';
import { formatDate } from  "@igblsln/store"
import { useAppDispatch, useAppSelector } from "@igblsln/store"
import { setFeedbackNeedsRefresh, clearFeedbackRefresh, selectFeedbackNeedsRefresh } from "@igblsln/store"


type FollowUpItem = {
    key?: number;
    last_followup_date?: string;
    followup_time?: string;
    feedback_key?: number | { key: number; descr: string };
    followup_details_key?: number | { key: number; descr: string };
    follow_notes?: string;
    [key: string]: any;
}

type Props = {
    data: FollowUpItem[] | { followup: FollowUpItem[] };
    isLoading?: boolean;
    onChange?: Function;
    onTableChange?: Function;
    leadKey?: number;
}

const ManageFollowUpTable = ({ data, isLoading, onChange = () => { }, onTableChange = () => { }, leadKey }: Props) => {
    const [items, setItems] = useState<any[]>([])
    const ref = useRef(items);
    const CREATE_AND_EDIT_OPTION = '__create_and_edit__';
    const toArray = (value: any): any[] => {
        if (Array.isArray(value)) return value;
        if (Array.isArray(value?.results)) return value.results;
        if (Array.isArray(value?.items)) return value.items;
        if (Array.isArray(value?.data)) return value.data;
        return [];
    };

    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const needsRefresh = useAppSelector(selectFeedbackNeedsRefresh);

    const { data: leadStatuses, isLoading: statusLoading } = useGetFollowUpStatusQuery()
    const { data: feedbacks, isLoading: feedbacksLoading, refetch: refetchFeedbacks } = useGetFeedbacksQuery()
    const { data: feedbackDetails, isLoading: detailsLoading, refetch: refetchFeedbackDetails } = useGetFeedbackDetailsQuery()

    const pStatusRef = useRef<any[]>([]);
    const feedbackRef = useRef<any[]>([]);
    const feedbackDetailsRef = useRef<any[]>([]);

    useEffect(() => {
        pStatusRef.current = toArray(leadStatuses);
    }, [leadStatuses])

    useEffect(() => {
        feedbackRef.current = toArray(feedbacks);
    }, [feedbacks])

    useEffect(() => {
        feedbackDetailsRef.current = toArray(feedbackDetails);
    }, [feedbackDetails])

    // Handle feedback data refresh when returning from FeedbackDetails page
    useEffect(() => {
        if (needsRefresh) {
            console.log("Refreshing feedback data...");
            // Refetch both feedback queries
            refetchFeedbacks();
            refetchFeedbackDetails();

            // Clear the refresh flag
            dispatch(clearFeedbackRefresh());
        }
    }, [needsRefresh, refetchFeedbacks, refetchFeedbackDetails, dispatch])

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

    const formattedDate = formatDate(date, "dd-MMM-yyyy");
    console.log("formatFollowUpDate - Final formatted date:", formattedDate);

    // ✅ Final backend-expected format
    return formattedDate;
};


    useEffect(() => {
        // Extract followup array from lead data - handle both array and object with followup property
        let followupData: FollowUpItem[];
        
        if (Array.isArray(data)) {
            followupData = data;
        } else if (data && typeof data === 'object' && 'followup' in data) {
            followupData = (data as { followup: FollowUpItem[] }).followup || [];
        } else {
            followupData = [];
        }
        
        const itemsWithIndex = followupData.map((item: FollowUpItem, index: number) => ({
            ...item,
            sno: index + 1,
            last_followup_date: item.last_followup_date ? formatFollowUpDate(item.last_followup_date) : item.last_followup_date,
            // Handle nested objects for display - extract key from nested objects or use direct value
            feedback_key: typeof item.feedback_key === 'object' && item.feedback_key !== null ? item.feedback_key.key : item.feedback_key,
            followup_details_key: typeof item.followup_details_key === 'object' && item.followup_details_key !== null ? item.followup_details_key.key : item.followup_details_key
        }));
        
        setItems(itemsWithIndex);
        console.log("ManageFollowUpTable loaded items:", itemsWithIndex);
        ref.current = itemsWithIndex;
    }, [data])


    const removeTask = (val: any) => {
        const updValue = ref.current.filter(x => x !== val)
        ref.current = updValue;
        setItems(updValue);
        onChange(updValue)
        onTableChange(true);
    }

    const actionBodyTemplate = (value: any) => {
        return <Button style={{ height: '35px', width: '20px', marginLeft: 20 }} type="button" onClick={() => removeTask(value)} className="p-button-rounded p-button-text" icon="pi pi-trash"></Button>
    }

    const getCalendarEditor = ({ row, column, onRowChange, onClose }: any) => {
        return <Calendar style={{ width: '100%' }} className="p-inputtext-sm"
            value={row[column.key]}
            onChange={(e: any) => {
                let clone = { ...row }
                const date = e.value;
                let value = formatDate(date, "dd-MMM-yyyy")
                clone[column.key] = value;
                onRowChange(clone, true)
            }}
            tabIndex={-1} />
    };


    const getOptionsEditor = ({ row, column, onRowChange, onClose }: any) => {
        return <Dropdown autoFocus style={{ width: '100%' }} className="p-inputtext-sm"
            value={row[column.key]}
            optionLabel="name"
            optionValue="key"
            filter
            filterBy={"name"}
            options={pStatusRef.current}
            onChange={(e: any) => {
                let clone = { ...row }
                clone[column.key] = e.value;
                onRowChange(clone, true)
            }}
            tabIndex={-1} />
    };

    const getFeedbackEditor = ({ row, column, onRowChange, onClose }: any) => {
        return <Dropdown style={{ width: '100%' }} className="p-inputtext-sm"
            value={row[column.key]}
            optionLabel="descr"
            optionValue="key"
            filter
            filterBy="descr"
            options={feedbackRef.current && feedbackRef.current.length > 0 ? feedbackRef.current : []}
            onChange={(e: any) => {
                let clone = { ...row }
                clone[column.key] = e.value;
                onRowChange(clone, true)
            }}
            onHide={onClose}
            tabIndex={-1} />
    };

    const getFeedbackDetailsEditor = ({ row, column, onRowChange, onClose }: any) => {
        const feedbackData = feedbackDetailsRef.current && feedbackDetailsRef.current.length > 0 ? feedbackDetailsRef.current : [];
        const filteredFeedbackDetails = row.feedback_key ? feedbackData.filter((detail: any) => detail.feedback_id === row.feedback_key) : feedbackData;
        const currentRoute = (() => {
            const hashPath = window.location.hash?.replace(/^#/, '');
            if (hashPath && hashPath !== '/') {
                return hashPath;
            }
            return window.location.pathname;
        })();
        return <Dropdown style={{ width: '100%' }} className="p-inputtext-sm"
            value={row[column.key]}
            optionLabel="descr"
            optionValue="key"
            filter
            filterBy="descr"
            optionGroupLabel="label"
            optionGroupChildren="items"
            optionGroupTemplate={<div style={{
                cursor: 'pointer',
                textAlign: 'center',
                backgroundColor: '#e6e1e1',
                color: 'black',
                lineHeight: 2.5
            }} onClick={() => navigate('/crm/feedbackdetails', {
                state: {
                    url: currentRoute,
                    data: {
                        leadKey: leadKey ?? null
                    }
                }
            })}>
                -- Create And Edit --
            </div>}
            options={[{ label: 'Add', items: filteredFeedbackDetails }]}
            onChange={(e: any) => {
                let clone = { ...row }
                clone[column.key] = e.value;
                onRowChange(clone, true)
            }}
            onHide={onClose}
            tabIndex={-1} />
    };

    const getTimeEditor = ({ row, column, onRowChange, onClose }: any) => {
        const parseTimeToDate = (timeStr: string) => {
            if (!timeStr) return undefined;
            try {
                // Handle different time string formats
                const timeString = timeStr.trim();

                // Case 1: "hh:mm AM/PM" format (e.g., "02:30 PM")
                if (timeString.includes(' ') && (timeString.includes('AM') || timeString.includes('PM'))) {
                    const parts = timeString.split(' ');
                    if (parts.length !== 2) return undefined;

                    const [time, period] = parts;
                    const [hours, minutes] = time.split(':').map(Number);

                    const date = new Date();
                    let hours24 = hours;

                    if (period === 'PM' && hours !== 12) {
                        hours24 = hours + 12;
                    } else if (period === 'AM' && hours === 12) {
                        hours24 = 0;
                    }

                    date.setHours(hours24, minutes, 0, 0);
                    return date;
                }
                // Case 2: "hh:mm" format (24-hour format)
                else if (timeString.includes(':')) {
                    const [hours, minutes] = timeString.split(':').map(Number);
                    const date = new Date();
                    date.setHours(hours, minutes, 0, 0);
                    return date;
                }
                // Case 3: Try to parse as Date directly
                else {
                    const date = new Date(timeString);
                    if (!isNaN(date.getTime())) {
                        return date;
                    }
                }
            } catch (error) {
                console.error("Error parsing time:", error);
                return undefined;
            }
            return undefined;
        };

        // Use state to track the current time value and prevent loops
        const [currentTime, setCurrentTime] = useState(parseTimeToDate(row[column.key]));

        // Update currentTime when row data changes
        useEffect(() => {
            setCurrentTime(parseTimeToDate(row[column.key]));
        }, [row[column.key]]);

        return <Calendar
            style={{ width: '100%' }}
            className="p-inputtext-sm"
            value={currentTime}
            onChange={(e: any) => {
                const time = e.value;
                if (time) {
                    try {
                        // Format the time in 12-hour format with AM/PM
                        let value = formatDate(time, "hh:mm a")
                        let clone = { ...row }
                        clone[column.key] = value;
                        onRowChange(clone, false) // Don't trigger immediate save
                    } catch (error) {
                        console.error("Error formatting time:", error);
                        // Fallback to default time if formatting fails
                        let clone = { ...row }
                        clone[column.key] = formatDate(new Date(), "hh:mm a");
                        onRowChange(clone, false); // Don't trigger immediate save
                    }
                }
            }}
            onHide={() => {
                // Only trigger save when the calendar is closed
                onClose();
            }}
            timeOnly
            hourFormat="12"
            showTime
            showSeconds={false}
            stepMinute={1}
            stepHour={1}
            tabIndex={-1} />
    };

    const shouldAllowAdd = (items: any[]) => {
        if (items.length === 0) return true
        let temp = items[items.length - 1]
        return temp?.last_followup_date &&
            temp?.followup_time &&
            temp?.follow_notes
    }

    // Render even when `leadStatuses` is empty so users can still add Follow Ups
    // (empty status master data should not block the table UI).
    if (statusLoading || feedbacksLoading || detailsLoading) {
        return null
    }

    const allFeedbacks = toArray(feedbacks).length > 0 ? toArray(feedbacks) : toArray(feedbackRef.current);
    const allDetails = toArray(feedbackDetails).length > 0 ? toArray(feedbackDetails) : toArray(feedbackDetailsRef.current);
    const currentRoute = (() => {
        const hashPath = window.location.hash?.replace(/^#/, '');
        if (hashPath && hashPath !== '/') {
            return hashPath;
        }
        return window.location.pathname;
    })();

    return (
        <EditableTable
            initialRows={items}
            columns={[
                { key: 'sno', name: 'S.No', editor: 'disabled', width: 70 },
                { key: 'last_followup_date', name: 'Date', editor: 'date', required: true, width: 150 },
                { key: 'followup_time', name: 'Time', editor: 'time', required: true, width: 120 },
                {
                    key: 'feedback_key',
                    name: 'Feedback',
                    editor: 'dropdown',
                    width: 200,
                    options: (allFeedbacks || []).map((fb: Feedback) => ({ label: fb?.descr, value: fb?.key })),
                    formatter: ({ row }: any) => {
                        const feedbackId = row?.feedback_key;
                        const match = (allFeedbacks || []).find((fb: Feedback) => fb.key === feedbackId);
                        return match?.descr || '';
                    }
                },
                {
                    key: 'followup_details_key',
                    name: 'Feedback Details',
                    editor: 'dropdown',
                    width: 520,
                    options: (row: any) => {
                        const feedbackId = row?.feedback_key;
                        const filteredDetails = (allDetails || []).filter((fd: any) => {
                            if (feedbackId === null || feedbackId === undefined || feedbackId === '') return false;
                            return fd?.feedback_id === feedbackId;
                        });
                        return [
                            {
                                label: '-- Create And Edit --',
                                value: CREATE_AND_EDIT_OPTION,
                                onSelect: ({ onClose }: any) => {
                                    onClose(true);
                                    navigate('/crm/feedbackdetails', {
                                        state: {
                                            url: currentRoute,
                                            data: {
                                                leadKey: leadKey ?? null
                                            }
                                        }
                                    });
                                }
                            },
                            ...filteredDetails.map((fd: any) => ({ label: fd?.descr, value: fd?.key }))
                        ];
                    },
                    formatter: ({ row }: any) => {
                        const feedbackId = row?.feedback_key;
                        const detailId = row?.followup_details_key;
                        if (detailId === CREATE_AND_EDIT_OPTION) return '';
                        const match = (allDetails || []).find((fd: any) =>
                            fd?.key === detailId &&
                            fd?.feedback_id === feedbackId
                        );
                        return match?.descr || '';
                    }
                },
                { key: 'follow_notes', name: 'Remarks', editor: 'text', required: false, width: 420 },
            ] as any}
            allowAddRow
            allowDeleteRow
            showRowDelete
            deleteColumnPosition="start"
            deleteButtonVariant="prime"
            disableAddWhenInvalid
            showInlineAddRow
            inlineAddRowLabel="Add"
            newRowDefaults={{
                last_followup_date: formatDate(new Date(), "dd-MMM-yyyy"),
                followup_time: formatDate(new Date(), "hh:mm a"),
            }}
            onTableChange={(value: boolean) => onTableChange(value)}
            onChange={async (rows: any[]) => {
                const parseAndFormatDate = (dateStr: string) => {
                    if (!dateStr) return dateStr;
                    const parts = dateStr.split('-');
                    if (parts.length === 3 && parts[0].length === 4) {
                        const year = parseInt(parts[0]);
                        const month = parseInt(parts[1]) - 1;
                        const day = parseInt(parts[2]);
                        const date = new Date(year, month, day);
                        return formatDate(date, "dd-MMM-yyyy");
                    }
                    return dateStr;
                };

                const temp = (rows || []).map((row, index) => ({
                    ...row,
                    sno: index + 1,
                    last_followup_date: row.last_followup_date ? parseAndFormatDate(row.last_followup_date) : row.last_followup_date
                })).map((row) => {
                    const hasFeedback = row?.feedback_key !== null && row?.feedback_key !== undefined && row?.feedback_key !== '';
                    const selectedDetail = (allDetails || []).find((fd: any) => fd?.key === row?.followup_details_key);
                    const detailMatchesFeedback = hasFeedback && selectedDetail?.feedback_id === row?.feedback_key;
                    const isCreateAndEditSelection = row?.followup_details_key === CREATE_AND_EDIT_OPTION;

                    return {
                        ...row,
                        followup_details_key: detailMatchesFeedback && !isCreateAndEditSelection ? row?.followup_details_key : undefined
                    };
                });

                ref.current = temp;
                await setItems(temp);
                onChange(temp);
                onTableChange(true);
            }}
        />
    );
}

export default ManageFollowUpTable;
