import React, { useEffect, useState, useRef } from 'react'
import { UseFormRegister, FieldErrors, FieldValues, useWatch } from 'react-hook-form';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { MultiSelect } from 'primereact/multiselect';
import { Calendar } from 'primereact/calendar';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { useNavigate } from 'react-router-dom';
import { ManageLayout, useToast, FormField } from '@igblsln/control';
import { useGetLeadQuery, useAddLeadMutation, useUpdateLeadMutation, useGetLeadStatusQuery, useLazyCheckContact1ExistsQuery, useGetLeadProjectsQuery } from '../api';
import { useListBudgetRangesQuery } from '../../BudgetRanges/budgetRangesApi';
import { useListLocationsQuery } from '../../Locations/locationsApi';
import { useListOccupanciesQuery } from '../../Occupancies/occupanciesApi';
import { useListOccupancySubtypesQuery } from '../../OccupancySubtypes/occupancySubtypesApi';
import { useListFollowUpStagesQuery } from '../../FollowupStages/followupStagesApi';
import { useGetLeadSourcesQuery } from '../../LeadSource/leadSourceApi';
import { useGetLeadsourceCategoriesQuery } from '../../LeadSourceCategory/leadSourceCategoryApi';
import { useListPropertyInterestsQuery } from '../../PropertyInterests/propertyInterestsApi';
import { useListFloorsQuery } from '../../Floors/floorsApi';
import { useListFacingsQuery } from '../../Facings/facingsApi';
import { AFTER_API_TIME, convertDateValue, getClientProps, setPromptNavigate, useGetNextDocNoQuery, selectLeadFormData, selectSelectedLocationPreference, setLeadFormData, clearLeadFormData, formatDate } from '@igblsln/store'
import { useDispatch, useSelector } from 'react-redux'


type Props = {
  displayModal: boolean,
  customDiscard: any,
  id?: any
}

