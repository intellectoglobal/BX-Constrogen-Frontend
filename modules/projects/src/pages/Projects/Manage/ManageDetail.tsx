import React, { ChangeEvent, useRef, useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { Controller, UseFormRegister, FieldErrors, FieldValues, UseFormGetValues } from 'react-hook-form';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { classNames } from 'primereact/utils';
import { Checkbox } from 'primereact/checkbox';
import { Toast } from 'primereact/toast';
import { ManageLayout, FormField } from '@igblsln/control';
import { useAddProjectMutation, useGetProjectQuery, useUpdateProjectMutation, useGetStatesQuery, useGetCitiesQuery, useGetProjectStatusesQuery } from '../apis';
import { useListProjectTypeQuery } from '../../ProjectTypes/projectTypeApi';
import { AFTER_API_TIME, base64Converter, getClientProps, setPaymentMenu, useGetAllCompaniesQuery } from '@igblsln/store'
import { useDispatch, useSelector } from 'react-redux'

type Props = {}

const ManageDetail = (props: Props) => {

  const toast = useRef<Toast>(null);
  const [showingToast, setShowingToast] = useState(false)
  const navigate = useNavigate();
  const id = useSelector((state: any) => state?.common?.selectedProject);
  const [selectedState, setSelectedState] = useState<any>('')

  const clientProps = getClientProps();

  const dataFromLocation: any = useLocation().state;

  const { data: projectTypes } = useListProjectTypeQuery({})
  const { data: states } = useGetStatesQuery()
  const { data: cities } = useGetCitiesQuery(selectedState)
  const { data: projectStatuses } = useGetProjectStatusesQuery(null, { refetchOnMountOrArgChange: true })

  const { data, isFetching: isLoading } = useGetProjectQuery(id, {
    skip: !id,
    refetchOnMountOrArgChange: true
  })
  const [updateProject, { isLoading: isUpdating }] = useUpdateProjectMutation();

  const showSuccess = (title: string, msg: string) => {
    toast?.current?.show({ severity: 'success', summary: title, detail: msg, life: 3000 });
  }

  const showError = (title: string, msg: string) => {
    toast?.current?.show({ severity: 'error', summary: title, detail: msg, life: 3000 });
  }

  const onSubmit = async (values: any) => {
    const body = {
      ...values,
      ...clientProps,
      door_no: values?.door_no || null,
      plot_no: values?.plot_no || null,
      survey_no: values?.survey_no || null,
    }

    try {
      let resp: any;
      resp = await updateProject(body).unwrap();
      showSuccess('Success', resp.detail);
      setShowingToast(true);
      // if (navPath) {
      //   setTimeout(() => {
      //     navigate(`/projects/${resp.data.key}/${navPath}`)
      //   }, AFTER_API_TIME);
      // }
      // else {
      //   setTimeout(() => {
      //     navigate("/projects/project")
      //   }, AFTER_API_TIME);
      // }

    } catch (error: any) {
      showError('An error occurred', error?.data?.detail || "We couldn't save your post, try again!");
    }
  }
  const customProjStatusOption = [
    {
      label: 'Add',
      items: projectStatuses || []
    }
  ]

  const customCityOption = [
    {
      label: 'Add',
      items: cities || []
    }
  ]

  const renderForm = (control: any, _register: UseFormRegister<FieldValues>, errors: FieldErrors<FieldValues>, getValues: UseFormGetValues<any>) => {
    return (
      <div>
        <div style={{ padding: '5px 20px' }}>
          <div className="flex">

            <FormField
              label="Project Name"
              name="name"
              className="col-12 md:col-6"
              control={control}
              errors={errors}
              required
              leftSpan={6}
              rightSpan={6}
              formItem={{
                component: InputText,
                componentProps: {
                  maxLength: 100
                }
              }} />

            <FormField
                label="Project Type"
                name="projtyp_key"
                className="col-12 md:col-6"
                control={control}
                errors={errors}
                required
                leftSpan={6}
                rightSpan={6}
                formItem={{
                  component: Dropdown,
                  componentProps: {
                    showClear: true,
                    optionGroupTemplate: (
                      <div
                        style={{
                          cursor: 'pointer',
                          textAlign: 'center',
                          backgroundColor: '#e6e1e1',
                          color: 'black',
                          lineHeight: 2.5
                        }}
                        onClick={() =>
                          navigate('/projects/projecttype', {
                            state: {
                              url: `/projects/project/detail`,
                              data: getValues()
                            }
                          })
                        }
                      >
                        -- Create And Edit --
                      </div>
                    ),
                    optionLabel: "descr",
                    optionValue: "key",
                    filter: true,
                    filterBy: "descr",
                    optionGroupLabel: "label",
                    optionGroupChildren: "items",
                    options: [
                      {
                        label: 'Add',
                        items: projectTypes?.results || []
                      }
                    ]
                  }
                }}
              />
          </div>

          <div className="flex">

            <FormField
                label="Address Line"
                name="addr1"
                className="col-12 md:col-6"
                control={control}
                errors={errors}
                leftSpan={6}
                rightSpan={6}
                formItem={{
                  component: InputTextarea,
                  componentProps: {
                    maxLength: 250,
                    rows: 4,
                    autoResize: true
                  }
                }} />

            <FormField
              label="Project Status"
              name="projstatus_key"
              className="col-12 md:col-6"
              control={control}
              errors={errors}
              required
              leftSpan={6}
              rightSpan={6}
              formItem={{
                component: Dropdown,
                componentProps: {
                  showClear: true,
                  optionGroupTemplate: (
                    <div
                      style={{
                        cursor: 'pointer',
                        textAlign: 'center',
                        backgroundColor: '#e6e1e1',
                        color: 'black',
                        lineHeight: 2.5
                      }}
                      onClick={() =>
                        navigate('/projects/projectstatus', {
                          state: {
                            url: `/projects/project/detail`,
                            data: getValues()
                          }
                        })
                      }
                    >
                      -- Create And Edit --
                    </div>
                  ),
                  optionLabel: "descr",
                  optionValue: "key",
                  filter: true,
                  filterBy: "descr",
                  optionGroupLabel: "label",
                  optionGroupChildren: "items",
                  options: customProjStatusOption
                }
              }}
            />
          </div>

          <div className="flex">
            <FormField
              label="State"
              name="state_key"
              className="col-12 md:col-6"
              control={control}
              errors={errors}
              // required
              leftSpan={6}
              rightSpan={6}
              useExplicit
              onChange={(e: any) => {
                setSelectedState(e.value);
              }}
              formItem={{
                component: Dropdown,
                componentProps: {
                  showClear: true,
                  optionGroupTemplate: (
                    <div
                      style={{
                        cursor: 'pointer',
                        textAlign: 'center',
                        backgroundColor: '#e6e1e1',
                        color: 'black',
                        lineHeight: 2.5
                      }}
                      onClick={() =>
                        navigate('/projects/state', {
                          state: {
                            url: `/projects/project/detail`,
                            data: getValues()
                          }
                        })
                      }
                    >
                      -- Create And Edit --
                    </div>
                  ),
                  optionLabel: "name",
                  optionValue: "key",
                  filter: true,
                  filterBy: "name",
                  optionGroupLabel: "label",
                  optionGroupChildren: "items",
                  options: [
                    {
                      label: 'Add',
                      items: states || []
                    }
                  ]
                }
              }}
            />

            <FormField
              label="City"
              name="city_key"
              className="col-12 md:col-6"
              control={control}
              errors={errors}
              // required
              leftSpan={6}
              rightSpan={6}
              formItem={{
                component: Dropdown,
                componentProps: {
                  showClear: true,
                  optionGroupTemplate:
                    <div
                      style={{ cursor: 'pointer', textAlign: 'center', backgroundColor: '#e6e1e1', color: 'black', lineHeight: 2.5 }}
                      onClick={() => navigate('/projects/city', {
                        state: {
                          url: `/projects/project/detail`,
                          data: getValues()
                        }
                      })
                      }
                    >
                      -- Create And Edit --
                    </div>
                  ,
                  optionLabel: "name",
                  optionValue: "key",
                  filter: true,
                  filterBy: "name",
                  optionGroupLabel: "label",
                  optionGroupChildren: "items",
                  options: customCityOption
                }
              }} />
          </div>

          <div className="flex">
            <FormField
              label="No of Blocks"
              name="no_of_blocks"
              className="col-12 md:col-6"
              control={control}
              errors={errors}
              leftSpan={6}
              rightSpan={6}
              formItem={{
                component: InputText,
                componentProps: {
                  thousandSeparator: true,
                  type: 'number',
                  disabled: true,
                }
              }}/>
            <FormField
              label="No of Units"
              name="no_of_units"
              className="col-12 md:col-6"
              control={control}
              errors={errors}
              leftSpan={6}
              rightSpan={6}
              formItem={{
                component: InputText,
                componentProps: {
                  thousandSeparator: true,
                  type: 'number',
                  disabled: true,
                }
              }} />
          </div>
          <div className="flex">
            <FormField
                label="Plot Area"
                name="totallandarea"
                className="col-12 md:col-6"
                control={control}
                errors={errors}
                leftSpan={6}
                rightSpan={6}
                formItem={{
                  component: InputNumber,
                  componentProps: {
                    // type: 'number',
                    min: 0,
                    suffix:" sqft"
                    // step: '0.01'
                  }
                }} />
              <FormField
                label="Built Up Area"
                name="builtuparea"
                className="col-12 md:col-6"
                control={control}
                errors={errors}
                leftSpan={6}
                rightSpan={6}
                formItem={{
                  component: InputNumber,
                  componentProps: {
                    // type: 'number',
                    min: 0,
                    suffix:" sqft"
                    // step: '0.01'
                  }
                }} />
              {/* <FormField
                label="Car Parking Cost"
                name="car_parking_cost"
                className="col-12 md:col-6"
                control={control}
                errors={errors}
                leftSpan={6}
                rightSpan={6}
                formItem={{
                  component: InputText,
                  componentProps: {
                    type: 'number',
                    min: 0,
                    step: '0.01'
                  }
                }} /> */}
          </div>
          {/* <div className="flex">
            <FormField
              label="EB Cost"
              name="eb_cost"
              // labelAlign='center'
              className="col-12 md:col-6"
              control={control}
              errors={errors}
              leftSpan={6}
              rightSpan={6}
              formItem={{
                component: InputText,
                componentProps: {
                  thousandSeparator: true,
                  type: 'number',
                  // disabled: true,
                }
              }} />
            <FormField
              label="Water and Drainage Cost"
              name="water_and_drainage_cost"
              className="col-12 md:col-6"
              control={control}
              errors={errors}
              leftSpan={6}
              rightSpan={6}
              formItem={{
                component: InputText,
                componentProps: {
                  type: 'number',
                  min: 0,
                  step: '0.01'
                }
              }} />

          </div>


          <div className="flex">
            <FormField
                label="EB Service Number"
                name="eb_service_no"
                className="col-12 md:col-6"
                control={control}
                errors={errors}
                leftSpan={6}
                rightSpan={6}
                formItem={{
                  component: InputText,
                  componentProps: {
                    type: 'number',
                    min: 0,
                    maxLength: 11,
                    step: '0.01'
                  }
                }} />
            <FormField
              label="ARN"
              name="arn"
              className="col-12 md:col-6"
              control={control}
              errors={errors}
              // required
              leftSpan={6}
              rightSpan={6}
              formItem={{
                component: InputText,
                componentProps: {
                  maxLength: 100
                }
              }} />
          </div> */}
          
        {/* <div className="flex">
          <div className="col-12 md:col-6">
            <div className="field-checkbox">
              <Controller
                name="inactive"
                control={control}
                defaultValue="N"
                render={({ field }) => (
                  <div className="p-field-checkbox" style={{ display: 'flex', alignItems: 'center' }}>
                    <label htmlFor="inactive" style={{ marginRight: '180px' }}>Inactive</label>
                    <Checkbox
                      inputId="inactive"
                      checked={field.value === 'Y'}
                      onChange={(e) => field.onChange(e.checked ? 'Y' : 'N')}
                    />
                  </div>
                )}
              />
            </div>
          </div>
        </div> */}
        </div>

      </div>

    )
  }

  return (
    <div style={{ maxHeight: '100vh', overflowY: 'auto' }} className="flex flex-column h-full">
      <Toast ref={toast} />
      <ManageLayout baseRoute="/projects/project" description="Project" id={id} data={data}
        hideHeader
        dataFromLocation={dataFromLocation}
        isUpdating={isLoading || isUpdating}
        bottomControl
        isLoading={isLoading} onSubmit={onSubmit} renderForm={renderForm} />
    </div>
  )
}

export default ManageDetail