
import React from 'react';
import { Card } from 'primereact/card';

interface PropertyDetails {
  bhk: string;
  area: string;
  facing: string;
}

interface Property {
  id: string;
  image: string;
  category: string;
  price: string;
  title: string;
  location: string;
  details: PropertyDetails;
  project: string;
  projectId: string;
}


export default function PropertyCard(data: Property) {
  const header = (
    <img alt="Property" src={data.image} height={400} /> 
  );

  return (
    <div className="card flex justify-content-center col-12 md:col-4">
      <Card title={data?.title} subTitle={data?.location} header={header} className="md:w-25rem">
        <div className="flex items-center justify-between">
          <span>Project: {data?.project || 'N/A'}</span>
          <span style={{ margin: 'auto 0 auto auto', fontWeight : 'bold' }}>{data?.price || '₹0'}</span>
        </div>
        <div className="mt-3 flex items-center gap-4 text-sm">
          <span>{data?.details?.bhk || 'N/A'}</span>
          <span>{data?.details?.area || 'N/A'}</span>
          <span>{data?.details?.facing || 'N/A'}</span>
        </div>
        <div className="mt-3 flex items-center gap-4 text-sm">
          {/* <span>•</span> */}
          <span>ID: {data?.projectId || 'N/A'}</span>
        </div>
      </Card>
    </div>
  )
}
