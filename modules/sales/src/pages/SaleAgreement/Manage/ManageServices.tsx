import React, { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import { EditableTable } from '@igblsln/control';

type Props = {
  data: any[];
  isLoading?: boolean;
  disableTable?: boolean;
  onChange?: Function;
  onTableChange?: Function;
};

const ManageServices = (
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
    const textEditor: any = disableTable ? 'disabled' : 'text';
    const numberEditor: any = disableTable ? 'disabled' : 'number';

    return [
      { key: 'item_desc', name: 'Item Description', editor: textEditor, required: true, width: 520 },
      { key: 'rate', name: 'Rate', editor: numberEditor, required: true, width: 160 }
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
      newRowDefaults={{ rate: 0 }}
      disableAddWhenInvalid
      canAddRow={(rows) => {
        if (!Array.isArray(rows) || rows.length === 0) return true;
        const last = rows[rows.length - 1];
        return Boolean(last?.item_desc) && Number(last?.rate) > 0;
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

export default forwardRef(ManageServices);
