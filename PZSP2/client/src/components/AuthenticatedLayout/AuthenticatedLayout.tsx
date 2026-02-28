import { useCallback, useState } from "react";
import { Outlet } from "react-router-dom";
import styles from "./AuthenticatedLayout.module.css";
import { Footer } from "../Footer/Footer";
import { Sidebar } from "../Sidebar/Sidebar";

export const AuthenticatedLayout = () => {
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

    const toggleSidebar = useCallback(() => {
        setIsSidebarExpanded((prev) => !prev);
    }, []);

    return (
        <div className={styles.layoutWrapper}>
            <Sidebar isExpanded={isSidebarExpanded} onToggle={toggleSidebar} />
            <main className={styles.mainSection}>
                <Outlet />
            </main>
            <footer className={styles.footerContainer}>
                <Footer />
            </footer>
        </div>
    );
};
