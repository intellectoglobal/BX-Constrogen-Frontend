import React, { useState, useRef, useEffect } from 'react';
import { Datacolumn, ListLayout } from '@igblsln/control';
import { Button } from 'primereact/button';
import { confirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast';
import { Divider } from 'primereact/divider';
import { Dropdown } from 'primereact/dropdown';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAddProjectBlockMutation, useDeleteProjectBlockMutation, useUpdateProjectBlockMutation } from '../api';
import { getClientProps, setPaymentMenu, setSelectedProjectReducer, useActiveProjectQuery, useBlocksForProjectQuery } from '@igblsln/store';
import { useSelector, useDispatch } from 'react-redux'

const BlockDetailPage = () => {
    const dispatch = useDispatch();
    const clientProps = getClientProps();

    const { data: projects } = useActiveProjectQuery()

    const selectedProjectFromReducer = useSelector((state: any) => state?.common?.selectedProject)
    const [isFormChanged, setIsFormChanged] = useState(false);

    const toast = useRef<Toast>(null);

    const [isNewBlock, setIsNewBlock] = useState(true);
    const [selectedBlock, setSelectedBlock] = useState<any>(null);
    const [displayAddBlockModal, setDisplayAddBlockModal] = useState(false);

    const { data: blockData, isLoading: isProjectBlockFetching, refetch: refetchBlock } = useBlocksForProjectQuery({
        projectId: selectedProjectFromReducer
    }, { skip: !selectedProjectFromReducer, refetchOnMountOrArgChange: true });

    const [addProjectBlock, { isLoading: isBlockAdding }] = useAddProjectBlockMutation();
    const [updateProjectBlock, { isLoading: isBlockUpdating }] = useUpdateProjectBlockMutation();
    const [deleteBlock, { isLoading: isBlockDeleting }] = useDeleteProjectBlockMutation();

    const deleteBlockAction = async (id: number) => {
        await deleteBlock(id).unwrap();
        refetchBlock();
    };

    const showSuccess = (title: string, msg: string) => {
        toast?.current?.show({ severity: 'success', summary: title, detail: msg, life: 3000 });
    };

    const showError = (title: string, msg: string) => {
        toast?.current?.show({ severity: 'error', summary: title, detail: msg, life: 3000 });
    };

    const renderBlockFooter = () => {
        return (
            <div>
                <Button loading={isBlockAdding || isBlockUpdating} label="Save" className="p-button-warning mr-3"
                    onClick={async () => {
                        try {
                            if (!selectedBlock?.descr) {
                                showError("Please Enter Block Name", "Block Name is Empty")
                                return
                            }
                            let resp: any;
                            if (isNewBlock) {
                                resp = await addProjectBlock({
                                    proj_key: selectedProjectFromReducer,
                                    ...selectedBlock,
                                    ...clientProps
                                }).unwrap();
                            } else {
                                resp = await updateProjectBlock({
                                    key: selectedBlock.id,
                                    ...selectedBlock,
                                    ...clientProps
                                }).unwrap();
                            }
                            refetchBlock()
                            setDisplayAddBlockModal(false)
                            showSuccess('Success', resp.detail);
                        } catch (e) {
                            console.log(e)
                            showError('An error occurred', "We couldn't save your request, try again!");
                        }

                    }} />
                <Button label="Discard" className='p-button-plain' onClick={() => {
                    if (isFormChanged) {
                        if (confirm("Are You Sure to Discard?")) {
                            setDisplayAddBlockModal(false)
                        }
                    }
                    else {
                        setIsFormChanged(false)
                        setDisplayAddBlockModal(false)
                    }

                }} />
            </div>
        );
    }

    useEffect(() => {
        dispatch(setPaymentMenu('project'));
        return () => {
            dispatch(setPaymentMenu(''));
        };
    }, [dispatch]);

    return (
        <>
            <Toast ref={toast} />
            <Divider />
            <div className="flex">
                <div className="field col-6">
                    <label className={'col-4'}>Project Name</label>
                    <Dropdown
                        style={{ width: '60%' }}
                        optionLabel={"name"}
                        optionValue={"key"}
                        value={selectedProjectFromReducer}
                        filter
                        filterBy={"name"}
                        onChange={(e) => {
                            dispatch(setSelectedProjectReducer(e.value))
                            // setSelectedProjectKey(e.value)
                        }}
                        options={projects || []}
                    />

                </div>

            </div>

            <div style={{ minHeight: 250 }}>
                <ListLayout
                    gridProps={{
                        style: {
                            maxHeight: 400,
                            overflowY: 'auto',
                        }
                    }}
                    tableLayoutClass='none'
                    baseRoute={`/projects/${selectedProjectFromReducer}/block`}
                    description="Block"
                    isLoading={isProjectBlockFetching || isBlockDeleting}
                    data={blockData}
                    newTable
                    allowFilters={false}
                    hideActionColumn
                    deleteAction={deleteBlockAction}
                    emptyRowMessage={selectedProjectFromReducer ? "No Block For Selected Project" : "Select a Project To View"}
                >
                    <Datacolumn filteringType="text" field="descr" header="Block Name" sortable filter style={{ minWidth: '12rem' }} />
                    <Datacolumn
                        field="edit"
                        header="Edit"
                        type="custom"
                        width={"10%"}
                        displayValueGetter={(row: any) =>
                            <Button
                                style={{ height: 30, marginRight: 10, marginBottom: 3 }}
                                onClick={() => {
                                    setIsNewBlock(false);
                                    setDisplayAddBlockModal(true);
                                    setSelectedBlock(row);
                                }}
                            >
                                Edit
                            </Button>}
                    />
                    <Datacolumn
                        field="delete"
                        header="Delete"
                        type="custom"
                        width={"10%"}
                        displayValueGetter={(row: any) =>
                            <Button
                                style={{ height: 30, marginRight: 10, marginBottom: 3 }}
                                onClick={() => confirmDialog({
                                    message: 'Are you sure to delete?',
                                    header: 'Confirmation',
                                    icon: 'pi pi-exclamation-triangle',
                                    accept: () => deleteBlockAction(row.key),
                                    reject: () => { }
                                })}
                            >
                                Delete
                            </Button>}
                    />
                </ListLayout>
                {
                    selectedProjectFromReducer &&
                    <Button
                        label='Add Block'
                        style={{
                            marginLeft: 'auto',
                            marginTop: 5,
                            display: 'flex',
                            width: 150
                        }}
                        onClick={() => {
                            setSelectedBlock(null);
                            setIsNewBlock(true);
                            setDisplayAddBlockModal(true);
                        }}
                        className='p-button-plain'
                    />
                }
            </div>

            <Dialog
                header={`${isNewBlock ? "Add" : "Edit"} Block`}
                visible={displayAddBlockModal}
                footer={renderBlockFooter}
                position={'center'}
                modal
                style={{ width: '40vw' }}
                onHide={() => setDisplayAddBlockModal(false)}
                draggable={false} resizable={false} closable={false}
            >
                <div style={{ padding: 15 }}>
                    <div className="field">
                        <label style={{ fontSize: 18 }} className={'col-3'}>Block Name*</label>
                        <InputText
                            style={{ width: '40%' }}
                            defaultValue={selectedBlock?.descr}
                            onChange={(e) => {
                                !isFormChanged && setIsFormChanged(true)
                                setSelectedBlock({
                                    ...selectedBlock,
                                    descr: e.target.value
                                })
                            }}
                        />
                    </div>
                </div>
            </Dialog>

        </>
    );
};

export default BlockDetailPage;