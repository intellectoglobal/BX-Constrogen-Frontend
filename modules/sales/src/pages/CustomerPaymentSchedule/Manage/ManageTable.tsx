import React, { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import { EditableTable } from '@igblsln/control';

type Props = {
    data: any[];
    isLoading?: boolean;
    onChange?: Function;
    onTableChange?: Function;
}

const ManageTable = ({ data, isLoading, onChange = () => {}, onTableChange = () => {} }: Props, _ref: any) => {
  const [items, setItems] = useState<any[]>([]);
  const itemsRef = useRef<any[]>(items);

  useEffect(() => {
    setItems(data || []);
    itemsRef.current = data || [];
  }, [data]);

  const columns = useMemo(() => {
    return [{ key: 'payment_stage_desc', name: 'Schedule Description', editor: 'text', required: true, width: 520 }];
  }, []);

  return (
    <EditableTable
      initialRows={items}
      columns={columns as any}
      allowAddRow={!isLoading}
      allowDeleteRow={!isLoading}
      showRowDelete
      deleteColumnPosition="start"
      deleteButtonVariant="prime"
      disableAddWhenInvalid
      showInlineAddRow
      inlineAddRowLabel="Add"
      newRowDefaults={{ amount: 0 }}
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

export default forwardRef(ManageTable);