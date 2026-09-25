import React, { useRef, useContext, useCallback } from "react";
import { Toast } from 'primereact/toast';

export type ToastContextType = {
    showSuccess: (title: string, msg: string) => void;
    showError: (title: string, msg: string) => void;
};

const ToastContext = React.createContext<ToastContextType>({
    showSuccess: () => {},
    showError: () => {}
});

type Props = {
    children: any;
}

const ToastProvider = ({ children }: Props) => {
    const toast = useRef<Toast>(null);

    const showError = useCallback(
        (title: string, msg: string) => {
            toast?.current?.show({ severity: 'error', summary: title, detail: msg, life: 3000 });
        },
        [toast]
    );

    const showSuccess = useCallback(
        (title: string, msg: string) => {
            toast?.current?.show({ severity: 'success', summary: title, detail: msg, life: 3000 });
        },
        [toast]
    );

    return (
        <ToastContext.Provider
            value={{
                showSuccess,
                showError
            }}
        >
            <Toast baseZIndex={5656} ref={toast} />
            {children}
        </ToastContext.Provider>
    );
};

const useToast = () => {
    const toastHelpers = useContext(ToastContext);

    return toastHelpers;
};

export { ToastContext, useToast };
export default ToastProvider;
