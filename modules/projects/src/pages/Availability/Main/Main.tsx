import React, { useRef, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { useDispatch, useSelector } from 'react-redux';
import {
  Datacolumn,
  ListLayout,
  ManageLayout,
  FormField,
  useToast
} from '@igblsln/control';
import {
  AFTER_API_TIME,
  getClientProps,
  setSelectedProjectReducer,
  useActiveProjectQuery,
  useBlocksForProjectQuery,
  useFloorsForProjectQuery,
  PAGE_SIZE,
  useGetProjectUnitStatusQuery,
  setPromptNavigate
} from '@igblsln/store';
import { useListAvailabilityQuery } from '../availabilityApi';
import { useUpdateProjectUnitMutation } from '../../FloorUnits/unitApi';

const Main = () => {
  const dispatch = useDispatch();
  const toast = useRef<Toast>(null);
  const { id: idString } = useParams();
  const id = parseInt(idString || '');
  const isNew = isNaN(id) || id <= 0;
  const { showError, showSuccess } = useToast()
  const clientProps = getClientProps();

  const selectedProject = useSelector((state: any) => state?.common?.selectedProject);

  const { data: projects } = useActiveProjectQuery();
  const { data: blockData } = useBlocksForProjectQuery(
    { projectId: selectedProject },
    { skip: !selectedProject, refetchOnMountOrArgChange: true }
  );

  const [selectedBlock, setSelectedBlock] = useState<any>('');
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(PAGE_SIZE);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<any>(null);

  useEffect(() => {
    if (selectedProject && blockData && blockData.length > 0) {
      setSelectedBlock(blockData[0]?.key);
    }
  }, [selectedProject, blockData]);

  const { data: floorData } = useFloorsForProjectQuery({
    projectId: selectedProject
  }, { skip: !selectedProject, refetchOnMountOrArgChange: true })
  const { data: projectUnitStatus } = useGetProjectUnitStatusQuery({})
  const [updateProjectUnit, { isLoading: isUpdating }] = useUpdateProjectUnitMutation();

  const {
    data: availabilityData,
    isLoading: isAvailabilityFetching,
    refetch: refetchAvailailityData
  } = useListAvailabilityQuery(
    { page, page_size: size, projectId: selectedProject, block: selectedBlock },
    { skip: !selectedProject || !selectedBlock }
  );

    const onUnitSubmit = async (values: any) => {
      try {
        values = {
          ...values,
        }
        console.log("values for the unit update payload ::", values)
        let resp: any;
        resp = await updateProjectUnit({ ...values, ...clientProps, proj_key: selectedProject }).unwrap();

        refetchAvailailityData();
        showSuccess('Success', resp.detail);
        dispatch(setPromptNavigate({promptNavigate: false}))
        setTimeout(() => {
          setShowEditModal(false)
        }, AFTER_API_TIME);
      } catch (error: any) {
        console.log(error)
        // showError('An error occurred', error?.data?.detail || "We couldn't save your post, try again!");
      }
    }


  const renderForm = (control: any, register: any, errors: any, getValues: any) => (

      <div>
        <div style={{ padding: '5px 20px' }}>
          <div className='flex'>  
          <FormField
            label="Block Code"
            name="projblk_key"
            className='col-12 md:col-6'
            control={control}
            errors={errors}
            required
            leftSpan={6}
            rightSpan={6}
            useExplicit
            onChange={(e: any) => {
              const block = blockData?.find(d => d.key === e.value) || { key: null };
              setSelectedBlock(block);
            }}
            formItem={{
              component: Dropdown,
              componentProps: {
                showClear: true,
                optionLabel: "descr",
                optionValue: "key",
                disabled: true,
                options: blockData || []
              }
            }}
            />

          <FormField
            label="Floor Code"
            name="projflr_key"
            className='col-12 md:col-6'
            control={control}
            errors={errors}
            required
            leftSpan={6}
            rightSpan={6}
            useExplicit
            formItem={{
              component: Dropdown,
              componentProps: {
                showClear: true,
                optionLabel: "descr",
                optionValue: "key",
                disabled: true,
                options: floorData?.filter((f: any) => (f.projblk_key === selectedBlock?.key) || (f.projblk_key === selectedUnit?.projblk_key)) || []
              }
            }}
            />
          </div>

          <div className='flex'>
            <FormField
            label="Unit Description"
            name="descr"
            className='col-12 md:col-6'
            control={control}
            errors={errors}
            required
            leftSpan={6}
            rightSpan={6}
            formItem={{
              component: InputText,
              componentProps: { 
                maxLength: 100,
                disabled: true,
               }
            }}
          />

          <FormField
            label="Facing"
            name="facing"
            className='col-12 md:col-6'
            control={control}
            errors={errors}
            leftSpan={6}
            rightSpan={6}
            useExplicit
            formItem={{
              component: Dropdown,
              componentProps: {
                showClear: true,
                disabled: true,
                options: ["East", "West", "North", "South"]
              }
            }}
          />
          </div>
          <div className='flex'>
           <FormField
            label="GST (%)"
            name="gst_percentage"
            className='col-12 md:col-6'
            control={control}
            errors={errors}
            leftSpan={6}
            rightSpan={6}
            useExplicit
            formItem={{
              component: Dropdown,
              componentProps: {
                showClear: true,
                disabled: true,
                options: [1, 5]
              }
            }}
          />

          <FormField
            label="Status"
            name="projunit_status_key"
            className='col-12 md:col-6'
            control={control}
            errors={errors}
            required
            leftSpan={6}
            rightSpan={6}
            useExplicit
            formItem={{
              component: Dropdown,
              componentProps: {
                showClear: true,
                optionLabel: "descr",
                optionValue: "key",
                options: projectUnitStatus
              }
            }}
          />
          </div>
        </div>
    </div>
  );

  return (
    <>
      <Divider />
      <Toast ref={toast} />

      <div className="flex">
        <div className="field col-6">
          <label className={'col-4'}>Project Name</label>
          <Dropdown
            style={{ width: '60%' }}
            optionLabel="name"
            optionValue="key"
            value={selectedProject}
            filter
            filterBy="name"
            onChange={(e) => dispatch(setSelectedProjectReducer(e.value))}
            options={projects || []}
          />
        </div>
        <div className="field col-6">
          <label className={'col-4'}>Block</label>
          <Dropdown
            style={{ width: '60%' }}
            optionLabel="descr"
            optionValue="key"
            value={selectedBlock}
            filter
            filterBy="descr"
            onChange={(e) => setSelectedBlock(e.value)}
            options={blockData || []}
          />
        </div>
      </div>

      <ListLayout
        pagination={{
          pageSize: size,
          loading: isAvailabilityFetching,
          currentPage: page,
          total: availabilityData?.count,
          onChange: (p, s) => {
            setPage(p);
            setSize(s);
          }
        }}
        gridProps={{
          style: {
            maxHeight: 400,
            overflowY: 'auto'
          }
        }}
        tableLayoutClass="none"
        baseRoute="/projects/availability"
        showHeader
        isLoading={isAvailabilityFetching}
        data={availabilityData?.results}
        newTable
        allowFilters={false}
        hideActionColumn
        hideAddButton
      >
        <Datacolumn field="descr" header="Unit" style={{ minWidth: '12rem' }} />
        <Datacolumn field="floor.descr" header="Floor" style={{ minWidth: '12rem' }} />
        <Datacolumn field="bedrooms" header="BHK" style={{ minWidth: '12rem' }} />
        <Datacolumn field="facing" header="Facing" style={{ minWidth: '12rem' }} />
        <Datacolumn field="status.descr" header="Status" style={{ minWidth: '12rem' }} />
        <Datacolumn field="base_price" header="Cost" type="currency" style={{ minWidth: '12rem' }} />
        <Datacolumn
          field="edit"
          header="Action"
          type="custom"
          width="10%"
          displayValueGetter={(row: any) => (
            <Button
              style={{ height: 30, marginRight: 10, marginBottom: 3 }}
              onClick={() => {
                setSelectedUnit(row);
                setShowEditModal(true);
              }}
            >
              Edit
            </Button>
          )}
        />
      </ListLayout>

      <Dialog
        // header="Edit Availability"
        visible={showEditModal}
        position="center"
        modal
        style={{ width: '60vw' }}
        onHide={() => {
          let element = document.getElementById('discard-btn')
          if(element) {
            element.click()
          } else {
            setShowEditModal(false)
          }
        }}
        draggable={false}
        resizable={false}
        closable
      >
        <ManageLayout
          baseRoute=""
          // description='unit'
          id={selectedUnit?.key}
          data={selectedUnit}
          renderForm={renderForm}
          onSubmit={onUnitSubmit}
          bottomControl
          hideHeader
          customDiscard={() => setShowEditModal(false)}
        />
      </Dialog>
    </>
  );
};

export default Main;
