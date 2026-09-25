import React, { useState } from 'react';
import { ListLayout, Datacolumn } from '@igblsln/control';
import { Divider } from 'primereact/divider';
import { Dropdown } from 'primereact/dropdown';
import { classNames } from "primereact/utils";
import { Link } from 'react-router-dom'
import { Button } from 'primereact/button';
import { useDeleteCupboardMutation, useListCupboardQuery } from '../cupboardApi';
import { PAGE_NAME } from '../constants';
import { useActiveProjectQuery, useBlocksForProjectQuery } from '@igblsln/store';

type Props = {}

const Main = (props: Props) => {

  const [deleteDataAction, { isLoading: isDeleting }] = useDeleteCupboardMutation()
  const deleteAction = (id: number) => deleteDataAction(id).unwrap();
  const [selectedProjectKey, setSelectedProjectKey] = useState<any>(null)
  const [selectedBlockKey, setSelectedBlockKey] = useState<any>(null)
  const { data: projects } = useActiveProjectQuery()
  const { data: blockData, isLoading: isBlockFetching } = useBlocksForProjectQuery({ projectId: selectedProjectKey }, { skip: !selectedProjectKey })
  const { data, isLoading } = useListCupboardQuery({ projectId: selectedProjectKey, blockId: selectedBlockKey }, { skip: !selectedProjectKey || !selectedBlockKey })
  // const data = {
  //   results : [
  //     {
  //       key : 1,
  //       name : "KKK",
  //       descr : "jjjj",
  //       uom : "kilknj"
  //     }
  //   ]
  // }
  return (
    <>
      <div className='flex'>
        <h3 className={classNames('m-0 my-auto')} >{PAGE_NAME}</h3>
        <Link
          to={{
            pathname: `/estimation/cupboard/new`,
          }}
          state={{ projectKey: selectedProjectKey, blockKey: selectedBlockKey }}
          //className={!selectedProjectKey ? 'disabled-link' : ''}
          style={{ textDecoration: "none", marginRight: 'auto' }} >
          <Button disabled={false} label="Add" className="ml-3" />
        </Link>
      </div>

      <Divider />
      <div className="pl-5 flex">
        <div className="field" style={{ width: '40%' }}>
          <label className={classNames('col-3')}>Project</label>
          <Dropdown
            showClear
            style={{ width: '60%' }}
            optionLabel={"name"}
            optionValue={"key"}
            value={selectedProjectKey}
            filter
            filterBy={"name"}
            onChange={(e) => {
              setSelectedProjectKey(e.value)
              setSelectedBlockKey(null)
            }}
            options={projects}
          />
        </div>
        <div className="field" style={{ width: '40%' }}>
          <label className={classNames('col-3')}>Block</label>
          <Dropdown
            showClear
            style={{ width: '60%' }}
            optionLabel={"descr"}
            optionValue={"key"}
            value={selectedBlockKey}
            filter
            filterBy={"descr"}
            onChange={(e) => {
              setSelectedBlockKey(e.value)
            }}
            options={blockData}
          />
        </div>
        <div className="field" style={{ width: '20%' }}>
          <Button label="Clear" onClick={(e) => {
            e.preventDefault()
            setSelectedProjectKey(null)
            setSelectedBlockKey(null)
          }} />
        </div>

      </div>

      <Divider />
      <ListLayout baseRoute="/estimation/cupboard"
        description={PAGE_NAME}
        isLoading={isLoading || isDeleting}
        data={data?.results}
        newTable
        allowFilters={false}
        deleteAction={deleteAction}
      >
        <Datacolumn field="name" header="Component Name" filteringType='text' />
        <Datacolumn field="descr" header="Description" filteringType='text' />
        <Datacolumn field="uom" header="Base UOM" filteringType='text' />
      </ListLayout>


    </>
  );
}

export default Main