'use client';

import { useSnackbar } from 'notistack';

export const useNotifications = () => {
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    const showSuccess = (message: string) => {
        enqueueSnackbar(message, { variant: 'success' });
    };

    const showError = (message: string) => {
        enqueueSnackbar(message, { variant: 'error' });
    };

    const showWarning = (message: string) => {
        enqueueSnackbar(message, { variant: 'warning' });
    };

    const showInfo = (message: string) => {
        enqueueSnackbar(message, { variant: 'info' });
    };

    return {
        showSuccess,
        showError,
        showWarning,
        showInfo,
        closeSnackbar,
    };
}; 