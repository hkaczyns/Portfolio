import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useListUsersQuery } from "../store/admin/api";
import { UserRole } from "../store/auth/types";
import { formatStudentName } from "../utils/studentUtils";

interface UseStudentSearchOptions {
    excludeIds?: Set<string>;
    allowAll?: boolean;
}

export const useStudentSearch = (options: UseStudentSearchOptions = {}) => {
    const { excludeIds, allowAll = false } = options;
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const { data: students = [], isLoading } = useListUsersQuery({
        role: UserRole.STUDENT,
    });

    const availableStudents = useMemo(() => {
        if (excludeIds) {
            return students.filter((s) => !excludeIds.has(s.id));
        }
        return students;
    }, [students, excludeIds]);

    const filteredStudents = useMemo(() => {
        if (!searchQuery.trim()) {
            return availableStudents;
        }
        const query = searchQuery.toLowerCase().trim();
        return availableStudents.filter((student) => {
            const firstName = (student.firstName || "").toLowerCase();
            const lastName = (student.lastName || "").toLowerCase();
            const email = (student.email || "").toLowerCase();
            const fullName = `${firstName} ${lastName}`.trim();
            return (
                fullName.includes(query) ||
                firstName.includes(query) ||
                lastName.includes(query) ||
                email.includes(query)
            );
        });
    }, [availableStudents, searchQuery]);

    const handleClickOutside = useCallback(
        (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                inputRef.current &&
                !inputRef.current.contains(event.target as Node)
            ) {
                setIsDropdownOpen(false);
            }
        },
        [setIsDropdownOpen],
    );

    useEffect(() => {
        if (isDropdownOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [isDropdownOpen, handleClickOutside]);

    const handleSearchChange = useCallback((value: string) => {
        setSearchQuery(value);
        setIsDropdownOpen(true);
    }, []);

    const reset = useCallback(() => {
        setSearchQuery("");
        setIsDropdownOpen(false);
    }, []);

    const getStudentName = useCallback(
        (studentId: string) => {
            const student =
                availableStudents.find((s) => s.id === studentId) || students.find((s) => s.id === studentId);
            return formatStudentName(student) || studentId;
        },
        [availableStudents, students],
    );

    return {
        searchQuery,
        setSearchQuery,
        isDropdownOpen,
        setIsDropdownOpen,
        filteredStudents,
        availableStudents,
        isLoading,
        dropdownRef,
        inputRef,
        handleSearchChange,
        reset,
        getStudentName,
        showAllOption: allowAll,
    };
};
