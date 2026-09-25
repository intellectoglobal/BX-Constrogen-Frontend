import React, { useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { classNames } from "primereact/utils";
import { Skeleton } from 'primereact/skeleton';
import { Toast } from 'primereact/toast';
import { Divider } from 'primereact/divider';
import { InputText } from 'primereact/inputtext';
import { confirmDialog } from 'primereact/confirmdialog';
import { Datacolumn, Datatable, ListLayout } from '@igblsln/control';
import { Link } from 'react-router-dom'
import { headerIconStyle, headerStyle } from '@igblsln/themes';
import { useDeleteProjectBlockMutation } from '../blockApi';
import { useListProjectFloorQuery, useDeleteProjectFloorMutation } from '../floorApi';
import { useListProjectUnitQuery, useDeleteProjectUnitMutation } from '../unitApi';
import { useGetProjectQuery } from '../../Projects/apis';
import { PAGE_SIZE, formatNumber, useBlocksForProjectQuery, } from '@igblsln/store';

type Props = {}

export const defaultActionBodyTemplate = (baseroute: string, deleteData: any, deleteFunc: Function) => {
  return (value: any) => {
    return (<>
      <Link
        to={`${baseroute}/${value.key}/edit`}
        style={{ textDecoration: "none" }} >
        <Button icon="pi pi-eye" className="p-button-rounded p-button-text"></Button>
      </Link>
      <Button style={{ height: '20px', width: '20px', borderRadius: 50 }} onClick={() => deleteData(value.key, deleteFunc)} className="p-button-rounded p-button-text" icon="pi pi-trash"></Button>
    </>);
  }
}

const Main = (props: Props) => {

  const [unitPage, setUnitPage] = useState(1)
  const [unitSize, setUnitSize] = useState(PAGE_SIZE)

  const [deleteBlockDataAction, { isLoading: isBlockDeleting }] = useDeleteProjectBlockMutation()
  const deleteBlockAction = (id: number) => deleteBlockDataAction(id).unwrap();
  const [deleteFloorDataAction, { isLoading: isFloorDeleting }] = useDeleteProjectFloorMutation()
  const deleteFloorAction = (id: number) => deleteFloorDataAction(id).unwrap();
  const [deleteUnitDataAction, { isLoading: isUnitDeleting }] = useDeleteProjectUnitMutation()
  const deleteUnitAction = (id: number) => deleteUnitDataAction(id).unwrap();
  const toast = useRef<Toast>(null);

  const { id: idString } = useParams()
  const id = parseInt(idString || '');
  const isNew = isNaN(id) || id <= 0;

  const { data: projectData } = useGetProjectQuery(id, {
    skip: isNew
  })

  const { data: blockData, isLoading: isBlockFetching } = useBlocksForProjectQuery({ projectId: projectData?.key }, { skip: !projectData?.key })
  const { data: unitData, isLoading: isUnitFetching } = useListProjectUnitQuery({ projectId: projectData?.key }, { skip: !projectData?.key })
  const { data: floorData, isLoading: isFloorFetching } = useListProjectFloorQuery({ projectId: projectData?.key }, { skip: !projectData?.key, refetchOnMountOrArgChange : true })

  if (isBlockFetching || isFloorFetching || isUnitFetching) {
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
          <h3 className={classNames('m-0 my-auto')} >Unit</h3>
          <Link
            to={`/projects/${id}/unit/block/new`}
            style={{ textDecoration: "none", display : 'none' }} >
            <Button label="Add Block" className="ml-3" />
          </Link>
          <Link
            to={`/projects/${id}/unit/floor/new`}
            style={{ textDecoration: "none", display : 'none' }} >
            <Button label="Add Floor" className="ml-3" />
          </Link>
          <Link
            to={`/projects/${id}/unit/new`}
            style={{ textDecoration: "none" }} >
            <Button label="Add Unit" className="ml-3" />
          </Link>
          <Link
            to={`/projects/project/${id}/edit`}
            style={{ textDecoration: "none", marginLeft: 'auto' }} >
            <Button label="Back" className="ml-auto" />
          </Link>
        </div>
        <Divider />
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
        <Divider />
      </div>
      <Datatable
        responsiveLayout='scroll'
        stripedRows
        resizableColumns={false}
        loading={isBlockDeleting}
        style={{
          height: (blockData?.length || 1) * 100,
          display : 'none',
          minHeight : 150,
          maxHeight: 250,
          overflowX: 'auto',
          border: '2px solid ',
          padding: 10,
          margin: 10
        }}
        value={blockData}
      >
        <Column headerStyle={customHeaderIconStyle} style={{ maxWidth: '100px' }} bodyStyle={{ textAlign: 'center', overflow: 'visible' }} body={defaultActionBodyTemplate(`/projects/${id}/unit/block`, deleteData, deleteBlockAction)} />
        <Column headerStyle={customHeaderStyle} field="id" header="Block" sortable filter dataType="numeric" style={{ minWidth: '8rem' }} />
        <Column headerStyle={customHeaderStyle} field="descr" header="Description" sortable filter style={{ minWidth: '12rem' }} />
      </Datatable>
      <Datatable
        responsiveLayout='scroll'
        // showGridlines
        stripedRows
        resizableColumns={false}
        loading={isFloorDeleting}
        style={{
          height: (floorData?.results?.length || 1) * 100,
          display : 'none',
          minHeight: 150,
          maxHeight: 250,
          overflowX: 'auto',
          border: '2px solid',
          padding: 10,
          margin: 10
        }}
        value={floorData?.results}
      >
        <Column headerStyle={customHeaderIconStyle} style={{ maxWidth: '100px' }} bodyStyle={{ textAlign: 'center', overflow: 'visible' }} body={defaultActionBodyTemplate(`/projects/${id}/unit/floor`, deleteData, deleteFloorAction)} />
        <Column headerStyle={customHeaderStyle} field="id" header="Floor" sortable filter dataType="numeric" style={{ minWidth: '8rem' }} />
        <Column headerStyle={customHeaderStyle} field="descr" header="Description" sortable filter style={{ minWidth: '12rem' }} />
        <Column headerStyle={customHeaderStyle} field="no_of_units" header="No of Units" align={"center"} sortable filter body={(data) => formatNumber(data.no_of_units)} style={{ maxWidth: '12rem' }} />
        <Column headerStyle={customHeaderStyle} field="" header="" style={{ maxWidth: '12rem' }} />
      </Datatable>

      <Datatable
        responsiveLayout='scroll'
        // showGridlines
        stripedRows
        resizableColumns={false}
        loading={isUnitDeleting}
        style={{
          height: (unitData?.results?.length || 1) * 100,
          maxHeight: 250,
          display : 'none',
          overflowX: 'auto',
          border: '2px solid red',
          padding: 10,
          margin: 10
        }}
        
        value={unitData?.results}
      >
        <Column headerStyle={customHeaderIconStyle} style={{ maxWidth: '100px' }} bodyStyle={{ textAlign: 'center', overflow: 'visible' }} body={defaultActionBodyTemplate(`/projects/${id}/unit`, deleteData, deleteUnitAction)} />
        <Column headerStyle={customHeaderStyle} field="id" header="Unit Code" sortable filter dataType="numeric" style={{ minWidth: '8rem' }} />
        <Column headerStyle={customHeaderStyle} field="descr" header="Description" sortable filter style={{ minWidth: '12rem' }} />
        <Column headerStyle={customHeaderStyle} field="saleablearea" header="Saleable SQFT" align={"center"} body={(data) => formatNumber(data.saleablearea || '0')} sortable filter style={{ maxWidth: '12rem' }} />
        <Column headerStyle={customHeaderStyle} field="" header="" style={{ maxWidth: '12rem' }} />
      </Datatable>

      <ListLayout
          pagination={{
            pageSize: unitSize,
            loading: isUnitFetching,
            currentPage: unitPage,
            total: unitData?.count,
            onChange: (page, size) => {
              setUnitPage(page);
              setUnitSize(size)
            }
          }}
          gridProps={{
            style: {
              maxHeight: 400,
              overflowY: 'auto',
            }
          }}
          tableLayoutClass='none'
          baseRoute="/projects/unit"
          description="Unit"
          isLoading={isUnitFetching || isUnitDeleting}
          data={unitData?.results}
          customBaseRoute={{
            directUrl: `/projects/FIRST_ARG/unit/`,
            args: ['proj_key'],
            suffix: '?direct'
          }}
          newTable
          allowFilters
          deleteAction={deleteUnitAction}
          emptyRowMessage={projectData?.key ? "No Unit For Selected Project" : "Select a Project To View"}
        >
          <Datacolumn filteringType="text" field="id" header="Unit" sortable filter dataType="numeric" style={{ minWidth: '8rem' }} />
          <Datacolumn filteringType="text" field="descr" header="Description" sortable filter style={{ minWidth: '12rem' }} />
          <Datacolumn filteringType="number" field="saleablearea" header="Saleable SQFT" valueGetter={(data) => formatNumber(data.saleablearea || '0')} style={{ maxWidth: '12rem' }} />
        </ListLayout>
    </>
  );
}

export default Main