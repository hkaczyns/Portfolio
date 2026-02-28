import { Outlet } from "react-router-dom";
import styles from "./Layout.module.css";
import { Header } from "../Header/Header";
import { Footer } from "../Footer/Footer";
import { CookieConsent } from "../CookieConsent/CookieConsent";

export const Layout = () => {
    return (
        <div className={styles.layoutWrapper}>
            <header className={styles.headerContainer}>
                <Header />
            </header>
            <main className={styles.mainSection}>
                <Outlet />
            </main>
            <footer className={styles.footerContainer}>
                <Footer />
            </footer>
            <CookieConsent />
        </div>
    );
};
