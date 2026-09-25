import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Checkbox } from 'primereact/checkbox';
import { confirmDialog } from 'primereact/confirmdialog';
import { Datacolumn, ListLayout, CurrencyFormatter } from '@igblsln/control';
import { Items, UOMs, shouldAllowAdd, useGetAllUOMsQuery, useGetItemTypesForVendorQuery, useGetItemsForItemTypeQuery, useGetItemsForVendorQuery, useGetUOMsForItemTypeQuery } from '@igblsln/store';
import { PAGE_NAME, PAGE_ROUTE } from '../constants';

type Props = {
  data: any[];
  isLoading?: boolean;
  disableTable?: boolean;
  onChange?: Function;
  selectedVendor: any;
  selectedItemTypes?: any;
};

const ManageItem = ({ data, isLoading, disableTable = false, selectedVendor, onChange = () => {}, selectedItemTypes = null }: Props, selfRef: React.Ref<any>) => {
  const [items, setItems] = useState<any[]>([]);
  const ref = useRef(items);
  const pItemRef = useRef<Items[]>([]);
  const UOMItemsRef = useRef<UOMs[]>([]);
  const { data: pItems, isLoading: isItemLoading } = useGetItemsForItemTypeQuery(selectedItemTypes, { skip: !selectedItemTypes, refetchOnMountOrArgChange: true });
  const { data: UOMItems, isLoading: isUOMLoading } = useGetAllUOMsQuery({});

  useImperativeHandle(selfRef, () => ({
    getItems() {
      return items;
    },
  }));

  useEffect(() => {
    let temp = data?.map((d) => ({
      ...d,
      uuid: Math.random(),
    }));
    setItems(temp);
    ref.current = temp;
  }, [data]);

  useEffect(() => {
    pItemRef.current = pItems || [];
    UOMItemsRef.current = UOMItems || [];
  }, [pItems, UOMItems]);

  const removeItem = (val: any) => {
    const updValue = ref.current.filter((x) => x !== val);
    ref.current = updValue;
    setItems(updValue);
    onChange(updValue);
  };

  const summaryRenderer = (descr: string, value: number) => {
    return (
      <strong>
        {descr} : <CurrencyFormatter value={value || 0} />
      </strong>
    );
  };

  const getOptionsEditor = ({ row, column, onRowChange, onClose }: any) => {
    return (
      <Dropdown
        autoFocus
        style={{ width: '100%' }}
        className="p-inputtext-sm"
        value={row[column.key]}
        optionLabel="descr"
        optionValue="key"
        filter
        filterBy="descr"
        options={pItemRef.current}
        onChange={(e: any) => {
          let clone = { ...row };
          clone[column.key] = e.value;
          onRowChange(clone, true);
        }}
        tabIndex={-1}
      />
    );
  };

  const shouldAllowAdd = (items: any[]) => {
    if (items.length === 0) return true;
    let temp = items[items.length - 1];
    return temp?.item_key && temp?.qty && temp?.item_uom_key;
  };

  const getUomOptionsEditor = ({ row, column, onRowChange, onClose }: any) => {
    return (
      <Dropdown
        autoFocus
        style={{ width: '100%' }}
        className="p-inputtext-sm"
        value={row[column.key]}
        optionLabel="descr"
        optionValue="key"
        filter
        filterBy="descr"
        options={UOMItemsRef.current}
        onChange={(e: any) => {
          let clone = { ...row };
          clone[column.key] = e.value;
          onRowChange(clone, true);
        }}
        tabIndex={-1}
      />
    );
  };

  const formatIndianNumber = (num: number) => {
    const [integer, decimal] = num.toFixed(2).split('.');
    const lastThree = integer.slice(-3);
    const otherDigits = integer.slice(0, -3);
    const formattedInteger = otherDigits ? otherDigits.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree : lastThree;
    return `${formattedInteger}.${decimal}`;
  };

  const formatQuantity = (qty: string) => {
    const num = parseFloat(qty);
    if (isNaN(num)) return qty; // Return original if not a number
    return num % 1 === 0 ? num.toString() : num.toFixed(2); // Show integer if no decimals, else 2 decimals
  };

  const totalNetAmt = formatIndianNumber(
    items
      .map((x) => parseFloat(x.netamt || 0))
      .reduce((partialSum, a) => partialSum + a, 0)
  );

  return (
    <>
      <div style={{ minHeight: items.length * 60, overflowX: 'hidden' }}>
        <ListLayout
          baseRoute={`/purchase/${PAGE_ROUTE}`}
          description={PAGE_NAME}
          isLoading={isLoading || isItemLoading || isUOMLoading}
          data={items}
          newTable
          tableLayoutClass="h-full"
          allowFilters={false}
          hideActionColumn
        >
          <Datacolumn
            field="item_key"
            header="Item*"
            width={'25%'}
            displayValueGetter={(row, field) => {
              if (!Array.isArray(row)) {
                let temp = pItemRef.current?.filter((d) => d.key === row[field]);
                if (temp.length) {
                  return temp[0].descr;
                } else {
                  return row?.items?.descr;
                }
              }
            }}
            editorType={!disableTable && getOptionsEditor}
          />
          <Datacolumn field="brand_name" header="Brand" type="text" editorType={!disableTable && 'text'} />
          <Datacolumn field="model_number" header="Model" type="text" editorType={!disableTable && 'text'} />
          <Datacolumn
            field="qty"
            header="Quantity*"
            type="number"
            editorType={!disableTable && 'number'}
            displayValueGetter={(row, field) => formatQuantity(row[field])}
          />
          <Datacolumn
            field="item_uom_key"
            header="UOM*"
            displayValueGetter={(row, field) => {
              if (!Array.isArray(row)) {
                let temp = UOMItemsRef.current?.filter((d) => d.key === row[field]);
                if (temp.length) {
                  return temp[0].descr;
                } else {
                  return row?.items_uoms?.descr;
                }
              }
            }}
            editorType={!disableTable && getUomOptionsEditor}
          />
          <Datacolumn field="netamt" header="Net Amt*" type="currency" defaultValue={0} editorType={!disableTable && 'number'} />
          <Datacolumn field="gst" header="GST %*" type="number" editorType={!disableTable && 'number'} />
          <Datacolumn field="gstamt" header="GST Amount (₹)*" type="number" editorType={!disableTable && 'number'} />
          {!disableTable && (
            <Datacolumn
              width={'10%'}
              field="selected"
              displayValueGetter={(row, field) => (
                <Checkbox
                  checked={row.selected}
                  onChange={() => {
                    let temp = ref.current?.map((d) => {
                      if (d?.uuid === row?.uuid) {
                        return {
                          ...d,
                          selected: !d.selected,
                        };
                      }
                      return d;
                    });
                    setItems(temp);
                    ref.current = temp;
                    onChange(temp);
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    margin: '10px auto',
                    justifyContent: 'center',
                  }}
                />
              )}
              header="Select"
            />
          )}
        </ListLayout>
        <div
          className="total-row"
          style={{
            padding: '10px',
            fontWeight: 'bold',
            textAlign: 'right',
            borderTop: '1px solid #ccc',
            backgroundColor: '#f9f9f9',
          }}
        >
          Total Taxable Amount: ₹{totalNetAmt}
        </div>
      </div>
      {!disableTable && (
        <div className="flex">
          <Button
            label="Remove Selected"
            style={{
              marginLeft: 'auto',
              marginTop: 5,
              display: 'flex',
              width: 200,
            }}
            disabled={!items.filter((d) => d.selected).length}
            onClick={(e) => {
              e.preventDefault();
              items
                .filter((d) => d.selected)
                .map((d) => {
                  removeItem(d);
                });
            }}
            className="p-button-plain"
          />
          <Button
            label="Select All"
            style={{
              marginLeft: 10,
              marginTop: 5,
              display: 'flex',
              width: 150,
            }}
            disabled={!items.length}
            onClick={(e) => {
              e.preventDefault();
              let temp = items.map((d) => ({
                ...d,
                selected: true,
              }));
              setItems(temp);
              ref.current = temp;
            }}
            className="p-button-plain"
          />
          <Button
            label="Validate"
            style={{
              marginLeft: 10,
              marginTop: 5,
              display: 'flex',
              width: 100,
            }}
            onClick={(e) => {
              e.preventDefault();
              alert('Funtionality Not Implemented Yet');
            }}
            className="p-button-plain"
          />
        </div>
      )}
    </>
  );
};

export type ManageItemHandle = {
  getItems: () => any[];
};

export default forwardRef(ManageItem);