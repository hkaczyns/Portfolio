import type { UserResponse } from "../store/auth/types";

export const formatStudentName = (student: UserResponse | undefined): string => {
    if (!student) return "";
    const fullName = `${student.firstName || ""} ${student.lastName || ""}`.trim();
    return fullName || student.email || "";
};

export const getStudentNameById = (studentId: string, students: UserResponse[]): string => {
    const student = students.find((s) => s.id === studentId);
    return formatStudentName(student) || studentId;
};
