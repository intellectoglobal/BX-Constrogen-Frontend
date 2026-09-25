import React, { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Controller, UseFormRegister, FieldErrors, FieldValues, UseFormSetValue } from 'react-hook-form';
import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { TabView, TabPanel } from 'primereact/tabview';
import { MultiSelect } from 'primereact/multiselect';
import { NumericFormat } from 'react-number-format';
import { ManageLayout, getFormErrorMessage, useToast, ManageLayoutHandle, FormField, Datacolumn, ListLayout } from '@igblsln/control';
import { useAddConstructionAgreementMutation, useUpdateConstructionAgreementMutation, useGetConstructionAgreementQuery } from '../constructionAgreementApi';
import ManagePaymentSchedule from './ManagePaymentSchedule';
import ManageServices from './ManageServices';

import {
  formatDate,
  AFTER_API_TIME,
  getClientProps,
  useGetNextDocNoQuery,
  useActiveCustomersQuery,
  convertDateValue,
  useGetSubmittedBookingsQuery,
  useActiveProjectQuery,
  useUnitsForProjectQuery,
  defaultDateFormat,
  setPromptNavigate,
  useAppDispatch
} from '@igblsln/store';
import { MODULE_NAME } from '../../../constants';
import { PAGE_NAME, PAGE_ROUTE } from '../constants';

type Props = {}

