import React, { useState } from "react";
import { Divider } from "primereact/divider";
import { Dropdown } from "primereact/dropdown";
import {
  ListLayout,
  Datacolumn
} from "@igblsln/control";
import { PAGE_NAME, PAGE_ROUTE } from "../constants";
import { MODULE_NAME } from "../../../constants";
import { useGetWorkCategoryDataQuery } from "../../WorkCategory/api";
import { PAGE_SIZE } from "@igblsln/store";
import { useGetWorkTypeDataWithCateTypeQuery } from "../../WorkType/api";
import { useDeleteWorkActivityMutation, useListWorkActivityQuery } from "../api";

const Main = () => {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(PAGE_SIZE);
  const [selectedWorkCategory, setSelectedWorkCategory] = useState<number | null>(null);
  const [selectedWorkType, setSelectedWorkType] = useState<number | null>(null);

  const {
    data: workCategoryData,
    isFetching: isCategoryLoading,
  } = useGetWorkCategoryDataQuery();

  const {
    data: workTypeData,
    isFetching: isTypeLoading,
  } = useGetWorkTypeDataWithCateTypeQuery(selectedWorkCategory ?? 0, {
    skip: !selectedWorkCategory,
    refetchOnMountOrArgChange: true,
  });

  const handleCategoryChange = (e: { value: React.SetStateAction<number | null>; }) => {
    setSelectedWorkCategory(e.value);
    setSelectedWorkType(null); // Reset work type when category changes
  };

  const handleTypeChange = (e: { value: React.SetStateAction<number | null>; }) => {
    setSelectedWorkType(e.value);
  };

  const { data, isFetching } = useListWorkActivityQuery({ page: page, size: size, workCategory: selectedWorkCategory, workType: selectedWorkType }, {skip: !selectedWorkCategory || !selectedWorkType})
  console.log("data ::", data)

  const [deleteDataAction, { isLoading: isDeleting }] = useDeleteWorkActivityMutation()
  const deleteAction = (id: number) => deleteDataAction(id).unwrap();

  const isLoading = isCategoryLoading || isTypeLoading || isFetching || isDeleting;

  console.log("selectedWorkType ::", selectedWorkType)



  return (
    <>
      <Divider />
      <div>
        <div style={{ display: "flex" }}>
          <div className="field col-6">
            <label className="col-4">Work Category</label>
            <Dropdown
              style={{ width: "60%" }}
              value={selectedWorkCategory}
              onChange={handleCategoryChange}
              filter
              filterBy="descr"
              options={workCategoryData?.results || []}
              optionLabel="descr"
              optionValue="key"
            />
          </div>

          <div className="field col-6">
            <label className="col-4">Work Type</label>
            <Dropdown
              style={{ width: "60%" }}
              value={selectedWorkType}
              onChange={handleTypeChange}
              filter
              filterBy="descr"
              options={workTypeData}
              optionLabel="descr"
              optionValue="key"
            />
          </div>
        </div>
      </div>

      <ListLayout
        description={PAGE_NAME}
        isLoading={isLoading}
        pagination={{
          pageSize: size,
          loading: isLoading,
          currentPage: page,
          total: data?.count || 0,
          onChange: (newPage, newSize) => {
            setPage(newPage);
            setSize(newSize);
          },
        }}
        deleteAction={deleteAction}
        data={data?.results}
        baseRoute={`/${MODULE_NAME}/${PAGE_ROUTE}`}
        newTable
        showHeader
        emptyRowMessage={
          !selectedWorkCategory
            ? "Select a Category"
            : !selectedWorkType
            ? "Select a Type to View the Activities"
            : "No Work Activities for the Selected Type"
        }

      >
        <Datacolumn field="descr" header="Name" filteringType="text" />
      </ListLayout>
    </>
  );
};

export default Main;
