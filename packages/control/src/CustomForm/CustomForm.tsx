import React from 'react'
import { Controller } from "react-hook-form";
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { classNames } from "primereact/utils";
import { Calendar } from 'primereact/calendar';

interface Props {
    handleSubmit: Function;
    onSubmit: Function;
    formFields: any[];
    control: any;
    errors: any;
    reset?:any;
    loading?:boolean;
    style?:{
        width?: string
    }
}

export default function CustomForm({ 
    handleSubmit, 
    onSubmit, 
    formFields, 
    control, 
    errors,
    style,
    loading,
}: Props) {
    return (
        <form 
            onSubmit={handleSubmit(onSubmit)} 
            style={{ width: style?.width || 'inherit' , maxHeight: '600px', overflowY: 'auto', overflowX: 'hidden' }}
        >
            {
                formFields.map((d: any, idx: number) => {

                    return (
                        <div className="flex" key={idx}>
                            <div className='col-4' style={{margin:'auto'}}>
                                <label
                                    htmlFor={d.name}
                                    style={{ fontSize: 13 }}
                                    //@ts-ignore 
                                    className={classNames({ "p-error": errors[d.name] })}
                                >
                                    {d.label}
                                </label>
                            </div>


                            <div className="col-8">
                                <span className="p-float-label">
                                    {
                                        d.inputType === "textField" && (
                                            < Controller 
                                                name={d.name} 
                                                defaultValue={d?.defaultValue}  
                                                control={control} 
                                                rules={{ required: d.error_message }}
                                                render={({ field, fieldState }) => (
                                                    <InputText
                                                        //@ts-ignore 
                                                        id={field[d.name]}
                                                        {...field}
                                                        disabled={loading}
                                                        style={{ width: d.width || "100%" }}
                                                        className={classNames({ 'p-invalid': fieldState.invalid })}
                                                    />
                                                )}
                                            />
                                        )
                                    }
                                    {
                                        d.inputType === "date" && (
                                            < Controller 
                                                name={d.name} 
                                                defaultValue={new Date(d?.defaultValue)}
                                                control={control} 
                                                rules={{ required: d.error_message }}
                                                render={({ field, fieldState }) => (
                                                    <Calendar
                                                        //@ts-ignore 
                                                        id={field[d.name]}
                                                        showIcon
                                                        {...field}
                                                        dateFormat="dd-MM-yy"
                                                        disabled={loading}
                                                        style={{ width: d.width || "100%" }}
                                                        className={classNames({ 'p-invalid': fieldState.invalid })}
                                                    />
                                                )}
                                            />
                                        )
                                    }
                                    {
                                        d.inputType === "dropdown" && (
                                            <Controller 
                                                name={d.name} 
                                                control={control} 
                                                rules={{ required: 'This field is required' }}
                                                defaultValue={d?.defaultValue}
                                                render={({ field, fieldState }) => {
                                                    return (
                                                        <Dropdown
                                                            // @ts-ignore 
                                                            id={field[d.name]}
                                                            value={field.value}
                                                            disabled={loading}
                                                            style={{ width: d.width || "100%" }}
                                                            onChange={(e) => field.onChange(e.value)}
                                                            optionLabel={d.optionLabel}
                                                            optionValue={d.optionValue}
                                                            filter
                                                            filterBy={d.optionLabel}
                                                            options={d.dropdownOption}
                                                            className={classNames({ 'p-invalid': fieldState.invalid })}
                                                        />
                                                    )
                                                }}
                                            />
                                        )
                                    }


                                </span>
                                {errors[d.name] && <small className="p-error">{errors[d.name].message}</small>}
                                {/* {props.getFormErrorMessage(d.name)} */}
                            </div>
                        </div>
                    )
                })

            }

            <Button id='form-submit' style={{ display: 'none' }} type="submit" label="Submit" />
        </form>
    )
}
