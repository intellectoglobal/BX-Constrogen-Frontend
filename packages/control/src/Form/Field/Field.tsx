import React from 'react'
import {
    FieldErrors,
    FieldValues,
    Controller
} from "react-hook-form";
import { classNames } from 'primereact/utils';
import { Skeleton } from 'primereact/skeleton';

type Props = {
    name: string;
    id?: string;
    label: string;
    labelAlign?: 'left' | 'center' | 'right';
    control: any;
    defaultValue?: any;
    centerText?: boolean;
    useExplicit?: boolean;
    isLoading?: boolean;
    className?: string;
    leftSpan?: number;
    rightSpan?: number;
    required?: boolean | string | undefined;
    rules?: Object;
    errors: FieldErrors<FieldValues>;
    onChange?: Function
    convertValue?(value: any, reverse?: boolean): any;
    formItem: {
        component: any;
        componentProps?: any;
    };
}

export const getFormErrorMessage = (errMsg?: any) => {
    return errMsg && <small className="p-error">{errMsg}</small>
};

const Field = ({ name, id, label, control, errors, formItem,
    isLoading,
    labelAlign = 'left',
    leftSpan, rightSpan,
    convertValue,
    useExplicit,
    onChange,
    defaultValue,
    rules = {},
    required, className, centerText }: Props) => {
    const Item = formItem.component;
    const { className: itemClassName, labelClassName, ...rest } = formItem.componentProps || {};

    return (
        <div className={classNames('field grid grid-nogutter p-fluid', className)}>
            {isLoading && <Skeleton height="38px" className="mb-2"></Skeleton>}
            {!isLoading && <>
                <div className={classNames(labelClassName, `col-${leftSpan || 6}`, { 'p-error': !!required && errors[name], 'text-center': centerText })}
                    style={{ display: 'inline-table' }}>
                    <span style={{ display: 'table-cell', verticalAlign: 'middle', textAlign : labelAlign }} >{label} {!!required && '*'}</span>
                </div>
                <div id={id || name} className={`col-${rightSpan || 6} input-field`}>
                    <Controller
                        name={name}
                        defaultValue={defaultValue || null}
                        control={control}
                        rules={{
                            required: required === true ? `${label} is required` : required,
                            ...rules
                        }}
                        render={({ field, fieldState }) => (
                            <>
                                <Item
                                    id={field?.name}
                                    value={convertValue ? convertValue(field.value) : field.value}
                                    onChange={(e: any) => {
                                        onChange && onChange(e)
                                        field.onChange(convertValue ? convertValue(e.value, true) : (e.value || e.target.value || null))
                                    }}
                                    className={classNames(itemClassName, { 'p-invalid': !!fieldState.error })}
                                    {...rest}
                                />
                                {/* {
                                    useExplicit &&
                                    <Item
                                        id={field.name}
                                        value={convertValue ? convertValue(field.value) : field.value}
                                        onChange={(e: any) => {
                                            onChange && onChange(e)
                                            field.onChange(convertValue ? convertValue(e.value, true) : e.value || e.target.value)
                                        }}
                                        className={classNames(itemClassName, { 'p-invalid': !!fieldState.error })}
                                        {...rest}
                                    />
                                } */}
                                {/* {
                                    !useExplicit &&
                                    <Item
                                        {...field}
                                        className={classNames(itemClassName, { 'p-invalid': !!fieldState.error })}
                                        {...rest}
                                    />
                                } */}
                            </>
                        )} />
                    {getFormErrorMessage(errors?.[name]?.message)}
                </div>

            </>}
        </div>
    )
}

export default Field