import { useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
    useListSessionAttendanceQuery,
    useBulkUpdateAttendanceMutation,
    type ClassSessionRead,
    type AttendanceBulkItem,
} from "../../../../../../store/admin/api";
import { useAlert } from "../../../../../../components/Alert/AlertContext";
import { ATTENDANCE_STATUS } from "../../../../../../constants/constants";

type AttendanceStatus = "PRESENT" | "ABSENT" | "EXCUSED" | "MAKEUP";

export const useManageSessionAttendance = (classSession: ClassSessionRead, isOpen: boolean) => {
    const { t } = useTranslation("common");
    const { publish } = useAlert();

    const { data: attendanceList = [], isLoading: isLoadingAttendance } = useListSessionAttendanceQuery(
        classSession.id,
        { skip: !isOpen },
    );

    const [bulkUpdateAttendance, { isLoading: isSaving }] = useBulkUpdateAttendanceMutation();

    const [attendanceData, setAttendanceData] = useState<
        Record<string, { status: AttendanceStatus; isMakeup: boolean }>
    >({});

    useEffect(() => {
        if (attendanceList.length > 0) {
            const initialData: Record<string, { status: AttendanceStatus; isMakeup: boolean }> = {};
            attendanceList.forEach((item) => {
                if (item.status) {
                    initialData[item.studentId] = {
                        status: item.status as AttendanceStatus,
                        isMakeup: item.isMakeup ?? false,
                    };
                } else {
                    initialData[item.studentId] = {
                        status: ATTENDANCE_STATUS.ABSENT,
                        isMakeup: false,
                    };
                }
            });
            setAttendanceData(initialData);
        }
    }, [attendanceList]);

    const handleStatusChange = useCallback((studentId: string, status: AttendanceStatus) => {
        setAttendanceData((prev) => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                status,
            },
        }));
    }, []);

    const handleMakeupToggle = useCallback((studentId: string) => {
        setAttendanceData((prev) => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                isMakeup: !prev[studentId]?.isMakeup,
            },
        }));
    }, []);

    const handleSave = useCallback(
        async (onClose: () => void) => {
            const items: AttendanceBulkItem[] = attendanceList.map((item) => ({
                studentId: item.studentId,
                status: attendanceData[item.studentId]?.status || ATTENDANCE_STATUS.ABSENT,
                isMakeup: attendanceData[item.studentId]?.isMakeup || false,
            }));

            try {
                await bulkUpdateAttendance({
                    sessionId: classSession.id,
                    data: { items },
                }).unwrap();
                publish(t("admin.attendanceUpdateSuccess"), "success");
                onClose();
            } catch {
                publish(t("admin.attendanceUpdateError"), "error");
            }
        },
        [attendanceData, attendanceList, classSession.id, bulkUpdateAttendance, publish, t],
    );

    const getAttendanceData = useCallback(
        (studentId: string) => {
            return (
                attendanceData[studentId] || {
                    status:
                        (attendanceList.find((item) => item.studentId === studentId)?.status as AttendanceStatus) ||
                        ATTENDANCE_STATUS.ABSENT,
                    isMakeup: attendanceList.find((item) => item.studentId === studentId)?.isMakeup ?? false,
                }
            );
        },
        [attendanceData, attendanceList],
    );

    return {
        attendanceList,
        isLoadingAttendance,
        isSaving,
        handleStatusChange,
        handleMakeupToggle,
        handleSave,
        getAttendanceData,
    };
};
