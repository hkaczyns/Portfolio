import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AttendanceManagement } from "./AttendanceManagement";

jest.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

jest.mock("./tabs/SessionsAttendanceTab", () => ({
    SessionsAttendanceTab: () => <div>Sessions Attendance Tab</div>,
}));

jest.mock("./tabs/GroupsAttendanceTab", () => ({
    GroupsAttendanceTab: () => <div>Groups Attendance Tab</div>,
}));

jest.mock("./tabs/StudentsAttendanceTab", () => ({
    StudentsAttendanceTab: () => <div>Students Attendance Tab</div>,
}));

describe("AttendanceManagement", () => {
    it("should render attendance management", () => {
        render(<AttendanceManagement />);

        expect(screen.getByText("admin.attendanceManagement")).toBeInTheDocument();
    });

    it("should render default tab (sessions)", () => {
        render(<AttendanceManagement />);

        expect(screen.getByText("Sessions Attendance Tab")).toBeInTheDocument();
    });

    it("should switch to groups tab", async () => {
        render(<AttendanceManagement />);

        const groupsTab = screen.getByText("admin.attendanceByGroup");
        await userEvent.click(groupsTab);

        expect(screen.getByText("Groups Attendance Tab")).toBeInTheDocument();
    });

    it("should switch to students tab", async () => {
        render(<AttendanceManagement />);

        const studentsTab = screen.getByText("admin.attendanceByStudent");
        await userEvent.click(studentsTab);

        expect(screen.getByText("Students Attendance Tab")).toBeInTheDocument();
    });
});
