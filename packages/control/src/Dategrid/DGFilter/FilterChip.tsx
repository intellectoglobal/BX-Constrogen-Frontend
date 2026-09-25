import React from 'react';
import { Chip } from 'primereact/chip';
import { InputText } from 'primereact/inputtext';
import { MenuItem } from 'primereact/menuitem';

type Props = {
    item: MenuItem;
    removeItem(item: MenuItem): void
    onChange(value: any): void
}

const FilterChip = ({ item, removeItem, onChange }: Props) => {

    const updatefilterValue = (val: any) => {
        if (onChange && item.data) {
            item.data.tempValue = val;
            onChange(val);
        }
    }

    return (
        <Chip template={<>
            <span className="text-sm">{item.label}: </span>
            <InputText autoFocus type={item.data.filterType === 'number' ? 'number' : 'text'}
                className='p-1 m-1' value={item.data?.tempValue}
                onChange={(e) => updatefilterValue(e.target.value)} />
            <span tabIndex={0} onClick={(e) => removeItem(item)} className="p-chip-remove-icon pi pi-times-circle"></span>
        </>} className="mr-2 mb-2" removable />
    )
}

export default FilterChip