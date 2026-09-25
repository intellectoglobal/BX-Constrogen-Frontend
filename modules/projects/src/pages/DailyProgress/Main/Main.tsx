import React, { useState } from "react";
import { ListLayout, Datacolumn, CreateButton } from "@igblsln/control";
import { formatDate, PAGE_SIZE, useActiveProjectQuery } from "@igblsln/store";
import { Divider } from "primereact/divider";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import {
  useDeleteDailyProgressMutation,
  useListDailyProgressQuery,
} from "../api";
import { useListWorkNameCategoryQuery } from "../../WorkInfo/workInfoApi";

type Props = {};

const Main = (props: Props) => {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(PAGE_SIZE);
  const { data: projects } = useActiveProjectQuery();
  const { data: workCategory } = useListWorkNameCategoryQuery();
  const [selectedProjectKey, setSelectedProjectKey] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [fromDate, setFromDate] = useState<any>(null);
  const [toDate, setToDate] = useState<any>(null);

  const apiQueryParams: any = {
    page: page,
    size: size,
    project: selectedProjectKey,
    type: selectedCategory,
  };

  if (fromDate) {
    apiQueryParams.from = formatDate(fromDate, "yyyy-MM-dd");
  }
  if (toDate) {
    apiQueryParams.to = formatDate(toDate, "yyyy-MM-dd");
  }

  const { data, isFetching: isLoading } = useListDailyProgressQuery(
    apiQueryParams,
    {
      refetchOnMountOrArgChange: true,
    }
  );
  const [deleteDataAction, { isLoading: isDeleting }] =
    useDeleteDailyProgressMutation();
  const deleteAction = (id: number) => deleteDataAction(id).unwrap();

  return (
    <>
      <Divider />

      <div className="flex" style={{ width: "100%" }}>
        <div className="field col-3">
          <label className={"col-4"}>Project</label>
          <Dropdown
            style={{ width: "60%" }}
            placeholder="All"
            optionLabel={"name"}
            optionValue={"key"}
            value={selectedProjectKey}
            filter
            filterBy="name"
            showClear
            onChange={(e) => {
              setSelectedProjectKey(e.value);
            }}
            options={projects}
          />
        </div>
        <div className="field col-3">
          <label className={"col-4"}>Category</label>
          <Dropdown
            style={{ width: "60%" }}
            placeholder="All"
            optionLabel={"descr"}
            optionValue={"key"}
            value={selectedCategory}
            filter
            filterBy="descr"
            showClear
            onChange={(e) => {
              setSelectedCategory(e.value);
            }}
            options={workCategory}
          />
        </div>
        <div className="field col-3">
          <label className={"col-4"}>From</label>
          <Calendar
            style={{ width: "60%" }}
            showIcon
            value={fromDate}
            todayButtonClassName="p-"
            dateFormat={"dd/mm/yy"}
            showButtonBar
            maxDate={toDate} // prevent selecting fromDate greater than toDate
            onChange={(e) => {
              const newFromDate = e.value as Date | null;
              if (newFromDate === null) {
                // If cleared, reset both
                setFromDate(null);
                setToDate(null);
              } else {
                setFromDate(newFromDate);
              }
            }}
          />
        </div>

        <div className="field col-3">
          <label className={"col-4"}>To</label>
          <Calendar
            style={{ width: "60%" }}
            showIcon
            value={toDate}
            todayButtonClassName="p-"
            dateFormat={"dd/mm/yy"}
            showButtonBar
            minDate={fromDate} // prevent selecting toDate smaller than fromDate
            onChange={(e) => {
              const newToDate = e.value as Date | null;
              if (newToDate === null) {
                setToDate(null);
              } else {
                setToDate(newToDate);
              }
            }}
          />
        </div>
      </div>

      <CreateButton to={"/projects/dailyprogress/new"} label="Daily Progress" />

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
        baseRoute="/projects/dailyprogress"
        hideAddButton
        description="Daily Progress"
        addBtnLabel="Create Daily Progress"
        isLoading={isLoading || isDeleting}
        data={data?.results}
        newTable
        showHeader
        deleteAction={deleteAction}
      >
        <Datacolumn
          field="project_name"
          header="Project"
          filteringType="text"
        />
        <Datacolumn
          field="work_ctgry_name"
          header="Type"
          filteringType="text"
        />
        <Datacolumn field="date" header="Date" filteringType="date" />
        <Datacolumn field="status_label" header="Status" filteringType="text" />
      </ListLayout>
    </>
  );
};

export default Main;
