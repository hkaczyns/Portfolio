import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Spinner } from "../../../../../components/Spinner/Spinner";
import { SECONDARY_TEXT_COLOR } from "../../../../../constants/constants";
import type { ChargeRead } from "../../../../../store/admin/api";
import styles from "../../ScheduleManagement/modals/Modal.module.css";

interface DeleteChargeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    isLoading: boolean;
    charge: ChargeRead;
}

export const DeleteChargeModal = ({ isOpen, onClose, onConfirm, isLoading, charge }: DeleteChargeModalProps) => {
    const { t } = useTranslation("common");

    return (
        <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <Dialog.Portal>
                <Dialog.Overlay className={styles.overlay} />
                <Dialog.Content className={styles.content}>
                    <div className={styles.modal}>
                        <div className={styles.header}>
                            <Dialog.Title className={styles.title}>{t("admin.cancelCharge")}</Dialog.Title>
                            <Dialog.Close className={styles.headerCloseButton} asChild>
                                <button>
                                    <X size={20} />
                                </button>
                            </Dialog.Close>
                        </div>
                        <div className={styles.description}>
                            {t("admin.chargeCancelConfirm", {
                                amount: parseFloat(charge.amountDue).toFixed(2),
                                date: new Date(charge.dueDate).toLocaleDateString(),
                            })}
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
                                onClick={onConfirm}
                                disabled={isLoading}
                            >
                                {isLoading ? <Spinner color={SECONDARY_TEXT_COLOR} /> : t("admin.cancel")}
                            </button>
                        </div>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};
