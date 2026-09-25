import { Checkbox } from 'primereact/checkbox';
import React from 'react';
import { ColumnType, IColumn } from '../DGColumn/DGColumn';

type FormaterType<T> = {
    column: IColumn,
    row: any;
    field: string;
    defaultValue: T;
};

const dateFormatter = new Intl.DateTimeFormat(navigator.language);
const currencyFormatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
});
const numberFormatter = new Intl.NumberFormat(navigator.language);

export const isFunction = (obj: any) => {
    return !!(obj && obj.constructor && obj.call && obj.apply);
}

const resolveFieldData = (data: any, field: any) => {
    if (data && Object.keys(data).length && field) {
        if (isFunction(field)) {
            return field(data);
        } else if (field.indexOf('.') === -1) {
            return data[field];
        } else {
            let fields = field.split('.');
            let value = data;

            for (var i = 0, len = fields.length; i < len; ++i) {
                if (value == null) {
                    return null;
                }

                value = value[fields[i]];
            }

            return value;
        }
    } else {
        return null;
    }
}


export const defaultValueGetter = (row: any, field: string, defaultValue?: any) => {
    return resolveFieldData(row, field) || defaultValue;
}

export const displayValueGetter = (column: IColumn, row: any, field: string, defaultValue?: any) => {
    if (column && (column.displayValueGetter || column.displayField)) {
        return column.displayValueGetter ? column.displayValueGetter(row, field, defaultValue) :
            defaultValueGetter(row, column.displayField || field, defaultValue);
    }
    return defaultValueGetter(row, field, defaultValue);
}

export function TimestampFormatter({ column, row, field, defaultValue }: FormaterType<number>) {
    let displayValue = displayValueGetter(column, row, field, defaultValue)
    return <>{displayValue ? dateFormatter.format(displayValue) : ''}</>;
}

export function CurrencyFormatter({ value }: { value : number}) {
    return <>{value ? currencyFormatter.format(value) : "₹0"}</>;
}

export function DisplayCurrencyFormatter({ column, row, field, defaultValue }: FormaterType<number>) {
    return <CurrencyFormatter value={displayValueGetter(column, row, field, defaultValue)} />;
}

export function NumberFormatter({ column, row, field, defaultValue }: FormaterType<number>) {
    return <>{numberFormatter.format(displayValueGetter(column, row, field, defaultValue))}</>;
}

export function DefaultFormatter({ column, row, field, defaultValue }: FormaterType<any>) {
    return <>{displayValueGetter(column, row, field, defaultValue)}</>;
}

export function CheckboxFormatter({ value }: { value: any; }) {
    return <Checkbox checked={value} style={{ width: '100%', display: 'flex', margin: '10px auto', justifyContent: 'center' }} />;
}

export const getFormatter = (type: ColumnType, field: string, valueGetter: any, defaultValue?: any) => {
    switch (type) {
        case 'number':
            return (props: any) => props.row[field] && <NumberFormatter  column={props.column} row={props.row} field={field} defaultValue={defaultValue} />;
        case 'currency':
            return (props: any) => <DisplayCurrencyFormatter column={props.column} row={props.row} field={field} defaultValue={defaultValue} />;
        case 'date':
            return (props: any) => <TimestampFormatter column={props.column} row={props.row} field={field} defaultValue={defaultValue} />;
        case 'checkbox':
            return (props: any) => <CheckboxFormatter value={valueGetter(props.row, field, defaultValue)} />;
        default:
            return (props: any) => <DefaultFormatter  column={props.column} row={props.row} field={field} defaultValue={defaultValue} />;
    }
}