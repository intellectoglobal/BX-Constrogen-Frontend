import React, { useState } from "react";
import { Divider } from "primereact/divider";
import { ListLayout, Datacolumn, CreateButton } from "@igblsln/control";
import { useDeleteWorkCategoryMutation, useListWorkCategoryDataQuery } from "../api";
import { PAGE_NAME, PAGE_ROUTE } from "../constants";
import { MODULE_NAME } from "../../../constants";
import { PAGE_SIZE } from "@igblsln/store";

const Main = () => {
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(PAGE_SIZE)
  const { data, isFetching: isLoading } = useListWorkCategoryDataQuery({ page: page, size: size});
  const [deleteDataAction, { isLoading: isDeleting }] = useDeleteWorkCategoryMutation()
  const deleteAction = (id: number) => deleteDataAction(id).unwrap();

  return (
    <>
      <Divider />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h3 className="col-4">Work Category</h3>
        <CreateButton col={4} to="/admintools/workcategory/new" label="" />
      </div>

      <ListLayout
        baseRoute={`/${MODULE_NAME}/${PAGE_ROUTE}`}
        description={PAGE_NAME}
        isLoading={isLoading || isDeleting}
        hideAddButton
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
        showHeader
        newTable
        data={data?.results || []}
        deleteAction={deleteAction}
      >
        <Datacolumn field="descr" header="Name" filteringType="text" />
      </ListLayout>
    </>
  );
};

export default Main;
