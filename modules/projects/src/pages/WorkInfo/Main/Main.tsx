import React, { useRef, useState, useCallback, useMemo, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Divider } from "primereact/divider";
import { Toast } from "primereact/toast";
import { useDispatch, useSelector } from "react-redux";
import { Datacolumn, ListLayout, useToast } from "@igblsln/control";
import {
  AFTER_API_TIME,
  getClientProps,
  setSelectedProjectReducer,
  useActiveProjectQuery,
  useBlocksForProjectQuery,
  useFloorsForProjectQuery,
  PAGE_SIZE,
  useGetProjectUnitStatusQuery,
  setPromptNavigate,
} from "@igblsln/store";
import {
  useGetWorkNameCategoryQuery,
  useGetWorkNameTypeByCategoryQuery,
  useListWorkDetailsQuery,
} from "../workInfoApi";
import { useUpdateProjectUnitMutation } from "../../FloorUnits/unitApi";

// const Main = () => {
//   // const toast = useRef<Toast>(null);
//   // const { id: idString } = useParams();
//   // const id = parseInt(idString || '');
//   // const isNew = isNaN(id) || id <= 0;
//   // const { showSuccess } = useToast();
//   // const clientProps = getClientProps();

//   // const [selectedWorkCategory, setSelectedWorkCategory] = useState<number | null>(null);
//   // const [selectedWorkType, setSelectedWorkType] = useState<number | null>(null);
//   // const [selectedBlock, setSelectedBlock] = useState<any>(null);
//   // const [showEditModal, setShowEditModal] = useState(false);
//   // const [selectedUnit, setSelectedUnit] = useState<any>(null);

//  const selectedProject = useSelector((state: any) => state?.common?.selectedProject);

//   const { data: projects } = useActiveProjectQuery();
//   // const { data: blockData } = useBlocksForProjectQuery(
//   //   { projectId: selectedProject },
//   //   { skip: !selectedProject, refetchOnMountOrArgChange: true }
//   // );
//   // const { data: floorData } = useFloorsForProjectQuery(
//   //   { projectId: selectedProject },
//   //   { skip: !selectedProject, refetchOnMountOrArgChange: true }
//   // );
//   // const { data: projectUnitStatus } = useGetProjectUnitStatusQuery({});

//   // const { data: workCategoryData } = useGetWorkNameCategoryQuery();
//   // const { data: workTypeData } = useGetWorkNameTypeByCategoryQuery(
//   //   selectedWorkCategory ?? 0,
//   //   {
//   //     skip: !selectedWorkCategory,
//   //     refetchOnMountOrArgChange: true
//   //   }
//   // );

//   // const [updateProjectUnit, { isLoading: isUpdating }] = useUpdateProjectUnitMutation();

//   // const handleCategoryChange = useCallback((e: { value: number | null }) => {
//   //   setSelectedWorkCategory(e.value);
//   //   setSelectedWorkType(null);
//   // }, []);

//   // const handleTypeChange = useCallback((e: { value: number | null }) => {
//   //   setSelectedWorkType(e.value);
//   // }, []);

//   // const onUnitSubmit = useCallback(async (values: any) => {
//   //   try {
//   //     const resp: any = await updateProjectUnit({
//   //       ...values,
//   //       ...clientProps,
//   //       proj_key: selectedProject
//   //     }).unwrap();

//   //     showSuccess('Success', resp.detail);
//   //     dispatch(setPromptNavigate({ promptNavigate: false }));
//   //     setTimeout(() => setShowEditModal(false), AFTER_API_TIME);
//   //   } catch (error) {
//   //     console.error('Update Error:', error);
//   //   }
//   // }, [updateProjectUnit, clientProps, selectedProject, dispatch, showSuccess]);

//   // const dropdownStyle = useMemo(() => ({ width: '60%' }), []);
//   // const labelClass = 'col-4';
//   // const fieldClass = 'field col-6';

