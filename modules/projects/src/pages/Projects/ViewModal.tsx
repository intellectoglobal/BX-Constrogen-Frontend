import React, { useEffect } from 'react'
import { UseFormRegister, FieldErrors, FieldValues, UseFormSetValue } from 'react-hook-form';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import {
  ManageLayout,
  FormField,
  Datacolumn,
  ListLayout
} from '@igblsln/control';
import { useGetProjectQuery } from './apis';
import { Dialog } from 'primereact/dialog';
import { ViewModalBorderRadius } from '@igblsln/store';

type Props = {
  displayModal: boolean,
  projectId: any;
  customDiscard: any,
}

export default function ViewModal({ displayModal, projectId, customDiscard }: Props) {

  const { data, isFetching } = useGetProjectQuery(projectId, {
    refetchOnMountOrArgChange: true,
    skip: !projectId
  })

  // useEffect(() => {
  //   if (displayModal) {
  //     document.addEventListener("keydown", (e) => {
  //       if (e.key === 'ArrowRight') {
  //         console.log("Do It")
  //       }
  //     })
  //   }
  //   // else {
  //   //   document.removeEventListener('keydown', (e) => {
  //   //     if (e.key === 'ArrowRight') {
  //   //       console.log("Do It")
  //   //     }
  //   //   })
  //   // }
  //   return () => {
  //     document.removeEventListener('keydown', (e) => {
  //       if (e.key === 'ArrowRight') {
  //         console.log("Do It")
  //       }
  //     })
  //   }
  // }, [displayModal])

  const renderForm = (control: any, _register: UseFormRegister<FieldValues>, errors: FieldErrors<FieldValues>) => {
    return (
      <div className='pl-4 pt-4 grid p-fluid h-full'>

        <div style={{ border: '2px solid', width: '100%', borderRadius: ViewModalBorderRadius }} className='mb-4 mr-6 pl-4 pt-4 grid p-fluid h-full'>
          <FormField
            label="Project Name"
            className="col-12 md:col-6"
            name="name"
            control={control}
            errors={errors}
            leftSpan={4}
            rightSpan={6}
            formItem={{
              component: InputText,
              componentProps: {
                maxLength: 100
              }
            }} />

          <FormField
            label="Project Type"
            className="col-12 md:col-6"
            name="pro_type.descr"
            control={control}
            errors={errors}
            leftSpan={4}
            rightSpan={6}
            formItem={{
              component: InputText,
              componentProps: {
                maxLength: 100
              }
            }} />


          {/* <FormField
            label="Project Code"
            className="col-12 md:col-6"
            name="id"
            control={control}
            errors={errors}
            leftSpan={4}
            rightSpan={6}
            formItem={{
              component: InputText,
              componentProps: {

              }
            }} /> */}

          <FormField
            label="No of Units"
            className="col-12 md:col-6"
            name="no_of_units"
            control={control}
            errors={errors}
            leftSpan={4}
            rightSpan={6}
            formItem={{
              component: InputText,
              componentProps: {
                thousandSeparator: true,
                type: 'number',
              }
            }} />

        </div>

        <div style={{ border: '2px solid', width: '100%', borderRadius: ViewModalBorderRadius }} className='mb-4 mr-6 pl-4 pt-4 grid p-fluid h-full'>


          <FormField
            label="State"
            className="col-12 md:col-4"
            name="state.name"
            control={control}
            errors={errors}
            leftSpan={4}
            rightSpan={6}
            formItem={{
              component: InputText,
              componentProps: {

              }
            }} />

          <FormField
            label="City"
            className="col-12 md:col-4"
            name="city.name"
            control={control}
            errors={errors}
            leftSpan={4}
            rightSpan={6}
            formItem={{
              component: InputText,
              componentProps: {

              }
            }} />

          <FormField
            label="Project Status"
            className="col-12 md:col-4"
            name="status.descr"
            control={control}
            errors={errors}
            leftSpan={4}
            rightSpan={6}
            formItem={{
              component: InputText,
              componentProps: {

              }
            }} />

          <FormField
            label="Address Line"
            className="col-12"
            name="addr1"
            control={control}
            errors={errors}
            leftSpan={2}
            rightSpan={8}
            formItem={{
              component: InputTextarea,
              componentProps: {
                maxLength: 100,
                rows: 3,
                autoResize: true
              }
            }} />




          {/* <div className="col-12 " style={{ height: 'calc(100% - 383px)', minHeight: 200 }}>
            <ListLayout description="Units List"
              data={[]}
              newTable
              showHeader
              hideAddButton
              tableLayoutClass='h-full'
              allowFilters={false}
              gridProps={{
                allowAdd: false,
              }}>
              <Datacolumn field="date" header="Unit" type="text" defaultValue={""} />
              <Datacolumn field="project" header="Description" />
              <Datacolumn field="totalamt" header="Saleable SQFT" defaultValue={0} />

            </ListLayout>
          </div> */}

        </div>

      </div>)
  }


  return (
    <>
      <Dialog
        header={`View Project`}
        visible={displayModal}
        position={'center'}
        modal
        style={{ width: '70vw' }}
        onHide={() => customDiscard()}
        closeOnEscape
        draggable={false} resizable={false} closable
      >
        <ManageLayout
          baseRoute=""
          viewMode
          id={projectId}
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
