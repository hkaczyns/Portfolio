import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { ManageGroupStudentsModal } from "./ManageGroupStudentsModal";
import * as useManageGroupStudents from "./hooks/useManageGroupStudents";
import { adminApi } from "../../../../../store/admin/api";
import authReducer from "../../../../../store/auth/slice";
import { authApi } from "../../../../../store/auth/api";

jest.mock("./hooks/useManageGroupStudents");

const createMockStore = () => {
    return configureStore({
        reducer: {
            auth: authReducer,
            [authApi.reducerPath]: authApi.reducer,
            [adminApi.reducerPath]: adminApi.reducer,
        },
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({
                serializableCheck: {
                    ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
                },
            }).concat(authApi.middleware, adminApi.middleware),
    });
};
jest.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

jest.mock("@radix-ui/react-dialog", () => ({
    Root: ({ children, open }: any) => (
        <div data-testid="dialog-root" data-open={open}>
            {open && children}
        </div>
    ),
    Portal: ({ children }: any) => <div>{children}</div>,
    Overlay: () => <div data-testid="dialog-overlay" />,
    Content: ({ children }: any) => <div data-testid="dialog-content">{children}</div>,
    Title: ({ children }: any) => <h2>{children}</h2>,
    Close: ({ children, asChild }: any) => (asChild ? children : <button>{children}</button>),
}));

describe("ManageGroupStudentsModal", () => {
    const mockOnClose = jest.fn();
    const mockClassGroup = {
        id: 1,
        name: "Test Group",
        semesterId: 1,
        levelId: 1,
        topicId: 1,
        roomId: null,
        capacity: 20,
        dayOfWeek: 1,
        startTime: "10:00",
        endTime: "11:00",
        instructorId: null,
        isPublic: true,
        status: "active",
        description: null,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
    };

    const mockEnrollments = [
        {
            id: 1,
            studentId: "1",
            classGroupId: 1,
            status: "ACTIVE",
            joinedAt: "2024-01-01",
            cancelledAt: null,
        },
    ];

    const mockUseManageGroupStudents = {
        enrollments: mockEnrollments,
        isLoading: false,
        selectedStudentId: "",
        setSelectedStudentId: jest.fn(),
        enrolledStudentIds: new Set(["1"]),
        isCreating: false,
        isDeleting: false,
        handleAddStudent: jest.fn(),
        handleRemoveStudent: jest.fn(),
        getStudentName: jest.fn((id: string) => `Student ${id}`),
        getStatusLabel: jest.fn((status: string) => status),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(useManageGroupStudents.useManageGroupStudents).mockReturnValue(mockUseManageGroupStudents as any);
    });

    it("should render modal when open", () => {
        const store = createMockStore();
        render(
            <Provider store={store}>
                <ManageGroupStudentsModal isOpen={true} onClose={mockOnClose} classGroup={mockClassGroup} />
            </Provider>,
        );

        expect(screen.getByText(/admin\.manageGroupStudents|manageGroupStudents/i)).toBeInTheDocument();
        expect(screen.getByText(/Test Group|admin\.classGroup/i)).toBeInTheDocument();
    });

    it("should show loading state", () => {
        jest.mocked(useManageGroupStudents.useManageGroupStudents).mockReturnValue({
            ...mockUseManageGroupStudents,
            isLoading: true,
        } as any);

        const store = createMockStore();
        render(
            <Provider store={store}>
                <ManageGroupStudentsModal isOpen={true} onClose={mockOnClose} classGroup={mockClassGroup} />
            </Provider>,
        );

        expect(screen.queryByText("admin.manageGroupStudents")).not.toBeInTheDocument();
    });

    it("should show empty state when no enrollments", () => {
        jest.mocked(useManageGroupStudents.useManageGroupStudents).mockReturnValue({
            ...mockUseManageGroupStudents,
            enrollments: [],
        } as any);

        const store = createMockStore();
        render(
            <Provider store={store}>
                <ManageGroupStudentsModal isOpen={true} onClose={mockOnClose} classGroup={mockClassGroup} />
            </Provider>,
        );

        expect(screen.getByText("admin.noEnrolledStudents")).toBeInTheDocument();
    });
});
