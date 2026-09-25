import React, { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import { EditableTable, Loader } from '@igblsln/control';
import { useGetAllUOMsQuery } from '@igblsln/store';

type Props = {
    data: any[];
    isLoading?: boolean;
    onChange?: Function;
    onTableChange?: Function;
}

const ManageTable = ({ data, isLoading, onChange = () => {}, onTableChange = () => {} }: Props, _ref: any) => {
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
    return [
      { key: 'service_desc', name: 'Service Description', editor: 'text', required: true, width: 420 },
      { key: 'uom', name: 'UOM', editor: 'dropdown', required: true, width: 220, options: uomOptions }
    ];
  }, [uomOptions]);

  if (!uoms) return <Loader />;

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
      newRowDefaults={{ rate_per_unit: 0 }}
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
