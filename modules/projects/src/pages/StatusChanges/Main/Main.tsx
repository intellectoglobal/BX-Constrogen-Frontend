import React, { useRef } from 'react'
import { useParams } from 'react-router-dom'
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { classNames } from "primereact/utils";
import { Skeleton } from 'primereact/skeleton';
import { Toast } from 'primereact/toast';
import { Divider } from 'primereact/divider';
import { InputText } from 'primereact/inputtext';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Datatable } from '@igblsln/control';
import { Link } from 'react-router-dom'
import { headerIconStyle, headerStyle } from '@igblsln/themes';
import { useListStatusChangeQuery, useDeleteStatusChangeMutation } from '../statusChangeApi';
import { useGetProjectQuery } from '../../Projects/apis';

type Props = {}

export const defaultActionBodyTemplate = (baseroute: string, deleteData: any, deleteFunc: Function) => {
  return (value: any) => {
    return (<>
      <Link
        to={`${baseroute}/${value.key}/edit`}
        style={{ textDecoration: "none" }} >
        <Button icon="pi pi-eye" className="p-button-rounded p-button-text"></Button>
      </Link>
      <Button style={{ height: '20px', width: '20px', borderRadius: 50 }} className="p-button-rounded p-button-text" onClick={() => deleteData(value.key, deleteFunc)} icon="pi pi-trash"></Button>
    </>);
  }
}

const Main = (props: Props) => {



  const toast = useRef<Toast>(null);

  const { id: idString } = useParams()
  const id = parseInt(idString || '');
  const isNew = isNaN(id) || id <= 0;

  const { data: projectData, isLoading: isProjectFetching } = useGetProjectQuery(id, {
    skip: isNew
  })

  const { data: statusChangeData, isLoading: isStatusChangeFetching } = useListStatusChangeQuery({projectId : projectData?.key},{skip : !projectData?.key})
  const [deleteStatusChangeDataAction, { isLoading: isStatusChangeDeleting }] = useDeleteStatusChangeMutation()
  const deleteStatusChangeAction = (id: number) => deleteStatusChangeDataAction(id).unwrap();


  if (isStatusChangeFetching) {
    return <div className="custom-skeleton p-4">
      <div>
        <Skeleton height="50px" width="30%" className="mb-2"></Skeleton>
        <Skeleton height="50px" width="50%" className="mb-2"></Skeleton>
      </div>
    </div>
  }

  const showSuccess = (title: string, msg: string) => {
    toast?.current?.show({ severity: 'success', summary: title, detail: msg, life: 3000 });
  }

  const showError = (title: string, msg: string) => {
    toast?.current?.show({ severity: 'error', summary: title, detail: msg, life: 3000 });
  }


  const deleteData = async (data: any, func: Function) => {

    if (!func) {
      return;
    }

    confirmDialog({
      message: 'Are you sure you want to delete?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          const resp = await func(data);
          //@ts-ignore
          showSuccess('Success', resp);
        } catch (error: any) {
          showError("Failed", error?.data?.detail)
        }
      },
      reject: () => { }
    });
  }

  const customHeaderStyle = {
    ...headerStyle,
    backgroundColor: 'gray',
    color: 'white'
  }

  const customHeaderIconStyle = {
    ...headerIconStyle,
    backgroundColor: 'gray',
    color: 'white'
  }

  return (
    <>
      <Toast ref={toast} />
      <div>
        <div className='flex'>
          <h3 className={classNames('m-0 my-auto')} >Status Change</h3>
          <Link
            to={`/projects/${id}/statuschange/new`}
            style={{ textDecoration: "none" }} >
            <Button label="Add" className="ml-3" />
          </Link>
          <Link
            to={`/projects/project/${id}/edit`}
            style={{ textDecoration: "none", marginLeft : 'auto' }} >
            <Button label="Back" className="ml-auto" />
          </Link>
        </div>
        <Divider/>
        <div className='pl-8'>
          <div className="field">
            <label className={classNames('col-2')}>Project Code</label>
            <InputText value={projectData?.id} disabled />
          </div>
          <div className="field">
            <label className={classNames('col-2')}>Project Name</label>
            <InputText style={{ width: '50%' }} value={projectData?.name} disabled />
          </div>
        </div>
        <Divider/>
      </div>
      <Datatable loading={isStatusChangeDeleting} style={{ /*height: 'calc(100vh - 450px)',*/ maxHeight: 250, overflowX: 'auto', border: '2px solid', padding: 10, margin: 10 }} value={statusChangeData?.results}>
        <Column headerStyle={customHeaderIconStyle} style={{ maxWidth: '100px' }} bodyStyle={{ textAlign: 'center', overflow: 'visible' }} body={defaultActionBodyTemplate(`/projects/${id}/statuschange`, deleteData, deleteStatusChangeAction)} />
        <Column headerStyle={customHeaderStyle} field="effdate" header="Effective Date" sortable filter dataType="numeric" style={{ minWidth: '8rem' }} />
        <Column headerStyle={customHeaderStyle} field="proj_status.descr" header="Effective Status" sortable filter dataType="numeric" style={{ minWidth: '8rem' }} />
        <Column headerStyle={customHeaderStyle} field="createdby" header="User" sortable filter style={{ minWidth: '12rem' }} />
      </Datatable>
    </>
  );
}

export default Main