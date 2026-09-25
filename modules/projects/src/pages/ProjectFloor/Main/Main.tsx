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
import { useAddProjectFloorMutation, useDeleteProjectFloorMutation, useUpdateProjectFloorMutation } from '../api';
import { getClientProps, setPaymentMenu, setSelectedProjectReducer, useActiveProjectQuery, useBlocksForProjectQuery, useFloorsForProjectQuery } from '@igblsln/store';
import { useSelector, useDispatch } from 'react-redux'

const FloorDetailPage = () => {
    const dispatch = useDispatch();
    const selectedProjectFromReducer = useSelector((state: any) => state?.common?.selectedProject)
    const state: any = useLocation().state;
    const clientProps = getClientProps();

    const { data: projects } = useActiveProjectQuery()

    const [isFormChanged, setIsFormChanged] = useState(false);

    const toast = useRef<Toast>(null);

    const [isNewFloor, setIsNewFloor] = useState(true);
    const [selectedFloor, setSelectedFloor] = useState<any>(null);
    const [displayAddFloorModal, setDisplayAddFloorModal] = useState(false);

    const { data: blockData } = useBlocksForProjectQuery({
        projectId: selectedProjectFromReducer
    }, { skip: !selectedProjectFromReducer, refetchOnMountOrArgChange: true });

    const { data: floorData, isLoading: isProjectFloorFetching, refetch: refetchFloor } = useFloorsForProjectQuery({
        projectId: selectedProjectFromReducer
    }, { skip: !selectedProjectFromReducer, refetchOnMountOrArgChange: true });

    const [addProjectFloor, { isLoading: isFloorAdding }] = useAddProjectFloorMutation();
    const [updateProjectFloor, { isLoading: isFloorUpdating }] = useUpdateProjectFloorMutation();
    const [deleteFloor, { isLoading: isFloorDeleting }] = useDeleteProjectFloorMutation();

    const deleteFloorAction = async (id: number) => {
        await deleteFloor(id).unwrap();
        refetchFloor();
    };

    const showSuccess = (title: string, msg: string) => {
        toast?.current?.show({ severity: 'success', summary: title, detail: msg, life: 3000 });
    };

    const showError = (title: string, msg: string) => {
        toast?.current?.show({ severity: 'error', summary: title, detail: msg, life: 3000 });
    };

    const renderFloorFooter = () => {
        return (
            <div>
                <Button loading={isFloorAdding || isFloorUpdating} label="Save" className="p-button-warning mr-3"
                    onClick={async () => {
                        try {
                            if (!selectedFloor?.descr) {
                                showError("Please Enter Floor Name", "Floor Name is Empty")
                                return
                            }
                            let resp: any;
                            if (isNewFloor) {
                                resp = await addProjectFloor({
                                    proj_key: selectedProjectFromReducer,
                                    ...selectedFloor,
                                    ...clientProps
                                }).unwrap();
                            } else {
                                resp = await updateProjectFloor({
                                    key: selectedFloor.id,
                                    ...selectedFloor,
                                    ...clientProps
                                }).unwrap();
                            }
                            refetchFloor()
                            setDisplayAddFloorModal(false)
                            showSuccess('Success', resp.detail);
                        } catch (e) {
                            console.log(e)
                            showError('An error occurred', "We couldn't save your request, try again!");
                        }

                    }} />
                <Button label="Discard" className='p-button-plain' onClick={() => {
                    if (isFormChanged) {
                        if (confirm("Are You Sure to Discard?")) {
                            setDisplayAddFloorModal(false)
                        }
                    }
                    else {
                        setIsFormChanged(false)
                        setDisplayAddFloorModal(false)
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
                    description="Floor"
                    isLoading={isProjectFloorFetching || isFloorDeleting}
                    data={floorData}
                    newTable
                    allowFilters={false}
                    hideActionColumn
                    deleteAction={deleteFloorAction}
                    emptyRowMessage={selectedProjectFromReducer ? "No Floor For Selected Project" : "Select a Project To View"}
                >
                    <Datacolumn filteringType="text" field="block.descr" header="Block" sortable filter style={{ minWidth: '12rem' }} />
                    <Datacolumn filteringType="text" field="descr" header="Floor Name" sortable filter style={{ minWidth: '12rem' }} />
                    <Datacolumn
                        field="edit"
                        header="Edit"
                        type="custom"
                        width={"10%"}
                        displayValueGetter={(row: any) =>
                            <Button
                                style={{ height: 30, marginRight: 10, marginBottom: 3 }}
                                onClick={() => {
                                    setIsNewFloor(false);
                                    setDisplayAddFloorModal(true);
                                    setSelectedFloor(row);
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
                                    accept: () => deleteFloorAction(row.key),
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
                        label='Add Floor'
                        style={{
                            marginLeft: 'auto',
                            marginTop: 5,
                            display: 'flex',
                            width: 150
                        }}
                        onClick={() => {
                            setSelectedFloor(null);
                            setIsNewFloor(true);
                            setDisplayAddFloorModal(true);
                        }}
                        className='p-button-plain'
                    />
                }
            </div>

            <Dialog
                header={`${isNewFloor ? "Add" : "Edit"} Floor`}
                visible={displayAddFloorModal}
                footer={renderFloorFooter}
                position={'center'}
                modal
                style={{ width: '40vw' }}
                onHide={() => setDisplayAddFloorModal(false)}
                draggable={false} resizable={false} closable={false}
            >
                <div style={{ padding: 15 }}>
                    <div className="field">
                        <label style={{ fontSize: 18 }} className={'col-3'}>Block*</label>
                        <Dropdown
                            style={{ width: '50%' }}
                            placeholder='Select a Block'
                            options={blockData || []}
                            value={selectedFloor?.projblk_key}
                            onChange={(e) => {
                                !isFormChanged && setIsFormChanged(true)
                                setSelectedFloor({
                                    ...selectedFloor,
                                    projblk_key: e.target.value
                                })
                            }}
                            optionLabel='descr'
                            optionValue='key'
                        />
                    </div>
                    <div className="field">
                        <label style={{ fontSize: 18 }} className={'col-3'}>Floor Name*</label>
                        <InputText
                            style={{ width: '40%' }}
                            defaultValue={selectedFloor?.descr}
                            onChange={(e) => {
                                !isFormChanged && setIsFormChanged(true)
                                setSelectedFloor({
                                    ...selectedFloor,
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

export default FloorDetailPage;