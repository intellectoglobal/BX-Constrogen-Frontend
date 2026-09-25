import React, { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import { EditableTable, Loader } from '@igblsln/control';
import { useGetAllUOMsQuery } from '@igblsln/store';

type Props = {
  data: any[];
  isLoading?: boolean;
  disableTable?: boolean;
  onChange?: Function;
  onTableChange?: Function;
};

const formatINR = (value: any) => {
  if (value === '' || value === null || value === undefined) return '';
  const num = Number(String(value).replace(/,/g, ''));
  if (isNaN(num)) return value;
  return `₹ ${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const ManageServices = (
  { data, isLoading, disableTable = false, onChange = () => {}, onTableChange = () => {} }: Props,
  _ref: React.Ref<any>
) => {
  const [items, setItems] = useState<any[]>([]);
  const itemsRef = useRef<any[]>(items);

  const { data: uoms } = useGetAllUOMsQuery({});

  useEffect(() => {
    setItems(data || []);
    itemsRef.current = data || [];
  }, [data]);

  const uomOptions = useMemo(() => {
    return (uoms || []).map((u: any) => ({ label: u?.descr, value: u?.key }));
  }, [uoms]);

  const columns = useMemo(() => {
    const textEditor: any = disableTable ? 'disabled' : 'text';
    const numberEditor: any = disableTable ? 'disabled' : 'number';
    const dropdownEditor: any = disableTable ? 'disabled' : 'dropdown';

    return [
      { key: 'service_desc', name: 'Service Description', editor: textEditor, required: true, width: 360 },
      { key: 'uom', name: 'UOM', editor: dropdownEditor, required: true, width: 200, options: uomOptions },
      { key: 'quantity', name: 'Quantity', editor: numberEditor, required: true, width: 140 },
      { key: 'rate_per_unit', name: 'Rate Per Unit', editor: numberEditor, required: true, width: 160 },
      {
        key: 'amount',
        name: 'Amount',
        editor: 'disabled',
        width: 160,
        formatter: ({ row }: any) => formatINR(row?.amount)
      }
    ];
  }, [disableTable, uomOptions]);

  if (!uoms) return <Loader />;

  return (
    <EditableTable
      initialRows={items}
      columns={columns as any}
      allowAddRow={!disableTable && !isLoading}
      allowDeleteRow={!disableTable && !isLoading}
      showRowDelete={!disableTable}
      deleteColumnPosition="start"
      deleteButtonVariant="prime"
      newRowDefaults={{ amount: 0, quantity: 0, rate_per_unit: 0 }}
      disableAddWhenInvalid
      canAddRow={(rows) => {
        if (!Array.isArray(rows) || rows.length === 0) return true;
        const last = rows[rows.length - 1];
        return (
          Boolean(last?.service_desc) &&
          Boolean(last?.uom) &&
          Number(last?.quantity) > 0 &&
          Number(last?.rate_per_unit) > 0 &&
          Number(last?.amount) > 0
        );
      }}
      showInlineAddRow
      inlineAddRowLabel="Add"
      onTableChange={(value: boolean) => onTableChange(value)}
      onChange={(rows: any[]) => {
        const computed = (rows || []).map((r: any) => ({
          ...r,
          amount: Number(r?.quantity || 0) * Number(r?.rate_per_unit || 0)
        }));

        itemsRef.current = computed;
        setItems(computed);
        onChange(computed);
        onTableChange(true);
      }}
    />
  );
};

export default forwardRef(ManageServices);
