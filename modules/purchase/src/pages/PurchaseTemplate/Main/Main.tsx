import React, { useState } from 'react';
import { ListLayout, Datacolumn } from '@igblsln/control';
import { PAGE_SIZE } from '@igblsln/store';
import { Button } from 'primereact/button';
import { useDeletePurchaseTemplateMutation, useListPurchaseTemplateQuery } from '../purchaseTemplateApi';

type Props = {}

const Main = (props: Props) => {
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(PAGE_SIZE)
  const { data, isFetching: isLoading } = useListPurchaseTemplateQuery({ page: page, size: size })
  const [deleteDataAction, { isLoading: isDeleting }] = useDeletePurchaseTemplateMutation()
  const deleteAction = (id: number) => deleteDataAction(id).unwrap();

  const statusTemplate = (rowData: any) => {
    return rowData.inactive === "Y" ? "Inactive" : "Active";
  }

  const actionBodyTemplate = () => {
    return (<>
      <Button style={{ height: '35px', marginRight : 10, width: '20px' }} type="button" className={"p-button-rounded p-button-text"} icon="pi pi-eye"></Button>
      <Button style={{ height: '35px', marginRight : 10, width: '20px' }} type="button" className={"p-button-rounded p-button-text"} icon="pi pi-pencil"></Button>
      <Button style={{ height: '35px', marginRight : 10, width: '20px' }} type="button" className={"p-button-rounded p-button-text"} icon="pi pi-trash"></Button>
    </>);
  }

  return (
    <ListLayout
      pagination={{
        pageSize: size,
        loading: isLoading,
        currentPage: page,
        total: data?.count,
        onChange: (page, size) => {
          setPage(page);
          setSize(size)
        }
      }}
      enableView
      baseRoute="/purchase/purchasetemplate"
      description="Purchase Template"
      addBtnLabel='Create Template'
      isLoading={isLoading || isDeleting}
      newTable
      showHeader
      data={data?.results}
      deleteAction={deleteAction}
      hideActionColumn
    >
      {/* <Datacolumn width={'9%'} field="action" header="" displayValueGetter={actionBodyTemplate} /> */}
      <Datacolumn field="number" header="Template" filteringType='number' />
      <Datacolumn field="name" header="Template Name" filteringType='text' />
      <Datacolumn field="itemtyp_key" header="Item Type" filteringType='text' />
      <Datacolumn field="inactive" header="Active Status" filteringType='text' displayValueGetter={statusTemplate} />
    </ListLayout>
  );
}

export default Main