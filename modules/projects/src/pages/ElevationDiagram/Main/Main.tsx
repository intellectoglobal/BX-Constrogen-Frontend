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
import { AFTER_API_TIME, base64Converter, getClientProps, PAGE_SIZE, setPaymentMenu, setSelectedProjectReducer, useActiveProjectQuery, useBlocksForProjectQuery } from '@igblsln/store';
import { Dialog } from 'primereact/dialog';
import { useAddProjectImageMutation, useUpdateProjectImageMutation, useDeleteProjectImageMutation, useListProjectImageQuery } from '../api';
import { useToast, EmptyRowsRenderer } from '@igblsln/control';
import { useSelector, useDispatch } from 'react-redux'

type Props = {}

const Main = (props: Props) => {

  const dispatch = useDispatch();
  const selectedProjectFromReducer = useSelector((state: any) => state?.common?.selectedProject)

  const { showError, showSuccess } = useToast()
  const { data: projects } = useActiveProjectQuery()
  const [isFormChanged, setIsFormChanged] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<any>('');

  const [selectedImage, setSelectedImage] = useState<any>({})

  const clientProps = getClientProps();

  const { data: blockData } = useBlocksForProjectQuery({
    projectId: selectedProjectFromReducer
  }, { skip: !selectedProjectFromReducer, refetchOnMountOrArgChange: true });


  const { data: imagesList, isLoading: isImagesLoading, refetch: refetchImages } = useListProjectImageQuery({
    projectId: selectedProjectFromReducer
  }, { skip: !selectedProjectFromReducer, refetchOnMountOrArgChange: true })
  const [deleteImage, { isLoading: isImageDeleting }] = useDeleteProjectImageMutation()
  const [addProjectImage, { isLoading: isAdding }] = useAddProjectImageMutation()
  const deleteImageAction = async (id: any) => {
    await deleteImage({
      id: id
    }).unwrap();
  }


  const onSubmit = async () => {
    try {
      let resp: any;
      resp = await addProjectImage({ ...selectedImage, ...clientProps, proj_key: selectedProjectFromReducer }).unwrap();
      showSuccess('Success', resp?.detail);
      setTimeout(() => {
      }, AFTER_API_TIME);
    } catch (error: any) {
      console.log(error)
      showError('An error occurred', error?.data?.detail || "We couldn't upload the image, try again!");
    }
  }

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

  useEffect(() => {
    dispatch(setPaymentMenu('project-design'));
    return () => {
      dispatch(setPaymentMenu(''));
    };
  }, [dispatch]);

  return (
    <>
      <Divider />
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
            }}
            options={projects || []}
          />

        </div>
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

      {
        selectedProjectFromReducer ?
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
              <div style={{ display: 'flex', height: '25%', alignItems: 'center', justifyContent: 'center' }}>
                <EmptyRowsRenderer msg={"No Elevation Image for Selected Project and Block"} />
              </div>
          )
          :
          <div style={{ display: 'flex', height: '50%', alignItems: 'center', justifyContent: 'center' }}>
            <EmptyRowsRenderer msg={"Select a Project to View"} />
          </div>


      }

      {
        selectedProjectFromReducer &&
        <div style={{ padding: 15 }}>
          <div className="card">
            <FileUpload
              name="image[]"
              url={'/api/upload'}
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
              customUpload
              uploadHandler={async (e) => {
                onSubmit()
              }}
              headerTemplate={headerTemplate}
              // auto
              chooseLabel='Browse'
              cancelLabel='Clear All'
              // emptyTemplate={<p className="m-0">Drag and drop files to here to upload.</p>}
              emptyTemplate={emptyTemplate}
            />
          </div>
        </div>
      }

    </>
  );
}

export default Main