import React, { useState, useEffect } from 'react';
import { ListLayout, Datacolumn, GenerateReport } from '@igblsln/control';
import { getMonthsFor, getPreviousYears, PAGE_SIZE, setPaymentMenu, useAppDispatch } from '@igblsln/store';
import { Divider } from 'primereact/divider';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { useListContractorPaymentVoucherReportsQuery } from '../api';
import ExcelJS from 'exceljs';

type Props = {}

const Main = (props: Props) => {
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(PAGE_SIZE)

  const dispatch = useAppDispatch()

  const years = getPreviousYears(5)
  const [selectedYear, setSelectedYear] = useState<any>(years[0])
  var months = getMonthsFor(selectedYear)
  const [selectedMonth, setSelectedMonth] = useState<any>(null)
  const [selectedMonthName, setSelectedMonthName] = useState<any>(null)

    useEffect(() => {
      dispatch(setPaymentMenu('view'));
      return () => {
        dispatch(setPaymentMenu(''));
      };
    }, [dispatch]);

  useEffect(() => {
    months = getMonthsFor(selectedYear)
    setSelectedMonth(months[months.length - 1].value)
    setSelectedMonthName(months[months.length - 1].name)
  }, [selectedYear])

  const { data: reports } = useListContractorPaymentVoucherReportsQuery({ page: page, size: size, year: selectedYear, month: selectedMonth }, { skip: !selectedMonth, refetchOnMountOrArgChange: true })

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

      <div className="col-12 " style={{ height: 'calc(100% - 100px)', minHeight: 200, marginTop: -15 }}>
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
          <Datacolumn field="date_of_payment" header="Date Of Payment" />
          <Datacolumn field="payee_name" header="Payee Name" />
          <Datacolumn field="amount" header="Amount" filteringType="number" />
          <Datacolumn field="mode_of_payment" header="Mode Of Payment" filteringType="text" />
          <Datacolumn field="bank_name" header="Bank Name" filteringType="text" />
          <Datacolumn field="transaction_no" header="Cheque/ Transaction No" filteringType="text" />
          <Datacolumn field="contractor_type" header="Contractor Type" filteringType="text" />
        </ListLayout>
      </div>

    </>

  );
}

export default Main