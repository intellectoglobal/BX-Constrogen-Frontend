import React, { useEffect, useState } from 'react';
import { ListLayout, Datacolumn, CreateButton } from '@igblsln/control';
import { PAGE_SIZE } from '@igblsln/store';
import { Divider } from 'primereact/divider';
import { Dropdown } from 'primereact/dropdown';
import { useDeleteContractorMutation, useListContractorQuery } from '../apis';
import { useListContractorTypeQuery } from '../../ContractorType/contractorTypeApi';
import ViewModal from '../ViewModal';

type Props = {}

const Main = (props: Props) => {
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(PAGE_SIZE);
  const [selectedType, setSelectedType] = useState(null)
  const [showModal, setShowModal] = useState<boolean>(false)
  const [selectedContractor, setSelectedContractor] = useState(null)
  const [allContractorTypes, setAllContractorTypes] = useState<any>([])
  const { data: contractorTypes } = useListContractorTypeQuery({ page: page, size: size })
  const { data, isFetching: isLoading } = useListContractorQuery({ page: page, size: size, type: selectedType }, { refetchOnMountOrArgChange: true })
  const [deleteDataAction, { isLoading: isDeleting }] = useDeleteContractorMutation()
  const deleteAction = (id: number) => deleteDataAction(id).unwrap();

  useEffect(() => {
    setAllContractorTypes([
      { key: null, descr: "All" },
      ...contractorTypes?.results || []
    ])
  }, [contractorTypes])

  const getItemTypes = (data: any) => {
    return data?.inhouse === "Y" ? "Yes" : "No"
  }

  const customDiscard = () => {
    setShowModal(false)
  }


  return (
    <>
      <Divider />
      <div className="flex">
        <div className="field col-6">
          <label className={'col-4'}>Contractor Type</label>
          <Dropdown
            style={{ width: '60%' }}
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.value)
            }}
            options={allContractorTypes}
            optionLabel='descr'
            optionValue='key'
            placeholder='All'
          />
        </div>
        <CreateButton to={"/contract/contractor/new"} label='Contractor' />

      </div>

      <ListLayout
        enableView
        onViewClick={(key: any) => {
          setShowModal(true)
          setSelectedContractor(key)
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
        hideAddButton
        showExport={"contractors"}
        baseRoute="/contract/contractor"
        description="Contractor"
        isLoading={isLoading || isDeleting}
        data={data?.results}
        deleteAction={deleteAction}
        newTable
        showHeader
      >
        <Datacolumn field="id" header="Contractor Code" filteringType='number' />
        <Datacolumn field="name" header="Contractor Name" filteringType='text' />
        <Datacolumn field="contractor_type" header="Contractor Type" filteringType='text' />
        <Datacolumn field="inhouse" header="In-House" displayValueGetter={getItemTypes} filteringType='text' />
      </ListLayout>
      {
        showModal &&
        <ViewModal displayModal={showModal} contractorId={selectedContractor} customDiscard={customDiscard} />
      }
    </>

  );
}

export default Main