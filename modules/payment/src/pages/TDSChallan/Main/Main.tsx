import React, { useState, useEffect } from 'react';
import { ListLayout, Datacolumn } from '@igblsln/control';
import { PAGE_SIZE, useActiveProjectQuery } from '@igblsln/store';
import { Divider } from 'primereact/divider';
import { Dropdown } from 'primereact/dropdown';
import { useDeleteTDSChallanMutation, useListTDSChallanQuery } from '../tdsChallanApi';

type Props = {}

const Main = (props: Props) => {
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(PAGE_SIZE)
  const { data: projects } = useActiveProjectQuery()
  const [selectedProjectKey, setSelectedProjectKey] = useState<any>(null)
  const [selectedStatus, setSelectedStatus] = useState<any>(null)
  const [allProjects, setAllProjects] = useState<any>([])
  const { data, isFetching: isLoading } = useListTDSChallanQuery({ page: page, size: size, project: selectedProjectKey, status: selectedStatus })
  const [deleteDataAction, { isLoading: isDeleting }] = useDeleteTDSChallanMutation()
  const deleteAction = (id: number) => deleteDataAction(id).unwrap();

  useEffect(() => {
    if (projects) {
      setAllProjects([
        {
          key: null,
          name: 'All'
        },
        ...projects
      ])
    }
  }, [projects])

  return (
    <>
      {/* <Divider />
      <div style={{ display: 'flex' }}>
        <div className="field col-6">
          <label className={'col-3'}>Project Name</label>
          <Dropdown
            style={{ width: '30%' }}
            optionLabel={"name"}
            optionValue={"key"}
            value={selectedProjectKey}
            onChange={(e) => {
              setSelectedProjectKey(e.value)
            }}
            options={allProjects}
            placeholder='All'
          />
        </div>
        <div className="field col-6">
          <div className="field">
            <label className={'col-3'}>Status of PO</label>
            <Dropdown
              style={{ width: '30%' }}
              value={selectedStatus}
              placeholder='All'
              onChange={(e) => {
                setSelectedStatus(e.value)
              }}
              optionLabel={"descr"}
              optionValue={"key"}
              options={[
                {
                  key: null,
                  descr: "All"
                },
                {
                  key: "S",
                  descr: "Saved"
                },
                {
                  key: "U",
                  descr: "Submitted"
                },
                {
                  key: "C",
                  descr: "Cancelled"
                }
              ]}
            />
          </div>
        </div>
      </div> */}

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
        baseRoute="/payment/tdschallan"
        description="TDS Challan List"
        isLoading={isLoading || isDeleting}
        data={data?.results}
        newTable
        showHeader
        deleteAction={deleteAction}
      >
        
        <Datacolumn field="number" header="Challan Number" filteringType='number' />
        <Datacolumn field="company" header="Company Name" filteringType='text' />
        <Datacolumn field="amount" header="Amount" type='currency' filteringType='currency' />
        <Datacolumn field="status.descr" header="Status" filteringType='text' />
      </ListLayout>
    </>

  );
}

export default Main