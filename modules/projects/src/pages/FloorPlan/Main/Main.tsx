import React, { useState, useRef, useEffect } from 'react';
import { Datacolumn, ListLayout } from '@igblsln/control';
import { Button } from 'primereact/button';
import { confirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast';
import { Divider } from 'primereact/divider';
import { Dropdown } from 'primereact/dropdown';
import { Dialog } from 'primereact/dialog';
import { MultiSelect } from 'primereact/multiselect';
import { Image } from 'primereact/image';
import { FileUpload, FileUploadHeaderTemplateOptions } from 'primereact/fileupload';
import { useAddProject3DImageMutation, useDeleteProject3DImageMutation, useFloorsForProjectBlockQuery, useListProject3DImageQuery, useUpdateProject3DImageMutation } from '../api';
import { base64Converter, getClientProps, setPromptNavigate, useAppDispatch, useBlocksForProjectQuery, useFloorsForProjectQuery } from '@igblsln/store';
import { useSelector, useDispatch } from 'react-redux'

const FloorPlanPage = () => {
    const selectedProjectFromReducer = useSelector((state: any) => state?.common?.selectedProject)

    const clientProps = getClientProps();

    const [isFormChanged, setIsFormChanged] = useState(false);
    const [selectedBlock, setSelectedBlock] = useState<any>('');
    const dispatch = useAppDispatch()

    const toast = useRef<Toast>(null);
    const floorRef = useRef<any[]>([])

    const [isNew, setIsNew] = useState(true);
    const [selectedFloors, setSelectedFloors] = useState<any>(null);
    const [selectedImageType, setSelectedImageType] = useState<any>(null);
    const [displayAddFloorModal, setDisplayAddFloorModal] = useState(false);
    const [displayViewFloorModal, setDisplayViewFloorModal] = useState(false);
    const [selectedRow, setSelectedRow] = useState<any>({})
    const [selectedImage, setSelectedImage] = useState<any>({})
    const [selectedImageName, setSelectedImageName] = useState<any>("")

    const { data: blockData } = useBlocksForProjectQuery({
        projectId: selectedProjectFromReducer
    }, { skip: !selectedProjectFromReducer, refetchOnMountOrArgChange: true });

    const { data: tableData, isLoading: isFetching, refetch } = useListProject3DImageQuery({
        projectId: selectedProjectFromReducer,
        blockId: selectedBlock
    }, { skip: !selectedProjectFromReducer || !selectedBlock, refetchOnMountOrArgChange: true });

    const { data: floors } = useFloorsForProjectBlockQuery({ projectId: selectedProjectFromReducer, blockId: selectedBlock }, { skip: !selectedProjectFromReducer || !selectedBlock, refetchOnMountOrArgChange: true });

    useEffect(() => {
        if (floors) {
            floorRef.current = floors
        }
    }, [floors])

    const [addFloorPlan, { isLoading: isAdding }] = useAddProject3DImageMutation();
    const [updateFloorPlan, { isLoading: isUpdating }] = useUpdateProject3DImageMutation();
    const [deleteFloor, { isLoading: isFloorDeleting }] = useDeleteProject3DImageMutation();

    const deleteFloorAction = async (id: number) => {
        await deleteFloor(id).unwrap();
        setSelectedImageType(null)
        setSelectedFloors([])
        setSelectedImage(null)
        refetch();
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
                <Button loading={isAdding || isUpdating} label="Save" className="p-button-warning mr-3"
                    onClick={async () => {
                        try {
                            if (!selectedFloors?.length || !selectedImageType) {
                                showError("Missing Required Field", "Enter Required Fields")
                                return
                            }
                            let resp: any;
                            if (isNew) {
                                if (!selectedImage?.files?.length) {
                                    showError("Image Not Uploaded", "Upload FloorPlan image")
                                    return
                                }
                                resp = await addFloorPlan({
                                    proj_key: selectedProjectFromReducer,
                                    image_type: selectedImageType,
                                    block_id: selectedBlock,
                                    floor_ids: selectedFloors.map((floor: any) => floor?.key),
                                    files: selectedImage?.files,
                                    image_name: selectedImageName,
                                    ...clientProps
                                }).unwrap();
                                showSuccess("success", resp.detail)
                                setDisplayAddFloorModal(false)
                                dispatch(setPromptNavigate({promptNavigate: false}))
                            } else {
                                let payload = {
                                    ...selectedRow,
                                    proj_key: selectedProjectFromReducer,
                                    image_type: selectedImageType,
                                    block_id: selectedBlock,
                                    floor_ids: selectedFloors?.map((floor: any) => floor?.key),
                                    files: selectedImage?.files?.length ? selectedImage?.files : undefined,
                                    image_name: selectedImageName || selectedRow?.image_name,
                                    ...clientProps,
                                }
                                if (selectedImage?.files?.length > 0) {
                                    confirmDialog({
                                        message: 'Are you sure to continue?',
                                        header: 'Existing Image will be replaced',
                                        icon: 'pi pi-exclamation-triangle',
                                        accept: async() => {
                                            resp = await updateFloorPlan(payload).unwrap();    
                                            refetch()
                                            setDisplayAddFloorModal(false)
                                            setSelectedImageType(null)
                                            setSelectedFloors([])
                                            setSelectedImage(null)
                                            showSuccess('Success', resp.detail);
                                        },
                                        reject: () => { },
                                    })
                                } else {
                                    resp = await updateFloorPlan(payload).unwrap();    
                                    refetch()
                                    setDisplayAddFloorModal(false)
                                    setSelectedImageType(null)
                                    setSelectedFloors([])
                                    setSelectedImage(null)
                                    showSuccess('Success', resp.detail);
                                }
                            }
                        } catch (e) {
                            console.log(e)
                            showError('An error occurred', "We couldn't save your request, try again!");
                        }

                    }} />
                <Button label="Discard" className='p-button-plain' onClick={() => {
                    if (isFormChanged) {
                        if (confirm("Are You Sure to Discard?")) {
                            setIsFormChanged(false)
                            setDisplayAddFloorModal(false)
                            setSelectedImageType(null)
                            setSelectedFloors([])
                            setSelectedImage(null)

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

    const headerTemplate = (options: FileUploadHeaderTemplateOptions) => {
        const { className, chooseButton } = options;

        return (
            <div className={className} style={{ backgroundColor: 'transparent', display: 'flex', alignItems: 'center' }}>
                {chooseButton}
            </div>
        );
    };

    const emptyTemplate = () => {
        return (
            <div className="flex align-items-center flex-column">
                <i className="pi pi-image p-1" style={{ fontSize: '5em', borderRadius: '50%', backgroundColor: 'var(--surface-b)', color: 'var(--surface-d)' }}></i>
                <span style={{ fontSize: '1.2em', color: 'var(--text-color-secondary)' }} className="my-1">
                    Drag and Drop to Upload New Elevation Diagram
                </span>
            </div>
        );
    };

    return (
        <>
            <Toast ref={toast} />
            <Divider />
            <div className="flex">
                <div className="field col-6">
                    <label className={'col-4'}>Block</label>
                    <Dropdown
                        style={{ width: '60%' }}
                        optionLabel={"descr"}
                        optionValue={"key"}
                        value={selectedBlock}
                        filter
                        filterBy={"descr"}
                        onChange={(e) => {
                            setSelectedBlock(e.value)
                        }}
                        options={blockData || []}
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
                    description="FloorPlan"
                    isLoading={isFetching || isFloorDeleting}
                    data={tableData || []}
                    newTable
                    allowFilters={false}
                    hideActionColumn
                    deleteAction={deleteFloorAction}
                    emptyRowMessage={selectedProjectFromReducer ? "No FloorPlan For Selected Project" : "Select a Project To View"}
                >
                    <Datacolumn filteringType="text" field="image_name" header="Image" sortable filter style={{ minWidth: '12rem' }} />
                    <Datacolumn filteringType="text" field="image_type" header="Image Type" sortable filter style={{ minWidth: '12rem' }} />
                    <Datacolumn filteringType="text" field="floor_name" header="Floor Details"
                        displayValueGetter={(row: any) => {
                            let temp = row?.floors?.map((d: any) => d[0]?.descr)
                            console.log(temp)
                            return temp?.join(",")
                        }}
                        filter style={{ minWidth: '12rem' }} />
                    <Datacolumn
                        field="edit"
                        header="View"
                        type="custom"
                        width={"10%"}
                        displayValueGetter={(row: any) =>
                            <Button
                                style={{ height: 30, marginRight: 10, marginBottom: 3 }}
                                onClick={() => {
                                    setDisplayViewFloorModal(true);
                                    setSelectedImageType(row?.image_type);
                                    let temp1 = row?.floors?.map((d: any) => d[0].key)
                                    let temp2 = floorRef.current?.filter(d => temp1.includes(d.key))
                                    setSelectedFloors(temp2);
                                    setSelectedRow(row);
                                }}
                            >
                                View
                            </Button>
                        }
                    />
                    <Datacolumn
                        field="edit"
                        header="Edit"
                        type="custom"
                        width={"10%"}
                        displayValueGetter={(row: any) =>
                            <Button
                                style={{ height: 30, marginRight: 10, marginBottom: 3 }}
                                onClick={() => {
                                    setIsNew(false);
                                    setDisplayAddFloorModal(true);
                                    setSelectedImageType(row?.image_type);
                                    let temp1 = row?.floors?.map((d: any) => d[0].key)
                                    let temp2 = floorRef.current?.filter(d => temp1.includes(d.key))
                                    setSelectedFloors(temp2);
                                    setSelectedRow(row);
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
                                    accept: async () => {
                                        try {
                                        const resp = await deleteFloorAction(row.key);
                                        showSuccess(
                                            "Success",
                                            "Deleted Successfully"
                                        );
                                        } catch (error: any) {
                                        showError("Failed", error?.data?.detail);
                                        }
                                    },
                                    reject: () => { },
                                })}
                            >
                                Delete
                            </Button>}
                    />
                </ListLayout>
                {
                    selectedProjectFromReducer && selectedBlock &&
                    <Button
                        label='Add FloorPlan'
                        style={{
                            marginLeft: 'auto',
                            marginTop: 5,
                            display: 'flex',
                            width: 150
                        }}
                        onClick={() => {
                            setSelectedFloors(null);
                            setIsNew(true);
                            setDisplayAddFloorModal(true);
                        }}
                        className='p-button-plain'
                    />
                }
            </div>
            {/* floor and 3D plan add */}
            <Dialog
                header={`${isNew ? "Add" : "Edit"} FloorPlan`}
                visible={displayAddFloorModal}
                footer={renderFloorFooter}
                position={'center'}
                modal
                style={{ width: '50vw' }}
                onHide={() => {
                    setDisplayAddFloorModal(false);
                    setSelectedRow({});
                    setSelectedImageType("")
                }}
                draggable={false}
                resizable={false}
                closable={false}
            >
                <div className="flex flex-col md:flex-row">
                    <div className="w-full md:w-1/2 p-2">
                        <Dropdown
                            style={{ width: '100%' }}
                            placeholder="Select a Type"
                            options={["FloorPlan", "3D"]}
                            value={selectedImageType}
                            onChange={(e) => {
                                !isFormChanged && setIsFormChanged(true);
                                setSelectedImageType(e.target.value);
                            }}
                        />
                    </div>

                    <div className="w-full md:w-1/2 p-2">
                        <MultiSelect
                            value={selectedFloors}
                            onChange={(e) => {
                                !isFormChanged && setIsFormChanged(true);
                                setSelectedFloors(e.value);
                            }}
                            options={floors || []}
                            optionLabel="descr"
                            display="chip"
                            placeholder="Select Floors"
                            className="w-full"
                        />
                    </div>
                </div>

                {selectedRow?.image_url && !isNew &&(
                    <div className="flex justify-center mt-4">
                        {selectedRow.image_url.toLowerCase().endsWith('.pdf') ? (
                            <iframe
                                src={selectedRow.image_url}
                                title="PDF Preview"
                                width="100%"
                                height="500px"
                                style={{ border: 'none' }}
                            />
                        ) : (
                            <Image
                                style={{ width: '70%' }}
                                src={selectedRow.image_url}
                                alt={`Image`}
                                width="100%"
                                height="300"
                            />
                        )}
                    </div>
                )}

                {selectedProjectFromReducer && selectedBlock && (
                    <div style={{ padding: 15 }}>
                        <div className="card">
                            <FileUpload
                                name="image[]"
                                accept="image/*,.pdf"
                                onSelect={async (e) => {
                                    !isFormChanged && setIsFormChanged(true);
                                    let filesArray = Array.from(e.files);
                                    setSelectedImageName(e.files[0].name);
                                    let files = await Promise.all(filesArray.map(async file => await base64Converter(file)));
                                    setSelectedImage({
                                        ...selectedImage,
                                        files: files
                                    });
                                }}
                                customUpload
                                headerTemplate={headerTemplate}
                                chooseLabel="Browse"
                                emptyTemplate={emptyTemplate}
                            />
                        </div>
                    </div>
                )}
            </Dialog>

            {/* floor and 3D plan view */}
            <Dialog
                header={`View FloorPlan`}
                visible={displayViewFloorModal}
                position={'center'}
                modal
                style={{ width: '50vw' }}
                onHide={() => {
                    setDisplayViewFloorModal(false);
                    setSelectedRow({});
                    setSelectedImageType("")
                }}
                draggable={false}
                resizable={true}
            >

                <div className="flex flex-col md:flex-row">
                    <div className="w-full md:w-1/2 p-2">
                        <Dropdown
                            style={{ width: '100%' }}
                            placeholder="Select a Type"
                            options={["FloorPlan", "3D"]}
                            value={selectedImageType}
                            disabled
                        />
                    </div>

                    <div className="w-full md:w-1/2 p-2">
                        <MultiSelect
                            value={selectedFloors}
                            disabled
                            options={floors || []}
                            optionLabel="descr"
                            display="chip"
                            placeholder="Select Floors"
                            className="w-full"
                        />
                    </div>
                </div>

                {selectedRow?.image_url && (
                    <div className="flex justify-center mt-4">
                        {selectedRow.image_url.toLowerCase().endsWith('.pdf') ? (
                            <iframe
                                src={selectedRow.image_url}
                                title="PDF Preview"
                                width="100%"
                                height="500px"
                                style={{ border: 'none' }}
                            />
                        ) : (
                            <Image
                                style={{ width: '70%' }}
                                src={selectedRow.image_url}
                                alt={`Image`}
                                width="100%"
                                height="300"
                            />
                        )}
                    </div>
                )}
            </Dialog>


        </>
    );
};

export default FloorPlanPage;