/* import React from 'react';
import { useGetPropertiesQuery } from '../api';
import PropertyCard from '../PropertyCard';

type Props = {}

const Main = (props: Props) => {
  const { data: properties, isFetching: isLoading } = useGetPropertiesQuery();

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
      {isLoading && <p>Loading...</p>}

      {!isLoading && properties?.map((property) => {
        const {
          id,
          descr,
          image_url,
          project,
          address,
          base_price,
          bedrooms,
          carpetarea,
          facing,
        } = property;

        const propertyCardData = {
          id,
          image: image_url || 'https://imgs.search.brave.com/erI3FXYI9Of9HliQeRUqiXCVPD9H_2TPfKTRT1O_y20/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly9oZHMu/aGVsLmZpL2ltYWdl/cy9mb3VuZGF0aW9u/L3Zpc3VhbC1hc3Nl/dHMvcGxhY2Vob2xk/ZXJzL2ltYWdlLW1A/MngucG5n',
          category: 'Residential',
          price: `₹${parseFloat(base_price).toLocaleString()}`,
          title: `${descr}`,
          location: address,
          details: {
            bhk: `${bedrooms} BHK`,
            area: carpetarea ? `${carpetarea} sq.ft` : 'N/A',
            facing: facing ? `${facing} Facing` : 'N/A',
          },
          project,
          projectId: id,
        };

        return <PropertyCard key={id} {...propertyCardData} />;
      })}
    </div>
  );
}

export default Main;
 */

import React from 'react';
import { useGetPropertiesQuery, Property } from '../api';
import '../index.scss';

type Props = {}

interface ProjectGroupProps {
  projectName: string;
  properties: Property[];
}

const UnitCard: React.FC<{ property: Property }> = ({ property }) => {
  const {
    id,
    descr,
    base_price,
    bedrooms,
    carpetarea,
    facing,
    status,
  } = property;

  // Determine CSS class based on status
  const statusText = status || 'Available';
  const cardClass = statusText === 'Booked'
    ? 'unit-card unit-card-booked'
    : statusText === 'Available'
      ? 'unit-card unit-card-available'
      : 'unit-card';

  return (
    <div className={cardClass}>
      <div>
        <h4 className="unit-title">
          {descr}
        </h4>
        <div className="unit-detail">
          <strong>BHK:</strong> {bedrooms} BHK
        </div>
        <div className="unit-detail">
          <strong>Price:</strong> ₹{parseFloat(base_price).toLocaleString()}
        </div>
        <div className="unit-detail">
          <strong>Square feet:</strong> {carpetarea ? Math.round(parseFloat(carpetarea)).toLocaleString() : 'N/A'}
        </div>
        <div className="unit-detail">
          <strong>Facing:</strong> {facing || 'N/A'}
        </div>
        <div className="unit-detail">
          <strong>Unit ID:</strong> {id}
        </div>
      </div>
    </div>
  );
};

const ProjectGroup: React.FC<ProjectGroupProps> = ({ projectName, properties }) => {
  if (!properties || properties.length === 0) return null;

  // Separate properties by status
  const availableUnits = properties.filter(property => (property.status || 'Available') === 'Available');
  const bookedUnits = properties.filter(property => (property.status || 'Available') === 'Booked');

  const projectAddress = properties[0]?.address || 'N/A';
  const projectImage = properties[0]?.image_url || 'https://imgs.search.brave.com/erI3FXYI9Of9HliQeRUqiXCVPD9H_2TPfKTRT1O_y20/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly9oZHMu/aGVsLmZpL2ltYWdl/cy9mb3VuZGF0aW9u/L3Zpc3VhbC1hc3Nl/dHMvcGxhY2Vob2xk/ZXJzL2ltYWdlLW1A/MngucG5n';

  return (
    <div className="project-group">
      {/* Project Header */}
      <div className="project-header">
        <h2 className="project-title">
          {projectName}
        </h2>
        <p className="project-address">
          {projectAddress}
        </p>
      </div>

      {/* Project Content */}
      <div className="project-content">
        {/* Project Image */}
        <div className="project-image-container">
          <img
            src={projectImage}
            alt={projectName}
            className="project-image"
          />
        </div>

        {/* Units Sections */}
        <div className="units-container">
          {/* Available Units */}
          {availableUnits.length > 0 && (
            <div className="units-section">
              <h3 className="units-section-title available-title">Available Units ({availableUnits.length})</h3>
              <div className="units-grid">
                {availableUnits.map((property) => (
                  <UnitCard key={property.id} property={property} />
                ))}
              </div>
            </div>
          )}

          {/* Booked Units */}
          {bookedUnits.length > 0 && (
            <div className="units-section">
              <h3 className="units-section-title booked-title">Booked Units ({bookedUnits.length})</h3>
              <div className="units-grid">
                {bookedUnits.map((property) => (
                  <UnitCard key={property.id} property={property} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Main = (props: Props) => {
  const { data: properties, isFetching: isLoading, error } = useGetPropertiesQuery();

  // Group properties by project
  const groupedProperties = React.useMemo(() => {
    if (!properties) return {};

    return properties.reduce((acc, property) => {
      const projectKey = property.project || 'Unknown Project';
      if (!acc[projectKey]) {
        acc[projectKey] = [];
      }
      acc[projectKey].push(property);
      return acc;
    }, {} as Record<string, typeof properties>);
  }, [properties]);

  return (
    <div className="properties-container">
      {isLoading && <p>Loading...</p>}

      {error && <p>Error loading properties: {JSON.stringify(error)}</p>}

      {!isLoading && !error && properties && properties.length === 0 && <p>No properties found</p>}

      {!isLoading && !error && Object.entries(groupedProperties).map(([projectName, projectProperties]) => (
        <ProjectGroup
          key={projectName}
          projectName={projectName}
          properties={projectProperties}
        />
      ))}
    </div>
  );
}

export default Main;        
