import React, { useEffect, forwardRef, useImperativeHandle, useState } from 'react'
import isEqual from 'lodash/isEqual'
import { useNavigate } from 'react-router-dom'
import { Toolbar } from 'primereact/toolbar';
import { Panel } from 'primereact/panel';
import { ScrollPanel } from 'primereact/scrollpanel';
import { Button } from 'primereact/button';
import { Skeleton } from 'primereact/skeleton';
import { ProgressSpinner } from 'primereact/progressspinner';
import { BlockUI } from 'primereact/blockui';
import { confirmDialog } from 'primereact/confirmdialog';
import {
  useForm, UseFormRegister, FieldErrors,
  FieldValues, SubmitHandler, SubmitErrorHandler,
  UseFormGetValues, UseFormSetValue
} from "react-hook-form";

import ConfirmOnDirty from '../ConfirmOnDirty'

import './styles.scss';
import Loader from '../Loader';

type Props = {
  id?: string | number;
  stateValue?: any;
  isLoading?: boolean;
  isUpdating?: boolean;
  baseRoute: string;
  description?: string;
  hideHeader?: boolean;
  customDiscard?: any;
  data?: any;
  saveBtnLabel?: string;
  discardBtnLabel?: string;
  viewMode?: boolean
  disableInput?: boolean
  additionalHeader?: JSX.Element;
  bottomControl?: boolean;
  disableSaveBtn?: boolean;
  saveButton?: JSX.Element | JSX.Element[];
  isItemsTableChanged?: boolean;
  moreSubmitItems?: JSX.Element | JSX.Element[];
  dataFromLocation?: any;
  onSubmit: SubmitHandler<FieldValues>;
  onError?: SubmitErrorHandler<FieldValues>
  renderForm: (control: any, register: UseFormRegister<FieldValues>, errors: FieldErrors<FieldValues>, getValues?: any, setValue?: any) => JSX.Element
}

export const getFormErrorMessage = (errMsg?: any) => {
  return errMsg && <small className="p-error">{errMsg}</small>
};

const ManageLayout = ({
  id,
  stateValue = null,
  data,
  viewMode,
  disableInput,
  dataFromLocation,
  isLoading,
  saveBtnLabel,
  discardBtnLabel,
  disableSaveBtn = false,
  isItemsTableChanged = false,
  bottomControl = false,
  isUpdating,
  baseRoute,
  description,
  additionalHeader,
  hideHeader = false,
  customDiscard = null,
  saveButton,
  moreSubmitItems, onSubmit, onError, renderForm }: Props, selfRef: React.Ref<any>) => {
  const navigate = useNavigate();
  const [promptNavigate, setPromptNavigate] = useState(false);

  const formData = dataFromLocation || data

  const {
    control,
    formState: { errors, isDirty, dirtyFields },
    register,
    reset,
    handleSubmit,
    getValues,
    setValue
  } = useForm({ defaultValues: formData });


  const exitPage = () => {
    if (promptNavigate) {
      confirmDialog({
        message: 'Are you sure you want to discard?',
        header: 'Confirmation',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          if (customDiscard) {
            setPromptNavigate(false);
            customDiscard()
          } else {
            setPromptNavigate(false);
            setTimeout(() => {
              navigate(baseRoute, {
                state: stateValue
              })
            }, 100);
          }
        },
        reject: () => { }
      });
    }
    else {
      customDiscard ? customDiscard() : navigate(baseRoute, {
        state: stateValue
      })
    }
  }

  useEffect(() => {
    setPromptNavigate((isDirty && Object.keys(dirtyFields).length > 0) || (dataFromLocation && !isEqual(data, dataFromLocation) || isItemsTableChanged));
  }, [isDirty, dirtyFields, dataFromLocation, data, isItemsTableChanged])

  useImperativeHandle(selfRef, () => ({
    getIsDirty() {
      return isDirty
    },
    getValues() {
      return getValues()
    }
  }));

  useEffect(() => {
    if (dataFromLocation || data) {
      reset(dataFromLocation || data);
    }
  }, [dataFromLocation, data])

  if (isLoading) {
    return <div className="custom-skeleton p-4">
      <Loader />
      {/* <div>
        <Skeleton height="50px" width="30%" className="mb-2"></Skeleton>
        <Skeleton height="50px" width="50%" className="mb-2"></Skeleton>
      </div> */}
    </div>
  }

  const handleKeydown = (event: React.KeyboardEvent<HTMLFormElement>) => {
    // if (event.key === 'Enter') {
    //   event.preventDefault();
    //   event.stopPropagation();
    // }
  }

  return (
    <form className='h-full module-layout' onSubmit={handleSubmit(onSubmit, onError)} onKeyDown={handleKeydown}>
      <ConfirmOnDirty isDirty={promptNavigate} />
      <BlockUI blocked={isUpdating} template={<ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="8" fill="var(--surface-ground)" animationDuration=".5s" />}>
        <Panel className='h-full' headerTemplate={
          !hideHeader && <Toolbar
            style={{ backgroundColor: 'white', width: '100%', padding: bottomControl ? '0 1rem' : '1rem' }}
            // left={<h3>{description}/ {id ? 'Edit' : 'New'}</h3>}
            left={<div style={{ display: 'flex' }}><h3>{id ? 'Update a ' : 'Create '}{description}</h3> {additionalHeader} </div>}
            right={!bottomControl && !viewMode &&
              <React.Fragment>
                {saveButton ? saveButton : <Button id='submit' label={saveBtnLabel || 'Save'} disabled={disableSaveBtn} type="submit" style={{ paddingRight: 20 }} className="p-button-warning mr-3" />}
                <Button label={discardBtnLabel || 'Discard'} className='p-button-plain' onClick={(e) => {
                  e.preventDefault()
                  customDiscard ? customDiscard() : exitPage()
                }} />
                {/* {moreSubmitItems} */}
              </React.Fragment>
            }
          />
        }>
          <div
            style={{
              maxHeight: '99%',
              maxWidth: '99%',
              overflow: 'hidden auto',
              pointerEvents: disableInput ? 'none' : 'all'
            }}>
            {renderForm(control, register, errors, getValues, setValue)}
          </div>
          {
            bottomControl && !viewMode &&
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <React.Fragment>
                {saveButton ? saveButton : <Button id='submit' label={saveBtnLabel || 'Save'} disabled={disableSaveBtn} type="submit" style={{ paddingRight: 20 }} className="p-button-warning mr-3" />}
                <Button id='discard-btn' label={discardBtnLabel || 'Discard'} className='p-button-plain' onClick={(e) => {
                  e.preventDefault()
                  exitPage()
                }} />
                {moreSubmitItems}
              </React.Fragment>
            </div>
          }


        </Panel>
      </BlockUI>
    </form>
  )
}

export type ManageLayoutHandle = {
  getIsDirty: () => boolean;
  getValues: () => any;
};

export default forwardRef(ManageLayout)
