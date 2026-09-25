import React, { useEffect, useState, useRef } from 'react';
import { Button } from 'primereact/button';
import { Datacolumn, ListLayout } from '@igblsln/control';
import { Image } from 'primereact/image';
import { Dropdown } from 'primereact/dropdown';
import { Dialog } from 'primereact/dialog';
import { confirmDialog } from 'primereact/confirmdialog';
import { FileUpload, FileUploadHeaderTemplateOptions } from 'primereact/fileupload';
import { Toast } from 'primereact/toast';
import { InputText } from 'primereact/inputtext';
import { AFTER_API_TIME, base64Converter, getClientProps, useActiveProjectQuery, useBlocksForProjectQuery, setPromptNavigate, useAppDispatch } from '@igblsln/store';
import { useAddProjectImageMutation, useDeleteProjectImageMutation, useListProjectImageQuery, useUpdateProjectImageMutation } from '../api';
import { useToast, EmptyRowsRenderer, Loader } from '@igblsln/control';
import { useSelector, useDispatch } from 'react-redux'

type Props = {}

const ElevationDiagram = (props: Props) => {

  const dispatch = useDispatch();
  const selectedProjectFromReducer = useSelector((state: any) => state?.common?.selectedProject)

  const { showError, showSuccess } = useToast()
  const { data: projects } = useActiveProjectQuery()
  const [isFormChanged, setIsFormChanged] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<any>('');

  const [selectedImage, setSelectedImage] = useState<any>({})
  const [selectedImageName, setSelectedImageName] = useState<any>("")

  const [isNew, setIsNew] = useState(true);
  const [displayAddElevationModal, setDisplayAddElevationModal] = useState(false);
  const [displayViewElevationModal, setDisplayViewElevationModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>({})

  const toast = useRef<Toast>(null);
  const [deleteDataAction] = useDeleteProjectImageMutation()
  const deleteAction = (id: number) => deleteDataAction(id).unwrap();


  const clientProps = getClientProps();

  const { data: blockData } = useBlocksForProjectQuery({
    projectId: selectedProjectFromReducer
  }, { skip: !selectedProjectFromReducer, refetchOnMountOrArgChange: true });


  const { data: imagesList, isLoading: isImagesLoading, refetch: refetchImages } = useListProjectImageQuery({
    projectId: selectedProjectFromReducer, blockId: selectedBlock
  }, { skip: !selectedProjectFromReducer || !selectedBlock, refetchOnMountOrArgChange: true })
  const [deleteImage, { isLoading: isImageDeleting }] = useDeleteProjectImageMutation()
  const [addProjectImage, { isLoading: isAdding }] = useAddProjectImageMutation()
  const deleteImageAction = async (id: number) => {
    await deleteImage(id).unwrap();
  };

  useEffect(() => {
    if (selectedProjectFromReducer) {
      setSelectedBlock(blockData?.[0]?.key)
    }
  }, [selectedProjectFromReducer, blockData])

  const headerTemplate = (options: FileUploadHeaderTemplateOptions) => {
    const { className, chooseButton, uploadButton, cancelButton } = options;

    return (
      <div className={className} style={{ backgroundColor: 'transparent', display: 'flex', alignItems: 'center' }}>
        {chooseButton}
        {uploadButton}
        {/* {cancelButton} */}
      </div>
    );
  };

  const emptyTemplate = () => {
    return (
      <div className="flex align-items-center flex-column">
        <i className="pi pi-image mt-3 p-5" style={{ fontSize: '5em', borderRadius: '50%', backgroundColor: 'var(--surface-b)', color: 'var(--surface-d)' }}></i>
        <span style={{ fontSize: '1.2em', color: 'var(--text-color-secondary)' }} className="my-5">
          Drag and Drop to Upload New Elevation Diagram
        </span>
      </div>
    );
  };

  const renderElevationFooter = () => {
    return (
      <div>
        <Button loading={isAdding || isUpdating} label="Save" className="p-button-warning mr-3"
          onClick={async () => {
            try {
              let payload: any = {
                files: selectedImage?.files,
                image_name: selectedImageName,
                proj_key: selectedProjectFromReducer,
                block_id: selectedBlock,
                ...clientProps
              };
              let resp: any;
              if (isNew) {
                if (!selectedImage?.files?.length) {
                  showError("Image Not Uploaded", "Upload Elevation Diagram image")
                  return
                }
                resp = await addProjectImage(payload).unwrap();
                showSuccess("success", resp.detail)
                setDisplayAddElevationModal(false)
                refetchImages()
                dispatch(setPromptNavigate({ promptNavigate: false }))
              } else {
                // Assuming update allows replacing image and name
                resp = await updateElevation({ key: selectedRow.key, ...payload }).unwrap();
                refetchImages()
                setDisplayAddElevationModal(false)
                showSuccess('Success', resp.detail);
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
              setDisplayAddElevationModal(false)
              setSelectedImageName("")
              setSelectedImage({})
            }
          } else {
            setIsFormChanged(false)
            setDisplayAddElevationModal(false)
          }
        }} />
      </div>
    );
  }

  const [updateElevation, { isLoading: isUpdating }] = useUpdateProjectImageMutation();

  if (isAdding) {
    return <div className="custom-skeleton p-4">
      <Loader />
    </div>
  }

  return (
    <>
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

      <Toast ref={toast} />

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
          description="Elevation Diagram"
          isLoading={isImagesLoading || isImageDeleting}
          data={imagesList?.map((item: any, index: number) => ({...item, __index: index + 1})) || []}
          newTable
          allowFilters={false}
          hideActionColumn
          emptyRowMessage={selectedProjectFromReducer ? "No Elevation Diagram for Selected Project" : "Select a Project to View"}
        >
          <Datacolumn filteringType="text" field="image_name" header="Image Name" sortable filter style={{ minWidth: '12rem', textAlign: 'right' }}
            displayValueGetter={(row: any) => row.image_name || `Main Block Image ${row.__index}`}
          />
          <Datacolumn filteringType="text" field="created_at" header="Uploaded Date" sortable filter style={{ minWidth: '12rem' }} />
          <Datacolumn
            field="view"
            header="View"
            type="custom"
            width="10%"
            displayValueGetter={(row: any) =>
              <Button
                style={{ height: 30, marginRight: 10, marginBottom: 3 }}
                onClick={() => {
                  setDisplayViewElevationModal(true);
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
            width="10%"
            displayValueGetter={(row: any) =>
              <Button
                style={{ height: 30, marginRight: 10, marginBottom: 3 }}
                onClick={() => {
                  setIsNew(false);
                  setDisplayAddElevationModal(true);
                  setSelectedImageName(row?.image_name || "");
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
            width="10%"
            displayValueGetter={(row: any) =>
              <Button
                style={{ height: 30, marginRight: 10, marginBottom: 3 }}
                onClick={() => confirmDialog({
                  message: 'Are you sure to delete?',
                  header: 'Confirmation',
                  icon: 'pi pi-exclamation-triangle',
                  accept: async () => {
                    try {
                      const resp = await deleteImageAction(row.key);
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
            label='Add Elevation'
            style={{
              marginLeft: 'auto',
              marginTop: 5,
              display: 'flex',
              width: 150
            }}
            onClick={() => {
              setIsNew(true);
              const nextNum = (imagesList?.length || 0) + 1;
              setSelectedImageName(`Main Block Image ${nextNum}`);
              setDisplayAddElevationModal(true);
            }}
            className='p-button-plain'
          />
        }
      </div>

      {/* add / edit elevation */}
      <Dialog
        header={`${isNew ? "Add" : "Edit"} Elevation Diagram`}
        visible={displayAddElevationModal}
        footer={renderElevationFooter()}
        position="center"
        modal
        style={{ width: '50vw' }}
        onHide={() => {
          setDisplayAddElevationModal(false);
          setSelectedRow({});
        }}
        draggable={false}
        resizable={false}
        closable={false}
      >
        <div className="flex flex-col p-2">
          <label>Image Name</label>
          <InputText
            value={selectedImageName}
            onChange={(e) => {
              !isFormChanged && setIsFormChanged(true);
              setSelectedImageName(e.target.value);
            }}
            className="w-full mb-2"
          />
        </div>

        {selectedRow?.image_url && !isNew && (
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

        <div style={{ padding: 15 }}>
          <div className="card">
            <FileUpload
              name="image[]"
              accept="image/*,.pdf"
              onSelect={async (e) => {
                !isFormChanged && setIsFormChanged(true);
                let filesArray = Array.from(e.files);
                setSelectedImageName(e.files[0]?.name || selectedImageName);
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
      </Dialog>

      {/* view elevation */}
      <Dialog
        header="View Elevation Diagram"
        visible={displayViewElevationModal}
        position="center"
        modal
        style={{ width: '50vw' }}
        onHide={() => {
          setDisplayViewElevationModal(false);
          setSelectedRow({});
        }}
        draggable={false}
        resizable={true}
      >
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
}

export default ElevationDiagram
