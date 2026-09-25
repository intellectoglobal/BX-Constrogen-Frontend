import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import DataGrid, {
  Column,
  DataGridHandle,
  SelectColumn,
  RowsChangeData,
  EditorProps
} from 'react-data-grid';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown'
import { InputNumber } from 'primereact/inputnumber'
import { InputText } from 'primereact/inputtext';
import { useToast } from '@igblsln/control';

interface DropdownOption {
  label: any;
  value: any;
  gst?: number;
}

interface EditableTableColumn {
  key: string;
  name: string;
  editor?: string;
  editable?: boolean;
  width?: number;
  required?: boolean;
  allowEnter?: boolean;
  options?: DropdownOption[];
  formatter?: (props: { row: any }) => React.ReactNode;
}

interface EditableTableProps {
  initialRows: any[];
  columns: EditableTableColumn[];
  enableRowSelection?: boolean;
  onChange?: (rows: any[]) => void;
  allowAddRow?: boolean;
  allowDeleteRow?: boolean;
  onTableChange?: Function;
  onSelectionChange?: (selectedRows: ReadonlySet<number>, selectedRowsData: any[]) => void;
}

const EditableTable: React.FC<EditableTableProps> = ({
  initialRows,
  columns,
  enableRowSelection = false,
  onChange,
  allowAddRow = true,
  allowDeleteRow = true,
  onTableChange = () => { },
  onSelectionChange
}) => {

  const { showSuccess, showError } = useToast();
  const [rows, setRows] = useState<any[]>(initialRows);
  const [selectedRows, setSelectedRows] = useState<ReadonlySet<number>>(new Set());
  const gridRef = useRef<DataGridHandle | null>(null);
  const leadingCols = enableRowSelection ? 1 : 0;

  const getBodyRows = (gridEl: HTMLElement) => {
    const allRows = Array.from(gridEl.querySelectorAll('[role="row"]')) as HTMLElement[];
    return allRows.filter((r) => !!r.querySelector('[role="gridcell"]'));
  };

  const toAriaColIndex = (colIndex: number) => colIndex + 1 + leadingCols;
  const fromAriaColIndex = (ariaColIndex: number) => ariaColIndex - 1 - leadingCols;

  const focusOpenEditorInput = () => {
    requestAnimationFrame(() => {
      const scope = (gridRef.current?.element as HTMLElement | null) ?? document;
      const editorInput = scope.querySelector(
        '.rdg-editor-container input, .rdg-editor-container textarea, .rdg-editor-container [tabindex]'
      ) as HTMLElement | null;
      if (!editorInput) return;
      editorInput.focus();
      try {
        (editorInput as HTMLInputElement).select?.();
      } catch {}
    });
  };

  const activateCell = (cell?: HTMLElement | null) => {
    if (!cell) return;
    cell.click();
    setTimeout(() => {
      cell.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const editorInput = cell.querySelector(
            '.rdg-editor-container input, .rdg-editor-container textarea, .rdg-editor-container [tabindex]'
          ) as HTMLElement | null;
          if (!editorInput) return;
          editorInput.focus();
          try {
            (editorInput as HTMLInputElement).select?.();
          } catch {}
        });
      });
    }, 0);
  };

  const focusGridCell = (cell?: HTMLElement | null) => {
    if (!cell) return;
    cell.focus();
  };

  useEffect(() => {
    // Normalize API data to match expected format
    const normalizedRows = initialRows.map(row => ({
      ...row,
      id: row.id ?? row.key, // Use 'key' if 'id' is not present
      item_key: row.item_key ?? row.items?.key, // Extract item_key from items.key if needed
      descr: row.descr ?? row.items?.descr // Extract descr for dropdown display
    }));
    setRows(normalizedRows);
  }, [initialRows]);

  const handleRowsChange = (updatedRows: any[], { indexes }: RowsChangeData<any>) => {
    const newRows = [...rows];
    for (const index of indexes) {
      newRows[index] = updatedRows[index];
    }
    setRows(newRows);
    onChange?.(newRows);
  };

  const handleAddRow = () => {
    const lastRow = rows[rows.length - 1];

    // Check if last row is completely filled for required fields
    const missingRequired = columns.some((col) => {
      if (col.required) {
        const value = lastRow?.[col.key];
        return value === '' || value === null || value === undefined;
      }
      return false;
    });

    if (lastRow && missingRequired) {
      showError('Missing Required Fields', 'Please fill all required fields before adding a new row.');
      return;
    }

    const nextId = rows.length ? Math.max(...rows.map((r) => r.id)) + 1 : 1;
    const newRow: any = { id: nextId };
    columns.forEach((col) => {
      if (col.key !== 'id') {
        newRow[col.key] = col.editor === 'number' ? '' : '';
      }
    });

    const updatedRows = [...rows, newRow];
    setRows(updatedRows);
    onChange?.(updatedRows);

    setTimeout(() => {
      const grid = gridRef.current?.element as HTMLElement | null;
      if (!grid) return;

      const bodyRows = getBodyRows(grid);
      const newRowElement = bodyRows[bodyRows.length - 1];
      if (!newRowElement) return;

      let firstEditableColIndex = 0;
      while (
        firstEditableColIndex < columns.length &&
        (!columns[firstEditableColIndex]?.editor || columns[firstEditableColIndex]?.editor === 'disabled')
      ) {
        firstEditableColIndex++;
      }

      const firstCell = newRowElement.querySelector(
        `[aria-colindex="${toAriaColIndex(firstEditableColIndex)}"]`
      ) as HTMLElement | null;

      firstCell?.click();
    }, 0);
  };


  const handleDeleteRow = (rowToDelete: any) => {
    const updatedRows = rows.filter((row) => row.id !== rowToDelete.id);
    setRows(updatedRows);
    setSelectedRows((prev) => {
      const updated = new Set(prev);
      updated.delete(rowToDelete.id);
      return updated;
    });
    onChange?.(updatedRows);
  };

  const handleBulkDelete = () => {
    const updatedRows = rows.filter((row) => !selectedRows.has(row.id));
    setRows(updatedRows);
    setSelectedRows(new Set());
    onChange?.(updatedRows);
  };

  const formatQuantity = (qty: string | number) => {
    const num = parseFloat(qty as string);
    if (isNaN(num)) return qty;
    return num % 1 === 0 ? num.toString() : num.toFixed(2);
  };

  const formatIndianForDisplay = (value: any, decimals = 2) => {
    if (value === '' || value === null || value === undefined) return '';
    const num = Number(String(value).replace(/,/g, ''));
    if (isNaN(num)) return value;
    return num.toLocaleString('en-IN', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  };

  const unformatNumber = (s: string) => (s || '').toString().replace(/,/g, '');

  // NumberEditor: local controlled editor to avoid frequent grid re-renders while typing
  const NumberEditor: React.FC<{
    row: any;
    colKey: string;
    onRowChange: (r: any, commit?: boolean) => void;
    onClose: (commit?: boolean) => void;
  }> = ({ row, colKey, onRowChange, onClose }) => {
    const decimals = colKey === 'qty' ? 3 : 2;
    const [value, setValue] = useState<string>(
      row[colKey] === '' || row[colKey] === null || row[colKey] === undefined ? '' : String(row[colKey])
    );
    const inputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
      // sync if external row changes
      const val = row[colKey];
      setValue(val === '' || val === null || val === undefined ? '' : String(val));
    }, [row, colKey]);

    useEffect(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        try { inputRef.current.select(); } catch {}
      }
    }, []);

    const commitValue = (rawValue: string) => {
      const cleaned = rawValue.replace(/,/g, '').trim();
      const parsed: any = cleaned === '' ? '' : parseFloat(cleaned);
      const updatedRow: any = { ...row, [colKey]: parsed };

      if (colKey === 'netamt' && parsed !== '') {
        const gst = parseFloat(row.gst) || 0;
        updatedRow.gstamt = parseFloat((Number(parsed) * (gst * 0.01)).toFixed(2));
      }
      if (colKey === 'gst' && parsed !== '') {
        const netamt = parseFloat(row.netamt) || 0;
        updatedRow.gstamt = parseFloat((Number(parsed) * (netamt * 0.01)).toFixed(2));
      }

      onRowChange(updatedRow, true);
    };

    return (
      <div className="rdg-editor-container">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onFocus={(e) => {
            setValue((v) => v.toString().replace(/,/g, ''));
            try { (e.target as HTMLInputElement).select(); } catch {}
          }}
          onChange={(e) => {
            const raw = (e.target as HTMLInputElement).value;
            if (/^-?\d*\.?\d*$/.test(raw) || raw === '') {
              setValue(raw);
              // don't call onRowChange here to avoid re-renders while typing
            }
          }}
          onBlur={(e) => {
            const raw = (e.target as HTMLInputElement).value;
            commitValue(raw);
            const cleaned = raw.replace(/,/g, '').trim();
            const parsed = cleaned === '' ? '' : parseFloat(cleaned);
            setValue(parsed === '' ? '' : Number(parsed).toLocaleString('en-IN', {
              minimumFractionDigits: decimals,
              maximumFractionDigits: decimals
            }));
            onClose(true);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              commitValue(value);
              onClose(true);
            } else if (e.key === 'Escape') {
              e.preventDefault();
              onClose(true);
            } else if (e.key === 'Tab') {
              e.preventDefault();
              e.stopPropagation(); // <- STOP original event from bubbling to parent
              commitValue(value);
              onClose(true);
              setTimeout(() => {
                const gridCell = document.activeElement?.closest('[role="gridcell"]') as HTMLElement;
                if (gridCell) {
                  const tabEvent = new KeyboardEvent('keydown', {
                    key: 'Tab',
                    shiftKey: (e as any).shiftKey,
                    bubbles: true,
                    cancelable: true
                  });
                  gridCell.dispatchEvent(tabEvent);
                }
              }, 0);
            } else {
              e.stopPropagation();
            }
          }}
          className="p-inputtext p-inputtext-sm"
          style={{ width: '100%', color: 'var(--text-color, #000)', caretColor: 'var(--text-color, #000)' }}
        />
      </div>
    );
  };

  const handleColumnEditor = (
    editor: string | undefined,
    row: any,
    onRowChange: any,
    onClose: any,
    colKey: string,
    options?: DropdownOption[]
  ) => {
    switch (editor) {
      case 'dropdown':
        const dropdownRef = useRef<any>(null);
        const panelClassName = useMemo(() => `rdg-dropdown-panel-${Math.random().toString(36).slice(2)}`, []);
        const [isOpen, setIsOpen] = useState(false);
        const [highlightedIndex, setHighlightedIndex] = useState(0);
        const highlightedIndexRef = useRef(0);
        const [filterValue, setFilterValue] = useState('');
        const rowRef = useRef(row);

        useEffect(() => {
          rowRef.current = row;
        }, [row]);

        const visibleOptions = useMemo(() => {
          const all = options ?? [];
          const q = filterValue.trim().toLowerCase();
          if (!q) return all;
          return all.filter((opt) => String(opt?.label ?? '').toLowerCase().includes(q));
        }, [options, filterValue]);

        const visibleOptionsRef = useRef<DropdownOption[]>(visibleOptions);

        useEffect(() => {
          visibleOptionsRef.current = visibleOptions;
        }, [visibleOptions]);

        useEffect(() => {
          highlightedIndexRef.current = highlightedIndex;
        }, [highlightedIndex]);

        const commitDropdownValue = useCallback(
          (rawValue: any) => {
            const value = isNaN(Number(rawValue)) ? rawValue : Number(rawValue);
            const selectedOption = options?.find((opt) => opt.value === value);
            const updatedRow = { ...rowRef.current, [colKey]: value };

            if (colKey === 'item_key' && selectedOption?.gst !== undefined) {
              updatedRow.gst = selectedOption.gst;
            }

            onRowChange(updatedRow, true);
          },
          [colKey, onRowChange, options]
        );

        const applyHighlight = useCallback(
          (idx: number) => {
            const panel = document.querySelector(`.${panelClassName}`) as HTMLElement | null;
            if (!panel) return;
            const items = Array.from(panel.querySelectorAll('li.p-dropdown-item')) as HTMLElement[];
            if (!items.length) return;

            items.forEach((el) => {
              el.classList.remove('p-highlight');
              el.setAttribute('aria-selected', 'false');
            });

            const clamped = Math.max(0, Math.min(idx, items.length - 1));
            const active = items[clamped];
            if (!active) return;
            active.classList.add('p-highlight');
            active.setAttribute('aria-selected', 'true');
            active.scrollIntoView({ block: 'nearest' });
          },
          [panelClassName]
        );

        useEffect(() => {
          if (!isOpen) return;
          setHighlightedIndex(0);
          requestAnimationFrame(() => applyHighlight(0));
        }, [applyHighlight, filterValue, isOpen]);

        useEffect(() => {
          if (!isOpen) return;
          requestAnimationFrame(() => applyHighlight(highlightedIndex));
        }, [applyHighlight, highlightedIndex, isOpen]);

        useEffect(() => {
          if (!isOpen) return;

          const onKeyDown = (ev: KeyboardEvent) => {
            const target = ev.target as HTMLElement | null;
            if (!target) return;

            const inPanel = !!target.closest(`.${panelClassName}`);
            const dropdownEl = (dropdownRef.current?.getElement?.() ?? dropdownRef.current?.container) as HTMLElement | null;
            const inDropdown = !!dropdownEl && dropdownEl.contains(target);
            if (!inPanel && !inDropdown) return;

            if (ev.key !== 'ArrowDown' && ev.key !== 'ArrowUp' && ev.key !== 'Enter') return;

            ev.preventDefault();
            ev.stopPropagation();
            (ev as any).stopImmediatePropagation?.();

            const opts = visibleOptionsRef.current;
            if (ev.key === 'Enter') {
              const opt = opts[highlightedIndexRef.current];
              if (opt) {
                commitDropdownValue(opt.value);
                dropdownRef.current?.hide?.();
              }
              return;
            }

            if (!opts.length) return;
            const delta = ev.key === 'ArrowDown' ? 1 : -1;
            setHighlightedIndex((prev) => {
              const next = Math.max(0, Math.min(prev + delta, opts.length - 1));
              highlightedIndexRef.current = next;
              return next;
            });
          };

          document.addEventListener('keydown', onKeyDown, true);
          return () => document.removeEventListener('keydown', onKeyDown, true);
        }, [commitDropdownValue, isOpen, panelClassName]);

        useEffect(() => {
          const timer = setTimeout(() => {
            if (dropdownRef.current) {
              dropdownRef.current.show();
            }
          }, 50);

          return () => clearTimeout(timer);
        }, []);
        return (
          <div className="rdg-editor-container">
            <Dropdown
              ref={dropdownRef}
              autoFocus
              style={{ width: '100%', color: 'var(--text-color, #000)', caretColor: 'var(--text-color, #000)' }}
              className="p-inputtext-sm rdg-select"
              value={row[colKey]}
              optionLabel="label"
              optionValue="value"
              filter
              filterBy="label"
              panelClassName={panelClassName}
              options={options}
              onChange={(e) => {
                commitDropdownValue(e.value);
              }}
              onFilter={(e) => setFilterValue(e.filter ?? '')}
              onShow={() => setIsOpen(true)}
              onHide={() => setIsOpen(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.stopPropagation();
                } else if (e.key === 'Tab') {
                  const gridCell = (e.target as HTMLElement | null)?.closest('[role="gridcell"]') as HTMLElement | null;
                  e.preventDefault();
                  e.stopPropagation();
                  onClose(true);
                  const tabEvent = new KeyboardEvent('keydown', {
                    key: 'Tab',
                    shiftKey: e.shiftKey,
                    bubbles: true,
                    cancelable: true
                  });
                  (gridCell ?? (document.activeElement?.closest('[role="gridcell"]') as HTMLElement | null))?.dispatchEvent(tabEvent);
                }
              }}
            />
          </div>
        );

      case 'number':
        return <NumberEditor row={row} colKey={colKey} onRowChange={onRowChange} onClose={onClose} />;

      case 'text':
        const TextEditor: React.FC<{
          row: any;
          colKey: string;
          onRowChange: (r: any, commit?: boolean) => void;
          onClose: (commit?: boolean) => void;
        }> = ({ row, colKey, onRowChange, onClose }) => {
          const [value, setValue] = useState<string>(row[colKey] ?? '');
          const inputRef = useRef<HTMLInputElement | null>(null);

          useEffect(() => {
            const val = row[colKey];
            setValue(val ?? '');
          }, [row, colKey]);

          useEffect(() => {
            if (inputRef.current) {
              inputRef.current.focus();
            }
          }, []);

          const commitValue = (rawValue: string) => {
            onRowChange({ ...row, [colKey]: rawValue }, true);
          };

          return (
            <div className="rdg-editor-container">
              <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onBlur={(e) => {
                  commitValue(value);
                  onClose(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    commitValue(value);
                    onClose(true);
                  } else if (e.key === 'Escape') {
                    e.preventDefault();
                    onClose(true);
                  } else if (e.key === 'Tab') {
                    e.preventDefault();
                    e.stopPropagation();
                    commitValue(value);
                    onClose(true);
                    setTimeout(() => {
                      const gridCell = document.activeElement?.closest('[role="gridcell"]') as HTMLElement;
                      if (gridCell) {
                        const tabEvent = new KeyboardEvent('keydown', {
                          key: 'Tab',
                          shiftKey: (e as any).shiftKey,
                          bubbles: true,
                          cancelable: true
                        });
                        gridCell.dispatchEvent(tabEvent);
                      }
                    }, 0);
                  } else {
                    e.stopPropagation();
                  }
                }}
                className="p-inputtext p-inputtext-sm"
                style={{ width: '100%', color: 'var(--text-color, #000)', caretColor: 'var(--text-color, #000)' }}
              />
            </div>
          );
        };
        return <TextEditor row={row} colKey={colKey} onRowChange={onRowChange} onClose={onClose} />;
      case 'disabled':
        return row[colKey];

      default:
        const DefaultTextEditor: React.FC<{
          row: any;
          colKey: string;
          onRowChange: (r: any, commit?: boolean) => void;
          onClose: (commit?: boolean) => void;
        }> = ({ row, colKey, onRowChange, onClose }) => {
          const [value, setValue] = useState<string>(row[colKey] ?? '');
          const inputRef = useRef<HTMLInputElement | null>(null);

          useEffect(() => {
            const val = row[colKey];
            setValue(val ?? '');
          }, [row, colKey]);

          useEffect(() => {
            if (inputRef.current) {
              inputRef.current.focus();
            }
          }, []);

          const commitValue = (rawValue: string) => {
            onRowChange({ ...row, [colKey]: rawValue }, true);
          };

          return (
            <div className="rdg-editor-container">
              <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onBlur={(e) => {
                  commitValue(value);
                  onClose(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    commitValue(value);
                    onClose(true);
                  } else if (e.key === 'Escape') {
                    e.preventDefault();
                    onClose(true);
                  } else if (e.key === 'Tab') {
                    e.preventDefault();
                    e.stopPropagation();
                    commitValue(value);
                    onClose(true);
                    setTimeout(() => {
                      const gridCell = document.activeElement?.closest('[role="gridcell"]') as HTMLElement;
                      if (gridCell) {
                        const tabEvent = new KeyboardEvent('keydown', {
                          key: 'Tab',
                          shiftKey: (e as any).shiftKey,
                          bubbles: true,
                          cancelable: true
                        });
                        gridCell.dispatchEvent(tabEvent);
                      }
                    }, 0);
                  } else {
                    e.stopPropagation();
                  }
                }}
                className="p-inputtext p-inputtext-sm"
                style={{ width: '100%', color: 'var(--text-color, #000)', caretColor: 'var(--text-color, #000)' }}
              />
            </div>
          );
        };
        return <DefaultTextEditor row={row} colKey={colKey} onRowChange={onRowChange} onClose={onClose} />;
    }
  };

  const gridColumns: Column<any>[] = [
    ...(enableRowSelection ? [SelectColumn] : []),
    ...columns.map((col) => ({
      ...col,
      name: `${col.name}${col.required ? ' *' : ''}`,
      editor:
        col?.editor === 'disabled' || !col?.editor
          ? undefined
          : (props: EditorProps<any>) =>
              handleColumnEditor(
                col?.editor,
                props.row,
                props.onRowChange,
                props.onClose,
                col.key,
                col.options
              ),
      formatter: ({ row }: { row: any }) => {
        if (typeof col.formatter === 'function') {
          return col.formatter({ row });
        }
        if (col.key === 'qty') {
          const qty = parseFloat(row[col.key]);
          if (isNaN(qty)) return row[col.key];
          return qty.toLocaleString('en-IN', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 3
          });
        }

        if (col.key === 'netamt') {
          const netamt = parseFloat(row[col.key]);
          if (isNaN(netamt)) return row[col.key];
          return netamt.toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          });
        }

        if (col.key === 'gst') {
          const gst = parseFloat(row[col.key]);
          if (isNaN(gst)) return row[col.key];
          return gst.toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          });
        }

        if (col.key === 'gstamt') {
          const gstamt = parseFloat(row[col.key]);
          if (isNaN(gstamt)) return row[col.key];
          return gstamt.toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          });
        }

        if (col.key === 'actions') {
          return (
            <i
              className="pi pi-trash"
              aria-hidden="true"
              onClick={() => {
                handleDeleteRow(row)
              }}
              title="Delete"
              style={{ cursor: 'pointer' }}
            />
          );
        }

        if (col.editor === 'dropdown' && col.options) {
          const selected = col.options.find(opt => opt.value === row[col.key]);
          return selected ? selected.label : '';
        }

        return row[col.key];
      }

    }))
  ];

  const getNextEditableColIndex = (startIndex: number, direction: 1 | -1): number | null => {
    let nextIndex = startIndex + direction;

    while (nextIndex >= 0 && nextIndex < columns.length) {
      if (columns[nextIndex]?.editor && columns[nextIndex]?.editor !== 'disabled') {
        return nextIndex;
      }
      nextIndex += direction;
    }

    return null;
  };

  const focusCell = (rowElement: HTMLElement, colIndex: number) => {
    const cell = rowElement.querySelector(`[aria-colindex="${toAriaColIndex(colIndex)}"]`) as HTMLElement | null;
    focusGridCell(cell);
  };

  const clickCell = (rowElement: HTMLElement, colIndex: number) => {
    const cell = rowElement.querySelector(`[aria-colindex="${toAriaColIndex(colIndex)}"]`) as HTMLElement | null;
    cell?.click();
  };

  const handleTabNavigation = (focusedCell: HTMLElement, isShiftTab: boolean) => {
    const rowElement = focusedCell.closest('[role="row"]') as HTMLElement | null;
    if (!rowElement) return;

    const ariaColIndex = parseInt(focusedCell.getAttribute('aria-colindex') || '', 10);
    const currentColIndex = fromAriaColIndex(ariaColIndex);
    const direction: 1 | -1 = isShiftTab ? -1 : 1;

    const nextColIndex = getNextEditableColIndex(currentColIndex, direction);
    if (nextColIndex !== null) {
      focusCell(rowElement, nextColIndex);
      return;
    }

    const grid = focusedCell.closest('[role="grid"]') as HTMLElement | null;
    if (!grid) return;

    const bodyRows = getBodyRows(grid);
    const currentBodyRowIndex = bodyRows.indexOf(rowElement);
    if (currentBodyRowIndex < 0) return;

    const nextRowIndex = currentBodyRowIndex + direction;

    if (nextRowIndex >= 0 && nextRowIndex < bodyRows.length) {
      const nextRow = bodyRows[nextRowIndex];
      const firstEditableIndex = direction === 1 ? 0 : columns.length - 1;
      const nextEditableColIndex = getNextEditableColIndex(firstEditableIndex - direction, direction);
      if (nextEditableColIndex !== null) {
        clickCell(nextRow, nextEditableColIndex);
      }
      return;
    }

    if (!isShiftTab && nextRowIndex >= bodyRows.length) {
      handleAddRow();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const focusedCell = document.activeElement?.closest('[role="gridcell"]') as HTMLElement | null;
    if (!focusedCell) return;

    const rowElement = focusedCell.closest('[role="row"]') as HTMLElement | null;
    if (!rowElement) return;

    const ariaColIndex = parseInt(focusedCell.getAttribute('aria-colindex') || '', 10);
    if (!ariaColIndex) return;

    const colIndex = fromAriaColIndex(ariaColIndex);
    const column = columns[colIndex];
    const target = e.target as HTMLElement | null;
    const isInEditor = !!target?.closest('.rdg-editor-container');

    const openFocusedDropdown = () => {
      e.preventDefault();
      activateCell(focusedCell);
      setTimeout(() => {
        const trigger = focusedCell.querySelector('.p-dropdown-trigger') as HTMLElement | null;
        const root = focusedCell.querySelector('.p-dropdown') as HTMLElement | null;
        (trigger ?? root)?.click();
      }, 0);
    };

    if (e.key === 'Enter') {
      if (!column) return;
      if (target?.closest('.p-dropdown-panel')) return;

      if (column?.editor === 'dropdown' && !isInEditor) {
        openFocusedDropdown();
        return;
      }

      if (!isInEditor) {
        const allowEnter = column?.allowEnter;
        if (!allowEnter) e.preventDefault();
      }
    }

    if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && column?.editor === 'dropdown' && !isInEditor) {
      openFocusedDropdown();
      return;
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      handleTabNavigation(focusedCell, e.shiftKey);
    }
  };

  const calculateColumnSum = (key: string) => {
    const sum = rows.reduce((sum, row) => {
      const value = parseFloat(row[key]);
      return sum + (isNaN(value) ? 0 : value);
    }, 0);

    return sum.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
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
          disabled={!allowAddRow}
          className="p-button-success"
          style={{ width: 150 }}
        />
        <Button
          label="Remove Selected"
          icon="pi pi-trash"
          onClick={(e) => {
            e.preventDefault()
            handleBulkDelete()
          }}
          className="p-button-danger"
          disabled={selectedRows.size === 0 || !allowDeleteRow}
          style={{ width: 200 }}
        />
      </div>

      <div onKeyDown={handleKeyDown}>
        <DataGrid
          ref={gridRef}
          defaultColumnOptions={{
            sortable: true,
            resizable: true
          }}
          columns={gridColumns}
          rows={rows}
          onRowsChange={(updatedRows, data) =>{
            handleRowsChange(updatedRows, data)
            onTableChange(true)
          } }
          selectedRows={selectedRows}
          onSelectedRowsChange={(newSelectedRows) => {
            setSelectedRows(newSelectedRows);
            if (onSelectionChange) {
              const selectedRowsData = rows.filter(row => newSelectedRows.has(row.id));
              onSelectionChange(newSelectedRows, selectedRowsData);
            }
          }}
          rowKeyGetter={(row) => row.id}
          className="rdg-light item-table"
          style={{
            height: `${Math.max(1, rows.length) * 35 + 35}px`,
            '--rdg-header-background-color': '#827f7f',
            overflowX: 'hidden',
            overflowY: 'hidden',
          } as React.CSSProperties}
        />

        {/* Footer Row */}
        <div
          className="rdg-light item-table"
          style={{
            display: 'grid',
            // gridTemplateColumns: `${enableRowSelection ? '35px ' : ''}${columns.map(col => `${col.width || 120}px`).join(' ')}`,
            height: '35px',
            backgroundColor: '#e0e0e0',
            fontWeight: 'bold',
            alignItems: 'center',
            paddingLeft: enableRowSelection ? '0px' : '5px'
          }}
        >
          {enableRowSelection && <div />} {/* Empty cell for checkbox */}

          {columns.map((col) => (
            <div key={col.key} style={{
              padding: '0 8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              height: '100%'
            }}>
              <div>
                {col.key === 'netamt' ? `Total Items : ${rows.length}` : ''}
              </div>
              <div>              
                {col.key === 'netamt' ? `Total Taxable Amount : ₹ ${calculateColumnSum('netamt')}` : ''}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default EditableTable;
