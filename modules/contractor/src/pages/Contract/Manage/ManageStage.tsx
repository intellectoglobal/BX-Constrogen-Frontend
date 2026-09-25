import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Datacolumn, ListLayout, CurrencyFormatter } from '@igblsln/control';
import { useStagesForProjectQuery } from '@igblsln/store';
import { PAGE_NAME, PAGE_ROUTE } from '../constants';
import { ContractStage, ContractStagePost } from '../contractStageApi';

type Props = {
    data: ContractStage[];
    isLoading?: boolean;
    disableTable?: boolean;
    selectedProject:any
}

const ManageStage = ({ data, isLoading, disableTable = false, selectedProject }: Props, selfRef: React.Ref<any>) => {
    const [items, setStages] = useState<ContractStage[]>([])
    const ref = useRef(items);
    const projectStagesRef = useRef<any[]>([]);
    const { data: projectStages } = useStagesForProjectQuery({id : selectedProject}, { skip: !selectedProject });

    useImperativeHandle(selfRef, () => ({
        getItems() {
            return items
        }
    }));

    useEffect(() => {
        setStages(data);
        ref.current = data;
    }, [data])

    useEffect(() => {
        projectStagesRef.current = projectStages || []
    }, [projectStages])

    const summaryRenderer = (value: number) => {
        return <CurrencyFormatter value={value || 0} />;
    }

    const removeStage = (val: any) => {
        const updValue = ref.current.filter(x => x !== val)
        ref.current = updValue;
        setStages(updValue);
    }

    const actionBodyTemplate = (value: any) => {
        return <Button style={{ height: '35px', width: '20px', marginLeft: 20 }} type="button" onClick={() => removeStage(value)} className="p-button-rounded p-button-text" icon="pi pi-trash"></Button>
    }

    const getOptionsEditor = ({ row, column, onRowChange, onClose }: any) => {
        return <Dropdown autoFocus className="p-inputtext-sm"
            value={row[column.key]}
            optionLabel="descr"
            optionValue="descr"
            options={projectStagesRef.current}
            filter
            filterBy={"descr"}
            onChange={(e: any) => {
                let clone = { ...row }
                clone[column.key] = e.value;
                onRowChange(clone, true)
              }}
            tabIndex={-1} />
    };

    const shouldAllowAdd = (items: any[]) => {
        if (items.length === 0) return true
        let temp = items[items.length - 1]
        return temp?.item_descr && temp?.netamt
    }

    return (
        <ListLayout baseRoute={`/contract/${PAGE_ROUTE}`} description={PAGE_NAME} isLoading={isLoading}
            data={items}
            newTable
            tableLayoutClass='h-full'
            hideActionColumn={disableTable}
            allowFilters={false}
            actionBodyTemplate={actionBodyTemplate}
            gridProps={{
                allowAdd: true,
                disableAdd : disableTable || !shouldAllowAdd(items),
                newRowDefaults: {
                    netamt: 0,
                },
                OnRowsChanged: (rows: any[]) => {
                    setStages(rows);
                    ref.current = rows;
                },
                getBottomSummaryRows: (rows: any) => {
                    return [{
                        netamt: rows.map((x: any) => parseFloat(x.netamt || 0)).reduce((partialSum: number, a: number) => partialSum + a, 0),
                    }];
                }
            }}>
            {/* <Datacolumn field="item_descr" header="Stagewise Payment" editorType={!disableTable && "text"} /> */}
            <Datacolumn field="item_descr" header="Stagewise Payment*" editorType={!disableTable && getOptionsEditor} />
            <Datacolumn field="netamt" header="Net Amt*" type="currency" defaultValue={0} editorType={!disableTable && "currency"} summaryFormatter={({ row }: any) => summaryRenderer(row?.netamt)} />
        </ListLayout>
    );
}

export type ManageStageHandle = {
    saveStage: (postData: ContractStagePost) => Promise<void>;
    getItems: () => ContractStage[];
};


export default forwardRef(ManageStage);