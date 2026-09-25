import React, { useState, useEffect } from "react";
import { ListLayout, Datacolumn } from "@igblsln/control";
import { useLocation } from "react-router-dom";
import {
  useGetAllItemTypesQuery,
  useGetItemSubTypeForItemTypeQuery,
  useGetBrandsQuery,
} from "@igblsln/store";
import { useListItemsQuery } from "../../Items/itemsApi";
import { MODULE_NAME } from "../../../constants";
import { Divider } from "primereact/divider";
import { Dropdown } from "primereact/dropdown";
import { PAGE_NAME, PAGE_ROUTE } from "../constants";
import { useListItemRatesQuery, useListItemModelsQuery } from "../itemRatesApi";
import { skipToken } from "@reduxjs/toolkit/query/react";

import { Avatar } from "primereact/avatar";
import { Card } from "primereact/card";
import { Tag } from "primereact/tag";

const ROWS_PER_PAGE = 5;
const MAX_TOTAL_ROWS = 10; // Only show 2 pages: 5 + 5 rows

type Props = {};

const Main = (props: Props) => {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(ROWS_PER_PAGE);
  const [filter, setFilter] = useState({});

  const filterFromState = JSON.parse(useLocation()?.state || "{}");

  const [selectedItemType, setSelectedItemType] = useState(
    filterFromState?.itemType || null
  );
  const [selectedItemSubType, setSelectedItemSubType] = useState(
    filterFromState?.itemSubType || null
  );
  const [selectedItem, setSelectedItem] = useState<number | undefined>(
    undefined
  );
  const [selectedBrand, setSelectedBrand] = useState<number | undefined>(
    undefined
  );
  const [selectedModel, setSelectedModel] = useState<string | undefined>(
    undefined
  );
  const [allItemTypes, setAllItemTypes] = useState<any>([]);
  const [allItemSubTypes, setAllItemSubTypes] = useState<any>([]);
  const { data: itemTypes } = useGetAllItemTypesQuery();
  const { data: itemSubTypes, isFetching: itemSubTypeFetching } =
    useGetItemSubTypeForItemTypeQuery(selectedItemType, {
      skip: !selectedItemType,
    });
  const { data: Items, isFetching: isLoading } = useListItemsQuery(
    selectedItemType && selectedItemSubType
      ? {
          page: 1,
          size: 50,
          type: selectedItemType,
          subtype: selectedItemSubType,
          without_pagination: 1, // this returns array
        }
      : skipToken
  );
  const itemOptions = Array.isArray(Items)
    ? Items.map((i) => ({ key: i.key, descr: i.descr }))
    : Items?.results?.map((i) => ({ key: i.key, descr: i.descr })) || [];

  const { data: brands, isFetching: brandsLoading } = useGetBrandsQuery(
    { type: selectedItemType },
    {
      skip: !selectedItemType,
      refetchOnMountOrArgChange: true,
    }
  );
  const brandOptions = brands?.map((b: any) => ({ key: b.key, name: b.name })) || [];

  const { data: models, isFetching: modelsLoading } = useListItemModelsQuery(
    { brand: selectedBrand, item: selectedItem },
    {
      skip: !selectedItem,
      refetchOnMountOrArgChange: true,
    }
  );
  const modelOptions = models?.map((m: any) => ({ name: m.name })) || [];

  const shouldFetchItemRates =
    selectedItemType && selectedItemSubType && selectedItem;
  const maxPage = Math.ceil(MAX_TOTAL_ROWS / size) || 1;
  const clampedPage = Math.min(page, maxPage);

  const { data: itemRates, isFetching: ratesLoading } = useListItemRatesQuery(
    shouldFetchItemRates
      ? {
          item_key: selectedItem,
          page: clampedPage,
          size,
          ...(selectedBrand && { brand: selectedBrand }),
          ...(selectedModel && { model: selectedModel }),
        }
      : skipToken
  );

  const summary = itemRates?.summary;

  let tableMessage = "";
  if (!selectedItemType) tableMessage = "Please select Item Type";
  else if (!selectedItemSubType) tableMessage = "Please select Item Sub Type";
  else if (!selectedItem) tableMessage = "Please select Item";
  useEffect(() => {
    setAllItemTypes([
      {
        key: null,
        descr: "All",
      },
      ...(itemTypes || []),
    ]);
  }, [itemTypes]);

  useEffect(() => {
    setAllItemSubTypes([
      {
        key: null,
        descr: "All",
      },
      ...(itemSubTypes || []),
    ]);
  }, [itemSubTypes]);
  useEffect(() => {
    setSelectedItem(undefined);
    setSelectedBrand(undefined);
    setSelectedModel(undefined);
    setPage(1);
  }, [selectedItemType, selectedItemSubType]);

  useEffect(() => {
    setPage(1);
  }, [selectedItem, selectedBrand, selectedModel]);

  useEffect(() => {
    setSelectedModel(undefined);
  }, [selectedBrand]);
  return (
    <>
      <Divider />
      <div style={{ display: "flex", flexWrap: "nowrap", width: "100%", gap: "0.5rem" }}>
        <div className="field" style={{ flex: "1 1 0", minWidth: 0 }}>
          <label style={{ display: "block", marginBottom: "0.25rem" }}> ItemType</label>
          <Dropdown
            style={{ width: "100%" }}
            value={selectedItemType}
            onChange={(e) => {
              setSelectedItemType(e.value);
            }}
            showClear
            options={allItemTypes}
            placeholder="All"
            optionLabel="descr"
            filter
            filterBy="descr"
            optionValue="key"
          />
        </div>
        <div className="field" style={{ flex: "1 1 0", minWidth: 0 }}>
          <label style={{ display: "block", marginBottom: "0.25rem" }}>Item Sub Type</label>
          <Dropdown
            style={{ width: "100%" }}
            value={selectedItemSubType}
            onChange={(e) => {
              setSelectedItemSubType(e.value);
            }}
            disabled={!selectedItemType}
            options={allItemSubTypes}
            showClear
            filter
            filterBy="descr"
            placeholder="All"
            optionLabel="descr"
            optionValue="key"
          />
          {!selectedItemType && (
            <small>Select Type to Enable</small>
          )}
        </div>
        <div className="field" style={{ flex: "1 1 0", minWidth: 0 }}>
          <label style={{ display: "block", marginBottom: "0.25rem" }}>Item</label>
          <Dropdown
            style={{ width: "100%" }}
            value={selectedItem}
            onChange={(e) => setSelectedItem(e.value)}
            disabled={!selectedItemType || !selectedItemSubType}
            options={itemOptions}
            showClear
            filter
            filterBy="descr"
            placeholder="Select Item"
            optionLabel="descr"
            optionValue="key"
          />
          {(!selectedItemType || !selectedItemSubType) && (
            <small>Select Type & Sub Type</small>
          )}
        </div>
        <div className="field" style={{ flex: "1 1 0", minWidth: 0 }}>
          <label style={{ display: "block", marginBottom: "0.25rem" }}>Brand</label>
          <Dropdown
            style={{ width: "100%" }}
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.value)}
            disabled={!selectedItemType || brandsLoading}
            options={brandOptions}
            showClear
            filter
            filterBy="name"
            placeholder="All Brands"
            optionLabel="name"
            optionValue="key"
          />
          {!selectedItemType && (
            <small>Select Type to Enable</small>
          )}
        </div>
        <div className="field" style={{ flex: "1 1 0", minWidth: 0 }}>
          <label style={{ display: "block", marginBottom: "0.25rem" }}>Model</label>
          <Dropdown
            style={{ width: "100%" }}
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.value)}
            disabled={!selectedItem || modelsLoading}
            options={modelOptions}
            showClear
            filter
            filterBy="name"
            placeholder="All Models"
            optionLabel="name"
            optionValue="name"
          />
          {!selectedItem && (
            <small>Select Item to Enable</small>
          )}
        </div>
      </div>
      {summary && selectedItemType && selectedItemSubType && selectedItem && (
        <div className="p-4 mb-3">
          {/* Item Name, Brand (if selected in dropdown), and UOM Row */}
          <div className="mb-4 flex flex-col md:flex-row gap-6 w-full">
            {selectedBrand ? (
              <>
                <div className="flex-1 text-lg">
                  <span className="font-semibold">Item:</span>{" "}
                  <span className="font-medium">{summary.item_name}</span>
                </div>
                <div className="text-lg text-center">
                  <span className="font-semibold">Brand:</span>{" "}
                  <span className="font-medium">
                    {brandOptions.find((b: any) => b.key === selectedBrand)?.name ?? ""}
                  </span>
                </div>
                <div className="flex-1 text-lg text-right">
                  <span className="font-semibold">UOM:</span>{" "}
                  <span className="text-gray-600">({summary.item_uom})</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex-1 text-lg">
                  <span className="font-semibold">Item:</span>{" "}
                  <span className="font-medium">{summary.item_name}</span>
                </div>
                <div className="flex-1 text-lg">
                  <span className="font-semibold">UOM:</span>{" "}
                  <span className="text-gray-600">({summary.item_uom})</span>
                </div>
              </>
            )}
          </div>

          <div className="flex flex-col md:flex-row gap-6 w-full">
            {/* Lowest Card */}
            <Card className="flex-1 shadow-md border border-green-200 p-4">
              {/* Header */}
              <div className="flex items-center gap-2 mb-4">
                <i className="pi pi-arrow-down text-green-600 text-lg" />
                <h4 className="font-semibold text-green-700 m-0">Lowest</h4>
              </div>

              {/* Body */}
              <div className="flex justify-between items-center w-full">
                {/* LEFT: details */}
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="font-medium">Date:</span>{" "}
                    {summary.lowest.date}
                  </p>
                  <p>
                    <span className="font-medium">Vendor:</span>{" "}
                    {summary.lowest.vendor}
                  </p>
                  <p>
                    <span className="font-medium">Project:</span>{" "}
                    {summary.lowest.project}
                  </p>
                </div>

                {/* RIGHT: amount */}
                <div className="text-2xl font-bold text-green-700 whitespace-nowrap ml-auto">
                  ₹ {summary.lowest.with_gst}
                </div>
              </div>
            </Card>

            {/* Highest Card */}
            <Card className="flex-1 shadow-md border border-red-200 p-4">
              {/* Header */}
              <div className="flex items-center gap-2 mb-4">
                <i className="pi pi-arrow-up text-red-600 text-lg" />
                <h4 className="font-semibold text-red-700 m-0">Highest</h4>
              </div>

              {/* Body */}
              <div className="flex justify-between items-center w-full">
                {/* LEFT: details */}
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="font-medium">Date:</span>{" "}
                    {summary.highest.date}
                  </p>
                  <p>
                    <span className="font-medium">Vendor:</span>{" "}
                    {summary.highest.vendor}
                  </p>
                  <p>
                    <span className="font-medium">Project:</span>{" "}
                    {summary.highest.project}
                  </p>
                </div>

                {/* RIGHT: amount */}
                <div className="text-2xl font-bold text-red-700 whitespace-nowrap ml-auto">
                  ₹ {summary.highest.with_gst}
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
      {(() => {
        const hasData = selectedItemType && selectedItemSubType && selectedItem && itemRates?.results?.length;
        const listLayout = (
          <ListLayout
            pagination={{
              pageSize: size,
              loading: ratesLoading,
              currentPage: clampedPage,
              total: Math.min(MAX_TOTAL_ROWS, itemRates?.count ?? 0),
              onChange: (page, size) => {
                setPage(page);
                setSize(size);
              },
            }}
            stateValue={{
              itemType: selectedItemType,
              itemSubType: selectedItemSubType,
            }}
            filterOptions={{
              onChange: (filter: any) => setFilter(filter),
            }}
            addParams={{
              itemtype: selectedItemType,
              itemsubtype: selectedItemSubType,
            }}
            baseRoute={`/${MODULE_NAME}/${PAGE_ROUTE}`}
            hideAddButton
            description={PAGE_NAME}
            isLoading={ratesLoading}
            emptyRowMessage={
              shouldFetchItemRates ? "No records found" : tableMessage
            }
            data={hasData ? itemRates?.results || [] : []}
            hideActionColumn
            newTable
            showHeader
          >
            <Datacolumn
              field="date"
              header="Date"
              // width={"15%"}
              filteringType="date"
            />
            <Datacolumn
              field="vendor"
              header="Vendor"
              // width={"40%"}
              filteringType="text"
            />
            <Datacolumn
              field="qty"
              header="Quantity"
              width={"8%"}
              filteringType="number"
            />
            <Datacolumn
              field="uom"
              header="UOM"
              width={"7%"}
              filteringType="text"
            />
            {/* <Datacolumn
              field="without_gst"
              header="Without GST"
              width={"15%"}
              filteringType="text"
            />
            <Datacolumn
              field="gst"
              header="GST %"
              width={"15%"}
              filteringType="number"
            /> */}
            <Datacolumn
              field="with_gst"
              header="Per Item Rate (₹)"
              // width={"15%"}
              filteringType="currency"
            />
            <Datacolumn
              field="project"
              header="Project"
              width={"22%"}
              filteringType="currency"
            />
          </ListLayout>
        );

        return hasData ? (
          <div className="col-12" style={{ maxHeight: 200 }}>
            {listLayout}
          </div>
        ) : (
          listLayout
        );
      })()}
    </>
  );
};

export default Main;
