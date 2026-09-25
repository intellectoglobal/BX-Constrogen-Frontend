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
        <Link
          to={`/projects/project/${data.key}/edit`}
          style={{ textDecoration: "none" }} >
          <Button icon="pi pi-eye" className="p-button-rounded p-button-text"></Button>
        </Link>
        <Button
          style={{ height: '35px', width: '20px' }}
          className="p-button-rounded p-button-text"
          icon="pi pi-trash"
          onClick={() => deleteData(data.key)}
        ></Button>
      </>
    } >
      <div className="flex">
        <div className="grid" style={{ paddingTop: '5px' }}>
          <div className="col-6">State/City</div>
          <div className="col-6">{data.state?.id}/{data.city?.name}</div>
          <div className="col-6">Project Type</div>
          <div className="col-6">{data.pro_type?.descr}</div>
          <div className="col-6">Total Units</div>
          <div className="col-6">{formatNumber(data.no_of_units)}</div>
          <div className="col-6">Price/SqFt</div>
          <div className="col-6">{formatCurrency(data?.latest_proj_price?.effprice)}</div>
          <div className="col-6">Status</div>
          <div className="col-6">{data.latest_proj_status?.descr || "NA"}</div>
        </div>

        <Divider layout="vertical" />
        <Image src={data?.elevationimage || "https://www.levelset.com/wp-content/uploads/2019/02/apartments.jpg"} alt="Image" width="150" height='150' />
      </div>

    </Panel>
  )
}

export default GridCard