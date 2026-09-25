import React, { useEffect } from 'react'
import { Outlet, useLocation, } from "react-router-dom";
import { ConfirmDialog } from 'primereact/confirmdialog';
import { Header, Loader, usePrompt } from '@igblsln/control';
import {
    selectSettingIsDirty,
    selectSettingsData,
    saveFilterSetting,
    selectIsUpdateNeeded,
    selectPromptNavigate,
    changeUpdated,
    useAppDispatch,
    useAppSelector,
    useSaveSettingsMutation,
    useSettingsQuery,
    useAuth,
    setPromptNavigate
} from '@igblsln/store';
import modules from '../modules';

type Props = {}

const Layout = (props: Props) => {

    const dispatch = useAppDispatch();
    const auth = useAuth()
    const location = useLocation();
    const { isLoading } = useSettingsQuery("admin");
    const [saveSetting] = useSaveSettingsMutation();
    const promptNavigate = useAppSelector(selectPromptNavigate);
    const isDirty = useAppSelector(selectSettingIsDirty);
    const isUpdateNeeded = useAppSelector(selectIsUpdateNeeded);
    const settings = useAppSelector(selectSettingsData);

    useEffect(() => {
        if (isDirty) {
            dispatch(saveFilterSetting());
        }
    }, [dispatch, location, isDirty])

    useEffect(() => {
        (async () => {
            if (isUpdateNeeded) {
                await saveSetting({ username: 'admin', settings });
                dispatch(changeUpdated());
            }
        })();
    }, [dispatch, isUpdateNeeded, saveSetting, settings])

    usePrompt('Are you sure you want to leave?', promptNavigate, () => {
        dispatch(setPromptNavigate({ promptNavigate: false}));
    });

    return (
        <div className="App">
            <Header routes={modules} user={auth?.user} />
            <ConfirmDialog />
            {isLoading && <Loader />}
            {!isLoading && <React.Suspense fallback={<Loader />}>
                <Outlet />
            </React.Suspense>}
        </div>
    )
}

export default Layout;