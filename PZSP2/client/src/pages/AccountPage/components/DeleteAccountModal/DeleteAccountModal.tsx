import * as Dialog from "@radix-ui/react-dialog";
import { Mail, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import styles from "./DeleteAccountModal.module.css";

const ADMIN_EMAIL = "admin@example.com";

export interface DeleteAccountModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const DeleteAccountModal = ({ isOpen, onClose }: DeleteAccountModalProps) => {
    const { t } = useTranslation("common");

    return (
        <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <Dialog.Portal>
                <Dialog.Overlay className={styles.overlay} />
                <Dialog.Content className={styles.content}>
                    <div className={styles.modal}>
                        <div className={styles.header}>
                            <Dialog.Title className={styles.title}>{t("account.deleteAccount")}</Dialog.Title>
                            <Dialog.Close className={styles.headerCloseButton} asChild>
                                <button>
                                    <X size={20} />
                                </button>
                            </Dialog.Close>
                        </div>
                        <Dialog.Description className={styles.description}>
                            {t("account.deleteAccountMessage")}
                        </Dialog.Description>
                        <div className={styles.body}>
                            <p className={styles.messageSend}>{t("account.deleteAccountMessageSend")}</p>
                            <div className={styles.contactInfo}>
                                <Mail size={20} className={styles.icon} />
                                <a href={`mailto:${ADMIN_EMAIL}`} className={styles.emailLink}>
                                    {ADMIN_EMAIL}
                                </a>
                            </div>
                            <div className={styles.actions}>
                                <Dialog.Close asChild>
                                    <button type="button" className={styles.closeButton}>
                                        {t("account.close")}
                                    </button>
                                </Dialog.Close>
                            </div>
                        </div>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};