export default function ManageModal({ displayModal, customDiscard, id }: Props) {
  const { showSuccess, showError } = useToast()
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showingToast, setShowingToast] = useState(false)
  const savedFormData = useSelector(selectLeadFormData);
  const savedSelectedLocationPreference = useSelector(selectSelectedLocationPreference);
  const [formKey, setFormKey] = useState(0);
  const manageLayoutRef = useRef<any>();
  const hasInitializedRef = useRef(false);
  const contactCheckTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastDuplicateNotifiedRef = useRef('');

  const isNew = isNaN(id) || id <= 0;

  // Reset initialization flag when modal opens
  useEffect(() => {
    if (displayModal) {
      hasInitializedRef.current = false;
    }
  }, [displayModal]);


  const clientProps = getClientProps();

  // Fetch data from APIs
  const { data: budgetRanges } = useListBudgetRangesQuery();
  const { data: locations } = useListLocationsQuery();
  const { data: occupancies } = useListOccupanciesQuery();
  const { data: followUpStages } = useListFollowUpStagesQuery();
  const { data: leadSources } = useGetLeadSourcesQuery();
  const { data: leadSourceCategories } = useGetLeadsourceCategoriesQuery();
  const { data: propertyInterests, isLoading: isPropertyInterestsLoading } = useListPropertyInterestsQuery();
  const { data: floors } = useListFloorsQuery();
  const { data: facings } = useListFacingsQuery();
  const { data: occupancySubtypes } = useListOccupancySubtypesQuery();


  
  const [formData, setFormData] = useState<any>({
    lead_name: '',
    email: '',
    enquiry_date: '',
    contact_1: '',
    contact_2: '',
    budget: '',
    budget_rng_key: '',
    lead_src_key: '',
    property_interest_key: '',
    status_key: isNew ? 6 : '',
    floor_pref_key: '',
    facing_pref_keys: [],
    occupancies_key:'',
    follow_upstg_key: '',
    occup_subtype_key: '',
    location_pref_keys: [],
    project_pref_keys: [],
  })

  const BudgetRangeField = ({ control, value, onChange, ...props }: {control: any, value?: string | number, onChange: (event: {target: {value: string | number}}) => void, [key: string]: any}) => {
    const safeValue = value ?? null;
    const isCustom = typeof safeValue === 'string' && safeValue !== '' && budgetRanges && !budgetRanges.some(item => item.key.toString() === safeValue.toString());

    const budgetRangeOptions = budgetRanges?.map(item => ({
      label: item.descr,
      value: item.key
    })) || [];

    const handleDropdownChange = (e: {value: number}) => {
      const selectedOption = budgetRangeOptions.find(option => option.value === e.value);
      if (selectedOption?.label === 'Others') {
        // Switch to custom input
        onChange({target: {value: 'others'}});
      } else {
        onChange({target: {value: e.value}});
      }
    };

    const handleInputChange = (e: {target: {value: string}}) => {
      onChange({target: {value: e.target.value}});
    };

    if (isCustom) {
      return (
        <InputText
          value={safeValue}
          onChange={handleInputChange}
          placeholder="Enter Budget Range"
          maxLength={100}
          className="w-full"
          {...props}
        />
      );
    }

    return (
      <Dropdown
        value={safeValue}
        onChange={handleDropdownChange}
        showClear
        filter
        filterBy="label"
        placeholder="Select Budget Range"
        optionGroupLabel="label"
        optionGroupChildren="items"
        optionGroupTemplate={
          <div
            style={{
              cursor: 'pointer',
              textAlign: 'center',
              backgroundColor: '#e6e1e1',
              color: 'black',
              lineHeight: 2.5
            }}
            onClick={() => {
              const currentFormData = manageLayoutRef.current?.getValues?.() || formData;
              dispatch(setLeadFormData({
                leadFormData: currentFormData,
                selectedLocationPreference: currentFormData.location_pref_keys || []
              }));
              navigate('/crm/budgets', {
                state: {
                  url: window.location.pathname,
                  data: null
                }
              });
            }}
          >
            -- Create And Edit --
          </div>
        }
        options={[
          {
            label: 'Add',
            items: budgetRangeOptions
          }
        ]}
        optionLabel="label"
        optionValue="value"
        className="w-full"
        {...props}
      />
    );
  };


  const OccupancyField = ({ control, value, onChange, ...props }: {control: any, value?: string, onChange: (event: {target: {value: string}}) => void, [key: string]: any}) => {
    const occupancyOptions = occupancies?.map(item => ({
      label: item.descr,
      value: item.key
    })) || [];

    return (
      <Dropdown
        value={value}
        onChange={(e) => onChange({target: {value: e.value}})}
        showClear
        filter
        filterBy="label"
        placeholder="Select Occupancy"
        optionGroupLabel="label"
        optionGroupChildren="items"
        optionGroupTemplate={
          <div
            style={{
              cursor: 'pointer',
              textAlign: 'center',
              backgroundColor: '#e6e1e1',
              color: 'black',
              lineHeight: 2.5
            }}
            onClick={() => {
              const currentFormData = manageLayoutRef.current?.getValues?.() || formData;
              dispatch(setLeadFormData({
                leadFormData: currentFormData,
                selectedLocationPreference: currentFormData.location_pref_keys || []
              }));
              navigate('/crm/occupancies', {
                state: {
                  url: window.location.pathname,
                  data: null
                }
              });
            }}
          >
            -- Create And Edit --
          </div>
        }
        options={[
          {
            label: 'Add',
            items: occupancyOptions
          }
        ]}
        optionLabel="label"
        optionValue="value"
        className="w-full"
        {...props}
      />
    );
  };

  const OccupancySubtypeField = ({ control, value, onChange, ...props }: {control: any, value?: string, onChange: (event: {target: {value: string}}) => void, [key: string]: any}) => {
    const occupancyKey = useWatch({ control, name: 'occupancies_key' });

    // Filter subtypes based on selected occupancy key
    const filteredSubtypes = occupancySubtypes?.filter((subtype: any) => subtype.occup_id === occupancyKey) || [];

    return (
      <Dropdown
        value={value}
        onChange={(e) => onChange({target: {value: e.value}})}
        showClear
        optionLabel="descr"
        optionValue="key"
        filter
        filterBy="descr"
        placeholder={occupancyKey ? "Select Occupancy Subtype" : "Select Occupancy first"}
        disabled={!occupancyKey}
        optionGroupLabel="label"
        optionGroupChildren="items"
        optionGroupTemplate={
          <div
            style={{
              cursor: 'pointer',
              textAlign: 'center',
              backgroundColor: '#e6e1e1',
              color: 'black',
              lineHeight: 2.5
            }}
            onClick={() => {
              const currentFormData = manageLayoutRef.current?.getValues?.() || formData;
              dispatch(setLeadFormData({
                leadFormData: currentFormData,
                selectedLocationPreference: currentFormData.location_pref_keys || []
              }));
              navigate('/crm/occupancysubtypes', {
                state: {
                  url: window.location.pathname,
                  data: null
                }
              });
            }}
          >
            -- Create And Edit --
          </div>
        }
        options={[
          {
            label: 'Add',
            items: filteredSubtypes
          }
        ]}
        {...props}
      />
    );
  };

  const LeadSourceField = ({ control, value, onChange, ...props }: {control: any, value?: string, onChange: (event: {target: {value: string}}) => void, [key: string]: any}) => {
    const category = useWatch({ control, name: 'lead_src_ctgry_key' });
    const prevCategoryRef = useRef<string | undefined>(category); // Initialize with current category value

    useEffect(() => {
      // Reset lead source only when category actually changes (not on initial mount)
      if (prevCategoryRef.current !== undefined && prevCategoryRef.current !== category) {
        onChange({ target: { value: '' } });
      }
      prevCategoryRef.current = category;
    }, [category, onChange]);

    if (!category) {
      return (
        <Dropdown
          value={value}
          disabled
          placeholder="Select Lead Source Category first"
          {...props}
        />
      );
    }

    // Filter sources strictly by category_id matching selected category key
    const filteredSources = leadSources?.filter((source: any) => source.category_id == category) || [];

    return (
      <Dropdown
        value={value}
        onChange={(e) => onChange({ target: { value: e.value } })}
        showClear
        optionLabel="descr"
        optionValue="key"
        filter
        filterBy="descr"
        placeholder="Select Lead Source"
        optionGroupLabel="label"
        optionGroupChildren="items"
        optionGroupTemplate={
          <div
            style={{
              cursor: 'pointer',
              textAlign: 'center',
              backgroundColor: '#e6e1e1',
              color: 'black',
              lineHeight: 2.5
            }}
            onClick={() => {
              const currentFormData = manageLayoutRef.current?.getValues?.() || formData;
              dispatch(setLeadFormData({
                leadFormData: currentFormData,
                selectedLocationPreference: currentFormData.location_pref_keys || []
              }));
              navigate('/crm/leadsource', {
                state: {
                  url: window.location.pathname,
                  data: null
                }
              });
            }}
          >
            -- Create And Edit --
          </div>
        }
        options={[
          {
            label: 'Add',
            items: filteredSources || []
          }
        ]}
        {...props}
      />
    );
  };

  const ProjectField = ({ control, value, onChange, ...props }: {control: any, value?: any[], onChange: (event: {target: {value: any[]}}) => void, [key: string]: any}) => {
    const { className, ...restProps } = props;
    return (
      <MultiSelect
        value={value}
        onChange={(e) => onChange({target: {value: e.value}})}
        optionLabel="name"
        optionValue="key"
        display="chip"
        disabled={isAdding || isUpdating}
        placeholder="Select Property Preferences"
        className={`w-full multiselect-chip-scroll${className ? ` ${className}` : ''}`}
        showClear
        filter
        filterBy="name"
        options={projects || []}
        {...restProps}
      />
    );
  };

  // const FollowUpStageField = ({ control, value, onChange, setValue, ...props }: {control: any, value?: string, onChange: (event: {target: {value: string}}) => void, setValue?: any, [key: string]: any}) => {
  //   control.register('junkLeadType');
  //   const junkLeadType = useWatch({ control, name: 'junkLeadType' });

  //   const followUpStageOptions = followUpStages?.map(stage => ({
  //     label: stage.descr,
  //     value: stage.key
  //   })) || [];

  //   const handleFollowUpStageChange = (e: {value: string}) => {
  //     onChange({target: {value: e.value}});
  //     // Clear junkLeadType if not Junk Leads
  //     if (e.value !== 'Junk Leads') {
  //       setValue?.('junkLeadType', '');
  //     }
  //   };

  //   const handleJunkLeadTypeChange = (e: {value: string}) => {
  //     setValue?.('junkLeadType', e.value);
  //   };

  //   return (
  //     <div className="flex flex-column gap-2">
  //       <Dropdown
  //         value={value}
  //         onChange={handleFollowUpStageChange}
  //         showClear
  //         placeholder="Select Follow-Up Stage"
  //         optionGroupLabel="label"
  //         optionGroupChildren="items"
  //         optionGroupTemplate={
  //           <div
  //             style={{
  //               cursor: 'pointer',
  //               textAlign: 'center',
  //               backgroundColor: '#e6e1e1',
  //               color: 'black',
  //               lineHeight: 2.5
  //             }}
  //             onClick={() => {
  //               const currentFormData = manageLayoutRef.current?.getValues?.() || formData;
  //               dispatch(setLeadFormData({
  //                 leadFormData: currentFormData,
  //                 selectedLocationPreference: currentFormData.location_pref_keys || []
  //               }));
  //               navigate('/crm/followupstages', {
  //                 state: {
  //                   url: window.location.pathname,
  //                   data: null
  //                 }
  //               });
  //             }}
  //           >
  //             -- Create And Edit --
  //           </div>
  //         }
  //         options={[
  //           {
  //             label: 'Add',
  //             items: followUpStageOptions
  //           }
  //         ]}
  //         optionLabel="label"
  //         optionValue="value"
  //         className="w-full"
  //         {...props}
  //       />

  //       {value === 'Junk Leads' && (
  //         <Dropdown
  //           value={junkLeadType}
  //           onChange={handleJunkLeadTypeChange}
  //           options={[
  //             { label: "Unanswered Calls", value: "Unanswered Calls" },
  //             { label: "Irrelevant Calls", value: "Irrelevant Calls" }
  //           ]}
  //           optionLabel="label"
  //           optionValue="value"
  //           placeholder="Select Junk Lead Type"
  //           showClear
  //           className="w-full"
  //         />
  //       )}
  //     </div>
  //   );
  // };

  const PhoneInput = ({ value, onChange, ...props }: {value?: string, onChange: (event: {target: {value: string}}) => void, [key: string]: any}) => {
    const [countryCode, setCountryCode] = useState('+91');
    const [phone, setPhone] = useState('');
    const { onBlur, ...inputProps } = props;
    const getMaxDigits = (code: string) => (code === '+91' || code === '+1' ? 10 : 25);

    useEffect(() => {
      if (value) {
        if (value.startsWith('+91')) {
          setCountryCode('+91');
          setPhone(formatPhone(value.slice(3)));
        } else if (value.startsWith('+1')) {
          setCountryCode('+1');
          setPhone(formatPhone(value.slice(2)));
        } else {
          setCountryCode('+91');
          setPhone(formatPhone(value));
        }
      }
    }, [value]);

    const formatPhone = (digits: string) => {
      digits = digits.replace(/\s/g, '').slice(0, getMaxDigits(countryCode));
      return digits.replace(/(.{5})/g, '$1 ').trim();
    };

    const handlePhoneChange = (e: {target: {value: string}}) => {
      const input = e.target.value.replace(/\D/g, '');
      const digits = input.slice(0, getMaxDigits(countryCode));
      const formatted = formatPhone(digits);
      setPhone(formatted);
      onChange({target: {value: countryCode + digits}});
    };

    const handleCountryChange = (e: {value: string}) => {
      const newCode = e.value;
      setCountryCode(newCode);
      const digits = phone.replace(/\s/g, '').slice(0, getMaxDigits(newCode));
      setPhone(formatPhone(digits));
      onChange({target: {value: newCode + digits}});
    };

    return (
      <div className="flex align-items-center">
        <Dropdown value={countryCode} onChange={handleCountryChange} options={[{label:'+91',value:'+91'},{label:'+1',value:'+1'}]} optionLabel="label" optionValue="value" style={{width:'90px'}} className="mr-2" />
        <InputText {...inputProps} value={phone} onChange={handlePhoneChange} onBlur={onBlur} type="tel" />
      </div>
    );
  };

  const BudgetInput = ({ value, onChange, ...props }: {value?: string, onChange: (event: {target: {value: string}}) => void, [key: string]: any}) => {
    const [displayValue, setDisplayValue] = useState('');

    useEffect(() => {
      if (value) {
        // Format the numeric value with Indian formatting for display
        const numericValue = Number(value.toString().replace(/,/g, ''));
        const budgetformated = numericValue.toLocaleString('en-IN');
        setDisplayValue(budgetformated);
      } else {
        setDisplayValue('');
      }
    }, [value]);

    const handleChange = (e: {target: {value: string}}) => {
      // Remove commas and non-numeric characters except decimal point
      const rawValue = e.target.value.replace(/,/g, '').replace(/[^0-9]/g, '');
      const numericValue = Number(rawValue);
      const formatted = numericValue.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2});
      setDisplayValue(formatted);
      // Send the clean numeric value to the form
      onChange({target: {value: rawValue}});
    };

    return (
      <InputText
        value={displayValue}
        onChange={handleChange}
        {...props}
      />
    );
  };

  const { data: leadStatuses } = useGetLeadStatusQuery()
  const { data: projects } = useGetLeadProjectsQuery()



  const { data, isLoading } = useGetLeadQuery(id, {
    skip: isNew
  })

  useEffect(() => {
    if (savedFormData && !hasInitializedRef.current) {
      setFormData(savedFormData);
      setFormKey(prev => prev + 1); // Force remount to reload form with saved data
      hasInitializedRef.current = true; // Mark as initialized
    } else if (data) {
      const selectedPrefs = data.location_pref_keys || [];
      const selectedKeys = selectedPrefs.map((loc: any) => loc.key);
      const selectedProjectPrefs = data.project_pref_keys || [];
      const selectedProjectKeys = selectedProjectPrefs
        .map((proj: any) => {
          if (typeof proj === 'object' && proj !== null) {
            if (proj.key !== undefined) return proj.key;
            if (proj.project_pref_key && typeof proj.project_pref_key === 'object') return proj.project_pref_key.key;
            if (proj.project_pref_key !== undefined) return proj.project_pref_key;
          }
          return proj;
        })
        .filter((key: any) => key !== undefined && key !== null);
      const selectedFacingPrefs = data.facing_pref_keys || [];
      const selectedFacingKeys = selectedFacingPrefs.map((facing: any) => facing.key);
      setFormData({
        ...data,
        enquiry_date: data.enquiry_date ? new Date(data.enquiry_date) : new Date(),
        location_pref_keys: selectedKeys,
        project_pref_keys: selectedProjectKeys,
        facing_pref_keys: selectedFacingKeys
      });
      setFormKey(prev => prev + 1); // Force remount with API data
      hasInitializedRef.current = true; // Mark as initialized
    } else if (!hasInitializedRef.current) {
      setFormData({
        ...clientProps,
        enquiry_date: formatDate(new Date(), "dd-MMM-yyyy"),
        location_pref_keys: [],
        project_pref_keys: []
      });
      hasInitializedRef.current = true; // Mark as initialized
    }
  }, [data, locations, savedFormData, savedSelectedLocationPreference, isNew])


  const [updateLead, { isLoading: isUpdating }] = useUpdateLeadMutation()
  const [addLead, { isLoading: isAdding }] = useAddLeadMutation()
  const [checkContact1Exists] = useLazyCheckContact1ExistsQuery()

  const { data: docId, isLoading: isDocIdLoading } = useGetNextDocNoQuery("LD", {
    skip: !isNew
  })

  const normalizeContact = (value?: string) => (value || '').replace(/\s/g, '').trim();
  const getContactLocalDigits = (contact: string) => {
    if (contact.startsWith('+91')) return contact.slice(3).replace(/\D/g, '');
    if (contact.startsWith('+1')) return contact.slice(2).replace(/\D/g, '');
    return contact.replace(/\D/g, '');
  };
  const isCompleteContact = (rawContact?: string) => {
    const contact = normalizeContact(rawContact);
    if (!contact) return false;
    const digits = getContactLocalDigits(contact);
    if (contact.startsWith('+91') || contact.startsWith('+1')) {
      return digits.length === 10;
    }
    return digits.length >= 10;
  };

  const getExcludeLeadKey = () => {
    const key = Number(id);
    return !isNew && !Number.isNaN(key) && key > 0 ? key : undefined;
  };

  const runContact1DuplicateCheck = async (
    rawContact: string,
    options?: { showToast?: boolean }
  ) => {
    const contact = normalizeContact(rawContact);
    if (!contact || !isCompleteContact(contact)) {
      lastDuplicateNotifiedRef.current = '';
      return false;
    }

    try {
      const response = await checkContact1Exists({
        contact_1: contact,
        exclude_lead_key: getExcludeLeadKey()
      }).unwrap();

      if (response?.exists) {
        if (options?.showToast && lastDuplicateNotifiedRef.current !== contact) {
          showError('Duplicate Contact', response?.message || 'Contact number already exists');
          lastDuplicateNotifiedRef.current = contact;
        }
        return true;
      }

      lastDuplicateNotifiedRef.current = '';
      return false;
    } catch (error: any) {
      const duplicateError = error?.data?.data?.contact_1?.[0];
      if (duplicateError) {
        if (options?.showToast && lastDuplicateNotifiedRef.current !== contact) {
          showError('Duplicate Contact', duplicateError);
          lastDuplicateNotifiedRef.current = contact;
        }
        return true;
      }
      if (options?.showToast) {
        showError('Duplicate Check Failed', error?.data?.detail || 'Unable to validate contact number right now');
      }
      return false;
    }
  };

  const scheduleContact1DuplicateCheck = (rawContact: string) => {
    if (contactCheckTimeoutRef.current) {
      clearTimeout(contactCheckTimeoutRef.current);
    }

    const contact = normalizeContact(rawContact);
    if (!contact || !isCompleteContact(contact)) {
      lastDuplicateNotifiedRef.current = '';
      return;
    }

    contactCheckTimeoutRef.current = setTimeout(() => {
      void runContact1DuplicateCheck(contact, { showToast: true });
    }, 450);
  };

  useEffect(() => {
    return () => {
      if (contactCheckTimeoutRef.current) {
        clearTimeout(contactCheckTimeoutRef.current);
      }
    };
  }, []);

  const onSubmit = async (values: any) => {
    console.log("onSubmit triggered", values);
    try {
      let resp: any;
      const hasDuplicateContact = await runContact1DuplicateCheck(values?.contact_1, { showToast: true });
      if (hasDuplicateContact) {
        return;
      }

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
        budget: values.budget
          ? Number(values.budget.toString().replace(/,/g, ''))
          : null,
        enquiry_date: values.enquiry_date
          ? convertDateForAPI(values.enquiry_date)
          : null,
        lead_no: docId?.next_doc_id,
        location_pref_keys: values.location_pref_keys?.map((key: any) => ({
          location_pref_key: key
        })),
        project_pref_keys: values.project_pref_keys?.map((key: any) => ({
          project_pref_key: key
        })),
        facing_pref_keys: values.facing_pref_keys?.map((key: any) => ({
          facing_pref_key: typeof key === 'object' && key !== null ? key.key : key
        }))
      }
      console.log("Request body:", body);
      if (isNew) {
        console.log("Making addLead request");
        resp = await addLead({ ...body, ...clientProps }).unwrap();
      } else {
        console.log("Making updateLead request");
        resp = await updateLead({ ...body, ...clientProps }).unwrap();
      }
      console.log("API response:", resp);
      showSuccess('Success', resp.detail);
      setShowingToast(true);
      dispatch(setPromptNavigate({ promptNavigate: false }))
      dispatch(clearLeadFormData());
      setTimeout(() => {
        customDiscard()
      }, AFTER_API_TIME);
    } catch (error: any) {
      console.error("onSubmit error:", error);
      const contact1Error = error?.data?.data?.contact_1?.[0];
      showError('An error occurred', contact1Error || error?.data?.detail || "We couldn't save your post, try again!");
    }
  }


  const renderForm = (control: any, _register: UseFormRegister<FieldValues>, errors: FieldErrors<FieldValues>, getValues?: any, setValue?: any) => {
    const Contact1PhoneInput = ({ value, onChange, onBlur, ...props }: {value?: string, onChange: (event: {target: {value: string}}) => void, onBlur?: (event: any) => void, [key: string]: any}) => {
      const handleChange = (event: {target: {value: string}}) => {
        onChange(event);
        scheduleContact1DuplicateCheck(event?.target?.value || '');
      };

      const handleBlur = (event: any) => {
        onBlur?.(event);
        if (contactCheckTimeoutRef.current) {
          clearTimeout(contactCheckTimeoutRef.current);
        }
        const currentFormValues = manageLayoutRef.current?.getValues?.() || {};
        const contactFromForm = currentFormValues?.contact_1 || value || '';
        void runContact1DuplicateCheck(contactFromForm, { showToast: true });
      };

      return <PhoneInput {...props} value={value} onChange={handleChange} onBlur={handleBlur} />;
    };

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
              maxLength: 25
            }
          }} />

          <FormField label="Primary Contact" name="contact_1"
          leftSpan={4}
          rightSpan={6}
          required
          className="col-12 md:col-6"
          control={control} errors={errors} formItem={{
            component: Contact1PhoneInput,
            componentProps: {}
          }} />

        <FormField label="Enquiry Date" name="enquiry_date" className="col-10 md:col-6" useExplicit control={control} errors={errors}
          convertValue={convertDateValue}
          required={"Select a Date"}
          leftSpan={4}
          rightSpan={6}
          formItem={{
            component: Calendar,
            componentProps: {
              showIcon: true,
              dateFormat: "dd-M-yy"
            }
          }} />

          <FormField label="Secondary Contact" name="contact_2"
          leftSpan={4}
          rightSpan={6}
          className="col-12 md:col-6"
          control={control} errors={errors} formItem={{
            component: PhoneInput,
            componentProps: {}
          }} />
        
          <FormField label="Email" name="email"
          leftSpan={4}
          rightSpan={6}
          // required
          className="col-12 md:col-6"
          control={control} errors={errors} formItem={{
            component: InputText,
            componentProps: {
              maxLength: 60,
              type: 'email'
            }
          }} />

        <FormField label="Budget" name="budget"
          leftSpan={4}
          rightSpan={6}
          // required
          className="col-12 md:col-6"
          control={control} errors={errors} formItem={{
            component: BudgetInput,
            componentProps: {
              maxLength: 25
            }
          }} />

        <FormField label="Budget Range" name="budget_rng_key"
          leftSpan={4}
          rightSpan={6}
          required
          className="col-12 md:col-6"
          control={control} errors={errors} formItem={{
            component: BudgetRangeField,
            componentProps: { control }
          }} />

        <FormField label="Lead Source Category" name="lead_src_ctgry_key"
          leftSpan={4}
          rightSpan={6}
          required
          className="col-12 md:col-6"
          control={control} errors={errors} formItem={{
            component: Dropdown,
            componentProps: {
              showClear: true,
              optionLabel: "descr",
              optionValue: "key",
              filter: true,
              filterBy: "descr",
              optionGroupLabel: "label",
              optionGroupChildren: "items",
              optionGroupTemplate: (
                <div
                  style={{
                    cursor: 'pointer',
                    textAlign: 'center',
                    backgroundColor: '#e6e1e1',
                    color: 'black',
                    lineHeight: 2.5
                  }}
              onClick={() => {
                const currentFormData = manageLayoutRef.current?.getValues?.() || formData;
                dispatch(setLeadFormData({
                  leadFormData: currentFormData,
                  selectedLocationPreference: currentFormData.location_pref_keys || []
                }));
                navigate('/crm/leadsourcecategory', {
                  state: {
                    url: window.location.pathname,
                    data: null
                  }
                });
              }}
                >
                  -- Create And Edit --
                </div>
              ),
              options: [
                {
                  label: 'Add',
                  items: leadSourceCategories || []
                }
              ]
            }
          }} />

        <FormField label="Property Interest" name="property_interest_key"
          leftSpan={4}
          rightSpan={6}
          // required
          className="col-12 md:col-6"
          control={control} errors={errors} formItem={{
            component: Dropdown,
            componentProps: {
              showClear: true,
              optionLabel: "descr",
              optionValue: "key",
              filter: true,
              filterBy: "descr",
              placeholder: "Select Property Interest",
              optionGroupLabel: "label",
              optionGroupChildren: "items",
              optionGroupTemplate: (
                <div
                  style={{
                    cursor: 'pointer',
                    textAlign: 'center',
                    backgroundColor: '#e6e1e1',
                    color: 'black',
                    lineHeight: 2.5
                  }}
                      onClick={() => {
                        const currentFormData = manageLayoutRef.current?.getValues?.() || formData;
                        dispatch(setLeadFormData({
                          leadFormData: currentFormData,
                          selectedLocationPreference: currentFormData.location_pref_keys || []
                        }));
                        navigate('/crm/propertyinterests', {
                          state: {
                            url: window.location.pathname,
                            data: null
                          }
                        });
                      }}
                >
                  -- Create And Edit --
                </div>
              ),
              options: [
                {
                  label: 'Add',
                  items: propertyInterests || []
                }
              ]
            }
          }} />

        <FormField label="Lead Source" name="lead_src_key"
          leftSpan={4}
          rightSpan={6}
          className="col-12 md:col-6"
          control={control} errors={errors}
          rules={{
            validate: (value: any, formValues: any) => {
              const category = formValues?.lead_src_ctgry_key;
              if (category && !value) {
                return 'Lead Source is required when Lead Source Category is selected';
              }
              return true;
            }
          }}
          formItem={{
            component: LeadSourceField,
            componentProps: { control }
          }} />

        <FormField label="Floor" name="floor_pref_key"
          leftSpan={4}
          rightSpan={6}
          className="col-12 md:col-6"
          control={control} errors={errors} formItem={{
            component: Dropdown,
            componentProps: {
              showClear: true,
              optionLabel: "descr",
              optionValue: "key",
              filter: true,
              filterBy: "descr",
              placeholder: "Select Floor",
              optionGroupLabel: "label",
              optionGroupChildren: "items",
              optionGroupTemplate: (
                <div
                  style={{
                    cursor: 'pointer',
                    textAlign: 'center',
                    backgroundColor: '#e6e1e1',
                    color: 'black',
                    lineHeight: 2.5
                  }}
            onClick={() => {
              const currentFormData = manageLayoutRef.current?.getValues?.() || formData;
              dispatch(setLeadFormData({
                leadFormData: currentFormData,
                selectedLocationPreference: currentFormData.location_pref_keys || []
              }));
              navigate('/crm/floors', {
                state: {
                  url: window.location.pathname,
                  data: null
                }
              });
            }}
                >
                  -- Create And Edit --
                </div>
              ),
              options: [
                {
                  label: 'Add',
                  items: floors || []
                }
              ]
            }
          }} />

        <FormField label="Facing" name="facing_pref_keys"
          leftSpan={4}
          rightSpan={6}
          className="col-12 md:col-6"
          control={control} errors={errors}
          useExplicit
          convertValue={(value: any) => {
            // PrimeReact MultiSelect expects an array of keys, not objects
            // Convert API response format [{key: 1, descr: "North"}, {key: 2, descr: "East"}] to [1, 2]
            if (Array.isArray(value)) {
              return value.map((item: any) => {
                if (typeof item === 'object' && item !== null && item.key !== undefined) {
                  // Handle the API response format: {key: 1, descr: "North"}
                  return item.key;
                }
                if (typeof item === 'object' && item !== null && item.facing_pref_key) {
                  // Handle nested structure: {facing_pref_key: {key: 1, descr: "North"}}
                  return item.facing_pref_key.key;
                }
                // If it's already a key value, return it as-is
                return item;
              });
            }
            return value;
          }}
          formItem={{
            component: MultiSelect,
            componentProps: {
              optionLabel: "descr",
              optionValue: "key",
              display: "chip",
              disabled: isAdding || isUpdating,
              placeholder: "Select Facing",
              className: "w-full multiselect-chip-scroll",
              showClear: true,
              filter: true,
              filterBy: "descr",
              optionGroupLabel: "label",
              optionGroupChildren: "items",
              optionGroupTemplate: (
                <div
                  style={{
                    cursor: 'pointer',
                    textAlign: 'center',
                    backgroundColor: '#e6e1e1',
                    color: 'black',
                    lineHeight: 2.5
                  }}
                  onClick={() => {
                    const currentFormData = manageLayoutRef.current?.getValues?.() || formData;
                    dispatch(setLeadFormData({
                      leadFormData: currentFormData,
                      selectedLocationPreference: currentFormData.location_pref_keys || []
                    }));
                    navigate('/crm/facings', {
                      state: {
                        url: window.location.pathname,
                        data: null
                      }
                    });
                  }}
                >
                  -- Create And Edit --
                </div>
              ),
              options: [
                {
                  label: 'Add',
                  items: facings || []
                }
              ]
            }
          }} />



        <FormField label="Location Preference" name="location_pref_keys"
          leftSpan={4}
          rightSpan={6}
          className="col-12 md:col-6"
          control={control} errors={errors}
          useExplicit
          formItem={{
            component: MultiSelect,
            componentProps: {
              optionLabel: "descr",
              optionValue: "key",
              display: "chip",
              disabled: isAdding || isUpdating,
              placeholder: "Select Location Preference",
              className: "w-full multiselect-chip-scroll",
              showClear: true,
              filter: true,
              filterBy: "descr",
              optionGroupLabel: "label",
              optionGroupChildren: "items",
              optionGroupTemplate: (
                <div
                  style={{
                    cursor: 'pointer',
                    textAlign: 'center',
                    backgroundColor: '#e6e1e1',
                    color: 'black',
                    lineHeight: 2.5
                  }}
                  onClick={() => {
                    const currentFormData = manageLayoutRef.current?.getValues?.() || formData;
                    dispatch(setLeadFormData({
                      leadFormData: currentFormData,
                      selectedLocationPreference: currentFormData.location_pref_keys || []
                    }));
                    navigate('/crm/locations', {
                      state: {
                        url: window.location.pathname,
                        data: null
                      }
                    });
                  }}
                >
                  -- Create And Edit --
                </div>
              ),
              options: [
                {
                  label: 'Add',
                  items: locations || []
                }
              ]
            }
          }} />

        <FormField label="Property Preference" name="project_pref_keys"
          leftSpan={4}
          rightSpan={6}
          className="col-12 md:col-6"
          control={control} errors={errors}
          useExplicit
          formItem={{
            component: ProjectField,
            componentProps: { control }
          }} />

        <FormField label="Occupancy" name="occupancies_key"
          leftSpan={4}
          rightSpan={6}
          className="col-12 md:col-6"
          control={control} errors={errors} formItem={{
            component: OccupancyField,
            componentProps: { control }
          }} />

        <FormField label="Occupancy Subtype" name="occupa_subtyp_key"
          leftSpan={4}
          rightSpan={6}
          className="col-12 md:col-6"
          control={control} errors={errors} formItem={{
            component: OccupancySubtypeField,
            componentProps: { control }
          }} />

        {/* <FormField label="Follow-Up Stage" name="follow_upstg_key"
          leftSpan={4}
          rightSpan={6}
          className="col-12 md:col-6"
          control={control} errors={errors} formItem={{
            component: FollowUpStageField,
            componentProps: { control, setValue }
          }} /> */}

        <FormField label="Status" name="status_key" className="col-12 md:col-6" control={control} errors={errors}
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
              options: leadStatuses || []
            }
          }} />

      </div>

    )
  }

  return (
    <>
      <Dialog
        header={isNew ? `Add Lead` : 'Update Lead'}
        visible={displayModal}
        position={'center'}
        modal
        style={{ width: '70vw' }}
        onHide={() => {
          let element = document.getElementById('discard-btn')
          if (element) {
            element.click()
          } else {
            customDiscard()
          }
        }}
        draggable={false} resizable={false} closable
      >
        <ManageLayout ref={manageLayoutRef} key={formKey} baseRoute="/payment/expenses" id={id} data={formData}
          isUpdating={isAdding || isUpdating || showingToast}
          bottomControl
          hideHeader
          customDiscard={() => {
            dispatch(clearLeadFormData());
            customDiscard();
          }}
          isLoading={isLoading} onSubmit={onSubmit} renderForm={renderForm} />

      </Dialog>
    </>
  )
}
