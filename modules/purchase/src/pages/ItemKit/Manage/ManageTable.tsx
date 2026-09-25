import React, { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import { EditableTable, Loader } from '@igblsln/control';
import { useGetAllItemQuery, useGetAllUOMsQuery } from '@igblsln/store';

type Props = {
    data: any[];
    isLoading?: boolean;
    onChange?: Function;
    onTableChange?: Function;
}

const ManageTable = ({ data, isLoading, onChange = () => {}, onTableChange = () => {} }: Props, _ref: any) => {
  const [items, setItems] = useState<any[]>([]);
  const itemsRef = useRef<any[]>(items);

  const { data: pItems } = useGetAllItemQuery(null, { refetchOnMountOrArgChange: true });
  const { data: uomItems } = useGetAllUOMsQuery({});

  useEffect(() => {
    setItems(data || []);
    itemsRef.current = data || [];
  }, [data]);

  const itemOptions = useMemo(() => {
    return (pItems || []).map((i: any) => ({ label: i?.descr, value: i?.key }));
  }, [pItems]);

  const uomOptions = useMemo(() => {
    return (uomItems || []).map((u: any) => ({ label: u?.descr, value: u?.key }));
  }, [uomItems]);

  const columns = useMemo(() => {
    return [
      { key: 'item_key', name: 'Item', editor: 'dropdown', required: true, width: 260, options: itemOptions },
      { key: 'brand', name: 'Brand', editor: 'text', width: 160 },
      { key: 'model_number', name: 'Model', editor: 'text', width: 160 },
      { key: 'qty', name: 'Quantity', editor: 'number', width: 140 },
      { key: 'item_uom_key', name: 'UOM', editor: 'dropdown', required: true, width: 220, options: uomOptions }
    ];
  }, [itemOptions, uomOptions]);

  if (!uomItems) return <Loader />;
  if (!pItems) return <Loader />;

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
      normalizeRows={(rows) =>
        (rows || []).map((row: any, idx: number) => ({
          ...row,
          id: row?.id ?? row?.key ?? idx + 1,
          item_key: row?.item_key ?? row?.items?.key,
          item_uom_key: row?.item_uom_key ?? row?.items_uoms?.key
        }))
      }
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
