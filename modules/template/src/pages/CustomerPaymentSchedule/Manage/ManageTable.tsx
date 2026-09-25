import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import { Button } from 'primereact/button';
import { Datacolumn, ListLayout } from '@igblsln/control';
import { PAGE_NAME, PAGE_ROUTE } from '../constants';
import { MODULE_NAME } from '../../../constants';

type Props = {
    data: any[];
    isLoading?: boolean;
    onChange?: Function;
    onTableChange?: Function;
}

const ManageTable = ({ data, isLoading, onChange = () => { }, onTableChange = () => { } }: Props) => {
    const [items, setTasks] = useState<any[]>([])
    const ref = useRef(items);

    useEffect(() => {
        setTasks(data);
        ref.current = data;
    }, [data])


    const removeTask = (val: any) => {
        const updValue = ref.current.filter(x => x !== val)
        ref.current = updValue;
        setTasks(updValue);
        onChange(updValue)
        onTableChange(true);
    }

    const actionBodyTemplate = (value: any) => {
        return <Button style={{ height: '35px', width: '20px', marginLeft: 20 }} type="button" onClick={() => removeTask(value)} className="p-button-rounded p-button-text" icon="pi pi-trash"></Button>
    }


    const shouldAllowAdd = (items: any[]) => {
        if (items.length === 0) return true
        let temp = items[items.length - 1]
        return temp?.payment_stage_desc
    }

    return (
        <ListLayout baseRoute={`/${MODULE_NAME}/${PAGE_ROUTE}`} description={PAGE_NAME} isLoading={isLoading}
            data={items}
            newTable
            tableLayoutClass='h-full'
            allowFilters={false}
            actionColumnInFirst
            actionColumnWidth={'11%'}
            actionBodyTemplate={actionBodyTemplate}
            gridProps={{
                allowAdd: true,
                disableAdd: !shouldAllowAdd(items),
                newRowDefaults: {
                    amount: 0
                },
                OnRowsChanged: async (rows: any[]) => {
                    let temp = rows
                    ref.current = temp;
                    await setTasks(temp);
                    onChange(temp)
                    onTableChange(true);
                }
            }}>
            <Datacolumn width={"70%"} field="payment_stage_desc" header="Schedule Description" type='text' editorType={"text"} />
            {/* <Datacolumn field="amount" header="Amount" type="number" editorType={"number"} /> */}


        </ListLayout>
    );
}

export default forwardRef(ManageTable);