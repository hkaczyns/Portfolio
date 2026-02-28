import { renderHook, act } from "@testing-library/react";
import { useStudentSearch } from "./useStudentSearch";
import * as adminApi from "../store/admin/api";
import { UserRole } from "../store/auth/types";

jest.mock("../store/admin/api");

describe("useStudentSearch", () => {
    const mockStudents = [
        {
            id: "1",
            firstName: "John",
            lastName: "Doe",
            email: "john@example.com",
            isActive: true,
            isSuperuser: false,
            isVerified: true,
            role: UserRole.STUDENT,
        },
        {
            id: "2",
            firstName: "Jane",
            lastName: "Smith",
            email: "jane@example.com",
            isActive: true,
            isSuperuser: false,
            isVerified: true,
            role: UserRole.STUDENT,
        },
        {
            id: "3",
            firstName: "Bob",
            lastName: "Johnson",
            email: "bob@example.com",
            isActive: true,
            isSuperuser: false,
            isVerified: true,
            role: UserRole.STUDENT,
        },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(adminApi.useListUsersQuery).mockReturnValue({
            data: mockStudents,
            isLoading: false,
            isError: false,
            error: undefined,
            refetch: jest.fn(),
        } as any);
    });

    it("should return all students when no search query", () => {
        const { result } = renderHook(() => useStudentSearch());

        expect(result.current.filteredStudents).toHaveLength(3);
        expect(result.current.searchQuery).toBe("");
        expect(result.current.isDropdownOpen).toBe(false);
    });

    it("should filter students by name", () => {
        const { result } = renderHook(() => useStudentSearch());

        act(() => {
            result.current.handleSearchChange("John");
        });

        expect(result.current.filteredStudents).toHaveLength(2);
        expect(result.current.filteredStudents[0].firstName).toBe("John");
        expect(result.current.filteredStudents[1].firstName).toBe("Bob");
    });

    it("should filter students by email", () => {
        const { result } = renderHook(() => useStudentSearch());

        act(() => {
            result.current.handleSearchChange("jane@example.com");
        });

        expect(result.current.filteredStudents).toHaveLength(1);
        expect(result.current.filteredStudents[0].email).toBe("jane@example.com");
    });

    it("should exclude students by IDs", () => {
        const excludeIds = new Set(["1", "2"]);
        const { result } = renderHook(() => useStudentSearch({ excludeIds }));

        expect(result.current.availableStudents).toHaveLength(1);
        expect(result.current.availableStudents[0].id).toBe("3");
    });

    it("should open dropdown when search changes", () => {
        const { result } = renderHook(() => useStudentSearch());

        act(() => {
            result.current.handleSearchChange("test");
        });

        expect(result.current.isDropdownOpen).toBe(true);
    });

    it("should reset search query and close dropdown", () => {
        const { result } = renderHook(() => useStudentSearch());

        act(() => {
            result.current.handleSearchChange("test");
        });

        expect(result.current.searchQuery).toBe("test");
        expect(result.current.isDropdownOpen).toBe(true);

        act(() => {
            result.current.reset();
        });

        expect(result.current.searchQuery).toBe("");
        expect(result.current.isDropdownOpen).toBe(false);
    });

    it("should get student name by ID", () => {
        const { result } = renderHook(() => useStudentSearch());

        const name = result.current.getStudentName("1");
        expect(name).toBe("John Doe");
    });

    it("should return studentId when student not found", () => {
        const { result } = renderHook(() => useStudentSearch());

        const name = result.current.getStudentName("999");
        expect(name).toBe("999");
    });

    it("should return showAllOption when allowAll is true", () => {
        const { result } = renderHook(() => useStudentSearch({ allowAll: true }));

        expect(result.current.showAllOption).toBe(true);
    });
});
