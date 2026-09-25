import React from 'react'
import { UseFormRegister, FieldErrors, FieldValues, UseFormSetValue } from 'react-hook-form';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { RadioButton } from 'primereact/radiobutton';
import {
  ManageLayout,
  FormField,
  Datacolumn,
  ListLayout
} from '@igblsln/control';
import { useGetPurchaseOrderQuery } from './apis';
import { Dialog } from 'primereact/dialog';
import { ViewModalBorderRadius } from '@igblsln/store';

type Props = {
  displayModal: boolean,
  poId: any;
  customDiscard: any,
}

export default function ViewModal({ displayModal, poId, customDiscard }: Props) {

  const { data, isFetching } = useGetPurchaseOrderQuery(poId, {
    refetchOnMountOrArgChange: true
  })

  const renderForm = (control: any, _register: UseFormRegister<FieldValues>, errors: FieldErrors<FieldValues>) => {
    return (<div className='pl-4 pt-4 grid p-fluid h-full'>

      <div style={{ border: '2px solid', width: '100%', borderRadius: ViewModalBorderRadius }} className='mb-4 mr-6 pl-4 pt-4 grid p-fluid h-full'>
        <FormField label="Payment ID" name="number" className="col-12 md:col-6" control={control} errors={errors}
          leftSpan={4}
          rightSpan={6}
          formItem={{
            component: InputText,
            componentProps: {
              // useGrouping: false,
              // disabled: true,
              // value: data?.number || docData?.next_doc_id
            }
          }} />

        <FormField label="Amount" name="proj_key" className="col-12 md:col-6" control={control} errors={errors}
          // required={"Select a Project"}
          leftSpan={4}
          rightSpan={6}
          formItem={{
            component: Dropdown,
            componentProps: {
              showClear: true,
              optionLabel: "name",
              optionValue: "key",
              filter: true,
              filterBy: "name",
              options: []
            }
          }} />

        <FormField label="Date" name="date" className="col-12 md:col-6" useExplicit control={control} errors={errors}
          leftSpan={4}
          rightSpan={6}
          formItem={{
            component: InputText,
            componentProps: {
            }
          }} />

        <FormField label="Type" name="descr7" className="col-12 md:col-6" control={control} errors={errors}
          // required
          leftSpan={4}
          rightSpan={6}
          formItem={{
            component: Dropdown,
            componentProps: {
              options: ["Income", "Expense"]
            }
          }}
        />

      </div>

      <div style={{ border: '2px solid', width: '100%', borderRadius: ViewModalBorderRadius }} className='mb-4 mr-6 pl-4 pt-4 grid p-fluid h-full'>

        <FormField label="Company Name" name="proj_key" className="col-12 md:col-6" control={control} errors={errors}
          // required={"Select a Project"}
          leftSpan={4}
          rightSpan={6}
          formItem={{
            component: Dropdown,
            componentProps: {
              showClear: true,
              optionLabel: "name",
              optionValue: "key",
              filter: true,
              filterBy: "name",
              options: []
            }
          }} />

        <FormField label="Account Name" name="descr2" className="col-12 md:col-6" control={control} errors={errors}
          // required
          leftSpan={4}
          rightSpan={6}
          formItem={{
            component: InputText,
            componentProps: {
              maxLength: 50
            }
          }}
        />

        <FormField label="Beneficiary Type" name="descr7" className="col-12 md:col-6" control={control} errors={errors}
          // required
          leftSpan={4}
          rightSpan={6}
          formItem={{
            component: Dropdown,
            componentProps: {
              options: ["Vendor", "Contractor", "Employee", "Taxer", "Flat Purchaser", "Land Purchaser", "Miscellaneous"]
            }
          }}
        />

        <FormField label="Beneficiary Name" name="descr1" className="col-12 md:col-6" control={control} errors={errors}
          // required
          leftSpan={4}
          rightSpan={6}
          formItem={{
            component: InputText,
            componentProps: {
              maxLength: 50
            }
          }}
        />

        <FormField label="Reference ID " name="descr8" className="col-12 md:col-6" control={control} errors={errors}
          // required
          leftSpan={4}
          rightSpan={6}
          formItem={{
            component: InputText,
            componentProps: {
              maxLength: 50
            }
          }}
        />

        <FormField label="Payment Mode" name="descr8" className="col-12 md:col-6" control={control} errors={errors}
          // required
          leftSpan={4}
          rightSpan={6}
          formItem={{
            component: InputText,
            componentProps: {
              maxLength: 50
            }
          }}
        />

        <div className="col-12 " style={{ height: 'calc(100% - 383px)', minHeight: 200 }}>
          <ListLayout description="Transaction ID List"
            data={[]}
            newTable
            showHeader
            hideAddButton
            tableLayoutClass='h-full'
            allowFilters={false}
            gridProps={{
              allowAdd: false,
            }}>
            <Datacolumn field="date" header="Date" type="text" defaultValue={""} />
            <Datacolumn field="project" width="20%" header="Receipt No" />
            <Datacolumn field="totalamt" header="Transaction ID" type="currency" defaultValue={0} />
            <Datacolumn field="estamt" header="Payment Status" type="text" defaultValue={""} />

          </ListLayout>
        </div>

      </div>

    </div>)
  }


  return (
    <>
      <Dialog
        header={`View Transaction`}
        visible={displayModal}
        position={'center'}
        modal
        style={{ width: '70vw' }}
        onHide={() => customDiscard()}
        closeOnEscape
        draggable={false} resizable={false} closable
      >
        <ManageLayout
          baseRoute="/payment/vendorpayment"
          viewMode
          id={poId}
          bottomControl
          data={data}
          hideHeader
          customDiscard={customDiscard}
          isLoading={isFetching}
          onSubmit={() => { }}
          renderForm={renderForm}
        />
      </Dialog>
    </>
  )
}
