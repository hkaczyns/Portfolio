import { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { CreditCard, Receipt, Link } from "lucide-react";
import { PAYMENTS_TAB } from "../../../../constants/constants";
import { PaymentsTab } from "./tabs/PaymentsTab";
import { ChargesTab } from "./tabs/ChargesTab";
import { AllocationsTab } from "./tabs/AllocationsTab";
import styles from "./PaymentsManagement.module.css";

type ActiveTab = "payments" | "charges" | "allocations";

interface TabConfig {
    id: ActiveTab;
    label: string;
    icon: React.ReactNode;
}

export const PaymentsManagement = () => {
    const { t } = useTranslation("common");
    const [activeTab, setActiveTab] = useState<ActiveTab>(PAYMENTS_TAB.PAYMENTS);

    const tabs: TabConfig[] = useMemo(
        () => [
            { id: PAYMENTS_TAB.PAYMENTS, label: t("admin.payments"), icon: <CreditCard size={20} /> },
            { id: PAYMENTS_TAB.CHARGES, label: t("admin.charges"), icon: <Receipt size={20} /> },
            { id: PAYMENTS_TAB.ALLOCATIONS, label: t("admin.allocations"), icon: <Link size={20} /> },
        ],
        [t],
    );

    const renderTabContent = useMemo(() => {
        switch (activeTab) {
            case PAYMENTS_TAB.PAYMENTS:
                return <PaymentsTab />;
            case PAYMENTS_TAB.CHARGES:
                return <ChargesTab />;
            case PAYMENTS_TAB.ALLOCATIONS:
                return <AllocationsTab />;
            default:
                return null;
        }
    }, [activeTab]);

    const handleTabChange = useCallback((tabId: ActiveTab) => {
        setActiveTab(tabId);
    }, []);

    return (
        <div className={styles.section}>
            <div className={styles.header}>
                <h2 className={styles.title}>{t("admin.paymentsManagement")}</h2>
            </div>

            <div className={styles.tabs}>
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ""}`}
                        onClick={() => handleTabChange(tab.id)}
                    >
                        {tab.icon}
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            <div className={styles.tabContent}>{renderTabContent}</div>
        </div>
    );
};
