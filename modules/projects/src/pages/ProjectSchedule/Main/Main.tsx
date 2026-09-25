import React, { useState, useEffect } from "react";
import { ListLayout, Datacolumn, CreateButton } from "@igblsln/control";
import { PAGE_SIZE, useGetAllProjectTypesQuery } from "@igblsln/store";
import { useDeleteSchedulesMutation, useListSchedulesQuery } from "../api";
import { MODULE_NAME } from "../../../constants";
import { PAGE_NAME, PAGE_ROUTE } from "../constants";
import { Divider } from "primereact/divider";
import { Dropdown } from "primereact/dropdown";

type Props = {};

const Main = (props: Props) => {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(PAGE_SIZE);
  const [selectedProjType, setSelectedProjType] = useState(null);
  const [allProjTypes, setAllProjTypes] = useState<any>([]);
  const { data: projTypes } = useGetAllProjectTypesQuery();
  const { data, isFetching: isLoading } = useListSchedulesQuery({
    page: page,
    size: size,
    type: selectedProjType,
  });
  const [deleteDataAction, { isLoading: isDeleting }] =
    useDeleteSchedulesMutation();
  const deleteAction = (id: number) => deleteDataAction(id).unwrap();

  useEffect(() => {
    setAllProjTypes([
      {
        key: null,
        descr: "All",
      },
      ...(projTypes || []),
    ]);
  }, [projTypes]);

  return (
    <>
      <Divider />
      <div className="flex" style={{ width: "100%" }}>
        <div className="field col-6">
          <label className={"col-4"}>Project Type</label>
          <Dropdown
            style={{ width: "60%" }}
            value={selectedProjType}
            onChange={(e) => {
              setSelectedProjType(e.value);
            }}
            showClear
            filter
            filterBy="descr"
            options={allProjTypes}
            placeholder="All"
            optionLabel="descr"
            optionValue="key"
          />
        </div>
        <CreateButton
          col={4}
          to={`/${MODULE_NAME}/${PAGE_ROUTE}/new`}
          label="Project Schedule"
        />
      </div>
      <ListLayout
        pagination={{
          pageSize: size,
          loading: isLoading,
          currentPage: page,
          total: data?.count,
          onChange: (page, size) => {
            setPage(page);
            setSize(size);
          },
        }}
        baseRoute={`/${MODULE_NAME}/${PAGE_ROUTE}`}
        description={PAGE_NAME}
        isLoading={isLoading || isDeleting}
        data={data?.results}
        deleteAction={deleteAction}
        newTable
      >
        <Datacolumn field="name" header="Description" filteringType="text" />
        <Datacolumn
          field="projtyp.descr"
          header="Project Type"
          filteringType="text"
        />
      </ListLayout>
    </>
  );
};

export default Main;
