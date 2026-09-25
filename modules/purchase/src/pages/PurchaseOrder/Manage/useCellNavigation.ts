import { useCallback } from 'react';

interface UseCellNavigationProps {
  columns: any[];
  rows: any[];
  onAddRow: () => void;
}

export const useCellNavigation = ({ columns, rows, onAddRow }: UseCellNavigationProps) => {
  const getNextEditableColIndex = useCallback(
    (startIndex: number, direction: 1 | -1): number | null => {
      let nextIndex = startIndex + direction;

      while (nextIndex >= 0 && nextIndex < columns.length) {
        if (columns[nextIndex]?.editor !== 'disabled') {
          return nextIndex;
        }
        nextIndex += direction;
      }

      return null; // No editable column found
    },
    [columns]
  );

  const focusCell = useCallback((rowElement: HTMLElement, colIndex: number) => {
    const cell = rowElement.querySelector(`[aria-colindex="${colIndex + 2}"]`) as HTMLElement;
    if (cell) {
      cell.click(); // Triggers edit mode
    }
  }, []);

  const handleTabNavigation = useCallback(
    (focusedCell: HTMLElement, isShiftTab: boolean) => {
      const rowElement = focusedCell.closest('[role="row"]') as HTMLElement;
      if (!rowElement) return;

      const currentColIndex = parseInt(focusedCell.getAttribute('aria-colindex') || '', 10) - 2;
      const currentRowIndex = parseInt(rowElement.getAttribute('aria-rowindex') || '', 10) - 1;

      const direction = isShiftTab ? -1 : 1;

      // Try to move within the same row
      const nextColIndex = getNextEditableColIndex(currentColIndex, direction);

      if (nextColIndex !== null) {
        // Found editable column in same row
        focusCell(rowElement, nextColIndex);
      } else {
        // Need to move to next/previous row
        const grid = focusedCell.closest('[role="grid"]') as HTMLElement;
        const allRows = Array.from(grid.querySelectorAll('[role="row"]')) as HTMLElement[];

        const nextRowIndex = currentRowIndex + direction;

        if (nextRowIndex >= 0 && nextRowIndex < allRows.length) {
          // Next row exists
          const nextRow = allRows[nextRowIndex];
          const firstEditableIndex = direction === 1 ? 0 : columns.length - 1;
          const nextEditableColIndex = getNextEditableColIndex(firstEditableIndex - direction, direction);

          if (nextEditableColIndex !== null) {
            focusCell(nextRow, nextEditableColIndex);
          }
        } else if (!isShiftTab && nextRowIndex >= allRows.length) {
          // Last row, Tab pressed → add new row
          onAddRow();
        }
      }
    },
    [columns, getNextEditableColIndex, focusCell, onAddRow]
  );

  return { handleTabNavigation };
};
