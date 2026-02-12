import { useState, useCallback } from 'react';
import { DialogConfig } from '@/lib/types';

export function useDialog() {
    const [dialogConfig, setDialogConfig] = useState<DialogConfig | null>(null);

    const openDialog = useCallback((config: DialogConfig) => {
        setDialogConfig(config);
    }, []);

    const closeDialog = useCallback(() => {
        setDialogConfig(null);
    }, []);

    return {
        dialogConfig,
        openDialog,
        closeDialog
    };
}
