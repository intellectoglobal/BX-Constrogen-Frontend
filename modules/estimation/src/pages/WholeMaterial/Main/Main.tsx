import React, { useState } from 'react';
import { ListLayout, Datacolumn } from '@igblsln/control';
import { Divider } from 'primereact/divider';
import { Dropdown } from 'primereact/dropdown';
import { classNames } from "primereact/utils";
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { RadioButton } from 'primereact/radiobutton';
import { Button } from 'primereact/button';
import { useDeleteWholeMaterialMutation, useListWholeMaterialQuery } from '../wholeMaterialApi';
import { useActiveProjectQuery, useBlocksForProjectQuery} from '@igblsln/store';

type Props = {}

const Main = (props: Props) => {

  const [deleteDataAction, { isLoading: isDeleting }] = useDeleteWholeMaterialMutation()
  const deleteAction = (id: number) => deleteDataAction(id).unwrap();
  const [selectedProjectKey, setSelectedProjectKey] = useState<any>(null)
  const [selectedBlockKey, setSelectedBlockKey] = useState<any>(null)
  const { data: projects } = useActiveProjectQuery()
  const navigate = useNavigate();
  const { data: blockData} = useBlocksForProjectQuery({ projectId: selectedProjectKey }, { skip: !selectedProjectKey })
  const { data, isLoading } = useListWholeMaterialQuery({ projectId: selectedProjectKey, blockId: selectedBlockKey }, { skip: !selectedProjectKey || !selectedBlockKey })
  return (
    <>
      <div className='flex'>
        <h3 className={classNames('m-0 my-auto')} >{"Material Pack"}</h3>
        <Link
          to={{
            pathname: `/estimation/wholematerial/new`,
          }}
          state={{ projectKey: selectedProjectKey, blockKey: selectedBlockKey }}
          //className={!selectedProjectKey ? 'disabled-link' : ''}
          style={{ textDecoration: "none", marginRight: 'auto' }} >
          <Button disabled={false} label="Add" className="ml-3" />
        </Link>
      </div>

      <Divider />
      <div className="pl-5 flex">
        <div className="field" style={{ width: '50%' }}>
          <div className="field-radiobutton">
            <RadioButton onChange={() => {
              navigate("/estimation/fractionalmaterial")
            }} />
            <label
              style={{ cursor: 'pointer' }}
              onClick={() => {
                navigate("/estimation/fractionalmaterial")
              }}>
              Fractional
            </label>
          </div>
        </div>
        <div className="field" style={{ width: '50%' }}>
          <div className="field-radiobutton">
            <RadioButton checked />
            <label>
              Whole
            </label>
          </div>
        </div>

      </div>

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
      <ListLayout baseRoute="/estimation/wholematerial"
        description={"Material Pack"}
        isLoading={isLoading || isDeleting}
        data={data?.results}
        newTable
        allowFilters={false}
        deleteAction={deleteAction}
      >
        <Datacolumn field="pack_type" header="Pack Type" filteringType='text' />
        <Datacolumn field="name" header="Material Name" filteringType='text' />
        <Datacolumn field="item_type" header="Item Type" filteringType='text' />
        <Datacolumn field="descr" header="Description" filteringType='text' />
        {/* <Datacolumn field="uom" header="UOM" filteringType='text' /> */}
      </ListLayout>


    </>
  );
}

export default Main