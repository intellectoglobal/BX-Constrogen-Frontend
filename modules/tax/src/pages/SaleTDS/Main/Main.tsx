import React, { useState, useEffect } from 'react';
import { ListLayout, Datacolumn } from '@igblsln/control';
import { getMonthsFor, getPreviousYears, PAGE_SIZE, useActiveProjectQuery } from '@igblsln/store';
import { Divider } from 'primereact/divider';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { useListTDSReportsQuery } from '../api';
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
  const { data, isFetching: isLoading } = useListTDSReportsQuery({
    page: page,
    size: size,
    year: selectedYear,
    month: selectedMonth
  }, {
    skip: !selectedMonth,
    refetchOnMountOrArgChange: true
  })


  useEffect(() => {
    months = getMonthsFor(selectedYear)
    setSelectedMonth(months[months.length - 1].value)
    setSelectedMonthName(months[months.length - 1].name)
  }, [selectedYear])

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("TDS Entries");

    // Add columns to the worksheet
    worksheet.columns = [
      { header: "Date", key: "date", width: 20 },
      { header: "Project Name", key: "project_name", width: 20 },
      { header: "Unit Name", key: "unit_name", width: 20 },
      { header: "Customer Name", key: "customer_name", width: 20 },
      { header: "Agreement Amount", key: "agreement_amount", width: 20 },
      { header: "TDS Amount", key: "amount", width: 20 },
    ];

    // Add the data rows
    data?.results?.forEach((row, index) => {
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
    link.download = `Sale_TDS_Entries_${selectedMonthName}_${selectedYear}.xlsx`;
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
        <div className="field col-2">
          <Button
            disabled={!data?.results?.length}
            onClick={exportToExcel} label='Export to Excel' />
        </div>


      </div>
      <div className="col-12 " style={{ height: 'calc(100% - 183px)', minHeight: 200, marginTop: -15 }}>
        <ListLayout
          enableView
          disableEdit
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
          description="TDS Invoice"
          hideAddButton
          allowFilters={false}
          isLoading={isLoading}
          data={data?.results}
          newTable
          showHeader
          hideActionColumn
        >
          <Datacolumn field="project_name" header="Project Name" />
          <Datacolumn field="unit_name" header="Unit Name" />
          <Datacolumn field="customer_name" header="Customer" />
          <Datacolumn field="agreement_amount" header="Agreement Amount" type='currency' />
          <Datacolumn field="amount" header="TDS Amount" type='currency' />
        </ListLayout>
      </div>
    </>

  );
}

export default Main