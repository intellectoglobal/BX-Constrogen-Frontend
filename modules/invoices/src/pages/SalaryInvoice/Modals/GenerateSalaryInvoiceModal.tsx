import React, { useState, useEffect } from 'react';
import { ListLayout, Datacolumn } from '@igblsln/control';
import { PAGE_SIZE, useActiveProjectQuery, useGetAllCompaniesQuery } from '@igblsln/store';
import { Divider } from 'primereact/divider';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Checkbox } from 'primereact/checkbox';
import { InputText } from 'primereact/inputtext';
import { useDeleteInvoiceMutation, useListInvoiceQuery } from '../api';
import {
  useToast,
} from '@igblsln/control';
import { Dialog } from 'primereact/dialog';

type Props = {
  displayModal: boolean,
  customDiscard: any,
}

export default function GenerateSalaryInvoiceModal({ displayModal, customDiscard }: Props) {
  const { data: projects } = useActiveProjectQuery()
  const [showModal, setShowModal] = useState<boolean>(false)
  const [showAdditionalInvoiceDetailModal, setShowAdditionalInvoiceDetailModal] = useState<boolean>(false)
  const [selectedProjectKey, setSelectedProjectKey] = useState<any>(null)
  const [selectedStatus, setSelectedStatus] = useState<any>(null)
  const [selectedPO, setSelectedPO] = useState<any>(null)
  const [allProjects, setAllProjects] = useState<any>([])
  const { data, isFetching: isLoading } = useListInvoiceQuery({ page: 1, size: 100, project: selectedProjectKey, status: selectedStatus })
  const [deleteDataAction, { isLoading: isDeleting }] = useDeleteInvoiceMutation()
  const deleteAction = (id: number) => deleteDataAction(id).unwrap();

  const { data: companies, isFetching: companiesFetching } = useGetAllCompaniesQuery()


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

  const customDiscard1 = () => {
    setShowModal(false)
    setShowAdditionalInvoiceDetailModal(false)
  }

  return (
    <>
      <Dialog
        header={`Generate Salary Invoice Screen`}
        visible={displayModal}
        position={'center'}
        modal
        style={{ width: '80vw' }}
        onHide={() => customDiscard()}
        draggable={false} resizable={false} closable
      >
        <>
          <Divider />
          <div style={{ display: 'flex' }}>
          <div className="field col-6">
          <div className="field">
            <label className={'col-3'}>Company Name</label>
            <Dropdown
              style={{ width: '30%' }}
              value={selectedStatus}
              placeholder='All'
              onChange={(e) => {
                setSelectedStatus(e.value)
              }}
              optionLabel={"id"}
              optionValue={"id"}
              options={companies}
            />
          </div>
        </div>
            <div className="field col-6">
              <label className={'col-4'}>Month ID</label>
              <Dropdown
                style={{ width: '45%' }}
                disabled
                // value={monthId}
                // onChange={(e) => setMonthId(e.target.value)}
                options={Array.from({ length: 12 }, (_, i) => i + 1)}
              />
            </div>
          </div>

          <div className="col-12 " style={{ height: 'calc(100% - 183px)', minHeight: 200 }}>
            <ListLayout
              hideActionColumn
              baseRoute="/invoice/tdsinvoice"
              description="Employees with their Monthly Salary"
              hideAddButton
              allowFilters={false}
              isLoading={isLoading || isDeleting}
              data={data?.results}
              newTable
              showHeader
              deleteAction={deleteAction}
            >
              
              <Datacolumn field="text1" header="Employee Name" filteringType='text' />
              <Datacolumn field="text2" header="Salary" filteringType='text' />
              <Datacolumn field="text3" header="TDS Amount" type='currency' filteringType='currency' />
              {/* <Datacolumn field="text6" header="Select Employee" filteringType='text' /> */}
              <Datacolumn
                width={'15%'}
                field="is_active"
                header="Select Employee"
                displayValueGetter={(row) => (
                  <div onClick={() => console.log(row)} style={{ display: 'flex', paddingTop: 7, justifyContent: 'center', }}>
                    <Checkbox checked={true} />
                  </div>
                )}
              />
            </ListLayout>
          </div>



          <div style={{ display: 'flex', margin: 'auto', justifyContent: 'center' }}>
            <Button
              label='Generate Salary Invoice'
              className='p-button-warning mr-3'
              onClick={() => {
                customDiscard(true)
              }}
            />
            <Button
              label='Close'
              className='p-button-plain'
              onClick={() => {
                customDiscard(true)
              }}
            />
          </div>
        </>
      </Dialog>
    </>
  )
}
