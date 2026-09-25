import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import DataGrid, {
  CalculatedColumn,
  Column,
  DataGridHandle,
  EditorProps,
  RowRendererProps,
  RowsChangeData,
  SelectColumn
} from 'react-data-grid';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { useToast } from '../Toast';
import Row from '../Dategrid/DGRow';
// import './EditableTable.scss';

interface DropdownOption {
  label: any;
  value: any;
  gst?: number;
  onSelect?: (params: {
    row: any;
    colKey: string;
    value: any;
    option: DropdownOption;
    onRowChange: (r: any, commit?: boolean) => void;
    onClose: (commit?: boolean) => void;
  }) => void;
}

export interface EditableTableColumn {
  key: string;
  name: string;
  editor?: 'dropdown' | 'number' | 'text' | 'disabled' | string;
  editable?: boolean;
  width?: number;
  required?: boolean;
  allowEnter?: boolean;
  options?: DropdownOption[] | ((row: any) => DropdownOption[]);
  formatter?: (props: { row: any }) => React.ReactNode;
}

export interface EditableTableProps {
  initialRows: any[];
  columns: EditableTableColumn[];
  enableRowSelection?: boolean;
  onChange?: (rows: any[]) => void;
  canAddRow?: (rows: any[]) => boolean;
  allowAddRow?: boolean;
  allowDeleteRow?: boolean;
  onTableChange?: (value: boolean) => void;
  newRowDefaults?: Record<string, any>;
  showFooter?: boolean;
  footerTotalColumnKey?: string;
  showAddRowButton?: boolean;
  showRemoveSelectedButton?: boolean;
  showRowDelete?: boolean;
  deleteColumnPosition?: 'start' | 'end';
  deleteButtonVariant?: 'icon' | 'prime';
  disableAddWhenInvalid?: boolean;
  showMissingRequiredToast?: boolean;
  stretchLastColumn?: boolean;
  showInlineAddRow?: boolean;
  inlineAddRowLabel?: string;
  className?: string;
  gridStyle?: React.CSSProperties;
  normalizeRows?: (rows: any[]) => any[];
}

const defaultNormalizeRows = (rows: any[]) =>
  (rows || []).map((row, idx) => ({
    ...row,
    id: row?.id ?? row?.key ?? idx + 1
  }));

const formatIndianForDisplay = (value: any, decimals = 2) => {
  if (value === '' || value === null || value === undefined) return '';
  const num = Number(String(value).replace(/,/g, ''));
  if (isNaN(num)) return value;
  return num.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const formatDdMmmYyyy = (date: Date) => {
  const dd = String(date.getDate()).padStart(2, '0');
  const mmm = MONTHS_SHORT[date.getMonth()] ?? '';
  const yyyy = String(date.getFullYear());
  return `${dd}-${mmm}-${yyyy}`;
};

const parseToDate = (value: any): Date | null => {
  if (!value) return null;
  if (value instanceof Date && !isNaN(value.getTime())) return value;
  const s = String(value).trim();
  if (!s) return null;

  // yyyy-mm-dd
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const [y, m, d] = s.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    return isNaN(dt.getTime()) ? null : dt;
  }

  // dd-MMM-yyyy
  const m = /^(\d{1,2})-([A-Za-z]{3})-(\d{4})$/.exec(s);
  if (m) {
    const day = Number(m[1]);
    const mon = m[2].toLowerCase();
    const year = Number(m[3]);
    const monthIndex = MONTHS_SHORT.findIndex((mm) => mm.toLowerCase() === mon);
    if (monthIndex >= 0) {
      const dt = new Date(year, monthIndex, day);
      return isNaN(dt.getTime()) ? null : dt;
    }
  }

  const parsed = new Date(s);
  return isNaN(parsed.getTime()) ? null : parsed;
};

