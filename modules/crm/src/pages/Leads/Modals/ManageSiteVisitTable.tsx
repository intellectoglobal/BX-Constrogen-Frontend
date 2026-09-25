import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Datacolumn, EditableTable, ListLayout } from '@igblsln/control';
import { useGetLeadStatusQuery, useGetSiteVisitStatusQuery, useGetLeadQuery } from '../api';
import { formatDate } from '@igblsln/store';


type Props = {
    data: any[];
    isLoading?: boolean;
    onChange?: Function;
    onTableChange?: Function;
    leadId?: number;
    leadFormData?: {
        lead_src_ctgry_key?: any;
        lead_src_key?: any;
        project_pref_keys?: any[];
        leadSourceCategories?: any[];
        leadSources?: any[];
        projects?: any[];
    };
}

const ManageSiteVisitTable = ({ data, isLoading, onChange = () => { }, onTableChange = () => { }, leadId, leadFormData }: Props) => {
    // If leadFormData is provided, use it; otherwise, use leadData from API
    const [items, setItems] = useState<any[]>([])
    const ref = useRef(items);
    const pStatusRef = useRef<any[]>([]);
    const toArray = (value: any): any[] => {
        if (Array.isArray(value)) return value;
        if (Array.isArray(value?.results)) return value.results;
        if (Array.isArray(value?.items)) return value.items;
        if (Array.isArray(value?.data)) return value.data;
        return [];
    };

    const { data: leadStatuses } = useGetSiteVisitStatusQuery()
    const { data: leadData } = useGetLeadQuery(leadId || 0, { skip: !leadId })

    useEffect(() => {
        pStatusRef.current = toArray(leadStatuses);
    }, [leadStatuses])

    const getLeadProjectPreference = () => {
        const leadProjectPrefs = leadData?.project_pref_keys;
        if (!Array.isArray(leadProjectPrefs) || leadProjectPrefs.length === 0) {
            return '';
        }

        return leadProjectPrefs
            .map((pref: any) => pref?.descr)
            .filter(Boolean)
            .join(', ');
    };

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

    if (!date) return dateStr;

    return formatDate(date, "dd-MMM-yyyy");
};


    useEffect(() => {
        const itemsWithIndex = data?.map((item, index) => ({
            ...item,
            sno: index + 1,
            visit_date: item.visit_date ? formatVisitDate(item.visit_date) : item.visit_date
        })) || [];
        setItems(itemsWithIndex);
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
        return temp?.visit_date
    }

    const statusOptions = (toArray(leadStatuses).length > 0 ? toArray(leadStatuses) : toArray(pStatusRef.current))
        .map((s: any) => ({ label: s?.name, value: s?.key }));

    if(!statusOptions?.length){
        return null
    }

    return (
        <EditableTable
            initialRows={items}
            columns={[
                { key: 'sno', name: 'S.No', editor: 'disabled', width: 70 },
                { key: 'visit_date', name: 'Date', editor: 'date', required: true, width: 150 },
                { key: 'visit_time', name: 'Time', editor: 'time', required: true, width: 120 },
                {
                    key: 'property_preference',
                    name: 'Property Preference',
                    editor: 'disabled',
                    width: 420,
                    formatter: () => getLeadProjectPreference()
                },
                {
                    key: 'source',
                    name: 'Lead Source',
                    editor: 'disabled',
                    width: 220,
                    formatter: ({ row }: any) => {
                        if (!row?.visit_date) {
                            if (leadFormData?.lead_src_key && leadFormData?.leadSources) {
                                const source = leadFormData.leadSources.find(s => s.key === leadFormData.lead_src_key);
                                return source?.descr || '';
                            }
                            return leadData?.source || '';
                        }

                        if (leadFormData?.lead_src_key && leadFormData?.leadSources) {
                            const source = leadFormData.leadSources.find(s => s.key === leadFormData.lead_src_key);
                            return source?.descr || '';
                        }
                        return row?.source || (items.length > 1 ? items[0]?.source : '') || leadData?.source || '';
                    }
                },
                {
                    key: 'source_category',
                    name: 'Source Category',
                    editor: 'disabled',
                    width: 260,
                    formatter: ({ row }: any) => {
                        if (!row?.visit_date) {
                            if (leadFormData?.lead_src_ctgry_key && leadFormData?.leadSourceCategories) {
                                const category = leadFormData.leadSourceCategories.find(c => c.key === leadFormData.lead_src_ctgry_key);
                                return category?.descr || '';
                            }
                            return leadData?.source_category || '';
                        }

                        if (leadFormData?.lead_src_ctgry_key && leadFormData?.leadSourceCategories) {
                            const category = leadFormData.leadSourceCategories.find(c => c.key === leadFormData.lead_src_ctgry_key);
                            return category?.descr || '';
                        }
                        return row?.source_category || (items.length > 1 ? items[0]?.source_category : '') || leadData?.source_category || '';
                    }
                },
                {
                    key: 'status_key',
                    name: 'Status',
                    editor: 'dropdown',
                    required: true,
                    width: 220,
                    options: statusOptions,
                    formatter: ({ row }: any) => {
                        const id = row?.status_key;
                        const match = (statusOptions || []).find((s: any) => s?.value === id);
                        return match?.label || '';
                    }
                },
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
                visit_date: formatDate(new Date(), "dd-MMM-yyyy"),
                visit_time: formatDate(new Date(), "hh:mm a")
            }}
            onTableChange={(value: boolean) => onTableChange(value)}
            onChange={async (rows: any[]) => {
                const temp = (rows || []).map((row, index) => ({ ...row, sno: index + 1 }));
                ref.current = temp;
                await setItems(temp);
                onChange(temp)
                onTableChange(true);
            }}
        />
    );
}

export default ManageSiteVisitTable;
