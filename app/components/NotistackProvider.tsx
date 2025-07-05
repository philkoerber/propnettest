'use client';

import { SnackbarProvider } from 'notistack';
import { ReactNode } from 'react';

interface NotistackProviderProps {
    children: ReactNode;
}

export default function NotistackProvider({ children }: NotistackProviderProps) {
    return (
        <SnackbarProvider
            maxSnack={3}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
            }}
            autoHideDuration={4000}
            preventDuplicate
        >
            {children}
        </SnackbarProvider>
    );
} 