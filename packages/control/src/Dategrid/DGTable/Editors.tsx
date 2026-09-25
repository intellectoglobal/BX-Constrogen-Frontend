import React from 'react'
import { EditorProps, textEditor } from 'react-data-grid';
import { InputNumber } from 'primereact/inputnumber';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Checkbox } from 'primereact/checkbox';
import { ColumnType } from "../DGColumn";
import { isFunction } from "./Formatter";
import { useToast} from '../../Toast';

const handleInputFocus = (event: any) => {
    // event.target.click();
    event.target.select();
}
const handleSetRowValue = (row: any, column: string, value: any, onRowChange: any, onClose: any) => {
    onRowChange({ ...row, [column]: value }, true)
    onClose(true);
}

const handleInputNumberKeyDown = (row: any, column: any, onRowChange: any, onClose: any) =>
    (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Tab") {
            const value = parseFloat(event.target.getAttribute('aria-valuenow') || '');
            handleSetRowValue(row, column.key, isNaN(value) ? null : value , onRowChange, onClose);
        }
    }

const handleCalenderKeyDown = (row: any, column: any, onRowChange: any, onClose: any) =>
    (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Tab") {
            handleSetRowValue(row, column.key, event.target.value, onRowChange, onClose);
        }
    };


export const handleDropdownKeyDown = (row: any, column: any, onRowChange: any, onClose: any) =>
    (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "Tab") {
        }
    }


const handleInputTextKeyDown = (row: any, column: any, onRowChange: any, onClose: any) =>
    (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Tab") {
            handleSetRowValue(row, column.key, event.target.value, onRowChange, onClose);
        }
    }

export function onEditorNavigation({ key, target }: React.KeyboardEvent<HTMLDivElement>): boolean {
    if (
        key === 'Tab' &&
        (target instanceof HTMLInputElement ||
            target instanceof HTMLTextAreaElement ||
            target instanceof HTMLSelectElement)
    ) {
        return target.matches(
            '.rdg-editor-container > :only-child, .rdg-editor-container > label:only-child > :only-child, .rdg-editor-container > span:only-child > :only-child, .rdg-editor-container > div > div:nth-child(1) > input[type=text] '
        );
    }
    return false;
}

const getCheckboxEditor = ({ row, column, onRowChange, onClose }: EditorProps<any, any>) => {
    return <Checkbox className="mb-2"
        defaultChecked
        checked={row[column.key]}
        onFocus={handleInputFocus}
        onChange={(e: any) => {
            row[column.key] = e.checked;
            onRowChange(row, true)
        }}
        onKeyDown={handleInputTextKeyDown(row, column, onRowChange, onClose)}
    />
};

const getCustomEditor = ({ row, column, onRowChange, onClose }: EditorProps<any, any>) => {
    const { showError } = useToast();
    if(!!row.key){
        showError("Restricted","You can't edit this data now")
        return row.id
    }
    else{
        return textEditor({ row, column, onRowChange, onClose })
    }
    
};

const getNumberEditor = ({ row, column, onRowChange, onClose }: EditorProps<any, any>) => {
    return <InputNumber autoFocus inputId="integeronly" className="p-inputtext-sm"
        onFocus={handleInputFocus}
        value={row[column.key]}
        minFractionDigits={0} maxFractionDigits={3}
        onKeyDown={handleInputNumberKeyDown(row, column, onRowChange, onClose)}
        onValueChange={(e: any) => { handleSetRowValue(row, column.key, e.value, onRowChange, onClose); }}
        tabIndex={-1} />
};

const getCurrencyEditor = ({ row, column, onRowChange, onClose }: EditorProps<any, any>) => {
    return <InputNumber autoFocus inputId="currency-india" className="p-inputtext-sm"
        onFocus={handleInputFocus}
        value={row[column.key]}
        minFractionDigits={0} maxFractionDigits={3}
        onKeyDown={handleInputNumberKeyDown(row, column, onRowChange, onClose)}
        onValueChange={(e: any) => {
            handleSetRowValue(row, column.key, e.value, onRowChange, onClose);
        }}
        tabIndex={-1}
        mode="currency" currency="INR" currencyDisplay="symbol" locale="en-IN" />
};

const getDateEditor = ({ row, column, onRowChange, onClose }: EditorProps<any, any>) => {
    return <Calendar className="p-inputtext-sm"
        showIcon
        dateFormat="yy-mm-dd"
        value={row[column.key]}
        // onKeyDown={handleCalenderKeyDown(row, column, onRowChange)}
        onChange={(e: any) => {
            handleSetRowValue(row, column.key, e.value, onRowChange, onClose);
        }}
        tabIndex={-1} />
};

const getOptionsEditor = ({ row, column, onRowChange, onClose }: EditorProps<any, any>) => {

    return <Dropdown autoFocus className="p-inputtext-sm editor-dropdown-style"
        onFocus={handleInputFocus}
        value={row[column.key]}
        optionLabel="name"
        optionValue="key"
        onKeyDown={handleDropdownKeyDown(row, column, onRowChange, onClose)}
        onChange={(e: any) => {
            handleSetRowValue(row, column.key, e.value, onRowChange, onClose);
        }}
        tabIndex={-1} />
};

export const getEditor = (editorType: ColumnType) => {
    if (!editorType) {
        return null;
    }
    if (isFunction(editorType)) {
        return editorType;
    } else if (editorType === 'number') {
        return getNumberEditor;
    } else if (editorType === 'currency') {
        return getCurrencyEditor;
    } else if (editorType === 'options') {
        return getOptionsEditor;
    } else if (editorType === 'date') {
        return getDateEditor;
    } else if (editorType === 'checkbox') {
        return getCheckboxEditor;
    } else if (editorType === 'custom') {
        return getCustomEditor;
    } else {
        return textEditor;
    }
}