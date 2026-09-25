import React, { useState, useRef, useMemo } from 'react';
import { FormField } from '@igblsln/control';
import { Datatable } from '@igblsln/control';
import { Column } from 'primereact/column';
import { Divider } from 'primereact/divider';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { confirmDialog } from 'primereact/confirmdialog';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import { useListOccupancySubtypesQuery, useDeleteOccupancySubtypesMutation, useAddOccupancySubtypesMutation, useUpdateOccupancySubtypesMutation } from '../occupancySubtypesApi';
import { useListOccupanciesQuery } from '../../Occupancies/occupanciesApi';
import { MODULE_NAME } from '../../../constants';
import { PAGE_NAME, PAGE_ROUTE } from '../constants';
import { getClientProps } from '@igblsln/store';

type Props = {}

const Main = (props: Props) => {
  const navigate = useNavigate();
  const { data, isFetching: isLoading } = useListOccupancySubtypesQuery()
  const { data: occupancies } = useListOccupanciesQuery();
  const [deleteDataAction, { isLoading: isDeleting }] = useDeleteOccupancySubtypesMutation()
  const [addOccupancySubtypes, { isLoading: isAdding }] = useAddOccupancySubtypesMutation()
  const [updateOccupancySubtypes, { isLoading: isUpdating }] = useUpdateOccupancySubtypesMutation()
  
  const deleteAction = (id: number) => deleteDataAction(id).unwrap();
  
  const toast = useRef<Toast>(null);
  const clientProps = getClientProps();
  
  const {
    control,
    formState: { errors },
    handleSubmit,
    setValue,
    setError,
  } = useForm({});

  const [isNew, setIsNew] = useState(true);
  const [selectedKey, setSelectedKey] = useState<number | null>(null);

  const occupanciesMap = useMemo(() => {
    const map: { [key: number]: string } = {};
    occupancies?.forEach(occ => {
      map[occ.key] = occ.descr;
    });
    return map;
  }, [occupancies]);

  // Transform data to include id field for ListLayout navigation
  const transformedData = useMemo(() =>
    data?.map(item => ({
      ...item,
      id: item.key,
      occupancy_descr: occupanciesMap[(item as any).occup_id] || ''
    })) || [],
    [data, occupanciesMap]
  );

  const showSuccess = (title: string, msg: string) => {
    toast?.current?.show({
      severity: "success",
      summary: title,
      detail: msg,
      life: 3000,
    });
  };

  const showError = (title: string, msg: string) => {
    toast?.current?.show({
      severity: "error",
      summary: title,
      detail: msg,
      life: 3000,
    });
  };

  const defaultActionBodyTemplate = (deleteData: any) => {
    return (value: any) => (
      <>
        <Button
          onClick={() => {
            setIsNew(false);
            setSelectedKey(value.key);
            setValue("occup_id", value.occup_id);
            setValue("descr", value.descr);
          }}
          icon="pi pi-eye"
          className="p-button-rounded p-button-text"
        />
        <Button
          style={{ height: "20px", width: "20px", borderRadius: 50 }}
          onClick={() => deleteData(value.key)}
          className="p-button-rounded p-button-text"
          icon="pi pi-trash"
        />
      </>
    );
  };

  const deleteData = async (id: number) => {
    confirmDialog({
      message: "Are you sure you want to delete this Occupancy Subtype?",
      header: "Confirmation",
      icon: "pi pi-exclamation-triangle",
      accept: async () => {
        try {
          const resp = await deleteAction(id);
          //@ts-ignore
          showSuccess("Success", resp);
        } catch (error: any) {
          showError("Failed", error?.data?.detail);
        }
      },
      reject: () => {},
    });
  };

  const onSubmit = async (values: any) => {
    try {
      if (!values.descr || !values.occup_id) {
        showError("Validation Error", "All fields are required.");
        return;
      }

      if (isNew) {
        if (data?.some((subtype: any) => subtype.occup_id === values.occup_id && subtype.descr.toLowerCase().trim() === values.descr.toLowerCase().trim())) {
          setError("descr", { message: "Occupancy Subtype already exists for this occupancy." });
          return;
        }
      } else {
        if (data?.some((subtype: any) => subtype.key !== selectedKey && subtype.occup_id === values.occup_id && subtype.descr.toLowerCase().trim() === values.descr.toLowerCase().trim())) {
          setError("descr", { message: "Occupancy Subtype already exists for this occupancy." });
          return;
        }
      }

      let resp: any;
      if (isNew) {
        resp = await addOccupancySubtypes({ ...values, ...clientProps }).unwrap();
      } else {
        resp = await updateOccupancySubtypes({ key: selectedKey, ...values, ...clientProps }).unwrap();
      }

      setIsNew(true);
      setValue("occup_id", "");
      setValue("descr", "");
      showSuccess("Success", resp.detail);
    } catch (error: any) {
      showError("Error", error?.data?.detail || "We couldn't save your request, try again!");
    }
  };

  const OccupancyTypeField = ({
    control,
    value,
    onChange,
    ...props
  }: {
    control: any;
    value?: string;
    onChange: (event: { target: { value: string } }) => void;
    [key: string]: any;
  }) => {
    const options = [
      {
        label: "Add",
        items:
          occupancies?.map((occ) => ({
            label: occ.descr,
            value: occ.key,
          })) || [],
      },
    ];

    return (
      <Dropdown
        value={value}
        onChange={(e) => onChange({ target: { value: e.value } })}
        options={options}
        optionLabel="label"
        optionValue="value"
        placeholder="Select Occupancy Type"
        showClear
        filter
        filterBy="label"
        optionGroupLabel="label"
        optionGroupChildren="items"
        optionGroupTemplate={
          <div
            style={{
              cursor: 'pointer',
              textAlign: 'center',
              backgroundColor: '#e6e1e1',
              color: 'black',
              lineHeight: 2.5,
            }}
            onClick={() =>
              navigate('/crm/occupancies', {
                state: {
                  url: window.location.pathname,
                  data: null,
                },
              })
            }
          >
            -- Create And Edit --
          </div>
        }
        className="w-full"
        {...props}
      />
    );
  };

  const renderForm = (control: any, errors: any) => {
    return (
      <div className="pl-8">
        <FormField
          label="Occupancy Type"
          name="occup_id"
          leftSpan={4}
          rightSpan={5}
          required
          control={control}
          errors={errors}
          formItem={{
            component: OccupancyTypeField,
            componentProps: { control },
          }}
        />
        <FormField
          label="Occupancy Sub Type"
          name="descr"
          control={control}
          errors={errors}
          required
          leftSpan={4}
          rightSpan={5}
          formItem={{
            component: InputText,
            componentProps: {
              maxLength: 100,
              disabled: isAdding || isUpdating,
            },
          }}
        />
      </div>
    );
  };

  return (
    <>
      <Toast ref={toast} />
      <Divider />

      <Datatable
        className="pl-8"
        style={{ height: "50%", width: "70%" }}
        header={
          <div className="flex">
            <h3 className="m-0 my-auto">{PAGE_NAME}</h3>
          </div>
        }
        rowHover
        onRowClick={(e) => {
          setIsNew(false);
          setSelectedKey(e.data.key);
          setValue("occup_id", e.data.occup_id);
          setValue("descr", e.data.descr);
        }}
        value={transformedData}
        stripedRows
      >
        <Column
          style={{ maxWidth: "100px" }}
          bodyStyle={{ textAlign: "center", overflow: "visible" }}
          body={defaultActionBodyTemplate(deleteData)}
        />
        <Column 
          field="occupancy_descr" 
          header="Occupancy" 
          sortable
          filter
        />
        <Column 
          field="descr" 
          header="Occupancy Sub Type" 
          sortable
          filter
        />
      </Datatable>

      <Divider />

      <div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex">
            <div className="col-1"></div>
            <div className="col-7">{renderForm(control, errors)}</div>
            <div className="my-auto">
              <Button
                loading={isAdding || isUpdating}
                label="Save"
                type="submit"
                style={{ paddingRight: 20 }}
                className="p-button-warning mr-3"
              />

              <Button
                loading={isAdding || isUpdating}
                label="Clear"
                className="mr-3"
                onClick={(e) => {
                  e.preventDefault();
                  setIsNew(true);
                  setValue("occup_id", "");
                  setValue("descr", "");
                }}
              />

              <Button
                loading={isAdding || isUpdating}
                label="Back"
                onClick={() =>
                  navigate("/crm/leads", {
                    state: { openModal: true, leadKey: null },
                  })
                }
              />
            </div>
          </div>
        </form>
      </div>
    </>
  );
}

export default Main
