import React, { useState } from 'react';
import { ListLayout, Datacolumn, CurrencyFormatter } from '@igblsln/control';
import { useNavigate, useLocation } from 'react-router-dom'
import { PAGE_SIZE, setSelectedProjectReducer, useActiveProjectQuery, useGetAllItemTypesQuery } from '@igblsln/store';
import { Divider } from 'primereact/divider';
import { Button } from 'primereact/button';
import { useGetProjectStockQuery } from '../api';
import { Dropdown } from 'primereact/dropdown';
import ViewModal from '../ViewModal';
import { useDispatch, useSelector } from 'react-redux';
import ExcelJS from 'exceljs';

type Props = {}

const Main = (props: Props) => {

  const dispatch = useDispatch();
  const selectedProjectKey = useSelector((state: any) => state?.common?.selectedProject)


  const [page, setPage] = useState(1)
  const [size, setSize] = useState(PAGE_SIZE)
  const { state } = useLocation()
  const [selectedItemType, setSelectedItemType] = useState<any>(state?.itemType || null)
  const [selectedStock, setSelectedStock] = useState<any>(null)
  const [showModal, setShowModal] = useState<any>(false)

  const { data: allProjects } = useActiveProjectQuery()
  const { data: itemTypes } = useGetAllItemTypesQuery()

  const { data, isFetching: isLoading } = useGetProjectStockQuery({ page: page, size: size, projectId: selectedProjectKey, item_type: selectedItemType }, { skip: !selectedProjectKey })

  const customDiscard = () => {
    setShowModal(false)
  }


const exportToExcel = async () => {
  if (!data?.results?.length) return;

  const workbook = new ExcelJS.Workbook();

  // 1. Project Stock Summary
  const stockSheet = workbook.addWorksheet("Project Stock");

  stockSheet.columns = [
    { header: "Item Name", key: "item_name", width: 25 },
    { header: "Brand", key: "brand", width: 20 },
    { header: "Quantity", key: "quantity", width: 15 },
    { header: "UOM", key: "UOM", width: 10 },
  ];

  data.results.forEach((item: any) => {
    stockSheet.addRow({
      item_name: item.item_name,
      brand: item.brand || "N/A",
      quantity: item.quantity || 0,
      UOM: item.UOM,
    });
  });

  stockSheet.getRow(1).font = { bold: true };

  // 2. Invoice Details
  const invoiceSheet = workbook.addWorksheet("Stock Invoices");

  invoiceSheet.columns = [
    { header: "Item Name", key: "item_name", width: 25 },
    { header: "Invoice No", key: "invoice_no", width: 15 },
    { header: "Date", key: "date", width: 15 },
    { header: "Quantity", key: "quantity", width: 15 },
    { header: "UOM", key: "uom", width: 10 },
  ];

  data.results.forEach((item: any) => {
    item.invoices?.forEach((inv: any) => {
      invoiceSheet.addRow({
        item_name: item.item_name,
        invoice_no: inv.invoice_no,
        date: inv.date,
        quantity: inv.quantity,
        uom: inv.uom,
      });
    });
  });

  invoiceSheet.getRow(1).font = { bold: true };

  // 3. Trigger download
  const projectName =
    allProjects?.find((p: any) => p.key === selectedProjectKey)?.name ||
    selectedProjectKey;

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${projectName || "Project"}_Stock_Report.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
  

  return (
    <>
      <Divider />

      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 15 }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
          <label style={{ width: '30%' }}>Project Name</label>
          <Dropdown
            style={{ width: '70%' }}
            optionLabel="name"
            optionValue="key"
            value={selectedProjectKey}
            onChange={(e) => dispatch(setSelectedProjectReducer(e.value))}
            filter
            filterBy="name"
            options={allProjects}
            placeholder="Select Project"
          />
        </div>

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', marginLeft: 20 }}>
          <label style={{ width: '30%' }}>Item Type</label>
          <Dropdown
            style={{ width: '70%' }}
            optionLabel="descr"
            optionValue="key"
            value={selectedItemType}
            onChange={(e) => setSelectedItemType(e.value)}
            filter
            filterBy="descr"
            options={itemTypes}
            placeholder="Select Item Type"
          />
        </div>

        <div style={{ marginLeft: 40 }}>
          <Button
            disabled={!selectedProjectKey}
            onClick={exportToExcel}
            label="Export to Excel"
          />
        </div>
      </div>

      <div className="col-12 " style={{ height: 'calc(100% - 383px)', minHeight: 200 }}>
        <ListLayout isLoading={isLoading}
          data={data?.results}
          newTable
          showHeader
          hideAddButton
          tableLayoutClass='h-full'
          allowFilters={false}
          hideActionColumn
        >
          {/* <Datacolumn field="sno" header="S.No" /> */}
          <Datacolumn field="item_name" header="Item" />
          <Datacolumn field="brand" header="Brand Name" />
          <Datacolumn field="quantity" header="Quantity" />
          <Datacolumn field="UOM" header="UOM" />
          <Datacolumn
            width={"15%"}
            field="view"
            header="View"
            type="custom"
            displayValueGetter={(row: any) =>
              <Button
                style={{ height: 30, marginRight: 10, marginBottom: 3 }}
                onClick={() => {
                  setSelectedStock(row)
                  setShowModal(true)
                }}
              >
                View
              </Button>
            }
          />

        </ListLayout>
      </div>

      {
        showModal &&
        <ViewModal filters={{ projectKey: selectedProjectKey, itemType: selectedItemType }} data={selectedStock} displayModal={showModal} customDiscard={customDiscard} />
      }
    </>

  );
}

export default Main