const parseTimeToDate = (timeStr: any): Date | null => {
  if (!timeStr) return null;
  if (timeStr instanceof Date && !isNaN(timeStr.getTime())) return timeStr;
  const s = String(timeStr).trim();
  if (!s) return null;

  // "hh:mm AM/PM"
  if (s.includes(' ') && (s.toUpperCase().includes('AM') || s.toUpperCase().includes('PM'))) {
    const parts = s.split(' ');
    if (parts.length !== 2) return null;
    const [time, periodRaw] = parts;
    const period = periodRaw.toUpperCase();
    const [hhRaw, mmRaw] = time.split(':');
    const hh = Number(hhRaw);
    const mm = Number(mmRaw);
    if (!Number.isFinite(hh) || !Number.isFinite(mm)) return null;

    let hours24 = hh;
    if (period === 'PM' && hh !== 12) hours24 = hh + 12;
    if (period === 'AM' && hh === 12) hours24 = 0;

    const dt = new Date();
    dt.setHours(hours24, mm, 0, 0);
    return dt;
  }

  // "hh:mm" 24-hour
  if (/^\d{1,2}:\d{2}$/.test(s)) {
    const [hhRaw, mmRaw] = s.split(':');
    const hh = Number(hhRaw);
    const mm = Number(mmRaw);
    if (!Number.isFinite(hh) || !Number.isFinite(mm)) return null;
    const dt = new Date();
    dt.setHours(hh, mm, 0, 0);
    return dt;
  }

  const parsed = new Date(s);
  return isNaN(parsed.getTime()) ? null : parsed;
};

const formatHhMmA = (date: Date) => {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;
  const hh = String(hours).padStart(2, '0');
  const mm = String(minutes).padStart(2, '0');
  return `${hh}:${mm} ${ampm}`;
};

