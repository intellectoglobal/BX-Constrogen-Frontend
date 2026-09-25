import React, { useState } from 'react';
import { Card } from 'primereact/card';
import { Calendar } from 'primereact/calendar';
import { ListLayout, Datacolumn } from '@igblsln/control';
import { PAGE_SIZE } from '@igblsln/store';
import { useDeleteSiteVisitMutation, useListSiteVisitQuery } from '../api';
import { MODULE_NAME } from '../../../constants';
import { PAGE_NAME, PAGE_ROUTE } from '../constants';

type Props = {}

const Main = (props: Props) => {
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(PAGE_SIZE)
  const { data, isFetching: isLoading } = useListSiteVisitQuery({ page: page, size: size })
  const [deleteDataAction, { isLoading: isDeleting }] = useDeleteSiteVisitMutation()
  const deleteAction = (id: number) => deleteDataAction(id).unwrap();
  return (
    <>
      <div style={{ display: 'flex' }}>
        <Card style={{
          flexGrow: 1,
          margin: 10,
          backgroundColor: '#f2f1f1',
          borderRadius: 8
        }}
          title={
            <div className='flex'>
              <div>245</div>
              <i className="pi pi-calendar ml-auto"></i>
            </div>
          }
          subTitle="Total Visits">
          <p className="m-0">
            +4% from last month
          </p>
        </Card>
        <Card style={{
          flexGrow: 1,
          margin: 10,
          backgroundColor: '#f2f1f1',
          borderRadius: 8
        }}
          title={
            <div className='flex'>
              <div>15</div>
              <i className="pi pi-clock ml-auto"></i>
            </div>
          }
          subTitle="Schedulded">
          <p className="m-0">
            +2 from last month
          </p>
        </Card>
        <Card style={{
          flexGrow: 1,
          margin: 10,
          backgroundColor: '#f2f1f1',
          borderRadius: 8
        }}
          title={
            <div className='flex'>
              <div>182</div>
              <i className="pi pi-check-circle ml-auto"></i>
            </div>
          }
          subTitle="Completed">
          <p className="m-0">
            This month
          </p>
        </Card>
        <Card style={{
          flexGrow: 1,
          margin: 10,
          backgroundColor: '#f2f1f1',
          borderRadius: 8
        }} title={
          <div className='flex'>
            <div>23</div>
            <i className="pi pi-times-circle ml-auto"></i>
          </div>
        }
         subTitle="Cancelled">
          <p className="m-0">
            This month
          </p>
        </Card>
      </div>
      <div className="row" style={{ display: 'flex' }}>
        <div className="col-12 md:col-9">
          <ListLayout
            description={PAGE_NAME}
            isLoading={isLoading || isDeleting}
            hideAddButton
            hideActionColumn
            title='Recent Leads'
            data={data?.results}
            deleteAction={deleteAction}
            newTable
            showHeader
          >
            <Datacolumn field="visit_id" header="Visit ID" filteringType='text' />
            <Datacolumn field="lead_id" header="Lead ID" filteringType='text' />
            <Datacolumn field="visit_date" header="Visit Date" filteringType='text' />
            <Datacolumn field="property_id" header="Property ID" filteringType='text' />
            <Datacolumn field="agent_name" header="Agent Name" filteringType='text' />
            <Datacolumn field="agent_phone" header="Agent Phone" filteringType='text' />
            <Datacolumn field="status" header="Status" filteringType='text' />


          </ListLayout>
        </div>
        <div className="col-12 md:col-3">
          <div>
            <h3>Visit Calendar</h3>
            <Calendar
              inline
            />
          </div>

        </div>
      </div>


    </>


  );
}

export default Main