import React from 'react'
import {
  ListLayout,
  Datacolumn,
} from '@igblsln/control';
import { Dialog } from 'primereact/dialog';
import { useGetPSTemplatesForContractTypeQuery } from '../contractAgreementApi';

type Props = {
  displayModal: boolean,
  customDiscard: any,
  setTableData: Function,
  contractType: any
}

export default function LoadFromPSTemplate({
  displayModal,
  customDiscard,
  setTableData = () => { },
  contractType
}: Props) {

  const renderField = (row: any, field: string) => (
    <div
      style={{ cursor: 'pointer' }}
      onClick={() => {
        let temp = row?.payment_schedule_template_detail?.map((d:any) => {
          const {key,...rest} = d
          return {
            ...rest
          }
        })
        setTableData(temp || [])
        customDiscard()
      }}
    >
      {row[field] || ''}
    </div>
  )

  const { data, isFetching } = useGetPSTemplatesForContractTypeQuery({ cType: contractType }, { skip: !contractType, refetchOnMountOrArgChange: true });

  return (
    <>
      <Dialog
        header={`Load From Payment Schedule Template`}
        visible={displayModal}
        position={'center'}
        modal
        style={{ width: '50vw' }}
        onHide={() => customDiscard()}
        closeOnEscape
        draggable={false} resizable={false} closable
      >

        <ListLayout
          data={data}
          newTable
          tableLayoutClass='h-full'
          hideActionColumn
          isLoading={isFetching}
        >
          <Datacolumn
            field="template_name"
            header="Template Name"
            displayValueGetter={renderField}
            filteringType='text' />
          <Datacolumn
            field="description"
            header="Description"
            filteringType='text'
            displayValueGetter={renderField}
          />
          <Datacolumn
            field="contract_type"
            header="Contract Type"
            filteringType='text'
            displayValueGetter={renderField}
          />
        </ListLayout>
      </Dialog>
    </>
  )
}
