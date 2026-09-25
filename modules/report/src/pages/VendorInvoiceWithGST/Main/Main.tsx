import React, { useState, useEffect } from 'react';
import { ListLayout, Datacolumn, GenerateReport } from '@igblsln/control';
import { getMonthsFor, getPreviousYears, PAGE_SIZE, setPaymentMenu, useAppDispatch } from '@igblsln/store';
import { Divider } from 'primereact/divider';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { useListVendorInvoiceWithGSTReportsQuery } from '../api';
import ExcelJS from 'exceljs';

type Props = {}

const Main = (props: Props) => {
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(PAGE_SIZE)



  const years = getPreviousYears(5)
  const [selectedYear, setSelectedYear] = useState<any>(years[0])
  var months = getMonthsFor(selectedYear)
  const [selectedMonth, setSelectedMonth] = useState<any>(null)
  const [selectedMonthName, setSelectedMonthName] = useState<any>(null)

  useEffect(() => {
    months = getMonthsFor(selectedYear)
    setSelectedMonth(months[months.length - 1].value)
    setSelectedMonthName(months[months.length - 1].name)
  }, [selectedYear])
  
  const dispatch = useAppDispatch()
  useEffect(() => {
    dispatch(setPaymentMenu('view'));
    return () => {
      dispatch(setPaymentMenu(''));
    };
  }, [dispatch]);

  const { data: reports } = useListVendorInvoiceWithGSTReportsQuery({ page: page, size: size, year: selectedYear, month: selectedMonth }, { skip: !selectedMonth, refetchOnMountOrArgChange: true })

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("GST Entries");

    // Add columns to the worksheet
    worksheet.columns = [
      { header: "Date", key: "date", width: 20 },
      { header: "Material Vendor Name", key: "vendor_name", width: 20 },
      { header: "GST Amount", key: "gst_amount", width: 20 },
      { header: "GST Number", key: "gst_no", width: 20 },
    ];

    // Add the data rows
    reports?.results?.forEach((row, index) => {
      worksheet.addRow(row);
    });

    // Style the header row (make it bold and set background color to yellow)
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true }; // Make header text bold
    });

    // Generate the Excel file as a Blob
    const buffer = await workbook.xlsx.writeBuffer();

    // Trigger a download of the generated Excel file
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Purchase_GST_Entries_${selectedMonthName}_${selectedYear}.xlsx`;
    link.click();
  };

  // const getRoundOffDirection = (data: any) => {
  //   if(data?.rounded_action == "A"){
  //     return "Increment"
  //   }
  //   else if (data?.rounded_action == "S"){
  //     return "Decrement"
  //   }
  //   else return "NA"
  // }

  // const getGSTPercent = (data:any) => {
  //   return ((data?.gstamt / data?.taxable_invoice_amount) * 100).toFixed(2) + "%"
  // }

  return (
    <>
      <Divider />


      <div style={{ display: 'flex' }}>
        <div className="field col-4">
          <label className={'col-4'}>Financial Year</label>
          <Dropdown
            style={{ width: '60%' }}
            options={years}
            onChange={(e) => setSelectedYear(e.value)}
            value={selectedYear}
            placeholder={'Select an Year'}
          />
        </div>
        <div className="field col-4">
          <label className={'col-4'}>Select Month</label>
          <Dropdown
            style={{ width: '60%' }}
            value={selectedMonth}
            placeholder='Select a Month'
            options={months}
            onChange={(e) => {
              //@ts-ignore
              setSelectedMonthName(e.originalEvent?.nativeEvent?.target?.innerText)
              setSelectedMonth(e.value)
            }}
            optionLabel='name'
            optionValue='value'
          />
        </div>
        {/* <div className="field col-2">
          <Button
            disabled={!reports?.results?.length}
            onClick={exportToExcel} label='Export to Excel' />
        </div> */}
      </div>

      <div className="col-12 " style={{ height: 'calc(100% - 183px)', minHeight: 200, marginTop: -15 }}>
        <ListLayout
          enableView
          disableEdit
          pagination={{
            pageSize: size,
            loading: false,
            currentPage: page,
            total: reports?.count,
            onChange: (page, size) => {
              setPage(page);
              setSize(size)
            }
          }}
          baseRoute="/expenses/gstinvoice"
          description="GST Invoice"
          hideAddButton
          allowFilters={false}
          data={reports?.results}
          newTable
          showHeader
          hideActionColumn
        >
          {/* <Datacolumn field="sno" header="S.No" /> */}
          <Datacolumn field="invoice_date" header="Invoice Date" />
          <Datacolumn field="vendor_name" header="Vendor Name" />
          <Datacolumn field="vendor_gst" header="Vendor GST" />
          <Datacolumn field="material_type" header="Material Type" />
          <Datacolumn field="taxable_invoice_amount" header="Taxable Invoice Amount" />
          <Datacolumn field="gst_rate" header="GST Rate" />
          <Datacolumn field="gst_amount" header="GST Amount" filteringType='number' />
          <Datacolumn field="rounded_off_direction" header="Round Off Direction" filteringType='text' />
          <Datacolumn field="rounded_off_value" header="Round Off Value" filteringType='text' />
          <Datacolumn field="total_bill_amount" header="Total Bill Amount" filteringType='number' />
          <Datacolumn field="vendor_invoice_no" header="Vendor Invoice No" filteringType='text' />
          <Datacolumn field="project_name" header="Project Name" filteringType='text' />
        </ListLayout>
      </div>

    </>

  );
}

export default Main