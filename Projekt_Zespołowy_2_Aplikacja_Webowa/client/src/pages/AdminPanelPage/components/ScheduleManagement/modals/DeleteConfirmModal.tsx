import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Spinner } from "../../../../../components/Spinner/Spinner";
import { SECONDARY_TEXT_COLOR } from "../../../../../constants/constants";
import styles from "./Modal.module.css";

interface DeleteConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    isLoading: boolean;
    title: string;
    message: string;
}

export const DeleteConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    isLoading,
    title,
    message,
}: DeleteConfirmModalProps) => {
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
                            <Dialog.Title className={styles.title}>{title}</Dialog.Title>
                            <Dialog.Close className={styles.headerCloseButton} asChild>
                                <button>
                                    <X size={20} />
                                </button>
                            </Dialog.Close>
                        </div>
                        <Dialog.Description className={styles.description}>{message}</Dialog.Description>
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
                                {isLoading ? <Spinner color={SECONDARY_TEXT_COLOR} /> : t("admin.delete")}
                            </button>
                        </div>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};