const Manage = (props: Props) => {
  const { showSuccess, showError } = useToast();
  const [showingToast, setShowingToast] = useState(false)
  const [itemsTableChanged, setItemsTableChanged] = useState(false)
  const [currentTab, setCurrentTab] = useState(0)

  const navigate = useNavigate();
  const { id: idString } = useParams()
  const id = parseInt(idString || '');
  const isNew = isNaN(id) || id <= 0;
  const [serviceTableChanged, setServiceTableChanged] = useState(false);
  const [stageTableChanged, setStageTableChanged] = useState(false)
  const manageLayoutRef = useRef<ManageLayoutHandle>();

  const clientProps = getClientProps();

  const { data, isLoading } = useGetConstructionAgreementQuery(id, {
    skip: isNew,
    refetchOnMountOrArgChange: true
  })



  const [serviceTableData, setServiceTableData] = useState<any[]>(data?.service_descriptions || []);
  const [paymentScheduleData, setPaymentScheduleData] = useState<any[]>(data?.payment_schedules || []);

  const [selectedProject, setSelectedProject] = useState<any>(null)
  const [selectedUnit, setSelectedUnit] = useState<any>(null)
  const [gridData, setGridData] = useState<any[]>([])
  const [selectedCustomers, setSelectedCustomers] = useState<any[]>([])
  const [formData, setFormData] = useState({});
    const dispatch = useAppDispatch()

  const { data: docData, isFetching: isDocDataFetching } = useGetNextDocNoQuery("CA", { skip: !isNew, refetchOnMountOrArgChange: isNew })
  const { data: customers, isLoading: customersFetching } = useActiveCustomersQuery()
  const { data: projects, isLoading: projectsFetching } = useActiveProjectQuery();

  const { data: unitData, isFetching: isUnitFetching } = useUnitsForProjectQuery({
    projectId: selectedProject
  }, { skip: !selectedProject, refetchOnMountOrArgChange: true })


  const [addConstructionAgreement, { isLoading: isAdding }] = useAddConstructionAgreementMutation()
  const [updateConstructionAgreement, { isLoading: isUpdating }] = useUpdateConstructionAgreementMutation();

  const onSubmit = async (values: any) => {
    try {

      const totalAmount = serviceTableData.map((x: any) => parseFloat(x.amount || 0)).reduce((partialSum: number, a: number) => partialSum + a, 0)
      const paymentScheduleAmount = paymentScheduleData.map((x: any) => parseFloat(x.amount || 0)).reduce((partialSum: number, a: number) => partialSum + a, 0)
  
      if (paymentScheduleAmount !== totalAmount) {
        showError("Scheduled Amount(s) are not equal to Total Amount", "Pleae Re-Check")
        return
      }

      let resp: any;
      let body = {
        ...values,
        docid: "CA",
        agreement_no: isNew ? docData?.next_doc_id : data?.agreement_no,
        agreement_date: formatDate(values.agreement_date, 'yyyy-MM-dd'),
        service_descriptions : serviceTableData,
        payment_schedules : paymentScheduleData,
        contract_amount : totalAmount
      }

      if (isNew) {
        resp = await addConstructionAgreement({ ...body, ...clientProps }).unwrap();
      } else {
        resp = await updateConstructionAgreement({ ...body, ...clientProps, key: data?.key }).unwrap();
      }

      showSuccess('Success', resp.detail);
      dispatch(setPromptNavigate({promptNavigate: false}))
      setShowingToast(true);
      setTimeout(() => {
        navigate("/sales/constructionagreement")
      }, AFTER_API_TIME);
    } catch (error: any) {
      showError('An error occurred', error?.data?.detail || "We couldn't save your post, try again!");
    }
  }

  useEffect(() => {
    setFormData(data || {
      ...clientProps,
      agreement_date: convertDateValue(new Date(), true),
      docid: "CA",
      agreement_no: docData?.next_doc_id,
      loctyp: 'PR'
    })
    if (data) {
      setServiceTableData(data?.service_descriptions || [])
      setPaymentScheduleData(data?.payment_schedules || [])
      setSelectedProject(data?.project_id)
    }
  }, [data])

  const renderForm = (control: any, _register: UseFormRegister<FieldValues>, errors: FieldErrors<FieldValues>, setValue: UseFormSetValue<any>) => {
    return (<div className='pl-4 pr-4 pt-4 grid p-fluid h-full'>

      <FormField label="Date" name="agreement_date" className="col-10 md:col-6" useExplicit control={control} errors={errors}
        convertValue={convertDateValue}
        required={"Select a Date"}
        leftSpan={4}
        rightSpan={8}
        formItem={{
          component: Calendar,
          componentProps: {
            showIcon: true,
            dateFormat: defaultDateFormat
          }
        }} />

      <FormField label="Project Name" name="project_id" className="col-10 md:col-6" control={control} errors={errors}
        isLoading={projectsFetching}
        required={"Select a Project"}
        leftSpan={4}
        rightSpan={8}
        useExplicit
        onChange={(e: any) => {
          setSelectedProject(e.value)
        }}
        formItem={{
          component: Dropdown,
          componentProps: {
            showClear: true,
            optionLabel: "name",
            optionValue: "key",
            filter: true,
            filterBy: "name",
            options: projects
          }
        }} />

      <FormField label="Unit Name" name="unit_id" className="col-10 md:col-6" control={control} errors={errors}
        isLoading={isUnitFetching}
        required={"Select an Unit"}
        leftSpan={4}
        rightSpan={8}
        formItem={{
          component: Dropdown,
          componentProps: {
            showClear: true,
            optionLabel: "descr",
            optionValue: "key",
            filter: true,
            filterBy: "descr",
            options: unitData
          }
        }} />

      <FormField label="Customer" name="customer_id" className="col-10 md:col-6" control={control} errors={errors}
        isLoading={customersFetching}
        leftSpan={4}
        rightSpan={8}
        formItem={{
          component: Dropdown,
          componentProps: {
            showClear: true,
            optionLabel: "name",
            optionValue: "key",
            filter: true,
            filterBy: "name",
            options: customers
          }
        }} />

      {/* <FormField label="Customer" name="cust_key" className="col-12 md:col-6" control={control} errors={errors}
        isLoading={customersFetching}
        required
        leftSpan={4}
        rightSpan={8}
        formItem={{
          component: MultiSelect,
          componentProps: {
            optionLabel: "name",
            value: selectedCustomers,
            onChange: (e: any) => setSelectedCustomers(e.value),
            options: customers,
            display: "chip",
            placeholder: "Select Customers",
            className: "w-full"
          }
        }} /> */}


      <FormField label="Contract Amount" name="contract_amount"
        leftSpan={4}
        rightSpan={8}
        className="col-10 md:col-6"
        control={control} errors={errors} formItem={{
          component: InputText,
          componentProps: {
            disabled: true,
            maxLength: 25,
            value: serviceTableData.map((x: any) => parseFloat(x.amount || 0)).reduce((partialSum: number, a: number) => partialSum + a, 0).toFixed(2),
          }
        }} />

      <FormField label="Paid Amount" name="paid_amount"
        leftSpan={4}
        rightSpan={8}
        className="col-10 md:col-6"
        control={control} errors={errors} formItem={{
          component: InputText,
          componentProps: {
            disabled: true,
            maxLength: 25
          }
        }} />

      <FormField label="Notes" name="notes" className="col-12"
        control={control} errors={errors}
        leftSpan={2}
        rightSpan={10}
        formItem={{
          component: InputText,
          componentProps: {
            maxLength: 255
          }
        }} />

      <TabView
        className='custom-tabview'
        activeIndex={currentTab}
        onTabChange={(e) => {
          setCurrentTab(e.index)
        }}
      >
        <TabPanel header="Services">
          <div className="col-12 " style={{ height: 'calc(100% - 183px)', minHeight: 200 }}>
            <ManageServices
              data={serviceTableData}
              isLoading={isLoading}
              onTableChange={(value: boolean) => !serviceTableChanged && setServiceTableChanged(value)}
              onChange={(value: any[]) => setServiceTableData(value)}
            />
          </div>
        </TabPanel>

        <TabPanel header="Payment Schedule">
          <div className="col-12 " style={{ height: 'calc(100% - 183px)', minHeight: 200 }}>
            <ManagePaymentSchedule
              data={paymentScheduleData}
              isLoading={isLoading}
              onTableChange={(value: boolean) => !stageTableChanged && setStageTableChanged(value)}
              onChange={(value: any[]) => setPaymentScheduleData(value)}
            />
          </div>
        </TabPanel>


        {
          !isNew &&
          <TabPanel header="Transaction Detail">
            <div className="col-12 " style={{ height: 'calc(100% - 183px)', minHeight: 200 }}>
              <ListLayout
                data={[]}
                newTable
                tableLayoutClass='h-full'
                hideActionColumn
              >
                <Datacolumn field="contract_voucher_dt" header="Date" />
                <Datacolumn field="voucher_number" header="Receipt No" />
                <Datacolumn field="total_amount" header="Amount" type="currency" defaultValue={0} />
                <Datacolumn field="payment_mode" header="Mode Of Payment" />

              </ListLayout>
            </div>
          </TabPanel>
        }

        {
          currentTab < 2 &&
          <TabPanel
            headerStyle={{
              display: 'flex',
              marginLeft: 'auto',
              paddingRight: 20
            }}
            headerTemplate={() => (
              <Button
                label={`Load From ${currentTab === 0 ? 'Service' : 'Schedule'} Template`}
                style={{
                  marginLeft: 'auto',
                  marginBottom: 5,
                  marginRight: 3,
                  display: 'flex',
                  width: 300
                }}
                onClick={(e) => {
                  e.preventDefault()
                  alert("Yet To Implement")
                }}
                className='p-button-plain'
              />
            )} >

          </TabPanel>
        }
      </TabView>


    </div>)
  }

  const getSaveBtnDisableStatus = () => {
    let disableConditions = ['U', 'R', 'C']
    return disableConditions.includes(data?.docstatus)
  }


  return (
    <>
      <ManageLayout disableSaveBtn={getSaveBtnDisableStatus()} baseRoute={`/${MODULE_NAME}/${PAGE_ROUTE}`} description={PAGE_NAME} id={id}
        data={formData}
        isUpdating={isAdding || isUpdating || showingToast}
        ref={manageLayoutRef}
        isItemsTableChanged={itemsTableChanged}
        isLoading={isLoading} onSubmit={onSubmit} renderForm={renderForm} />
    </>
  )
}

export default Manage