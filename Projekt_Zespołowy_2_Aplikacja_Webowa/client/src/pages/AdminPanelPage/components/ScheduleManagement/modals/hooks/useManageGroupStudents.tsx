import { useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
    useListEnrollmentsQuery,
    useCreateEnrollmentMutation,
    useDeleteEnrollmentMutation,
    useListUsersQuery,
    type EnrollmentRead,
    type ClassGroupRead,
} from "../../../../../../store/admin/api";
import { UserRole } from "../../../../../../store/auth/types";
import { useAlert } from "../../../../../../components/Alert/AlertContext";
import { getStudentNameById } from "../../../../../../utils/studentUtils";
import { ENROLLMENT_STATUS } from "../../../../../../constants/constants";

export const useManageGroupStudents = (classGroup: ClassGroupRead) => {
    const { t } = useTranslation("common");
    const { publish } = useAlert();
    const [selectedStudentId, setSelectedStudentId] = useState<string>("");

    const { data: enrollments = [], isLoading: isLoadingEnrollments } = useListEnrollmentsQuery({
        classGroupId: classGroup.id,
    });

    const { data: students = [], isLoading: isLoadingStudents } = useListUsersQuery({
        role: UserRole.STUDENT,
    });

    const enrolledStudentIds = useMemo(() => new Set(enrollments.map((e) => e.studentId)), [enrollments]);

    const [createEnrollment, { isLoading: isCreating }] = useCreateEnrollmentMutation();
    const [deleteEnrollment, { isLoading: isDeleting }] = useDeleteEnrollmentMutation();

    const handleAddStudent = useCallback(async () => {
        if (!selectedStudentId) return;
        try {
            await createEnrollment({
                studentId: selectedStudentId,
                classGroupId: classGroup.id,
            }).unwrap();
            publish(t("admin.enrollmentCreateSuccess"), "success");
            setSelectedStudentId("");
        } catch {
            publish(t("admin.enrollmentCreateError"), "error");
        }
    }, [selectedStudentId, classGroup.id, createEnrollment, publish, t]);

    const handleRemoveStudent = useCallback(
        async (enrollment: EnrollmentRead) => {
            try {
                await deleteEnrollment(enrollment.id).unwrap();
                publish(t("admin.enrollmentDeleteSuccess"), "success");
            } catch {
                publish(t("admin.enrollmentDeleteError"), "error");
            }
        },
        [deleteEnrollment, publish, t],
    );

    const getStatusLabel = useCallback(
        (status: string) => {
            switch (status) {
                case ENROLLMENT_STATUS.ACTIVE:
                    return t("admin.enrollmentStatusActive");
                case ENROLLMENT_STATUS.WAITLISTED:
                    return t("admin.enrollmentStatusWaitlisted");
                case ENROLLMENT_STATUS.CANCELLED:
                    return t("admin.enrollmentStatusCancelled");
                case ENROLLMENT_STATUS.COMPLETED:
                    return t("admin.enrollmentStatusCompleted");
                default:
                    return status;
            }
        },
        [t],
    );

    const getStudentName = useCallback((studentId: string) => getStudentNameById(studentId, students), [students]);

    return {
        enrollments,
        isLoading: isLoadingEnrollments || isLoadingStudents,
        selectedStudentId,
        setSelectedStudentId,
        enrolledStudentIds,
        isCreating,
        isDeleting,
        handleAddStudent,
        handleRemoveStudent,
        getStudentName,
        getStatusLabel,
    };
};
