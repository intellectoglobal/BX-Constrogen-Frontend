import React, { ReactElement } from 'react'
import { Column } from 'react-data-grid';

export type ColumnType = 'text' | 'number' | 'bool' | 'date' | 'currency' | 'options' | 'checkbox' | 'custom';

export interface IColumn extends Column<any, unknown> {
  filteringType?: ColumnType;
  type?: ColumnType;
  defaultValue?: any;
  selectOptions?: any[];
  displayField?: string;
  valueGetter(row: any, field: string, defaultValue?: any): any
  displayValueGetter?(row: any, field: string, defaultValue?: any): any
  disableCondition?(row: any, field: string, defaultValue?: any): boolean;
}

type Props = {
  field: string;
  defaultValue?: any;
  header: string | ReactElement;
  selectOptions?: any[];
  displayField?: string;
  editOnDoubleClick?: boolean;
  editOnFocus?: boolean;
  valueGetter?(row: any, field: string, defaultValue?: any): any;
  displayValueGetter?(row: any, field: string, defaultValue?: any): any;
  type?: ColumnType;
  editorType?: ColumnType | ((prop: any) => JSX.Element) | any
  children?: ReactElement | ReactElement[];
  filteringType?: ColumnType;
  width?: any;
  className?: string;
  disableCondition?(row: any, field: string, defaultValue?: any): boolean;
  [name: string]: any;
}


const DGColumn = ({ }: Props) => <div />

export default DGColumn;