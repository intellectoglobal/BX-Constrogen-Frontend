import React, { ChangeEvent, useRef, useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { Controller, UseFormRegister, FieldErrors, FieldValues, UseFormGetValues } from 'react-hook-form';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { classNames } from 'primereact/utils';
import { Checkbox } from 'primereact/checkbox';
import { Toast } from 'primereact/toast';
import { ManageLayout, FormField } from '@igblsln/control';
import { useAddProjectMutation, useGetProjectQuery, useUpdateProjectMutation, useGetStatesQuery, useGetCitiesQuery, useGetProjectStatusesQuery } from '../apis';
import { useListProjectTypeQuery } from '../../ProjectTypes/projectTypeApi';
import { AFTER_API_TIME, base64Converter, getClientProps, setPaymentMenu, setPromptNavigate, useAppDispatch, useGetAllCompaniesQuery } from '@igblsln/store'
import { useDispatch, useSelector } from 'react-redux'

type Props = {}

const Manage = (props: Props) => {

  const dispatch = useDispatch()

  const toast = useRef<Toast>(null);
  const [showingToast, setShowingToast] = useState(false)
  const [navPath, setNavPath] = useState<any>(null)
  const [uploadedImage, setUploadedImage] = useState<any>(null)
  const [removeImage, setRemoveImage] = useState<boolean>(false)
  const navigate = useNavigate();
  const { id: idString } = useParams()
  const id = parseInt(idString || '');
  const isNew = isNaN(id) || id <= 0;
  const [selectedState, setSelectedState] = useState<any>('')

  const clientProps = getClientProps();

  const dataFromLocation: any = useLocation().state;

  const { data: projectTypes } = useListProjectTypeQuery({})
  const { data: states } = useGetStatesQuery()
  const { data: cities } = useGetCitiesQuery(selectedState)
  const { data: projectStatuses } = useGetProjectStatusesQuery(null, { refetchOnMountOrArgChange: true })

  const { data, isLoading } = useGetProjectQuery(id, {
    skip: isNew,
    refetchOnMountOrArgChange: true
  })
  const [addProject, { isLoading: isAdding }] = useAddProjectMutation()
  const [updateProject, { isLoading: isUpdating }] = useUpdateProjectMutation();
  const dispath = useAppDispatch()

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
      elevationimage: removeImage ? 'null' : (uploadedImage ? await base64Converter(uploadedImage) : data?.elevationimage),
      is_image_updated: (removeImage || uploadedImage) ? 'true' : 'false',
      door_no: values?.door_no || null,
      plot_no: values?.plot_no || null,
      survey_no: values?.survey_no || null,
    }

    try {
      let resp: any;
      if (isNew) {
        resp = await addProject(body).unwrap();
      } else {
        resp = await updateProject(body).unwrap();
      }
      showSuccess('Success', resp.detail);
      setShowingToast(true);
      dispatch(setPromptNavigate({ promptNavigate: false }))
      if (navPath) {
        setTimeout(() => {
          navigate(`/projects/${resp.data.key}/${navPath}`)
        }, AFTER_API_TIME);
      }
      else {
        setTimeout(() => {
          navigate("/projects/project")
        }, AFTER_API_TIME);
      }

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
      <div className="flex">
        <div className="col-8">

          <div className="card" style={{ width: '100%' }}>

            <div>

              <FormField
                label="Project Name"
                name="name"
                control={control}
                errors={errors}
                required
                leftSpan={4}
                rightSpan={6}
                formItem={{
                  component: InputText,
                  componentProps: {
                    maxLength: 100
                  }
                }} />

              {/* <Tooltip
                mouseTrack
                mouseTrackLeft={10}
                target="#user-company"
                position="top"
                content={"Can't Modify Once Added"}
                className='my-tooltip'
              /> */}

              {/* <FormField
                label="Company"
                name="company"
                required
                control={control}
                errors={errors}
                isLoading={companiesFetching}
                leftSpan={4}
                rightSpan={6}
                formItem={{
                  component: Dropdown,
                  componentProps: {
                    showClear: true,
                    optionLabel: "name",
                    optionValue: "id",
                    filter: true,
                    disabled: !isNew,
                    id: "user-company",
                    filterBy: "name",
                    options: companies,
                  }
                }} /> */}

              <FormField
                label="Project Type"
                name="projtyp_key"
                control={control}
                errors={errors}
                required
                leftSpan={4}
                rightSpan={4}
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
                              url: isNew
                                ? "/projects/project/new"
                                : `/projects/project/${data?.key}/edit`,
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

              {/* <FormField
                label="Door No"
                name="door_no"
                control={control}
                errors={errors}
                leftSpan={4}
                rightSpan={3}
                formItem={{
                  component: InputText,
                  componentProps: {
                  }
                }} /> */}

              {/* <FormField
                label="Plot No"
                name="plot_no"
                control={control}
                errors={errors}
                leftSpan={4}
                rightSpan={3}
                formItem={{
                  component: InputText,
                  componentProps: {
                  }
                }} /> */}

              {/* <FormField
                label="Survey No"
                name="survey_no"
                control={control}
                errors={errors}
                leftSpan={4}
                rightSpan={3}
                formItem={{
                  component: InputText,
                  componentProps: {
                  }
                }} /> */}

              {/* <FormField
                label="Street Name"
                name="streetname"
                control={control}
                errors={errors}
                leftSpan={4}
                rightSpan={5}
                formItem={{
                  component: InputText,
                  componentProps: {
                  }
                }} /> */}

              {/* <FormField
                label="Area"
                name="area"
                control={control}
                errors={errors}
                leftSpan={4}
                rightSpan={5}
                formItem={{
                  component: InputText,
                  componentProps: {
                  }
                }} /> */}


              <FormField
                label="Address Line"
                name="addr1"
                control={control}
                errors={errors}
                leftSpan={4}
                rightSpan={6}
                formItem={{
                  component: InputTextarea,
                  componentProps: {
                    maxLength: 250,
                    rows: 3,
                    autoResize: true
                  }
                }} />

            <FormField
              label="Project Status"
              name="projstatus_key"
              control={control}
              errors={errors}
              required
              leftSpan={4}
              rightSpan={4}
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
                            url: isNew
                              ? "/projects/project/new"
                              : `/projects/project/${data?.key}/edit`,
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

              {/* <FormField
                label="Project Code"
                name="id"
                control={control}
                errors={errors}
                // required
                leftSpan={4}
                rightSpan={4}
                formItem={{
                  component: InputText,
                  componentProps: {
                    maxLength: 25,
                    disabled: !isNew,
                  }
                }} /> */}

              <FormField
                label="State"
                name="state_key"
                control={control}
                errors={errors}
                // required
                leftSpan={4}
                rightSpan={4}
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
                              url: isNew
                                ? "/projects/project/new"
                                : `/projects/project/${data?.key}/edit`,
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
                control={control}
                errors={errors}
                // required
                leftSpan={4}
                rightSpan={4}
                formItem={{
                  component: Dropdown,
                  componentProps: {
                    showClear: true,
                    optionGroupTemplate:
                      <div
                        style={{ cursor: 'pointer', textAlign: 'center', backgroundColor: '#e6e1e1', color: 'black', lineHeight: 2.5 }}
                        onClick={() => navigate('/projects/city', {
                          state: {
                            url: isNew ? "/projects/project/new" : `/projects/project/${data?.key}/edit`,
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

              {/* <FormField
                label="No of Blocks"
                name="no_of_blocks"
                control={control}
                errors={errors}
                leftSpan={4}
                rightSpan={3}
                formItem={{
                  component: InputText,
                  componentProps: {
                    thousandSeparator: true,
                    type: 'number',
                    // disabled: true,
                  }
                }} /> */}

              {/* <FormField
                label="No of Units"
                name="no_of_units"
                control={control}
                errors={errors}
                leftSpan={4}
                rightSpan={3}
                formItem={{
                  component: InputText,
                  componentProps: {
                    thousandSeparator: true,
                    type: 'number',
                    // disabled: true,
                  }
                }} /> */}

              <FormField
                label="Plot Area"
                name="totallandarea"
                control={control}
                errors={errors}
                leftSpan={4}
                rightSpan={3}
                formItem={{
                  component: InputText,
                  componentProps: {
                    type: 'number',
                    min: 0,
                    // step: '0.01'
                  }
                }} />
              <FormField
                label="Built Up Area"
                name="builtuparea"
                control={control}
                errors={errors}
                leftSpan={4}
                rightSpan={3}
                formItem={{
                  component: InputText,
                  componentProps: {
                    type: 'number',
                    min: 0,
                    // step: '0.01'
                  }
                }} />
              {/* <FormField
                label="Car Parking Cost"
                name="car_parking_cost"
                control={control}
                errors={errors}
                leftSpan={4}
                rightSpan={3}
                formItem={{
                  component: InputText,
                  componentProps: {
                    type: 'number',
                    min: 0,
                    step: '0.01'
                  }
                }} />

              <FormField
                label="EB Cost"
                name="eb_cost"
                control={control}
                errors={errors}
                leftSpan={4}
                rightSpan={3}
                formItem={{
                  component: InputText,
                  componentProps: {
                    type: 'number',
                    min: 0,
                    step: '0.01'
                  }
                }} />

              <FormField
                label="Water and Drainage Cost"
                name="water_and_drainage_cost"
                control={control}
                errors={errors}
                leftSpan={4}
                rightSpan={3}
                formItem={{
                  component: InputText,
                  componentProps: {
                    type: 'number',
                    min: 0,
                    step: '0.01'
                  }
                }} />

              <FormField
                label="EB Service Number"
                name="eb_service_no"
                control={control}
                errors={errors}
                leftSpan={4}
                rightSpan={3}
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
                control={control}
                errors={errors}
                // required
                leftSpan={4}
                rightSpan={6}
                formItem={{
                  component: InputText,
                  componentProps: {
                    maxLength: 100
                  }
                }} /> */}
{/* 
              <div className="field">
                <label style={{ margin: 'auto', paddingLeft: 0 }} htmlFor="inactive" className={classNames('col-4', { 'p-error': errors.inactive })}>Inactive</label>
                <Controller defaultValue={"N"} name="inactive" control={control} render={({ field, fieldState }) => (
                  <Checkbox checked={field.value} trueValue={"Y"} falseValue={"N"} id={field.name} {...field}></Checkbox>
                )} />
              </div> */}

              {/* <FormField
                label="Project Status"
                name="status"
                control={control}
                errors={errors}
                leftSpan={4}
                rightSpan={6}
                formItem={{
                  component: InputText,
                  componentProps: {
                    disabled: true,
                    value: isNew ? "New Project" : (data?.latest_proj_status.descr || data?.status.descr)
                  }
                }} /> */}

            </div>

          </div>
        </div>
        <div className="col-4">
          <div className="flex">
            {/* <div className="col-6">
              <Button label='Unit Details'
                onClick={(e) => {
                  if (isNew) {
                    setNavPath('unit')
                  }
                  else {
                    e.preventDefault()
                    // navigate(`/projects/${id}/unit`)
                    navigate(`/projects/unit`, {
                      state: id
                    })
                  }
                }}
                className='project-page-tags' style={{ width: '100%' }} />
            </div>
            <div className="col-6">
              <Button label='Image Details'
                onClick={(e) => {
                  if (isNew) {
                    setNavPath('images')
                  }
                  else {
                    e.preventDefault()
                    navigate(`/projects/images`, {
                      state: id
                    })
                  }
                }}
                className='project-page-tags' style={{ width: '100%' }} />
            </div> */}
            {/* <div className="col-6">
              <Button label='Status Change'
                onClick={(e) => {
                  if (isNew) {
                    setNavPath('statuschange')
                  }
                  else {
                    e.preventDefault()
                    navigate(`/projects/${id}/statuschange`)
                  }
                }}
                className='project-page-tags' style={{ width: '100%' }} />
            </div> */}
          </div>
          {/* <div className="flex">
            <div className="col-6">
              <Button label='Availability'
                onClick={(e) => {
                  if (isNew) {
                    setNavPath('availability')
                  }
                  else {
                    e.preventDefault()
                    navigate(`/projects/${id}/availability`)
                  }
                }}
                className='project-page-tags' style={{ width: '100%' }} />
            </div>
            <div className="col-6">
              <Button label='Price Change'
                onClick={(e) => {
                  if (isNew) {
                    setNavPath('pricechange')
                  }
                  else {
                    e.preventDefault()
                    navigate(`/projects/${id}/pricechange`)
                  }
                }}
                className='project-page-tags' style={{ width: '100%' }} />
            </div>
          </div>
          <div className="flex">
            <div className="col-6">
              <Button label='Pay Term'
                onClick={(e) => {
                  if (isNew) {
                    setNavPath('paymentterm')
                  }
                  else {
                    e.preventDefault()
                    navigate(`/projects/${id}/paymentterm`)
                  }
                }}
                className='project-page-tags' style={{ width: '100%' }} />
            </div>
            <div className="col-6">
              <Button label='Contact' onClick={(e) => {
                e.preventDefault()
              }} className='project-page-tags' style={{ width: '100%' }} />
            </div>
          </div> */}
          {/* <div className='flex' >
            <div className="p-5 justify-content-center" style={{ width: '100%' }}>
              <input id='img-upload' type={"file"} style={{ display: 'none' }} accept="image/*"
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  e.target.files?.length && setUploadedImage(e.target.files[0])
                }} />

              {
                !removeImage && !uploadedImage && data?.elevationimage &&
                <Image preview width='100%' style={{ padding: 30, marginTop: 'auto' }} src={data?.elevationimage || "https://www.levelset.com/wp-content/uploads/2019/02/apartments.jpg"} alt="Image Text" />
              }
              {
                uploadedImage && uploadedImage !== 'clear' &&
                <Image preview width='100%' style={{ padding: 30, marginTop: 'auto' }} src={URL.createObjectURL(uploadedImage)} alt="Image Text" />
              }
              <div style={{ display: 'flex' }}>
                <Button
                  onClick={(e) => {
                    e.preventDefault()
                    document.getElementById('img-upload')?.click()
                  }}
                  className="p-button-warning mr-3"
                  style={{ paddingRight: 20, flexGrow: 1 }}
                  label="Add Image"
                />
                {
                  (!removeImage && (uploadedImage || !!data?.elevationimage)) &&
                  <Button
                    style={{ flexGrow: 1 }}
                    onClick={(e) => {
                      e.preventDefault()
                      setUploadedImage(null)
                      setRemoveImage(true)
                    }}
                    className="p-button-plain"
                    label="Clear"
                  />
                }

              </div>

            </div>
          </div> */}
        </div>
      </div>


    )
  }

  useEffect(() => {
    dispatch(setPaymentMenu('project'));
    return () => {
      dispatch(setPaymentMenu(''));
    };
  }, [dispatch]);

  return (
    <>
      <Toast ref={toast} />
      <ManageLayout baseRoute="/projects/project" description="Project " id={id} data={data}
        dataFromLocation={dataFromLocation}
        isUpdating={isAdding || isUpdating || showingToast}
        isLoading={isLoading} onSubmit={onSubmit} renderForm={renderForm} />
    </>
  )
}

export default Manage