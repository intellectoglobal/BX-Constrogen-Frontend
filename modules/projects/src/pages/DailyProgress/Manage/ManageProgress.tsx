import React, { useState, useEffect, useRef } from "react";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { Datacolumn, ListLayout } from "@igblsln/control";
import { MODULE_NAME, PAGE_NAME, PAGE_ROUTE, STATUS_OPTIONS, StatusOption } from "../constants";
import ManageModal from "../Modals/ManageModal";
import { useAuth } from "@igblsln/store";

interface ProgressDetail {
  key?: number;
  descr: string;
  comments: string;
  status: string;
  status_label: string;
  created_by?: string;
  created_at?: string; 
  images?: { key?: number; image_url: string }[];
}

interface Props {
  data: ProgressDetail[];
  isLoading?: boolean;
  disableTable?: boolean;
  onChange?: (data: ProgressDetail[]) => void;
  onTableChange?: (changed: boolean) => void;
}

const ManageProgress = ({
  data,
  isLoading,
  disableTable = false,
  onChange = () => {},
  onTableChange = () => {},
}: Props) => {
  const [items, setItems] = useState<ProgressDetail[]>([]);
  const itemsRef = useRef<ProgressDetail[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedProgress, setSelectedProgress] = useState<ProgressDetail | null>(null);
  const auth = useAuth();

  useEffect(() => {
    setItems(data);
    itemsRef.current = data;
  }, [data]);

  const removeTask = (val: ProgressDetail) => {
    const updated = itemsRef.current.filter((x) => x !== val);
    itemsRef.current = updated;
    setItems(updated);
    onChange(updated);
    onTableChange(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedProgress(null);
  };

  const updateRow = (updatedRow: ProgressDetail) => {
    let updated: ProgressDetail[];
    if (updatedRow.key && itemsRef.current.some((row) => row.key === updatedRow.key)) {
      updated = itemsRef.current.map((row) =>
        row.key === updatedRow.key
          ? {
              ...updatedRow,
              created_by: updatedRow.created_by || auth.user?.user_name || "",
              created_at: updatedRow.created_at || row.created_at || new Date().toISOString(), 
              status_label:
                STATUS_OPTIONS.find((s: StatusOption) => s.key === updatedRow.status)?.name ||
                updatedRow.status_label,
            }
          : row
      );
    } else {
      updated = [
        ...itemsRef.current,
        {
          ...updatedRow,
          created_by: updatedRow.created_by || auth.user?.user_name || "",
          created_at: updatedRow.created_at || new Date().toISOString(),
          status_label:
            STATUS_OPTIONS.find((s: StatusOption) => s.key === updatedRow.status)?.name ||
            updatedRow.status_label,
        },
      ];
    }

    itemsRef.current = updated;
    setItems(updated);
    onChange(updated);
    onTableChange(true);
    console.log("data received in manageprogress :", updated);
    setShowModal(false);
    setSelectedProgress(null);
  };

  const actionBodyTemplate = (value: ProgressDetail) => {
    return (
      <div className="flex">
        <Button
          style={{ height: "35px", width: "20px", marginLeft: 10 }}
          type="button"
          onClick={() => {
            setSelectedProgress(value);
            setShowModal(true);
          }}
          className="p-button-rounded p-button-text"
          icon="pi pi-pencil"
        />
        <Button
          style={{ height: "35px", width: "20px", marginLeft: 10 }}
          type="button"
          onClick={() => removeTask(value)}
          className="p-button-rounded p-button-text"
          icon="pi pi-trash"
        />
      </div>
    );
  };

  const shouldAllowAdd = (items: ProgressDetail[]) => {
    if (items.length === 0) return true;
    const lastItem = items[items.length - 1];
    return lastItem?.descr && lastItem?.status;
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // fallback
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${day}-${month}-${year}, ${hours}:${minutes}`;
  };

  return (
    <>
      <ListLayout
        baseRoute={`/${MODULE_NAME}/${PAGE_ROUTE}`}
        description={PAGE_NAME}
        isLoading={isLoading}
        data={items}
        newTable
        tableLayoutClass="h-full"
        allowFilters={false}
        hideActionColumn={disableTable}
        actionColumnInFirst
        actionColumnWidth={"10%"}
        actionBodyTemplate={actionBodyTemplate}
        customHandleAddRow={() => {
          setShowModal(true);
          setSelectedProgress(null);
        }}
        gridProps={{
          allowAdd: true,
          disableAdd: disableTable || !shouldAllowAdd(items),
          newRowDefaults: {
            descr: "",
            comments: "",
            status: "Y",
            status_label: "Yet to Start",
            created_by: auth.user?.user_name || "",
            created_at: new Date().toISOString(), 
          },
          OnRowsChanged: async (rows: ProgressDetail[]) => {
            const updated = rows.map((row) => ({
              ...row,
              created_by: row.created_by || auth.user?.user_name || "",
              status_label: STATUS_OPTIONS.find((s: StatusOption) => s.key === row.status)?.name || row.status_label,
              created_at: row.created_at || new Date().toISOString(), 
            }));
            console.log('updated :', updated);
            itemsRef.current = updated;
            setItems(updated);
            onChange(updated);
            onTableChange(true);
          },
        }}
      >
        <Datacolumn
          width={"30%"}
          field="descr"
          header="Description *"
          type="text"
          editorType={false}
        />
        <Datacolumn
          width="15%"
          field="status"
          header="Status *"
          displayValueGetter={(row: ProgressDetail, field: keyof ProgressDetail) => {
            const status = STATUS_OPTIONS.find((option: StatusOption) => option.key === row[field]);
            return status?.name || row[field];
          }}
          editorType={false}
        />
        <Datacolumn
          width={"20%"}
          field="comments"
          header="Comments"
          type="text"
          editorType={false}
        />
        <Datacolumn
          width={"12%"}
          field="created_by"
          header="Created By"
          type="text"
          editorType={false}
        />
        <Datacolumn
          width={"13%"}
          field="created_at"
          header="Created On"
          displayValueGetter={(row: ProgressDetail) => formatDateTime(row.created_at)}
          editorType={false}
        />
      </ListLayout>

      {showModal && (
        <ManageModal
          displayModal={showModal}
          customDiscard={handleCloseModal}
          data={selectedProgress}
          onSave={updateRow}
        />
      )}
    </>
  );
};

export default ManageProgress;