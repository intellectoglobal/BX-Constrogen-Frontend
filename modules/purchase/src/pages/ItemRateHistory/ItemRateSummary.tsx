import React from "react";
import { Card } from "primereact/card";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { ProgressSpinner } from "primereact/progressspinner";
import { useListItemRatesQuery } from "./itemRatesApi";
import { skipToken } from "@reduxjs/toolkit/query/react";

type Props = {
  itemKey?: number;
  brand?: number;
  model?: string;
  maxRates?: number;
};

const ItemRateSummary = ({ itemKey, brand, model, maxRates = 3 }: Props) => {
  const { data: itemRates, isFetching: ratesLoading } = useListItemRatesQuery(
    itemKey
      ? {
          item_key: itemKey,
          page: 1,
          size: maxRates,
          ...(brand && { brand }),
          ...(model && { model }),
        }
      : skipToken
  );

  const summary = itemRates?.summary;

  if (!itemKey) {
    return null;
  }

  if (ratesLoading) {
    return (
      <div className="flex justify-content-center p-4">
        <ProgressSpinner style={{ width: "40px", height: "40px" }} />
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  const displayBrand = summary.item_brand;
  const displayModel = (summary as any).item_model || model;

  return (
    <div className="p-3 mb-3" style={{ border: "1px solid #e0e0e0", borderRadius: "8px", backgroundColor: "#fafafa" }}>
      {/* Item Name, Brand (if available), Model (if available), and UOM Row */}
      <div className="mb-3" style={{ display: "flex", flexWrap: "wrap", width: "100%", alignItems: "center", justifyContent: "space-between" }}>
        {/* Item - always shown */}
        <div className="text-base">
          <span className="font-semibold">Item:</span>{" "}
          <span className="font-medium">{summary.item_name}</span>
        </div>

        {/* Brand - shown if present */}
        {displayBrand && (
          <div className="text-base">
            <span className="font-semibold">Brand:</span>{" "}
            <span className="font-medium">{displayBrand}</span>
          </div>
        )}

        {/* Model - shown if present */}
        {displayModel && (
          <div className="text-base">
            <span className="font-semibold">Model:</span>{" "}
            <span className="font-medium">{displayModel}</span>
          </div>
        )}

        {/* UOM - always shown */}
        <div className="text-base">
          <span className="font-semibold">UOM:</span>{" "}
          <span className="text-gray-600">({summary.item_uom})</span>
        </div>
      </div>

      {/* <div className="flex flex-col md:flex-row gap-4 w-full mb-3">
        <Card className="flex-1 shadow-sm border border-green-200 p-3">
          <div className="flex items-center gap-2 mb-3">
            <i className="pi pi-arrow-down text-green-600 text-base" />
            <h5 className="font-semibold text-green-700 m-0">Lowest</h5>
          </div>

          <div className="flex justify-between items-center w-full">
            <div className="space-y-1 text-xs">
              <p className="m-0">
                <span className="font-medium">Date:</span> {summary.lowest.date}
              </p>
              <p className="m-0">
                <span className="font-medium">Vendor:</span> {summary.lowest.vendor}
              </p>
              <p className="m-0">
                <span className="font-medium">Project:</span> {summary.lowest.project}
              </p>
            </div>

            <div className="text-xl font-bold text-green-700 whitespace-nowrap ml-auto">
              ₹ {summary.lowest.with_gst}
            </div>
          </div>
        </Card>

        <Card className="flex-1 shadow-sm border border-red-200 p-3">
          <div className="flex items-center gap-2 mb-3">
            <i className="pi pi-arrow-up text-red-600 text-base" />
            <h5 className="font-semibold text-red-700 m-0">Highest</h5>
          </div>

          <div className="flex justify-between items-center w-full">
            <div className="space-y-1 text-xs">
              <p className="m-0">
                <span className="font-medium">Date:</span> {summary.highest.date}
              </p>
              <p className="m-0">
                <span className="font-medium">Vendor:</span> {summary.highest.vendor}
              </p>
              <p className="m-0">
                <span className="font-medium">Project:</span> {summary.highest.project}
              </p>
            </div>

            <div className="text-xl font-bold text-red-700 whitespace-nowrap ml-auto">
              ₹ {summary.highest.with_gst}
            </div>
          </div>
        </Card>
      </div> */}

      {/* Rate History Table */}
      {itemRates?.results && itemRates.results.length > 0 && (
        <div>
          <h6 className="font-semibold mb-2 mt-0">Recent Rates</h6>
          <DataTable
            value={itemRates.results}
            size="small"
            stripedRows
            className="text-sm"
          >
            <Column 
              field="date" 
              header="Date" 
              headerStyle={{ backgroundColor: "#827f7f", color: "#ffffff" }}
            />
            <Column 
              field="vendor" 
              header="Vendor" 
              headerStyle={{ backgroundColor: "#827f7f", color: "#ffffff" }}
            />
            <Column
              field="with_gst"
              header="Rate (₹)"
              headerStyle={{ backgroundColor: "#827f7f", color: "#ffffff" }}
              body={(rowData) => `₹ ${rowData.with_gst}`}
            />
          </DataTable>
        </div>
      )}
    </div>
  );
};

export default ItemRateSummary;
