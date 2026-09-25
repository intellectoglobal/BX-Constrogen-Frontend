import React, { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { UseFormRegister, FieldErrors, FieldValues } from 'react-hook-form';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { TabView, TabPanel } from 'primereact/tabview';
import { ManageLayout, FormField, useToast, ManageLayoutHandle } from '@igblsln/control';
import {
  useActiveProjectQuery, useActiveContractorsQuery, AFTER_API_TIME, getClientProps,
  useGetAllContractorTypeQuery, defaultDateFormat, useAppDispatch, setPromptNavigate
} from '@igblsln/store';
import ManageServices from './ManageServices';
import { formatDate, useGetNextDocNoQuery } from '@igblsln/store';
import { MODULE_NAME } from '../../../constants';
import { PAGE_ROUTE } from '../constants';
import { useGetWorkCategoryDataQuery } from '../../WorkCategory/api';
import { useGetWorkTypeDataWithCateTypeQuery } from '../../WorkType/api';
import {
  useAddWorkActivityMutation, useGetWorkActivityQuery, useUpdateWorkActivityMutation
} from '../api';

type Props = {}

const Manage = ({ }: Props) => {
  const { showSuccess, showError } = useToast();
  const [showingToast, setShowingToast] = useState(false)
  const [currentTab, setCurrentTab] = useState(0)
  const [formData, setFormData] = useState({});
  const [serviceTableChanged, setServiceTableChanged] = useState(false);
  const [stageTableChanged, setStageTableChanged] = useState(false)
  const { id: idString } = useParams()
  const id = parseInt(idString || '');
  const isNew = isNaN(id) || id <= 0;
  const manageLayoutRef = useRef<ManageLayoutHandle>();
  const dispatch = useAppDispatch()

  const [selectedWorkCategory, setSelectedWorkCategory] = useState<number | null>(null);
  const [selectedWorkType, setSelectedWorkType] = useState<number | null>(null);

  const {
    data: workCategoryData,
    isFetching: isCategoryLoading,
  } = useGetWorkCategoryDataQuery();

  const {
    data: workTypeData,
    isFetching: isTypeLoading,
  } = useGetWorkTypeDataWithCateTypeQuery(selectedWorkCategory ?? 0, {
    skip: !selectedWorkCategory,
    refetchOnMountOrArgChange: true,
  });

  const clientProps = getClientProps();

  const { data, isLoading, refetch } = useGetWorkActivityQuery(id, {
    skip: isNew
  })

  const [serviceTableData, setServiceTableData] = useState<any[]>([]);

  const navigate = useNavigate();
  const [updateWorkActivity, { isLoading: isUpdating }] = useUpdateWorkActivityMutation()
  const [addWorkActivity, { isLoading: isAdding }] = useAddWorkActivityMutation()

// 👇 ADD these two useEffects in your component, right after the hooks section

  useEffect(() => {
    if (data) {
      const categoryId = data.work_category?.key || data.work_category?.key || null;
      setSelectedWorkCategory(categoryId);

      setFormData({
        ...data,
        category_key: categoryId,
        type_key: data.work_type?.key || data.work_type?.key || null,
        descr: data.descr || ''
      });
    }
  }, [data]);

  useEffect(() => {
    if (data && selectedWorkCategory && workTypeData?.length) {
      const typeId = data.work_type?.key || data.work_type?.key || null;
      setSelectedWorkType(typeId);
    }
  }, [selectedWorkCategory, workTypeData]);


  console.log("work activity data ::", data)

  const onSubmit = async (values: any) => {
    let body = { ...values };
    console.log("body ::", body)
    try {
      let resp: any;
      if (isNew) {
        resp = await addWorkActivity({ ...body, ...clientProps }).unwrap();
      } else {
        resp = await updateWorkActivity({ ...body, ...clientProps }).unwrap();
      }

      refetch();
      showSuccess('Success', resp.detail);
      dispatch(setPromptNavigate({ promptNavigate: false }))
      setShowingToast(true);
      setTimeout(() => {
        navigate(`/${MODULE_NAME}/${PAGE_ROUTE}`)
      }, AFTER_API_TIME);
    } catch (error: any) {
      showError('An error occurred', "We couldn't save your post, try again!");
    }
  }

  const renderForm = (control: any, _register: UseFormRegister<FieldValues>, errors: FieldErrors<FieldValues>) => {
    return (
      <div className='pl-4 pr-4 pt-4 pb-3 grid p-fluid h-full'>

        <FormField
          label="Work Category"
          name="category_key"
          className="col-10 md:col-6"
          control={control}
          errors={errors}
          isLoading={isCategoryLoading}
          required={"Select a work Category"}
          leftSpan={4}
          rightSpan={8}
          useExplicit
          onChange={(e: any) => {
            setSelectedWorkCategory(e.value)
          }}
          formItem={{
            component: Dropdown,
            componentProps: {
              showClear: true,
              optionLabel: "descr",
              optionValue: "key",
              filter: true,
              filterBy: "descr",
              options: workCategoryData?.results,
              value: selectedWorkCategory
            }
          }}
        />

        <FormField
          label="Work Type"
          name="type_key"
          className="col-10 md:col-6"
          control={control}
          errors={errors}
          isLoading={isTypeLoading}
          required={"Select a work type"}
          leftSpan={4}
          rightSpan={8}
          useExplicit
          onChange={(e: any)=> {
            setSelectedWorkType(e.value)
          }}
          formItem={{
            component: Dropdown,
            componentProps: {
              showClear: true,
              optionLabel: "descr",
              optionValue: "key",
              filter: true,
              filterBy: "descr",
              //@ts-ignore
              options: workTypeData,
              value: selectedWorkType // ✅ fixed here
            }
          }}
        />

        <FormField
          label="Description"
          name="descr"
          className="col-10 md:col-6"
          control={control}
          errors={errors}
          leftSpan={4}
          rightSpan={8}
          formItem={{
            component: InputText,
            componentProps: {
              maxLength: 25
            }
          }}
        />

        <TabView
          className='custom-tabview'
          activeIndex={currentTab}
          onTabChange={(e) => {
            setCurrentTab(e.index)
          }}
        >
          <TabPanel header="Job List">
            <div className="col-12 " style={{ height: 'calc(100% - 183px)', minHeight: 200 }}>
              <ManageServices
                data={serviceTableData}
                onTableChange={(value: boolean) => !serviceTableChanged && setServiceTableChanged(value)}
                onChange={(value: any[]) => setServiceTableData(value)}
              />
            </div>
          </TabPanel>

          <TabPanel header="Matrial Pack">
            <div className="col-12 " style={{ height: 'calc(100% - 183px)', minHeight: 200 }}>
              {/* Future component placeholder */}
            </div>
          </TabPanel>
        </TabView>

      </div>
    )
  }

  return (
    <>
      <ManageLayout
        ref={manageLayoutRef}
        baseRoute={`/${MODULE_NAME}/${PAGE_ROUTE}`}
        description={`Work Activity`}
        id={id}
        data={data}
        isItemsTableChanged={serviceTableChanged || stageTableChanged}
        isUpdating={isAdding || isUpdating || showingToast}
        isLoading={isLoading}
        onSubmit={onSubmit}
        renderForm={renderForm}
      />
    </>
  )
}

export default Manage;
