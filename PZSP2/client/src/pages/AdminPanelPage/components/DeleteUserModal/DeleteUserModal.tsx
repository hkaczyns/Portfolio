import * as Dialog from "@radix-ui/react-dialog";
import { AlertTriangle, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import styles from "./DeleteUserModal.module.css";

export interface DeleteUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    userName: string;
    isLoading: boolean;
}

export const DeleteUserModal = ({ isOpen, onClose, onConfirm, userName, isLoading }: DeleteUserModalProps) => {
    const { t } = useTranslation("common");

    const handleConfirm = async () => {
        await onConfirm();
    };

    return (
        <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <Dialog.Portal>
                <Dialog.Overlay className={styles.overlay} />
                <Dialog.Content className={styles.content}>
                    <div className={styles.modal}>
                        <div className={styles.header}>
                            <Dialog.Title className={styles.title}>{t("admin.deleteUser")}</Dialog.Title>
                            <Dialog.Close className={styles.headerCloseButton} asChild>
                                <button disabled={isLoading}>
                                    <X size={20} />
                                </button>
                            </Dialog.Close>
                        </div>
                        <Dialog.Description className={styles.description}>
                            {t("admin.deleteUserMessage", { userName })}
                        </Dialog.Description>
                        <div className={styles.warning}>
                            <AlertTriangle size={20} className={styles.warningIcon} />
                            <span>{t("admin.deleteUserWarning")}</span>
                        </div>
                        <div className={styles.actions}>
                            <Dialog.Close asChild>
                                <button type="button" className={styles.cancelButton} disabled={isLoading}>
                                    {t("account.cancel")}
                                </button>
                            </Dialog.Close>
                            <button
                                type="button"
                                className={styles.deleteButton}
                                onClick={handleConfirm}
                                disabled={isLoading}
                            >
                                {isLoading ? t("admin.deleting") : t("admin.delete")}
                            </button>
                        </div>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};
