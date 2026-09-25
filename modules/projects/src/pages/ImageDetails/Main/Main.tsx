import React, { useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { DataView } from 'primereact/dataview';
import { Panel } from 'primereact/panel';
import { Image } from 'primereact/image';
import { useLocation } from 'react-router-dom'
import { Divider } from 'primereact/divider';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { classNames } from "primereact/utils";
import { confirmDialog } from 'primereact/confirmdialog';
import { FileUpload, FileUploadHeaderTemplateOptions } from 'primereact/fileupload';
import { AFTER_API_TIME, base64Converter, getClientProps, PAGE_SIZE, useActiveProjectQuery } from '@igblsln/store';
import { Dialog } from 'primereact/dialog';
import { useAddProjectImageMutation, useUpdateProjectImageMutation, useDeleteProjectImageMutation, useListProjectImageQuery } from '../api';
import { useToast, EmptyRowsRenderer } from '@igblsln/control';


type Props = {}

const Main = (props: Props) => {
  const { showError, showSuccess } = useToast()
  const projKeyFromState: any = useLocation().state;
  const { data: projects } = useActiveProjectQuery()
  const [isFormChanged, setIsFormChanged] = useState(false);
  const [selectedProjectKey, setSelectedProjectKey] = useState<any>(projKeyFromState)

  const [selectedImage, setSelectedImage] = useState<any>({})
  const [isNewImage, setIsNewImage] = useState(true);
  const [displayAddImageModal, setDisplayAddImageModal] = useState(false);

  const searchQuery = useLocation().search

  const clientProps = getClientProps();

  useEffect(() => {
    if (searchQuery && searchQuery.split('bkp=').length === 2) {
      let id = parseInt(searchQuery.split('bkp=')[1])
      setSelectedProjectKey(id)
    }
  }, [])

  const { data: imagesList, isLoading: isImagesLoading, refetch: refetchImages } = useListProjectImageQuery({
    projectId: selectedProjectKey
  }, { skip: !selectedProjectKey, refetchOnMountOrArgChange: true })
  const [deleteImage, { isLoading: isImageDeleting }] = useDeleteProjectImageMutation()
  const [addProjectImage, { isLoading: isAdding }] = useAddProjectImageMutation()
  const deleteImageAction = async (id: number) => {
    await deleteImage({
      projectId: selectedProjectKey,
      id: id
    }).unwrap();
  }


  const onSubmit = async () => {
    try {
      if (!selectedImage?.descr) {
        showError("Please Enter Description", "Description is Empty")
        return
      }
      let resp: any;
      resp = await addProjectImage({ ...selectedImage, ...clientProps, proj_key: selectedProjectKey }).unwrap();
      setDisplayAddImageModal(false)
      showSuccess('Success', resp?.detail);
      setTimeout(() => {
      }, AFTER_API_TIME);
    } catch (error: any) {
      console.log(error)
      showError('An error occurred', error?.data?.detail || "We couldn't upload the image, try again!");
    }
  }

  const renderImageFooter = () => {
    return (
      <div>
        <Button loading={isAdding} label="Save" className="p-button-warning mr-3" onClick={() => onSubmit()} />
        <Button loading={isAdding} label="Discard" className='p-button-plain' onClick={() => {
          if (isFormChanged) {
            if (confirm("Are You Sure to Discard?")) {
              setDisplayAddImageModal(false)
            }
          }
          else {
            setDisplayAddImageModal(false)
          }

        }} />
      </div>
    );
  }

  const headerTemplate = (options: FileUploadHeaderTemplateOptions) => {
    const { className, chooseButton, cancelButton } = options;

    return (
      <div className={className} style={{ backgroundColor: 'transparent', display: 'flex', alignItems: 'center' }}>
        {chooseButton}
        {/* {cancelButton} */}
      </div>
    );
  };

  return (
    <>
      <Divider />
      <div className="pl-5">
        <div className="field">
          <label className={classNames('col-2')}>Project Name</label>
          <Dropdown
            style={{ width: '30%' }}
            optionLabel={"name"}
            optionValue={"key"}
            value={selectedProjectKey}
            filter
            filterBy={"name"}
            onChange={(e) => {
              setSelectedProjectKey(e.value)
            }}
            options={projects}
          />
        </div>
      </div>
      {
        selectedProjectKey &&
        <Button
          label='Add Image'
          style={{
            marginLeft: 'auto',
            marginTop: 5,
            display: 'flex',
            width: 150
          }}
          onClick={() => {
            setSelectedImage(null)
            setIsNewImage(true)
            setDisplayAddImageModal(true)
          }}
          className='p-button-plain'
        />
      }

      {
        selectedProjectKey ?
          (
            imagesList?.length ? <DataView value={imagesList || []}
              itemTemplate={(item) => <div className="col-12 md:col-4 p-1">
                <Panel className='project-grid' header={item?.proj_img_hdr?.description || ""} icons={
                  <>
                    <Button
                      style={{ height: '35px', width: '20px' }}
                      className="p-button-rounded p-button-text"
                      icon="pi pi-trash"
                      onClick={() => confirmDialog({
                        message: 'Are you sure to delete?',
                        header: 'Confirmation',
                        icon: 'pi pi-exclamation-triangle',
                        accept: () => deleteImageAction(item?.key),
                        reject: () => { }
                      })
                      }

                    ></Button>
                  </>
                } >
                  <div className="flex" >
                    <Image
                      style={{ width: '100%' }}
                      // src={"https://www.levelset.com/wp-content/uploads/2019/02/apartments.jpg"}
                      src={item?.image_path}
                      alt="Image"
                      width="100%"
                      height='200' />
                  </div>

                </Panel>
              </div>}
              totalRecords={imagesList?.length}
            /> :
              <div style={{ display: 'flex', height: '50%', alignItems: 'center', justifyContent: 'center' }}>
                <EmptyRowsRenderer msg={"No Images for Selected Project"} />
              </div>
          )
          :
          <div style={{ display: 'flex', height: '50%', alignItems: 'center', justifyContent: 'center' }}>
            <EmptyRowsRenderer msg={"Select a Project to View"} />
          </div>


      }

      <Dialog
        header={`Add Image`}
        visible={displayAddImageModal}
        footer={renderImageFooter}
        position={'center'}
        modal
        style={{ width: '60vw' }}
        onHide={() => setDisplayAddImageModal(false)}
        draggable={false} resizable={false} closable={false}
      >
        <div style={{ padding: 15 }}>
          <div className="field">
            <label style={{ fontSize: 18 }} className={'col-3'}>Description*</label>
            <InputText
              style={{ width: '40%' }}
              defaultValue={selectedImage?.descr}
              onChange={(e) => {
                !isFormChanged && setIsFormChanged(true)
                setSelectedImage({
                  ...selectedImage,
                  descr: e.target.value
                })
              }}
            />
          </div>
        </div>

        <div style={{ padding: 15 }}>
          <div className="card">
            <FileUpload
              name="image[]"
              url={'/api/upload'}
              multiple
              accept="image/*"
              onSelect={async (e) => {
                !isFormChanged && setIsFormChanged(true)
                let filesArray = Array.from(e.files);
                let files = await Promise.all(filesArray.map(async file => await base64Converter(file)));
                setSelectedImage({
                  ...selectedImage,
                  files: files
                });
              }}
              headerTemplate={headerTemplate}
              cancelLabel='Clear All'
              emptyTemplate={<p className="m-0">Drag and drop files to here to upload.</p>}
            />
          </div>
        </div>
      </Dialog>

    </>
  );
}

export default Main