const EditableTable: React.FC<EditableTableProps> = ({
  initialRows,
  columns,
  enableRowSelection = false,
  onChange,
  canAddRow,
  allowAddRow = true,
  allowDeleteRow = true,
  onTableChange = () => {},
  newRowDefaults,
  showFooter = false,
  footerTotalColumnKey = 'netamt',
  showAddRowButton = true,
  showRemoveSelectedButton = true,
  showRowDelete = true,
  deleteColumnPosition = 'end',
  deleteButtonVariant = 'icon',
  disableAddWhenInvalid = false,
  showMissingRequiredToast = true,
  stretchLastColumn = false,
  showInlineAddRow = false,
  inlineAddRowLabel = 'Add',
  className = 'rdg-light item-table',
  gridStyle,
  normalizeRows
}) => {
  const { showError } = useToast();
  const [rows, setRows] = useState<any[]>([]);
  const [selectedRows, setSelectedRows] = useState<ReadonlySet<any>>(new Set());
  const gridWrapRef = useRef<HTMLDivElement | null>(null);
  const gridRef = useRef<DataGridHandle | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const pendingSelectAfterAddRef = useRef<{ rowIdx: number } | null>(null);

  useEffect(() => {
    const el = gridWrapRef.current;
    if (!el) return;

    const update = () => {
      const rect = el.getBoundingClientRect();
      setContainerWidth(Math.floor(rect.width));
    };

    update();

    const ro = new ResizeObserver(() => update());
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const inlineAddRowItem = useMemo(() => ({ __inlineAddRow: true, id: '__inline_add_row__' }), []);
  const isInlineAddRow = (row: any) => !!row?.__inlineAddRow;

  const DropdownEditor: React.FC<{
    row: any;
    colKey: string;
    options?: DropdownOption[];
    onRowChange: (r: any, commit?: boolean) => void;
    onClose: (commit?: boolean) => void;
  }> = ({ row, colKey, options, onRowChange, onClose }) => {
    const dropdownRef = useRef<any>(null);
    const panelClassName = useMemo(() => `rdg-dropdown-panel-${Math.random().toString(36).slice(2)}`, []);
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(0);
    const highlightedIndexRef = useRef(0);
    const [filterValue, setFilterValue] = useState('');

    const visibleOptions = useMemo(() => {
      const all = options ?? [];
      const q = filterValue.trim().toLowerCase();
      if (!q) return all;
      return all.filter((opt) => String(opt?.label ?? '').toLowerCase().includes(q));
    }, [options, filterValue]);

    const visibleOptionsRef = useRef<DropdownOption[]>(visibleOptions);
    const rowRef = useRef(row);
    const currentValueRef = useRef<any>(row[colKey]);

    useEffect(() => {
      highlightedIndexRef.current = highlightedIndex;
    }, [highlightedIndex]);

    useEffect(() => {
      visibleOptionsRef.current = visibleOptions;
    }, [visibleOptions]);

    useEffect(() => {
      rowRef.current = row;
      currentValueRef.current = row[colKey];
    }, [row]);

    const commitDropdownValue = useCallback(
      (rawValue: any) => {
        const value = isNaN(Number(rawValue)) ? rawValue : Number(rawValue);
        const selectedOption = options?.find((opt) => opt.value === value);
        if (selectedOption?.onSelect) {
          selectedOption.onSelect({
            row: rowRef.current,
            colKey,
            value,
            option: selectedOption,
            onRowChange,
            onClose
          });
          return;
        }
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
      // Default highlight when panel opens (or filter changes).
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
        // Prevent PrimeReact/React handlers from seeing this key event.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        if (dropdownRef.current) dropdownRef.current.show();
      }, 50);
      return () => clearTimeout(timer);
    }, []);

    return (
      <div className="rdg-editor-container">
        <Dropdown
          ref={dropdownRef}
          autoFocus
          style={{ width: '100%' }}
          className="p-inputtext-sm rdg-select"
          value={row[colKey]}
          optionLabel="label"
          optionValue="value"
          filter
          filterBy="label"
          panelClassName={panelClassName}
          options={options}
          onChange={(e) => {
            currentValueRef.current = e.value;
            commitDropdownValue(e.value);
          }}
          onFilter={(e) => setFilterValue(e.filter ?? '')}
          onShow={() => setIsOpen(true)}
          onHide={() => setIsOpen(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.stopPropagation();
            } else if (e.key === 'Tab') {
              e.stopPropagation();
              commitDropdownValue(currentValueRef.current);
              onClose(true);
            }
          }}
        />
      </div>
    );
  };

  const TextEditor: React.FC<{
    row: any;
    colKey: string;
    onRowChange: (r: any, commit?: boolean) => void;
    onClose: (commit?: boolean) => void;
  }> = ({ row, colKey, onRowChange, onClose }) => {
    return (
      <div className="rdg-editor-container">
        <InputText
          autoFocus
          value={row[colKey] || ''}
          onChange={(e) => onRowChange({ ...row, [colKey]: e.target.value }, true)}
          onBlur={(e) => {
            onRowChange({ ...row, [colKey]: e.target.value }, true);
            onClose(true);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onRowChange({ ...row, [colKey]: e.target.value }, true);
              onClose(true);
              e.preventDefault();
              e.stopPropagation();
            } else if (e.key === 'Escape') {
              onClose(true);
              e.preventDefault();
              e.stopPropagation();
            } else if (e.key === 'Tab') {
              e.stopPropagation();
              onRowChange({ ...row, [colKey]: e.target.value }, true);
              onClose(true);
            } else {
              e.stopPropagation();
            }
          }}
          style={{ width: '100%' }}
          className="p-inputtext-sm"
        />
      </div>
    );
  };

  const CalendarEditor: React.FC<{
    row: any;
    colKey: string;
    onRowChange: (r: any, commit?: boolean) => void;
    onClose: (commit?: boolean) => void;
    mode: 'date' | 'time';
  }> = ({ row, colKey, onRowChange, onClose, mode }) => {
    const value = mode === 'time' ? parseTimeToDate(row[colKey]) : parseToDate(row[colKey]);
    const [currentTime, setCurrentTime] = useState<Date | null>(mode === 'time' ? value : null);

    useEffect(() => {
      if (mode !== 'time') return;
      setCurrentTime(value);
    }, [mode, value]);

    const timeValue = mode === 'time' ? currentTime ?? undefined : undefined;
    const dateValue = mode === 'date' ? value ?? undefined : undefined;
    return (
      <div className="rdg-editor-container">
        <Calendar
          style={{ width: '100%' }}
          className="p-inputtext-sm"
          value={mode === 'time' ? timeValue : dateValue}
          showIcon
          dateFormat={mode === 'date' ? 'dd-M-yy' : undefined}
          monthNavigator={mode === 'date'}
          yearNavigator={mode === 'date'}
          yearRange={mode === 'date' ? '2000:2100' : undefined}
          timeOnly={mode === 'time'}
          hourFormat="12"
          showTime={mode === 'time'}
          showSeconds={false}
          stepMinute={1}
          stepHour={1}
          onChange={(e: any) => {
            const dt = e?.value as Date | null;
            if (!dt) return;
            const next = { ...row };
            if (mode === 'time') {
              setCurrentTime(dt);
              next[colKey] = formatHhMmA(dt);
              // Match previous behavior: update value but don't close/commit until picker hides.
              onRowChange(next, false);
            } else {
              next[colKey] = formatDdMmmYyyy(dt);
              onRowChange(next, true);
            }
          }}
          onHide={() => {
            onClose(true);
          }}
          tabIndex={-1}
        />
      </div>
    );
  };

  const activateCell = (cell?: HTMLElement | null, openEditor: boolean = true) => {
    if (!cell) return;
    cell.click();
    if (!openEditor) return;

    // Give the grid time to update selection/focus before attempting to enter edit mode.
    requestAnimationFrame(() => {
      cell.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
      requestAnimationFrame(() => {
        const editorInput = cell.querySelector(
          '.rdg-editor-container input, .rdg-editor-container textarea, .rdg-editor-container [tabindex]'
        ) as HTMLElement | null;
        if (editorInput) {
          editorInput.focus();
          // Select text for inputs when available (best-effort)
          try {
            (editorInput as HTMLInputElement).select?.();
          } catch {}
        }
      });
    });
  };

  const focusOpenEditorInput = () => {
    // Best-effort focus: only one editor should be open at a time.
    requestAnimationFrame(() => {
      const scope = gridWrapRef.current ?? document;
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

  const selectFirstEditableCell = (rowIdx: number) => {
    let firstEditableColIndex = 0;
    while (
      firstEditableColIndex < columns.length &&
      (columns[firstEditableColIndex]?.editor === 'disabled' || !columns[firstEditableColIndex]?.editor)
    ) {
      firstEditableColIndex++;
    }

    const leadingCols =
      (enableRowSelection ? 1 : 0) + (showRowDelete && allowDeleteRow && deleteColumnPosition === 'start' ? 1 : 0);
    const gridColIndex = firstEditableColIndex + leadingCols;

    // Prefer DataGrid API for reliable focus/edit-mode (avoids landing on the header).
    // Two-phase select helps when focus comes from a button click (inline add row) and RDG is not yet ready to render the editor.
    const position = { rowIdx, idx: gridColIndex };
    gridRef.current?.scrollToRow(rowIdx);
    gridRef.current?.scrollToColumn(gridColIndex);
    gridRef.current?.selectCell(position, false);

    requestAnimationFrame(() => {
      gridRef.current?.element?.focus?.();
      gridRef.current?.selectCell(position, true);
      focusOpenEditorInput();
    });
  };

  const getBodyRows = (gridEl: HTMLElement) => {
    const allRows = Array.from(gridEl.querySelectorAll('[role="row"]')) as HTMLElement[];
    // Header rows use columnheader; data rows contain gridcells.
    return allRows.filter((r) => !!r.querySelector('[role="gridcell"]'));
  };

  useEffect(() => {
    const normalized = (normalizeRows ?? defaultNormalizeRows)(initialRows || []);
    setRows(normalized);
  }, [initialRows, normalizeRows]);

  const handleRowsChange = (updatedRows: any[], { indexes: _indexes }: RowsChangeData<any>) => {
    const cleaned = showInlineAddRow ? updatedRows.filter((r) => !isInlineAddRow(r)) : updatedRows;
    setRows(cleaned);
    onChange?.(cleaned);
  };

  const isRowMissingRequired = (row: any) => {
    if (!row) return false;
    return columns.some((col) => {
      if (!col.required) return false;
      const value = row?.[col.key];
      if (value === '' || value === null || value === undefined) return true;
      if (col.editor === 'number') {
        const num = Number(String(value).replace(/,/g, '').trim());
        if (!Number.isFinite(num) || num === 0) return true;
      }
      return false;
    });
  };

  const isAddDisabled = () => {
    if (!allowAddRow) return true;
    if (typeof canAddRow === 'function' && !canAddRow(rows)) return true;
    if (!disableAddWhenInvalid) return false;
    if (rows.length === 0) return false;
    return isRowMissingRequired(rows[rows.length - 1]);
  };

  const handleAddRow = () => {
    if (isAddDisabled()) {
      if (showMissingRequiredToast) {
        showError('Missing Required Fields', 'Please fill all required fields before adding a new row.');
      }
      return;
    }

    const lastRow = rows[rows.length - 1];
    const missingRequired = isRowMissingRequired(lastRow);

    if (lastRow && missingRequired) {
      if (showMissingRequiredToast) {
        showError('Missing Required Fields', 'Please fill all required fields before adding a new row.');
      }
      return;
    }

    const numericIds = rows
      .map((r) => Number(r?.id))
      .filter((n) => Number.isFinite(n)) as number[];
    const nextId = numericIds.length ? Math.max(...numericIds) + 1 : rows.length + 1;

    const newRow: any = { id: nextId, ...(newRowDefaults || {}) };
    columns.forEach((col) => {
      if (col.key !== 'id' && newRow[col.key] === undefined) {
        newRow[col.key] = '';
      }
    });

    const updatedRows = [...rows, newRow];
    setRows(updatedRows);
    onChange?.(updatedRows);
    onTableChange(true);
    pendingSelectAfterAddRef.current = { rowIdx: updatedRows.length - 1 };

    setTimeout(() => {
      const pending = pendingSelectAfterAddRef.current;
      if (!pending) return;
      pendingSelectAfterAddRef.current = null;
      selectFirstEditableCell(pending.rowIdx);
    }, 0);
  };

  const handleDeleteRow = (rowToDelete: any) => {
    if (isInlineAddRow(rowToDelete)) return;
    const updatedRows = rows.filter((row) => row.id !== rowToDelete.id);
    setRows(updatedRows);
    setSelectedRows((prev) => {
      const updated = new Set(prev);
      updated.delete(rowToDelete.id);
      return updated;
    });
    onChange?.(updatedRows);
    onTableChange(true);
  };

  const handleBulkDelete = () => {
    const updatedRows = rows.filter((row) => !selectedRows.has(row.id) && !isInlineAddRow(row));
    setRows(updatedRows);
    setSelectedRows(new Set());
    onChange?.(updatedRows);
    onTableChange(true);
  };

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
      const val = row[colKey];
      setValue(val === '' || val === null || val === undefined ? '' : String(val));
    }, [row, colKey]);

    useEffect(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        try {
          inputRef.current.select();
        } catch {}
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
            try {
              (e.target as HTMLInputElement).select();
            } catch {}
          }}
          onChange={(e) => {
            const raw = (e.target as HTMLInputElement).value;
            if (/^-?\d*\.?\d*$/.test(raw) || raw === '') {
              setValue(raw);
            }
          }}
          onBlur={(e) => {
            const raw = (e.target as HTMLInputElement).value;
            commitValue(raw);
            const cleaned = raw.replace(/,/g, '').trim();
            const parsed = cleaned === '' ? '' : parseFloat(cleaned);
            setValue(
              parsed === ''
                ? ''
                : Number(parsed).toLocaleString('en-IN', {
                    minimumFractionDigits: decimals,
                    maximumFractionDigits: decimals
                  })
            );
            onClose(true);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              commitValue(value);
              e.stopPropagation();
              onClose(true);
            } else if (e.key === 'Escape') {
              e.preventDefault();
              e.stopPropagation();
              onClose(true);
            } else if (e.key === 'Tab') {
              e.stopPropagation();
              commitValue(value);
              onClose(true);
            } else {
              e.stopPropagation();
            }
          }}
          className="p-inputtext p-inputtext-sm"
          style={{ width: '100%' }}
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
        return <DropdownEditor row={row} colKey={colKey} options={options} onRowChange={onRowChange} onClose={onClose} />;

      case 'number':
        return <NumberEditor row={row} colKey={colKey} onRowChange={onRowChange} onClose={onClose} />;

      case 'calendar':
      case 'date':
        return <CalendarEditor row={row} colKey={colKey} onRowChange={onRowChange} onClose={onClose} mode="date" />;

      case 'time':
        return <CalendarEditor row={row} colKey={colKey} onRowChange={onRowChange} onClose={onClose} mode="time" />;

      case 'disabled':
        return null;

      case 'text':
      default:
        return <TextEditor row={row} colKey={colKey} onRowChange={onRowChange} onClose={onClose} />;
    }
  };

  const resolveDropdownOptions = (col: EditableTableColumn, row: any): DropdownOption[] => {
    if (!col?.options) return [];
    if (typeof col.options === 'function') {
      return col.options(row) || [];
    }
    return col.options;
  };

  const gridColumns: Column<any>[] = [
    ...(enableRowSelection ? [SelectColumn] : []),
    ...(showRowDelete && allowDeleteRow && deleteColumnPosition === 'start'
      ? ([
          {
            key: '__delete__',
            name: '',
            width: 60,
            resizable: false,
            sortable: false,
            formatter: ({ row }: { row: any }) => {
              if (!row) return null;
              if (deleteButtonVariant === 'prime') {
                return (
                  <Button
                    style={{ height: '35px', width: '20px', marginLeft: 20 }}
                    type="button"
                    onClick={() => handleDeleteRow(row)}
                    className="p-button-rounded p-button-text"
                    icon="pi pi-trash"
                  />
                );
              }
              return (
                <i
                  className="pi pi-trash"
                  aria-hidden="true"
                  onClick={() => handleDeleteRow(row)}
                  title="Delete"
                  style={{ cursor: 'pointer' }}
                />
              );
            }
          } as unknown as Column<any>
        ] as Column<any>[])
      : []),
    ...columns.map((col) => ({
      ...col,
      name: `${col.name}${col.required ? ' *' : ''}`,
      editor:
        col?.editor === 'disabled'
          ? undefined
          : (props: EditorProps<any>) =>
              handleColumnEditor(
                col?.editor,
                props.row,
                props.onRowChange,
                props.onClose,
                col.key,
                resolveDropdownOptions(col, props.row)
              ),
      formatter: ({ row }: { row: any }) => {
        if (typeof col.formatter === 'function') {
          return col.formatter({ row });
        }
        if (col.key === 'qty') return formatIndianForDisplay(row[col.key], 3);
        if (col.key === 'netamt') return formatIndianForDisplay(row[col.key], 2);
        if (col.key === 'gst') return formatIndianForDisplay(row[col.key], 2);
        if (col.key === 'gstamt') return formatIndianForDisplay(row[col.key], 2);

        if (col.editor === 'dropdown' && col.options) {
          const options = resolveDropdownOptions(col, row);
          const selected = options.find((opt) => opt.value === row[col.key]);
          return selected ? selected.label : '';
        }

        return row[col.key];
      }
    })),
    ...(showRowDelete && allowDeleteRow && deleteColumnPosition === 'end'
      ? ([
          {
            key: '__delete__',
            name: '',
            width: 60,
            resizable: false,
            sortable: false,
            formatter: ({ row }: { row: any }) => {
              if (!row) return null;
              if (deleteButtonVariant === 'prime') {
                return (
                  <Button
                    style={{ height: '35px', width: '20px', marginLeft: 20 }}
                    type="button"
                    onClick={() => handleDeleteRow(row)}
                    className="p-button-rounded p-button-text"
                    icon="pi pi-trash"
                  />
                );
              }
              return (
                <i
                  className="pi pi-trash"
                  aria-hidden="true"
                  onClick={() => handleDeleteRow(row)}
                  title="Delete"
                  style={{ cursor: 'pointer' }}
                />
              );
            }
          } as unknown as Column<any>
        ] as Column<any>[])
      : [])
  ];

  const gridColumnsWithStretch = React.useMemo(() => {
    if (!stretchLastColumn) return gridColumns;
    if (!containerWidth || containerWidth <= 0) return gridColumns;
    if (!columns.length) return gridColumns;

    // Stretch the last "user column" (not the internal delete column)
    const lastUserCol = columns[columns.length - 1];
    if (!lastUserCol?.key) return gridColumns;

    const leadingWidth =
      (enableRowSelection ? 35 : 0) + (showRowDelete && allowDeleteRow && deleteColumnPosition === 'start' ? 60 : 0);
    const trailingWidth = showRowDelete && allowDeleteRow && deleteColumnPosition === 'end' ? 60 : 0;

    const defaultWidth = 120;
    const otherUserColsWidth = columns
      .slice(0, -1)
      .reduce((sum, c) => sum + (Number(c.width) || defaultWidth), 0);
    const lastWidth = Number(lastUserCol.width) || defaultWidth;

    const available = containerWidth - leadingWidth - trailingWidth - otherUserColsWidth;
    const nextLastWidth = Math.max(lastWidth, available);

    return gridColumns.map((c: any) => {
      if (c?.key === lastUserCol.key) {
        return { ...c, width: nextLastWidth };
      }
      return c;
    });
  }, [
    allowDeleteRow,
    columns,
    deleteColumnPosition,
    enableRowSelection,
    gridColumns,
    showRowDelete,
    stretchLastColumn
  ]);

  const getColWidth = (col: any) => {
    const width = Number(col?.width);
    if (Number.isFinite(width) && width > 0) return width;
    const minWidth = Number(col?.minWidth);
    if (Number.isFinite(minWidth) && minWidth > 0) return minWidth;
    return 120;
  };

  const gridPixelWidth = React.useMemo(() => {
    if (!gridColumnsWithStretch?.length) return 0;
    return gridColumnsWithStretch.reduce((sum: number, c: any) => sum + getColWidth(c), 0);
  }, [gridColumnsWithStretch]);

  const getNextEditableColIndex = (startIndex: number, direction: 1 | -1): number | null => {
    let nextIndex = startIndex + direction;
    while (nextIndex >= 0 && nextIndex < columns.length) {
      if (columns[nextIndex]?.editor && columns[nextIndex]?.editor !== 'disabled') return nextIndex;
      nextIndex += direction;
    }
    return null;
  };

  const focusCell = (rowElement: HTMLElement, colIndex: number) => {
    const leadingCols =
      (enableRowSelection ? 1 : 0) + (showRowDelete && allowDeleteRow && deleteColumnPosition === 'start' ? 1 : 0);
    const gridColIndex = colIndex + leadingCols;
    const cell = rowElement.querySelector(`[aria-colindex="${gridColIndex + 1}"]`) as HTMLElement | null;
    activateCell(cell, true);
  };

  const handleTabNavigation = (focusedCell: HTMLElement, isShiftTab: boolean) => {
    const rowElement = focusedCell.closest('[role="row"]') as HTMLElement | null;
    if (!rowElement) return;

    const ariaColIndex = parseInt(focusedCell.getAttribute('aria-colindex') || '', 10);
    if (!ariaColIndex) return;

    const leadingCols =
      (enableRowSelection ? 1 : 0) + (showRowDelete && allowDeleteRow && deleteColumnPosition === 'start' ? 1 : 0);
    const gridIdx = ariaColIndex - 1;
    const currentColIndex = gridIdx - leadingCols;
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

    // If an inline add-row is rendered, don't focus it; add a real row instead.
    if (!isShiftTab && showInlineAddRow && nextRowIndex >= rows.length) {
      handleAddRow();
      return;
    }

    if (nextRowIndex >= 0 && nextRowIndex < bodyRows.length) {
      const nextRow = bodyRows[nextRowIndex];
      const firstEditableIndex = direction === 1 ? 0 : columns.length - 1;
      const nextEditableColIndex = getNextEditableColIndex(firstEditableIndex - direction, direction);
      if (nextEditableColIndex !== null) focusCell(nextRow, nextEditableColIndex);
      return;
    }

    if (!isShiftTab && nextRowIndex >= bodyRows.length) {
      handleAddRow();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement | null;
    const focusedCell =
      (target?.closest('[role="gridcell"]') as HTMLElement | null) ??
      (document.activeElement?.closest('[role="gridcell"]') as HTMLElement | null);
    if (!focusedCell) return;

    const rowElement = focusedCell.closest('[role="row"]') as HTMLElement | null;
    if (!rowElement) return;

    const ariaColIndex = parseInt(focusedCell.getAttribute('aria-colindex') || '', 10);
    if (!ariaColIndex) return;

    const leadingCols =
      (enableRowSelection ? 1 : 0) + (showRowDelete && allowDeleteRow && deleteColumnPosition === 'start' ? 1 : 0);
    const gridIdx = ariaColIndex - 1;
    const colIndex = gridIdx - leadingCols;
    const column = columns[colIndex];
    const isInEditor = !!target?.closest('.rdg-editor-container');

    if (e.key === 'Enter') {
      if (!column) return;
      if (target?.closest('.p-dropdown-panel')) return;

      if (column?.editor === 'dropdown' && !isInEditor) {
        e.preventDefault();
        activateCell(focusedCell, true);
        setTimeout(() => {
          const trigger = focusedCell.querySelector('.p-dropdown-trigger') as HTMLElement | null;
          const root = focusedCell.querySelector('.p-dropdown') as HTMLElement | null;
          (trigger ?? root)?.click();
        }, 0);
        return;
      }

      if (!isInEditor) {
        const allowEnter = column?.allowEnter;
        if (!allowEnter) e.preventDefault();
      }
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      Promise.resolve().then(() => {
        const activeCell =
          (document.activeElement?.closest('[role="gridcell"]') as HTMLElement | null) ?? focusedCell;
        handleTabNavigation(activeCell, e.shiftKey);
      });
    }
  };

  const calculateColumnSum = (key: string) => {
    const sum = rows.reduce((sum, row) => {
      const value = parseFloat(row[key]);
      return sum + (isNaN(value) ? 0 : value);
    }, 0);
    return sum.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2 mb-2">
        {showAddRowButton && !showInlineAddRow && (
          <Button
            label="Add Row"
            icon="pi pi-plus"
            onClick={(e) => {
              e.preventDefault();
              handleAddRow();
            }}
            disabled={isAddDisabled()}
            className="p-button-success"
            style={{ width: 150 }}
          />
        )}
        {showRemoveSelectedButton && enableRowSelection && (
          <Button
            label="Remove Selected"
            icon="pi pi-trash"
            onClick={(e) => {
              e.preventDefault();
              handleBulkDelete();
            }}
            className="p-button-danger"
            disabled={selectedRows.size === 0 || !allowDeleteRow}
            style={{ width: 200 }}
          />
        )}
      </div>

      <div
        ref={gridWrapRef}
        onKeyDownCapture={handleKeyDown}
        style={{ width: '100%', overflowX: 'auto' }}
      >
        <DataGrid
          ref={gridRef}
          defaultColumnOptions={{ sortable: true, resizable: true }}
          columns={gridColumnsWithStretch}
          rows={showInlineAddRow ? [...rows, inlineAddRowItem] : rows}
          onRowsChange={(updatedRows, data) => {
            handleRowsChange(updatedRows, data);
            onTableChange(true);
          }}
          renderers={{
            rowRenderer: (key: React.Key, props: RowRendererProps<any, any>) => {
              if (!showInlineAddRow || !isInlineAddRow(props.row)) {
                return <Row key={key} {...props} />;
              }

              const { viewportColumns, ...rest } = props;
              const firstCol = viewportColumns?.[0] as CalculatedColumn<any, any> | undefined;
              if (!firstCol) return <Row key={key} {...props} />;

              const newViewportColumns: readonly CalculatedColumn<any, any>[] = [
                {
                  ...firstCol,
                  minWidth: 160,
                  width: 160,
                  cellClass: 'action-cell-class',
                  colSpan: () => viewportColumns.length,
                  formatter: () => (
                    <div style={{ paddingLeft: 8 }}>
                      <Button
                        icon="pi pi-plus"
                        type="button"
                        disabled={isAddDisabled()}
                        label={inlineAddRowLabel}
                        tabIndex={1}
                        style={{ width: 80 }}
                        onClick={(e) => {
                          e.preventDefault();
                          handleAddRow();
                        }}
                        className="p-button-text"
                      />
                    </div>
                  )
                }
              ];

              return <Row key={key} viewportColumns={newViewportColumns} {...rest} />;
            }
          }}
          selectedRows={selectedRows}
          onSelectedRowsChange={setSelectedRows}
          rowKeyGetter={(row) => (isInlineAddRow(row) ? '__inline_add_row__' : row.id)}
          className={className}
          style={
            (gridStyle ??
              ({
                height: `${Math.max(1, rows.length + (showInlineAddRow ? 1 : 0)) * 35 + 35}px`,
                '--rdg-header-background-color': '#827f7f',
                width: stretchLastColumn ? '100%' : Math.max(1, gridPixelWidth),
                overflowX: 'hidden',
                overflowY: 'hidden'
              } as React.CSSProperties))
          }
        />

        {showFooter && (
          <div
            className={className}
            style={{
              display: 'grid',
              height: '35px',
              backgroundColor: '#e0e0e0',
              fontWeight: 'bold',
              alignItems: 'center',
              paddingLeft: enableRowSelection ? '0px' : '5px'
            }}
          >
            {enableRowSelection && <div />}
            {columns.map((col) => (
              <div
                key={col.key}
                style={{
                  padding: '0 8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  height: '100%'
                }}
              >
                <div>{col.key === footerTotalColumnKey ? `Total Items : ${rows.length}` : ''}</div>
                <div>{col.key === footerTotalColumnKey ? `Total Taxable Amount : ₹ ${calculateColumnSum(footerTotalColumnKey)}` : ''}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EditableTable;