//   // return (
//   //   <>
//   //     <Divider />
//   //     <Toast ref={toast} />

//   //     <div className="pl-4 pr-4 pt-4 pb-3 grid">
//   //       <div className={fieldClass}>
//   //         <label className={labelClass}>Project Name</label>
//   //         <Dropdown
//   //           style={dropdownStyle}
//   //           optionLabel="name"
//   //           optionValue="key"
//   //           value={selectedProject}
//   //           filter
//   //           filterBy="name"
//   //           onChange={(e) => dispatch(setSelectedProjectReducer(e.value))}
//   //           options={projects || []}
//   //         />
//   //       </div>

//   //       <div className={fieldClass}>
//   //         <label className={labelClass}>Block</label>
//   //         <Dropdown
//   //           style={dropdownStyle}
//   //           optionLabel="descr"
//   //           optionValue="key"
//   //           value={selectedBlock}
//   //           filter
//   //           filterBy="descr"
//   //           onChange={(e) => setSelectedBlock(e.value)}
//   //           options={blockData || []}
//   //         />
//   //       </div>

//   //       <div className={fieldClass}>
//   //         <label className={labelClass}>Work Category</label>
//   //         <Dropdown
//   //           style={dropdownStyle}
//   //           value={selectedWorkCategory}
//   //           onChange={handleCategoryChange}
//   //           showClear
//   //           filter
//   //           filterBy="descr"
//   //           options={workCategoryData?.results || []}
//   //           placeholder="All"
//   //           optionLabel="descr"
//   //           optionValue="key"
//   //         />
//   //       </div>

//   //       <div className={fieldClass}>
//   //         <label className={labelClass}>Work Type</label>
//   //         <Dropdown
//   //           style={dropdownStyle}
//   //           value={selectedWorkType}
//   //           onChange={handleTypeChange}
//   //           showClear
//   //           filter
//   //           filterBy="descr"
//   //           options={workTypeData}
//   //           placeholder="All"
//   //           optionLabel="descr"
//   //           optionValue="key"
//   //         />
//   //       </div>
//   //     </div>

//   //     <ListLayout
//   //       gridProps={{ style: { maxHeight: 400, overflowY: 'auto' } }}
//   //       tableLayoutClass="none"
//   //       baseRoute="/projects/workinfo"
//   //       showHeader
//   //       newTable
//   //       allowFilters={false}
//   //       hideAddButton
//   //     >
//   //       <Datacolumn field="descr" header="Unit" style={{ minWidth: '12rem' }} />
//   //       <Datacolumn field="floor.descr" header="Floor" style={{ minWidth: '12rem' }} />
//   //       <Datacolumn field="bedrooms" header="BHK" style={{ minWidth: '12rem' }} />
//   //       <Datacolumn field="facing" header="Facing" style={{ minWidth: '12rem' }} />
//   //       <Datacolumn field="status.descr" header="Status" style={{ minWidth: '12rem' }} />
//   //       <Datacolumn field="base_price" header="Cost" type="currency" style={{ minWidth: '12rem' }} />
//   //       {/* Uncomment when Edit feature is needed */}
//   //       {/* <Datacolumn
//   //         field="edit"
//   //         header="Action"
//   //         type="custom"
//   //         width="10%"
//   //         displayValueGetter={(row) => (
//   //           <Button
//   //             style={{ height: 30, marginRight: 10, marginBottom: 3 }}
//   //             onClick={() => {
//   //               setSelectedUnit(row);
//   //               setShowEditModal(true);
//   //             }}
//   //           >
//   //             Edit
//   //           </Button>
//   //         )}
//   //       /> */}
//   //     </ListLayout>
//   //   </>
//   // );
// };

