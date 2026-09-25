import React, { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import { EditableTable } from '@igblsln/control';

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

const ManageStage = (
  { data, isLoading, disableTable = false, onChange = () => {}, onTableChange = () => {} }: Props,
  _ref: React.Ref<any>
) => {
  const [items, setItems] = useState<any[]>([]);
  const itemsRef = useRef<any[]>(items);

  useEffect(() => {
    setItems(data || []);
    itemsRef.current = data || [];
  }, [data]);

  const columns = useMemo(() => {
    const editor: any = disableTable ? 'disabled' : 'text';
    const numberEditor: any = disableTable ? 'disabled' : 'number';

    return [
      { key: 'payment_stage_desc', name: 'Payment Stage Description', editor, required: true, width: 420 },
      {
        key: 'amount',
        name: 'Amount',
        editor: numberEditor,
        required: true,
        width: 180,
        formatter: ({ row }: any) => formatINR(row?.amount)
      }
    ];
  }, [disableTable]);

  return (
    <EditableTable
      initialRows={items}
      columns={columns as any}
      allowAddRow={!disableTable && !isLoading}
      allowDeleteRow={!disableTable && !isLoading}
      showRowDelete={!disableTable}
      deleteColumnPosition="start"
      deleteButtonVariant="prime"
      newRowDefaults={{ amount: 0 }}
      disableAddWhenInvalid
      canAddRow={(rows) => {
        if (!Array.isArray(rows) || rows.length === 0) return true;
        const last = rows[rows.length - 1];
        return Boolean(last?.payment_stage_desc) && Number(last?.amount) > 0;
      }}
      showInlineAddRow
      inlineAddRowLabel="Add"
      onTableChange={(value: boolean) => onTableChange(value)}
      onChange={(rows: any[]) => {
        itemsRef.current = rows || [];
        setItems(rows || []);
        onChange(rows || []);
        onTableChange(true);
      }}
    />
  );
};

export default forwardRef(ManageStage);
