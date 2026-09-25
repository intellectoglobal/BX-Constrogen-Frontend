import React, { useState } from "react";
import { Card } from "primereact/card";
import { Divider } from "primereact/divider";
import { Dropdown } from "primereact/dropdown";
import { ListLayout, Datacolumn, CreateButton } from "@igblsln/control";
import { PAGE_NAME, PAGE_ROUTE } from "../constants";
import { MODULE_NAME } from "../../../constants";
import { useGetWorkCategoryDataQuery } from "../../WorkCategory/api";
import { useDeleteWorkTypeMutation, useListWorkTypeQuery } from "../api";
import { PAGE_SIZE } from "@igblsln/store";

const Main = () => {
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(PAGE_SIZE)
  const [selectedWorkCategory, setSelectedWorkCategory] = useState(null)
  const { data:workCategoryData, isFetching } = useGetWorkCategoryDataQuery();
  const { data, isFetching: isLoading } = useListWorkTypeQuery({ page: page, size: size, type: selectedWorkCategory },{skip: !selectedWorkCategory})
  console.log("data ::", data)
  const [deleteDataAction, { isLoading: isDeleting }] = useDeleteWorkTypeMutation()
  const deleteAction = (id: number) => deleteDataAction(id).unwrap();
  return (
    <>
      <Divider />
      <div style={{ display: 'flex' }}>
        <div className="field col-6">
          <label className={'col-4'}>Work Category</label>
          <Dropdown
            style={{ width: '60%' }}
            value={selectedWorkCategory}
            onChange={(e) => {
              setSelectedWorkCategory(e.value)
            }}
            filter
            filterBy='descr'
            options={workCategoryData?.results}
            optionLabel='descr'
            optionValue='key'
          />
        </div>

        <CreateButton col={4} to={"/admintools/worktype/new"} label='' />

      </div>

      <ListLayout
        description={PAGE_NAME}
        isLoading={isLoading || isFetching || isDeleting}
        hideAddButton
        baseRoute={`/${MODULE_NAME}/${PAGE_ROUTE}`}
        // hideActionColumn
        // title="Work Category"
        data={data?.results}
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
        newTable
        showHeader
        deleteAction={deleteAction}
        emptyRowMessage={selectedWorkCategory ? "No Work Types For Selected Category" : "Select a Category To View"}
      >
        {/* <Datacolumn field="lead_no" header="S.No" filteringType="text" /> */}
        <Datacolumn field="descr" header="Name" filteringType="text" />
        {/* <Datacolumn field="contact_1" header="Contact" filteringType="text" />
        <Datacolumn field="budget" header="Budget" filteringType="text" />
        <Datacolumn field="email" header="Email" filteringType="text" />
        <Datacolumn field="status_name" header="Status" filteringType="text" />
        <Datacolumn field="source" header="Source" filteringType="text" /> */}
      </ListLayout>
    </>
  );
};

export default Main;
