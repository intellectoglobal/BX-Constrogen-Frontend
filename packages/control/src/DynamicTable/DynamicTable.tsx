
import React, { useState } from 'react';
import DataGrid, {
  Column,
  SelectColumn,
  RowsChangeData,
  EditorProps
} from 'react-data-grid';
import { Button } from 'primereact/button';

interface EditableTableProps {
  initialRows: any[];
  columns: Array<{
    key: string;
    name: string;
    editor: string;
    options?: { label: string; value: string | number }[];
  }>;
  enableRowSelection?: boolean;
}

const DynamicTable: React.FC<EditableTableProps> = ({
  initialRows,
  columns,
  enableRowSelection = false
}) => {
  console.log(columns)
  const [rows, setRows] = useState<any[]>(initialRows);
  const [selectedRows, setSelectedRows] = useState<ReadonlySet<number>>(new Set());

  const handleRowsChange = (
    updatedRows: any[],
    { indexes }: RowsChangeData<any>
  ) => {
    const newRows = [...rows];
    for (const index of indexes) {
      newRows[index] = updatedRows[index];
    }
    setRows(newRows);
  };

  const handleAddRow = () => {
    const nextId = rows.length ? Math.max(...rows.map((r) => r.id)) + 1 : 1;
    const newRow: any = { id: nextId };
    columns.forEach((col) => {
      if (col.key !== 'id') newRow[col.key] = col.editor === 'number' ? 0 : '';
    });
    setRows([...rows, newRow]);
  };

  const handleDeleteRow = (rowToDelete: any) => {
    setRows(rows.filter((row) => row.id !== rowToDelete.id));
    setSelectedRows((prev) => {
      const updated = new Set(prev);
      updated.delete(rowToDelete.id);
      return updated;
    });
  };

  const handleBulkDelete = () => {
    setRows(rows.filter((row) => !selectedRows.has(row.id)));
    setSelectedRows(new Set());
  };

  const handleColumnEditor = (
    editor: string,
    row: any,
    onRowChange: any,
    onClose: any,
    options?: { label: string; value: string | number }[]
  ) => {
    switch (editor) {
      case 'dropdown':
        console.log(options, 'options')
        return (
          <div className="rdg-editor-container">
            <select
              value={row.role}
              className="rdg-select"
              onChange={(e) => onRowChange({ ...row, role: e.target.value }, true)}
              onBlur={onClose}
              autoFocus
            >
              {options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        );
      case 'number':
        return (
          <input
            type="number"
            className="rdg-editor"
            value={row.age}
            onChange={(e) => onRowChange({ ...row, age: parseInt(e.target.value || '0') }, true)}
            onBlur={onClose}
            autoFocus
          />
        );
      case 'text':
      default:
        return (
          <input
            type="text"
            className="rdg-editor"
            value={row.name}
            onChange={(e) => onRowChange({ ...row, name: e.target.value }, true)}
            onBlur={onClose}
            autoFocus
          />
        );
    }
  };

  const gridColumns: readonly Column<any>[] = [
    ...(enableRowSelection ? [SelectColumn] : []),
    ...columns.map((col) => ({
      ...col,
      editable: true,
      editor: (props: EditorProps<any>) =>
        handleColumnEditor(
          typeof col.editor === 'string' ? col.editor : 'text',
          props.row,
          props.onRowChange,
          props.onClose,
          'options' in col ? col.options?.filter((option): option is { label: string; value: string | number } => typeof option.value === 'string' || typeof option.value === 'number') : undefined
        ),
      formatter: col.key === 'delete'
        ? ({ row }: { row: any }) => (
          <i
            className="pi pi-trash cursor-pointer text-red-500"
            onClick={() => handleDeleteRow(row)}
            title="Delete"
          />
        )
        : undefined
    }))
  ];

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    console.log('Key pressed:', e.key);

    if (e.key === 'Tab') {
      const focusedCell = document.activeElement?.closest('[role="gridcell"]') as HTMLElement;
      console.log('Focused cell:', focusedCell);

      const rowElement = focusedCell?.closest('[role="row"]') as HTMLElement;
      console.log('Row element:', rowElement);

      if (!focusedCell || !rowElement) return;

      const colIndex = parseInt(focusedCell.getAttribute('aria-colindex') || '', 10) - 1;
      console.log('Column index:', colIndex);

      const rowIndex = parseInt(rowElement.getAttribute('aria-rowindex') || '', 10) - 1;
      console.log('Row index:', rowIndex);

      const visibleColLength = columns.length;
      console.log('Visible column length:', visibleColLength);

      const isLastRow = rowIndex === rows.length;
      console.log('Is last row:', isLastRow);

      const isLastColumn = colIndex === visibleColLength;
      console.log('Is last column:', isLastColumn);

      if (isLastRow && isLastColumn && !e.shiftKey) {
        e.preventDefault();
        console.log('Adding new row...');
        handleAddRow();
      }
    }
  };



  return (
    <div className="space-y-3">
      <div className="flex gap-2 mb-2">
        <Button
          label="Add Row"
          icon="pi pi-plus"
          onClick={(e) => {
            e.preventDefault()
            handleAddRow()
          }}
          className="p-button-success"
        />
        <Button
          label="Delete Selected"
          icon="pi pi-trash"
          onClick={(e) => {
            e.preventDefault()
            handleBulkDelete()
          }}
          // onClick={handleBulkDelete}
          className="p-button-danger"
          disabled={selectedRows.size === 0}
        />
      </div>

      <div onKeyDown={handleKeyDown}>
        <DataGrid
          columns={gridColumns}
          rows={rows}
          onRowsChange={handleRowsChange}
          selectedRows={selectedRows}
          onSelectedRowsChange={setSelectedRows}
          rowKeyGetter={(row) => row.id.toString()}
          className="rdg-light"
          style={{
            '--rdg-header-background-color': '#a26360'
          } as React.CSSProperties}
        />
      </div>
    </div>
  );
};

export default DynamicTable;
