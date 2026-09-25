import React, { useState } from "react";
import { ListLayout, Datacolumn, CurrencyFormatter } from "@igblsln/control";
import { PAGE_SIZE, setSelectedProjectReducer, useActiveProjectQuery } from "@igblsln/store";
import { Divider } from "primereact/divider";
import { TabView, TabPanel } from "primereact/tabview";
import {
  useGetOverallExpenseQuery,
  useGetMaterialExpensesQuery,
  useGetContractExpensesQuery,
  useGetExtraExpensesQuery,
  useGetSalaryExpensesQuery,
} from "../api";
import { Dropdown } from "primereact/dropdown";
import { useDispatch, useSelector } from "react-redux";
import { Button } from 'primereact/button';
import ExcelJS from 'exceljs';

type Props = {};

const Main = (props: Props) => {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(PAGE_SIZE);
  const dispatch = useDispatch();
  const selectedProjectKey = useSelector((state: any) => state?.common?.selectedProject)

  const { data: allProjects } = useActiveProjectQuery();

  const { data: overallExpense, isFetching: isLoadingOverall } =
    useGetOverallExpenseQuery(
      { projectId: selectedProjectKey },
      { skip: !selectedProjectKey }
    );
  const { data: materialExpenses, isFetching: isLoading } =
    useGetMaterialExpensesQuery(
      { page: page, size: size, projectId: selectedProjectKey },
      { skip: !selectedProjectKey }
    );
  const { data: contractExpenses } = useGetContractExpensesQuery(
    { page: page, size: size, projectId: selectedProjectKey },
    { skip: !selectedProjectKey }
  );
  const { data: extraExpenses } = useGetExtraExpensesQuery(
    { page: page, size: size, projectId: selectedProjectKey },
    { skip: !selectedProjectKey }
  );
  const { data: salaryExpenses } = useGetSalaryExpensesQuery(
    { page: page, size: size, projectId: selectedProjectKey },
    { skip: !selectedProjectKey }
  );

  console.log("materialExpenses", materialExpenses);
  console.log("contractExpenses", contractExpenses);
  console.log("extraExpenses", extraExpenses);
  console.log("salaryExpenses", salaryExpenses);

  const summaryRenderer = (value: number) => {
    return <CurrencyFormatter value={value || 0} />;
  };

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();

    if (overallExpense) {
      const worksheet = workbook.addWorksheet("Overall Expense");

      const overallRows = [
        {
          type: "Material Expense",
          invoice_amount: overallExpense?.material_expense?.netamt || 0,
          paid_amount: overallExpense?.material_expense?.paid_amount || 0,
        },
        {
          type: "Contract Expense",
          invoice_amount: overallExpense?.contract_expense?.invoice_amount || 0,
          paid_amount: overallExpense?.contract_expense?.paid_amount || 0,
        },
        {
          type: "Extra Expense",
          invoice_amount: overallExpense?.extra_expense?.paid_amount || 0,
          paid_amount: overallExpense?.extra_expense?.paid_amount || 0,
        },
        {
          type: "Salary Expense",
          invoice_amount: (overallExpense?.salary_expense?.salary_amount || 0) + (overallExpense?.salary_expense?.allowance_amount || 0),
          paid_amount: (overallExpense?.salary_expense?.salary_amount || 0) + (overallExpense?.salary_expense?.allowance_amount || 0),
        },
      ];

      worksheet.columns = [
        { header: "Expense Type", key: "type", width: 25 },
        { header: "Invoice Amount", key: "invoice_amount", width: 20 },
        { header: "Paid Amount", key: "paid_amount", width: 20 },
      ];

      overallRows.forEach(row => worksheet.addRow(row));

      const totalRow = {
        type: "Total",
        invoice_amount: overallRows.reduce((sum, r) => sum + (r.invoice_amount || 0), 0),
        paid_amount: overallRows.reduce((sum, r) => sum + (r.paid_amount || 0), 0),
      };
      const totalExcelRow = worksheet.addRow(totalRow);
      totalExcelRow.font = { bold: true };

      worksheet.columns.forEach((col) => {
        if (col.key?.toString().toLowerCase().includes("amount")) {
          col.numFmt = '₹#,##0.00';
        }
      });

      worksheet.getRow(1).font = { bold: true };
    }

    interface ExpenseRecord {
      [key: string]: string | number;
    }

    interface PagedResponse {
      results?: ExpenseRecord[];
    }

    const reports: Record<string, ExpenseRecord[]> = {
      material_expenses: Array.isArray(materialExpenses) ? materialExpenses : [],
      contract_expenses: contractExpenses && Array.isArray(contractExpenses.results) ? contractExpenses.results : [],
      extra_expenses: extraExpenses && Array.isArray(extraExpenses.results) ? extraExpenses.results : [],
      salary_expenses: salaryExpenses && Array.isArray(salaryExpenses.results) ? salaryExpenses.results : [],
    };

    Object.entries(reports).forEach(([sheetKey, entries]) => {
      if (!entries.length) return;

      const sheetName = sheetKey
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());

      const worksheet = workbook.addWorksheet(sheetName);

      const columns = entries[0]
        ? Object.keys(entries[0]).map((key) => ({
            header: key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
            key,
            width: 20,
          }))
        : [];
      worksheet.columns = columns;

      entries.forEach((entry) => {
        const rowValues: Record<string, any> = {};
        Object.entries(entry).forEach(([key, value]) => {
          if (
            key.toLowerCase().includes("amt") ||
            key.toLowerCase().includes("salary") ||
            key.toLowerCase().includes("paid")
          ) {
            rowValues[key] =
              typeof value === "string" || typeof value === "number"
                ? parseFloat(value as string) || 0
                : 0;
          } else {
            rowValues[key] = value;
          }
        });
        worksheet.addRow(rowValues);
      });

      const totalRowData: Record<string, any> = {};
      worksheet.columns?.forEach((col) => {
        const key = col.key?.toString() || "";
        if (
          key.toLowerCase().includes("amt") ||
          key.toLowerCase().includes("salary") ||
          key.toLowerCase().includes("paid")
        ) {
          totalRowData[key] = entries.reduce((sum, r) => {
            const value = r[key];
            return sum + (typeof value === "string" || typeof value === "number" ? parseFloat(value as string) || 0 : 0);
          }, 0);
        } else if (key.toLowerCase().includes("type") || key.toLowerCase().includes("employee")) {
          totalRowData[key] = "Total";
        }
      });
      const totalRow = worksheet.addRow(totalRowData);
      totalRow.font = { bold: true };

      worksheet.columns.forEach((col) => {
        const key = col.key?.toString().toLowerCase() || "";
        if (key.includes("amt") || key.includes("salary") || key.includes("paid")) {
          col.numFmt = '₹#,##0.00';
        }
      });

      worksheet.getRow(1).font = { bold: true };
    });

    const projectName =
      allProjects?.find((p: any) => p.key === selectedProjectKey)?.name ||
      selectedProjectKey;

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${projectName}_Expense_Report.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  return (
    <>
      <Divider />
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 50 }}>
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

        <div style={{ flex: 1, marginLeft: 20 }} />

        <div style={{ marginLeft: 40 }}>
          <Button
            disabled={!selectedProjectKey}
            onClick={exportToExcel}
            label="Export to Excel"
          />
        </div>
      </div>

      <TabView className="custom-tabview">
        <TabPanel header="Overall Expense">
          <div
            className="col-12 "
            style={{ height: "calc(100% - 383px)", minHeight: 200 }}
          >
            <ListLayout
              isLoading={isLoadingOverall}
              data={
                overallExpense
                  ? [
                      {
                        type: "Material Expense",
                        invoice_amount:
                          overallExpense?.material_expense?.netamt || 0,
                        paid_amount:
                          overallExpense?.material_expense?.paid_amount || 0,
                      },
                      {
                        type: "Contract Expense",
                        invoice_amount:
                          overallExpense?.contract_expense?.invoice_amount || 0,
                        paid_amount:
                          overallExpense?.contract_expense?.paid_amount || 0,
                      },
                      {
                        type: "Extra Expense",
                        invoice_amount: 
                          overallExpense?.extra_expense?.paid_amount || 0,
                        paid_amount:
                          overallExpense?.extra_expense?.paid_amount || 0,
                      },
                      {
                        type: "Salary Expense",
                        invoice_amount:
                          (overallExpense?.salary_expense?.salary_amount || 0) + (overallExpense?.salary_expense?.allowance_amount || 0),
                        paid_amount:
                          (overallExpense?.salary_expense?.salary_amount || 0) + (overallExpense?.salary_expense?.allowance_amount || 0),
                      },
                    ]
                  : []
              }
              newTable
              showHeader
              hideAddButton
              tableLayoutClass="h-full"
              allowFilters={false}
              hideActionColumn
              gridProps={{
                getBottomSummaryRows: (rows: any) => {
                  return [
                    {
                      invoice_amount: rows.reduce(
                        (sum: number, x: any) =>
                          sum + parseFloat(x.invoice_amount || 0),
                        0
                      ),
                      paid_amount: rows.reduce(
                        (sum: number, x: any) =>
                          sum + parseFloat(x.paid_amount || 0),
                        0
                      ),
                    },
                  ];
                },
              }}
            >
              <Datacolumn field="type" header="Expense Type" />
              <Datacolumn
                field="invoice_amount"
                header="Invoice Amount"
                type="currency"
                defaultValue={0}
                summaryFormatter={({ row }: any) =>
                  summaryRenderer(row?.invoice_amount)
                }
              />
              <Datacolumn
                field="paid_amount"
                header="Paid Amount"
                type="currency"
                defaultValue={0}
                summaryFormatter={({ row }: any) =>
                  summaryRenderer(row?.paid_amount)
                }
              />
            </ListLayout>
          </div>
        </TabPanel>
        <TabPanel header="Material Expenses ">
          <div
            className="col-12 "
            style={{ height: "calc(100% - 383px)", minHeight: 200 }}
          >
            <ListLayout
              isLoading={isLoading}
              data={materialExpenses || []}
              newTable
              showHeader
              hideAddButton
              tableLayoutClass="h-full"
              allowFilters={false}
              hideActionColumn
              gridProps={{
                getBottomSummaryRows: (rows: any) => {
                  return [
                    {
                      netamt: rows
                        .map((x: any) => parseFloat(x.netamt || 0))
                        .reduce(
                          (partialSum: number, a: number) => partialSum + a,
                          0
                        ),
                      paid_amount: rows
                        .map((x: any) => parseFloat(x.paid_amount || 0))
                        .reduce(
                          (partialSum: number, a: number) => partialSum + a,
                          0
                        ),
                      discount_amount: rows
                        .map((x: any) => parseFloat(x.discount_amount || 0))
                        .reduce(
                          (partialSum: number, a: number) => partialSum + a,
                          0
                        ),
                    },
                  ];
                },
              }}
            >
              {/* <Datacolumn field="sno" header="S.No" /> */}
              <Datacolumn field="item_type" header="Item Type" />
              <Datacolumn
                field="netamt"
                header="Net Amount"
                type="currency"
                defaultValue={0}
                summaryFormatter={({ row }: any) =>
                  summaryRenderer(row?.netamt)
                }
              />
              <Datacolumn
                field="paid_amount"
                header="Paid Amount"
                type="currency"
                defaultValue={0}
                summaryFormatter={({ row }: any) =>
                  summaryRenderer(row?.paid_amount)
                }
              />
              <Datacolumn
                field="discount_amount"
                header="Discount Amount"
                type="currency"
                defaultValue={0}
                summaryFormatter={({ row }: any) =>
                  summaryRenderer(row?.discount_amount)
                }
              />
            </ListLayout>
          </div>
        </TabPanel>
        <TabPanel header="Contract Expenses ">
          <div
            className="col-12 "
            style={{ height: "calc(100% - 383px)", minHeight: 200 }}
          >
            <ListLayout
              isLoading={isLoading}
              data={contractExpenses?.results || []}
              newTable
              showHeader
              hideAddButton
              tableLayoutClass="h-full"
              allowFilters={false}
              hideActionColumn
              gridProps={{
                getBottomSummaryRows: (rows: any) => {
                  return [
                    {
                      invoice_amount: rows
                        .map((x: any) => parseFloat(x.invoice_amount || 0))
                        .reduce(
                          (partialSum: number, a: number) => partialSum + a,
                          0
                        ),
                      paid_amount: rows
                        .map((x: any) => parseFloat(x.paid_amount || 0))
                        .reduce(
                          (partialSum: number, a: number) => partialSum + a,
                          0
                        ),
                    },
                  ];
                },
              }}
            >
              {/* <Datacolumn field="sno" header="S.No" /> */}
              <Datacolumn field="contractor_type" header="Contract Type" />
              <Datacolumn
                field="invoice_amount"
                header="Invoice Amount"
                type="currency"
                defaultValue={0}
                summaryFormatter={({ row }: any) =>
                  summaryRenderer(row?.invoice_amount)
                }
              />
              <Datacolumn
                field="paid_amount"
                header="Paid Amount"
                type="currency"
                defaultValue={0}
                summaryFormatter={({ row }: any) =>
                  summaryRenderer(row?.paid_amount)
                }
              />
            </ListLayout>
          </div>
        </TabPanel>
        <TabPanel header="Salary Expenses ">
          <div
            className="col-12 "
            style={{ height: "calc(100% - 383px)", minHeight: 200 }}
          >
            <ListLayout
              isLoading={isLoading}
              data={salaryExpenses?.results || []}
              newTable
              showHeader
              hideAddButton
              tableLayoutClass="h-full"
              allowFilters={false}
              hideActionColumn
              gridProps={{
                getBottomSummaryRows: (rows: any) => {
                  return [
                    {
                      salary: rows
                        .map((x: any) => parseFloat(x.salary || 0))
                        .reduce(
                          (partialSum: number, a: number) => partialSum + a,
                          0
                        ),
                      allowance: rows
                        .map((x: any) => parseFloat(x.allowance || 0))
                        .reduce(
                          (partialSum: number, a: number) => partialSum + a,
                          0
                        ),
                    },
                  ];
                },
              }}
            >
              <Datacolumn field="employee" header="Employee" />
              <Datacolumn
                field="salary"
                header="Salary"
                type="currency"
                defaultValue={0}
                summaryFormatter={({ row }: any) =>
                  summaryRenderer(row?.salary)
                }
              />
              <Datacolumn
                field="allowance"
                header="Allowance"
                type="currency"
                defaultValue={0}
                summaryFormatter={({ row }: any) =>
                  summaryRenderer(row?.allowance)
                }
              />
            </ListLayout>
          </div>
        </TabPanel>
        <TabPanel header="Extra Expenses ">
          <div
            className="col-12 "
            style={{ height: "calc(100% - 383px)", minHeight: 200 }}
          >
            <ListLayout
              isLoading={isLoading}
              data={extraExpenses?.results || []}
              newTable
              showHeader
              hideAddButton
              tableLayoutClass="h-full"
              allowFilters={false}
              hideActionColumn
              gridProps={{
                getBottomSummaryRows: (rows: any) => {
                  return [
                    {
                      paid_amount: rows
                        .map((x: any) => parseFloat(x.paid_amount || 0))
                        .reduce(
                          (partialSum: number, a: number) => partialSum + a,
                          0
                        ),
                    },
                  ];
                },
              }}
            >
              <Datacolumn field="expense_type" header="Expense Type" />
              <Datacolumn
                field="paid_amount"
                header="Paid Amount"
                type="currency"
                defaultValue={0}
                summaryFormatter={({ row }: any) =>
                  summaryRenderer(row?.paid_amount)
                }
              />
            </ListLayout>
          </div>
        </TabPanel>
      </TabView>
    </>
  );
};

export default Main;
