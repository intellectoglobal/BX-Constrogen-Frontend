import React from 'react'
import { Button } from 'primereact/button';
import { Panel } from 'primereact/panel';
import { Divider } from 'primereact/divider';
import { Image } from 'primereact/image';
import { Link } from 'react-router-dom'
import { Project, formatCurrency, formatNumber, } from '@igblsln/store';

type Props = {
  data: Project;
  deleteData: any
}


const GridCard = ({ data, deleteData }: Props) => {

  return (
    <Panel className='project-grid' header={data.name} icons={
      <>
        <Button
          style={{ height: '35px', width: '20px' }}
          className="p-button-rounded p-button-text"
          icon="pi pi-trash"
          onClick={() => deleteData(data.key)}
        ></Button>
      </>
    } >
      <div className="flex">
        <Image src={data?.elevationimage || "https://www.levelset.com/wp-content/uploads/2019/02/apartments.jpg"} alt="Image" width="100%" height='100%' />
      </div>

    </Panel>
  )
}

export default GridCard