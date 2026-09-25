import React, { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { UseFormRegister, FieldErrors, FieldValues } from 'react-hook-form';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { Tooltip } from 'primereact/tooltip';
import { TabView, TabPanel } from 'primereact/tabview';
import { SaveResponse } from '@igblsln/model';
import { ManageLayout, FormField, useToast, ManageLayoutHandle, ListLayout, Datacolumn } from '@igblsln/control';
import { useActiveProjectQuery, useActiveContractorsQuery, AFTER_API_TIME, getClientProps, useGetAllContractorTypeQuery, defaultDateFormat, useAppDispatch, setPromptNavigate } from '@igblsln/store';
import { useGetContractAgreementQuery, useAddContractAgreementMutation, useUpdateContractAgreementMutation, ContractAgreement, useGetTransactionsForAgreementQuery, useGetInvoicesForAgreementQuery } from '../contractAgreementApi';
import ManageServices from './ManageServices';
import ManagePaymentSchedule from './ManagePaymentSchedule';
import { formatDate, useGetNextDocNoQuery } from '@igblsln/store';
import { MODULE_NAME } from '../../../constants';
import { PAGE_ROUTE } from '../constants';
import LoadFromCS from '../Modals/LoadFromCSTemplate'
import LoadFromPS from '../Modals/LoadFromPSTemplate'

type Props = {
}

const convertDateValue = (value: any, reverse?: boolean) => {
  if (value) {
    return reverse ? `${value.getFullYear()}-${value.getMonth() + 1}-${value.getDate()}` : new Date(value);
  }
  return value;
}

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

  const clientProps = getClientProps();

  const [selectedProject, setSelectedProject] = useState<any>(null)
  const [displayCSModal, setDisplayCSModal] = useState<boolean>(false)
  const [displayPSModal, setDisplayPSModal] = useState<boolean>(false)
  const [selectedContractorType, setSelectedContractorType] = useState<any>(null)

  const { data, isLoading, refetch } = useGetContractAgreementQuery(id, {
    skip: isNew
  })

  const [serviceTableData, setServiceTableData] = useState<any[]>(data?.service_descriptions || []);
  const [paymentScheduleData, setPaymentScheduleData] = useState<any[]>(data?.payment_schedules || []);


  const { data: docId, isLoading: isDocIdLoading } = useGetNextDocNoQuery("CAN", {
    skip: !isNew,
    refetchOnMountOrArgChange: true
  })

  const navigate = useNavigate();

  const { data: projects, isLoading: projectsFetching } = useActiveProjectQuery();
  const { data: contractor, isLoading: contractorFetching } = useActiveContractorsQuery();
  const { data: contractorType, isLoading: contractorTypeFetching } = useGetAllContractorTypeQuery();
  const { data: transactions } = useGetTransactionsForAgreementQuery(id, { skip: isNew });
  const { data: invoices } = useGetInvoicesForAgreementQuery({ project: data?.project_id, agreement: id }, { skip: (isNew || !data) });

  const [updateContract, { isLoading: isUpdating }] = useUpdateContractAgreementMutation()
  const [addContract, { isLoading: isAdding }] = useAddContractAgreementMutation()

  useEffect(() => {
    setFormData(data || {
      ...clientProps,
      agreement_date: convertDateValue(new Date(), true),
      docid: "CAN",
      agreement_no: docId?.next_doc_id,
    })
    if (data) {
      setServiceTableData(data?.service_descriptions)
      setPaymentScheduleData(data?.payment_schedules)
      setSelectedContractorType(data?.contractor?.contractortyp_key)
    }
  }, [data, docId])

  useEffect(() => {
    if (data) {
      setSelectedProject(data.project_id)
    }
  }, [data, contractor])

  const selectedProjectName = React.useMemo(() => {
    if (!selectedProject) return '';

    const selectedKey = (selectedProject as any)?.key ?? selectedProject;
    const selectedKeyAsString = String(selectedKey);

    const match = projects?.find?.((p: any) => String(p?.key) === selectedKeyAsString);
    return match?.name ?? (typeof selectedProject === 'object' ? selectedProject?.name : '') ?? '';
  }, [selectedProject, projects]);

  const onSubmit = async (values: any) => {

    const totalAmount = serviceTableData.map((x: any) => parseFloat(x.cost || 0)).reduce((partialSum: number, a: number) => partialSum + a, 0).toFixed(2)
    const paymentScheduleAmount = paymentScheduleData.map((x: any) => parseFloat(x.amount || 0)).reduce((partialSum: number, a: number) => partialSum + a, 0).toFixed(2)

    if(serviceTableData.some((x: any) => !x.service_desc || !x.uom)){
      showError("Service Description and UOM are required", "Please fill all the required fields")
      return
    }

    if (paymentScheduleAmount != totalAmount) {
      showError("Scheduled Amount(s) are not equal to Total Amount", "Pleae Re-Check")
      return
    }

    if(serviceTableData.length === 0) {
      showError("Service Needed", "Atleast one service needed")
      return
    }

    if(paymentScheduleAmount.length === 0) {
      showError("Need Payment Schedule", "Atleast One Payment Schedule")
      return
    }

    let body = {
      ...values,
      agreement_date: formatDate(values.agreement_date, 'yyyy-MM-dd'),
      service_descriptions: serviceTableData.filter((d: any) => !!d.service_desc && !!d.uom),
      payment_schedules: paymentScheduleData,
      total_amount: totalAmount
    }

    console.log(body);


    try {
      let resp: SaveResponse<ContractAgreement>;
      if (isNew) {
        resp = await addContract({ ...body, ...clientProps }).unwrap();
      } else {
        resp = await updateContract({ ...body, ...clientProps }).unwrap();
      }

      refetch();

      showSuccess('Success', resp.detail);
      dispatch(setPromptNavigate({promptNavigate: false}))
      setShowingToast(true);
      setTimeout(() => {
        navigate(`/${MODULE_NAME}/${PAGE_ROUTE}`)
      }, AFTER_API_TIME);
    } catch (error: any) {
      showError('An error occurred', "We couldn't save your post, try again!");
    }
  }

    const getPaymentStatus = (row: any) => {
    switch (row?.invoice_status) {
      case "O":
        return "Not Paid"
      case "A":
        return "Partially Paid"
      case "P":
        return "Paid"
      default:
        return "NA"
    }
  }

  const displayInvoiceNumbers = (row:any) => {
    console.log("row.Invoice_id ::", row?.invoice_id.join(", "))
    return row?.invoice_id.join(", ")
  }

  const renderForm = (control: any, _register: UseFormRegister<FieldValues>, errors: FieldErrors<FieldValues>) => {
    return (
      <div className='pl-4 pr-4 pt-4 pb-3 grid p-fluid h-full'>
        {/* <FormField label="Agreement No" name="agreement_no" isLoading={isDocIdLoading} className="col-10 md:col-6" control={control} errors={errors}
          leftSpan={4}
          rightSpan={8}
          formItem={{
            component: InputNumber,
            componentProps: {
              useGrouping: false,
              disabled: true
            }
          }} /> */}

        <FormField label="Contractor Type" name="contractor_type" className="col-10 md:col-4" control={control} errors={errors}
          isLoading={contractorTypeFetching}
          leftSpan={4}
          rightSpan={8}
          useExplicit
          onChange={(e: any) => {
            let temp = contractorType?.filter(d => d.key === e.value);
            if (temp) {
              setSelectedContractorType(temp[0]?.key)
            }
          }}
          formItem={{
            component: Dropdown,
            componentProps: {
              showClear: true,
              optionLabel: "descr",
              optionValue: "key",
              filter: true,
              filterBy: "descr",
              options: contractorType,
              value: selectedContractorType
            }
          }} />

        <FormField label="Contractor" name="contractor_id" className="col-10 md:col-4" control={control} errors={errors}
          isLoading={contractorFetching}
          required={"Select a Contractor"}
          leftSpan={4}
          rightSpan={8}
          useExplicit
          formItem={{
            component: Dropdown,
            componentProps: {
              showClear: true,
              optionLabel: "name",
              optionValue: "key",
              filter: true,
              filterBy: "name",
              //@ts-ignore
              options: contractor?.filter(c => (c?.contractortyp_key === selectedContractorType) && c.inhouse !== "Y")
            }
          }} />

        {!!selectedProjectName && (
          <Tooltip
            mouseTrack
            mouseTrackLeft={24}
            mouseTrackTop={18}
            target="#contractagreement-project"
            position="bottom"
            content={selectedProjectName}
            className="my-tooltip-plain"
          />
        )}
        <FormField label="Project" name="project_id" className="col-10 md:col-4" control={control} errors={errors}
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
              id: 'contractagreement-project',
              optionLabel: "name",
              optionValue: "key",
              filter: true,
              filterBy: "name",
              options: projects
            }
          }} />

        <FormField label="Date" name="agreement_date" className="col-10 md:col-4" useExplicit control={control} errors={errors}
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



        <FormField label="Total Amount" name="total_amount"
          leftSpan={4}
          rightSpan={8}
          className="col-10 md:col-4"
          control={control} errors={errors} formItem={{
            component: InputText,
            componentProps: {
              disabled: true,
              value: serviceTableData.map((x: any) => parseFloat(x.cost || 0)).reduce((partialSum: number, a: number) => partialSum + a, 0).toFixed(2),
            }
          }} />

        <FormField label="Paid Amount" name="paid_amount"
          leftSpan={4}
          rightSpan={8}
          className="col-10 md:col-4"
          control={control} errors={errors} formItem={{
            component: InputText,
            componentProps: {
              disabled: true,
              maxLength: 25
            }
          }} />

        <FormField label="Notes" name="notes" className="col-10 md:col-12"
          control={control} errors={errors}
          leftSpan={1}
          rightSpan={11}
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
            <TabPanel header="Invoice Detail">
              <div className="col-12 " style={{ height: 'calc(100% - 183px)', minHeight: 200 }}>
                <ListLayout
                  data={invoices}
                  newTable
                  tableLayoutClass='h-full'
                  hideActionColumn
                >
                  <Datacolumn field="invoice_date" header="Date" />
                  <Datacolumn field="invoice_id" header="Invoice No" />
                  <Datacolumn field="invoice_desc" header="Invoice Description" />
                  <Datacolumn field="invoice_amount" header="Amount" type="currency" defaultValue={0} />
                  <Datacolumn field="invoice_status" header="Payment Status" displayValueGetter={getPaymentStatus}/>
                  <Datacolumn field="tds_amount" header="TDS" type="currency" defaultValue={0} />
                </ListLayout>
              </div>
            </TabPanel>
          }

          {
            !isNew &&
            <TabPanel header="Transaction Detail">
              <div className="col-12 " style={{ height: 'calc(100% - 183px)', minHeight: 200 }}>
                <ListLayout
                  data={transactions}
                  newTable
                  tableLayoutClass='h-full'
                  hideActionColumn
                >
                  <Datacolumn field="contract_voucher_dt" header="Date" />
                  <Datacolumn field="voucher_number" header="Voucher No" />
                  <Datacolumn field="paid_amount" header="Invoice No" displayValueGetter={displayInvoiceNumbers}/>
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
                  disabled={!selectedContractorType}
                  onClick={(e) => {
                    e.preventDefault()
                    if (currentTab === 0) {
                      setDisplayCSModal(true)
                    }
                    else {
                      setDisplayPSModal(true)
                    }
                  }}
                  className='p-button-plain'
                />
              )} >

            </TabPanel>
          }
        </TabView>

      </div>
    )
  }

  return (
    <>
      <ManageLayout
        ref={manageLayoutRef}
        baseRoute={`/${MODULE_NAME}/${PAGE_ROUTE}`}
        description={`Contract Agreement ${!isNew ? ` - ${data?.agreement_no}` : ''}`}
        id={id}
        data={formData}
        isItemsTableChanged={serviceTableChanged || stageTableChanged}
        isUpdating={isAdding || isUpdating || showingToast}
        isLoading={isLoading} onSubmit={onSubmit} renderForm={renderForm} />
      {
        displayCSModal &&
        <LoadFromCS
          displayModal={displayCSModal}
          customDiscard={() => setDisplayCSModal(false)}
          setTableData={(value: any[]) => setServiceTableData(value)}
          contractType={selectedContractorType}
        />
      }
      {
        displayPSModal &&
        <LoadFromPS
          displayModal={displayPSModal}
          customDiscard={() => setDisplayPSModal(false)}
          setTableData={(value: any[]) => setPaymentScheduleData(value)}
          contractType={selectedContractorType}
        />
      }

    </>
  )
}

export default Manage;