const Main = () => {
  const dispatch = useDispatch();
  const [selectedBlock, setSelectedBlock] = useState<any>(null);
  const [selectedWorkCategory, setSelectedWorkCategory] = useState<
    number | null
  >(null);
  const [selectedWorkType, setSelectedWorkType] = useState<number | null>(null);
  const selectedProject = useSelector(
    (state: any) => state?.common?.selectedProject
  );
  const [workData, setWorkData] =useState<any | null>([])

  const { data: projects } = useActiveProjectQuery();
  const { data: blockData } = useBlocksForProjectQuery(
    { projectId: selectedProject },
    { skip: !selectedProject, refetchOnMountOrArgChange: true }
  );
  const { data: workCategoryData } = useGetWorkNameCategoryQuery();
  const { data: workTypeData } = useGetWorkNameTypeByCategoryQuery(
    selectedWorkCategory ?? 0,
    {
      skip: !selectedWorkCategory,
      refetchOnMountOrArgChange: true,
    }
  );
const { data, isFetching } = useListWorkDetailsQuery(
  {
    project: selectedProject,
    block: selectedBlock,
    category: Number(selectedWorkCategory),
    type: Number(selectedWorkType),
  },
  {
    skip: !selectedWorkType || !selectedWorkCategory || !selectedBlock || !selectedProject,
    refetchOnMountOrArgChange: true,
  }
);
  const handleCategoryChange = useCallback((e: { value: number | null }) => {
    setSelectedWorkCategory(e.value);
    setSelectedWorkType(null);
  }, []);

  const handleTypeChange = useCallback((e: { value: number | null }) => {
    setSelectedWorkType(e.value);
  }, []);

  const dropdownStyle = useMemo(() => ({ width: "60%" }), []);
  const labelClass = "col-4";
  const fieldClass = "field col-6";

  useEffect(()=> {
    if(data) {
      setWorkData(data)
    }
  },[data])

  return (
    <>
      <Divider />

      <div className="pl-4 pr-4 pt-4 pb-3 grid">
        <div className={fieldClass}>
          <label className={labelClass}>Project Name</label>
          <Dropdown
            style={dropdownStyle}
            optionLabel="name"
            optionValue="key"
            value={selectedProject}
            filter
            filterBy="name"
            onChange={(e) => dispatch(setSelectedProjectReducer(e.value))}
            options={projects || []}
          />
        </div>

        <div className={fieldClass}>
          <label className={labelClass}>Block</label>
          <Dropdown
            style={dropdownStyle}
            optionLabel="descr"
            optionValue="key"
            value={selectedBlock}
            filter
            filterBy="descr"
            onChange={(e) => setSelectedBlock(e.value)}
            options={blockData || []}
          />
        </div>

        <div className={fieldClass}>
          <label className={labelClass}>Work Category</label>
          <Dropdown
            style={dropdownStyle}
            value={selectedWorkCategory}
            onChange={handleCategoryChange}
            showClear
            filter
            filterBy="descr"
            options={workCategoryData?.results || []}
            placeholder="All"
            optionLabel="descr"
            optionValue="key"
          />
        </div>

        <div className={fieldClass}>
          <label className={labelClass}>Work Type</label>
          <Dropdown
            style={dropdownStyle}
            value={selectedWorkType}
            onChange={handleTypeChange}
            showClear
            filter
            filterBy="descr"
            options={selectedWorkCategory ? workTypeData : []}
            placeholder="All"
            optionLabel="descr"
            optionValue="key"
          />
        </div>
      </div>

      <ListLayout
        gridProps={{ style: { maxHeight: 400, overflowY: "auto" } }}
        tableLayoutClass="none"
        baseRoute="/projects/workinfo"
        showHeader
        newTable
        isLoading={isFetching}
        allowFilters={false}
        hideAddButton
        viewOnly
        data={workData}
      >
        <Datacolumn
          field="name"
          header="Work Name"
          style={{ minWidth: "12rem" }}
        />
        <Datacolumn
          field="segment"
          header="segment"
          style={{ minWidth: "12rem" }}
        />
        {/* Uncomment when Edit feature is needed */}
      </ListLayout>
    </>
  );
};

export default Main;
