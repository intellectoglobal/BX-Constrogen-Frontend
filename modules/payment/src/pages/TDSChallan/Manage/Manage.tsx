import React, { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { UseFormRegister, FieldErrors, FieldValues } from 'react-hook-form';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { confirmDialog } from 'primereact/confirmdialog';
import { ManageLayout, useToast, ManageLayoutHandle, FormField } from '@igblsln/control';
import { useAddTDSChallanMutation, useUpdateTDSChallanMutation, useGetTDSChallanQuery, useAddVendorInvoiceMutation, useAddContractInvoiceMutation } from '../tdsChallanApi';
import { AFTER_API_TIME, getClientProps, useActiveVendorsQuery, useGetAllItemTypesQuery, useGetItemTypesForVendorQuery } from '@igblsln/store'
import ManageItem, { ManageItemHandle } from './ManageItem'
import { Accordion, AccordionTab } from 'primereact/accordion';


type Props = {}

const Manage = (props: Props) => {
  const { showSuccess, showError } = useToast();
  const [itemsTableChanged, setItemsTableChanged] = useState(false)
  const [poData, setPoData] = useState({});
  const navigate = useNavigate();
  const { id: idString } = useParams()
  const id = parseInt(idString || '');
  const isNew = isNaN(id) || id <= 0;
  const manageItemRef = useRef<ManageItemHandle>();
  const manageLayoutRef = useRef<ManageLayoutHandle>();

  const clientProps = getClientProps();

  const { data, isLoading } = useGetTDSChallanQuery(id, {
    skip: isNew,
    refetchOnMountOrArgChange: true
  })

  // const { data: pTemplate } = useListTDSTemplateQuery({})

  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null)
  const [gridData, setGridData] = useState<any[]>([])
  const [selectedItemType, setSelectedItemType] = useState<any>(null)
  const [selectedVendor, setSelectedVendor] = useState<any>(null)

  const [addTDSChallan, { isLoading: isAdding }] = useAddTDSChallanMutation()
  const [updateTDSChallan, { isLoading: isUpdating }] = useUpdateTDSChallanMutation();

  const onSubmit = async (values: any) => {
    try {
      let resp: any;
      let tdsChallanItems = manageItemRef.current?.getItems()
      let body = {
        ...values,
      }

      if (isNew) {
        resp = await addTDSChallan({ ...body, ...clientProps }).unwrap();
      } else {
        resp = await updateTDSChallan({ ...body, ...clientProps, key: data?.key }).unwrap();
      }

      showSuccess('Success', resp.detail);

      showSuccess('Success', resp.detail);
      setTimeout(() => {
        navigate("/payment/tdschallan")
      }, AFTER_API_TIME);

    } catch (error: any) {
      showError('An error occurred', error?.data?.detail || "We couldn't save your post, try again!");
    }
  }



  const renderForm = (control: any, _register: UseFormRegister<FieldValues>, errors: FieldErrors<FieldValues>) => {
    return (<div className='pl-4 pt-4 grid p-fluid h-full'>


      <FormField label="Challan No" name="challan_no" className="col-12 md:col-6" control={control} errors={errors}
        required
        leftSpan={4}
        rightSpan={6}
        formItem={{
          component: InputText,
          componentProps: {
            maxLength: 50
          }
        }}
      />

      <FormField label="Month ID" name="monthid" className="col-12 md:col-6" control={control} errors={errors}
        required
        leftSpan={4}
        rightSpan={6}
        formItem={{
          component: InputText,
          componentProps: {
            maxLength: 50
          }
        }}
      />

      <FormField label="Company Name" name="company" className="col-12 md:col-6" control={control} errors={errors}
        required
        leftSpan={4}
        rightSpan={6}
        formItem={{
          component: InputText,
          componentProps: {
            maxLength: 50
          }
        }}
      />

      <FormField label="Challan Description" name="descr" className="col-12 md:col-6" control={control} errors={errors}
        required
        leftSpan={4}
        rightSpan={6}
        formItem={{
          component: InputText,
          componentProps: {
            maxLength: 50
          }
        }}
      />

      {/* <div className="col-12 md:col-6"></div> */}

      <Accordion className="col-12">
        <AccordionTab header="Description">

          <div className="col-12 " style={{ height: 'calc(100% - 183px)', minHeight: 200 }}>
            <ManageItem
              data={gridData}
              isLoading={isLoading}
              ref={manageItemRef}
              onChange={(value: boolean) => !itemsTableChanged && setItemsTableChanged(value)}
            />
          </div>

        </AccordionTab>
      </Accordion>

      <FormField label="Other Charges" name="others" className="col-12 md:col-6" control={control} errors={errors}
        required
        leftSpan={4}
        rightSpan={6}
        formItem={{
          component: InputText,
          componentProps: {
            maxLength: 50
          }
        }}
      />

      <FormField label="Total Amount" name="total" className="col-12 md:col-6" control={control} errors={errors}
        required
        leftSpan={4}
        rightSpan={6}
        formItem={{
          component: InputText,
          componentProps: {
            maxLength: 50
          }
        }}
      />

      <FormField label="Payment Status" name="status" className="col-12 md:col-6" control={control} errors={errors}
        required
        leftSpan={4}
        rightSpan={6}
        formItem={{
          component: InputText,
          componentProps: {
            maxLength: 50
          }
        }}
      />
    </div>)
  }


  return (
    <>
      <ManageLayout
        baseRoute="/payment/tdschallan"
        description="TDS Challan"
        id={id}
        data={poData}
        isUpdating={isAdding || isUpdating}
        ref={manageLayoutRef}
        isItemsTableChanged={itemsTableChanged}
        isLoading={isLoading}
        onSubmit={onSubmit}
        renderForm={renderForm}
      />
    </>
  )
}

export default Manage