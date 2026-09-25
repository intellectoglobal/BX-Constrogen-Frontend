import React, { useState, useEffect } from 'react';
import { getMonthsFor, getPreviousYears} from '@igblsln/store';
import { Divider } from 'primereact/divider';
import { Checkbox } from 'primereact/checkbox';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { useLazyListAllReportsToExportQuery } from '../api';
import ExcelJS from 'exceljs';

type Props = {}

const reportPages = [
  { "label": "GST Invoices", "value": "gst_invoices" },
  { "label": "Non-GST Invoices", "value": "non_gst_invoices" },
  { "label": "Customer Payments", "value": "customer_payments" },
  { "label": "Contractor Payments", "value": "contractor_payments" },
  { "label": "Supplier Payments", "value": "supplier_payments" },
  { "label": "Payroll", "value": "payroll_reports" },
  { "label": "Contractor TDS", "value": "contractor_tds" }
]


const Main = (props: Props) => {

  const years = getPreviousYears(5)
  const [selectedYear, setSelectedYear] = useState<any>(years[0])
  var months = getMonthsFor(selectedYear)
  const [selectedMonth, setSelectedMonth] = useState<any>(null)
  const [selectedMonthName, setSelectedMonthName] = useState<any>(null)
  const [triggerExportQuery] = useLazyListAllReportsToExportQuery();
  const [exporting, setExporting] = useState(false);
  useEffect(() => {
    months = getMonthsFor(selectedYear)
    setSelectedMonth(months[months.length - 1].value)
    setSelectedMonthName(months[months.length - 1].name)
  }, [selectedYear])

  const [selectedReports, setSelectedReports] = useState(reportPages);

  // const { data: reports } = useListAllReportsToExportQuery({ year: selectedYear, month: selectedMonth, includes: selectedReports.map(d => d.value) }, { skip: !selectedMonth, refetchOnMountOrArgChange: true })


  const onCategoryChange = (e: any) => {
    let _selectedReports = [...selectedReports];

    if (e.checked) {
      // Check if the category is already selected
      const existingCategory = _selectedReports.find(category => category?.value === e.value);
      // If not, add it to the selected reports
      if (!existingCategory) {
        const foundCategory = reportPages.find(category => category?.value === e.value);
        if (foundCategory) {
          _selectedReports.push(foundCategory);
        }
      }
    }
    else {
      // If it is already selected, remove it from the selected reports
      _selectedReports = _selectedReports.filter(category => category?.value != e.value);
    }

    setSelectedReports(_selectedReports);
  };

const exportToExcel = async () => {
  setExporting(true);
  try {
    const response = await triggerExportQuery({
      year: selectedYear,
      month: selectedMonth,
      includes: selectedReports.map(d => d.value)
    }).unwrap();

    const workbook = new ExcelJS.Workbook();

    Object.entries(response || {}).forEach(([sheetName, entries]) => {
      const formattedSheetName = sheetName
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
      const worksheet = workbook.addWorksheet(formattedSheetName);

      if (entries.length === 0) return;

      const columns = Object.keys(entries[0]).map((key) => ({
        header: key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        key,
        width: 20,
      }));
      worksheet.columns = columns;

      entries.forEach((entry: any) => {
        const rowValues: Record<string, any> = {};
        Object.entries(entry).forEach(([key, value]) => {
          if (key.toLowerCase().includes("amt") && !isNaN(Number(value))) {
            rowValues[key] = Number(value);
          } else {
            rowValues[key] = value;
          }
        });
        worksheet.addRow(rowValues);
      });

      worksheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true };
      });

      worksheet.columns.forEach((column) => {
        if (column.key?.toLowerCase().includes("amt")) {
          column.numFmt = '₹#,##0.00';
        }
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();

    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Finance_Report_${selectedMonthName}_${selectedYear}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Failed to export:", error);
  } finally {
    setExporting(false);
  }
};


  return (
    <>
      <Divider />

      <div className="card flex justify-content-left">
        <div className="flex flex-column gap-3">
          {reportPages.map((category) => {
            return (
              <div key={category.value} className="flex align-items-center">
                <Checkbox inputId={category.value} name="category" value={category.value} onChange={onCategoryChange} checked={selectedReports.some((item) => item.value === category.value)} />
                <label htmlFor={category.value} className="ml-2">
                  {category.label}
                </label>
              </div>
            );
          })}
        </div>
      </div>

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
      </div>

      <div style={{ display: 'flex' }}>
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
      </div>

      <div style={{ display: 'flex' }}>
        <div className="field col-2">
          <Button
            disabled={!selectedReports.length || exporting}
            onClick={exportToExcel}
            label={exporting ? 'Exporting...' : 'Export to Excel'}
            icon={exporting ? 'pi pi-spin pi-spinner' : undefined}
          />
        </div>
      </div>

    </>

  );
}

export default Main