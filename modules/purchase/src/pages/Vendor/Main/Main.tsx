import React, { useEffect, useState } from 'react';
import { ListLayout, Datacolumn, CreateButton } from '@igblsln/control';
import { PAGE_SIZE, useAllVendorsFilteredQuery, useGetAllItemTypesQuery } from '@igblsln/store';
import { Divider } from 'primereact/divider';
import { Dropdown } from 'primereact/dropdown';
import { useDeleteVendorMutation, useListVendorQuery } from '../apis';
// import { useListVendorTypeQuery } from '../../VendorType/vendorTypeApi';
import ViewModal from '../ViewModal';
import { MODULE_NAME } from '../../../constants';

type Props = {}

const Main = (props: Props) => {
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(PAGE_SIZE);
  const [showModal, setShowModal] = useState<boolean>(false)
  const [selectedVendor, setSelectedVendor] = useState(null)
  const [selectedType, setSelectedType] = useState(null)
  const [allVendorTypes, setAllVendorTypes] = useState<any>([])
  const { data: vendorTypes } = useAllVendorsFilteredQuery()
  const { data, isFetching: isLoading } = useListVendorQuery({ page: page, size: size, type: selectedType })
  const [deleteDataAction, { isLoading: isDeleting }] = useDeleteVendorMutation()
  const deleteAction = (id: number) => deleteDataAction(id).unwrap();

  // useEffect(() => {
  //   setAllVendorTypes([
  //     { key: null, descr: "All" },
  //     ...vendorTypes || []
  //   ])
  // }, [vendorTypes])

  const getItemTypes = (data: any) => {
    if (data?.itemtypes?.length) {
      return data?.itemtypes.map((d: any) => d?.itemType?.descr).join(", ")
    }
    else return "NA"
  }

  const customDiscard = () => {
    setShowModal(false)
  }

  return (
    <>
      <Divider />

      <div className="flex" style={{ width: '100%' }}>
        <div className="field col-6">
          <label className={'col-4'}>Vendor Name</label>
          <Dropdown
            style={{ width: '60%' }}
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.value)
            }}
            options={vendorTypes}
            showClear
            filter
            filterBy='name'
            optionLabel='name'
            optionValue='key'
          />
        </div>
        <CreateButton to={`/purchase/vendor/new`} label='Material Vendor' />
      </div>
      <ListLayout
        enableView
        onViewClick={(key: any) => {
          setShowModal(true)
          setSelectedVendor(key)
        }}
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
        showExport={"vendors"}
        baseRoute="/purchase/vendor"
        description="Material Vendor"
        isLoading={isLoading || isDeleting}
        data={data?.results}
        deleteAction={deleteAction}
        newTable
      >
        <Datacolumn field="id" header="Material Vendor Code" filteringType='number' />
        <Datacolumn field="name" header="Material Vendor Name" filteringType='text' />
        {/* <Datacolumn field="type.descr" header="Material Vendor Type" filteringType='text' /> */}
        <Datacolumn field="contactphoneno" header="Contact No" filteringType='text' />
        <Datacolumn field="itemtype" header="Item Types" displayValueGetter={getItemTypes} filteringType='text' />
      </ListLayout>
      {
        showModal &&
        <ViewModal displayModal={showModal} vendorId={selectedVendor} customDiscard={customDiscard} />
      }

    </>

  );
}

export default Main