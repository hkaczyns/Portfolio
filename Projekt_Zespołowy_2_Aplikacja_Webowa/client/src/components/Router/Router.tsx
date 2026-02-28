import { Suspense, lazy } from "react";
import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import {
    selectIsAuthenticated,
    selectIsNotVerified,
    selectIsAdmin,
    selectIsStudent,
    selectIsInstructor,
} from "../../store/auth/selectors";
import { useAppSelector } from "../../store/store";
import { LoginPage } from "../../pages/LoginPage/LoginPage";
import { Layout } from "../Layout/Layout";
import { RegisterPage } from "../../pages/RegisterPage/RegisterPage";
import { AuthenticatedLayout } from "../AuthenticatedLayout/AuthenticatedLayout";
import { HomePage } from "../../pages/HomePage/HomePage";
import { VerificationStartedPage } from "../../pages/VerificationStartedPage/VerificationStartedPage";
import { VerificationPage } from "../../pages/VerificationPage/VerificationPage";
import { ForgotPasswordPage } from "../../pages/ForgotPasswordPage/ForgotPasswordPage";
import { ResetPasswordPage } from "../../pages/ResetPasswordPage/ResetPasswordPage";
import { AccountPage } from "../../pages/AccountPage/AccountPage";
import { AdminPanelPage } from "../../pages/AdminPanelPage/AdminPanelPage";
import { PrivacyPolicyPage } from "../../pages/PrivacyPolicyPage/PrivacyPolicyPage";
import { TermsOfServicePage } from "../../pages/CookiePolicyPage/CookiePolicyPage";
import { ContactPage } from "../../pages/ContactPage/ContactPage";
import { RoomRentalPage } from "../../pages/RoomRentalPage/RoomRentalPage";
import { PublicCalendarPage } from "../../pages/PublicCalendarPage/PublicCalendarPage";
import { InstructorCalendarPage } from "../../pages/InstructorCalendarPage/InstructorCalendarPage";
import { AttendanceManagementPage } from "../../pages/AttendanceManagementPage/AttendanceManagementPage";
import { BillingPage } from "../../pages/BillingPage/BillingPage";
import { DashboardPage } from "../../pages/DashboardPage/DashboardPage";
import { MySchedulePage } from "../../pages/MySchedulePage/MySchedulePage";
import { AttendancePage } from "../../pages/AttendancePage/AttendancePage";

const CalendarPage = lazy(() =>
    import("../../pages/CalendarPage/CalendarPage").then((module) => ({ default: module.CalendarPage })),
);

const RequireAuth = () => {
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

const RequireNotVerified = () => {
    const isNotVerified = useAppSelector(selectIsNotVerified);
    return isNotVerified ? <Outlet /> : <Navigate to="/login" />;
};

const RequireGuest = () => {
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    return !isAuthenticated ? <Outlet /> : <Navigate to="/account" />;
};

const RequireAdmin = () => {
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const isAdmin = useAppSelector(selectIsAdmin);
    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }
    if (!isAdmin) {
        return <Navigate to="/account" />;
    }
    return <Outlet />;
};

const RequireStudent = () => {
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const isStudent = useAppSelector(selectIsStudent);
    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }
    if (!isStudent) {
        return <Navigate to="/account" />;
    }
    return <Outlet />;
};

const RequireInstructor = () => {
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const isInstructor = useAppSelector(selectIsInstructor);
    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }
    if (!isInstructor) {
        return <Navigate to="/account" />;
    }
    return <Outlet />;
};

export const Router = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<Layout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                    <Route path="/terms-of-service" element={<TermsOfServicePage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/room-rental" element={<RoomRentalPage />} />
                    <Route
                        path="/calendar"
                        element={
                            <Suspense fallback={<div>Ładowanie...</div>}>
                                <PublicCalendarPage />
                            </Suspense>
                        }
                    />
                    <Route element={<RequireGuest />}>
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    </Route>
                    <Route element={<RequireNotVerified />}>
                        <Route path="/verification" element={<VerificationStartedPage />} />
                    </Route>
                    <Route path="/verification/:verificationToken" element={<VerificationPage />} />
                    <Route path="/reset-password/:resetToken" element={<ResetPasswordPage />} />
                </Route>
                <Route element={<RequireAuth />}>
                    <Route element={<AuthenticatedLayout />}>
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route element={<RequireStudent />}>
                            <Route
                                path="/classes"
                                element={
                                    <Suspense fallback={<div>Ładowanie...</div>}>
                                        <CalendarPage />
                                    </Suspense>
                                }
                            />
                            <Route path="/my-schedule" element={<MySchedulePage />} />
                            <Route path="/billing" element={<BillingPage />} />
                            <Route path="/attendance" element={<AttendancePage />} />
                        </Route>
                        <Route element={<RequireInstructor />}>
                            <Route path="/my-classes" element={<InstructorCalendarPage />} />
                            <Route path="/attendance/:sessionId" element={<AttendanceManagementPage />} />
                        </Route>
                        <Route path="/account" element={<AccountPage />} />
                        <Route element={<RequireAdmin />}>
                            <Route path="/admin" element={<AdminPanelPage />} />
                        </Route>
                    </Route>
                </Route>
            </Routes>
        </BrowserRouter>
    );
};
