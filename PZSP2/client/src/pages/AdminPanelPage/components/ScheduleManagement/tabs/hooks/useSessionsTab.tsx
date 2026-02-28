import { useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
    useListClassSessionsQuery,
    useCreateClassSessionMutation,
    useUpdateClassSessionMutation,
    useDeleteClassSessionMutation,
    useCancelClassSessionMutation,
    useCompleteClassSessionMutation,
    useRescheduleClassSessionMutation,
    useListClassGroupsQuery,
    useListRoomsQuery,
    useListInstructorsQuery,
    type ClassSessionRead,
    type ClassSessionCreate,
    type ClassSessionCancel,
    type ClassSessionComplete,
    type ClassSessionReschedule,
} from "../../../../../../store/admin/api";
import { useAlert } from "../../../../../../components/Alert/AlertContext";
import { CLASS_SESSION_STATUS } from "../../../../../../constants/constants";

export const useSessionsTab = () => {
    const { t } = useTranslation("common");
    const { publish } = useAlert();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<ClassSessionRead | null>(null);
    const [deletingItem, setDeletingItem] = useState<ClassSessionRead | null>(null);
    const [cancellingItem, setCancellingItem] = useState<ClassSessionRead | null>(null);
    const [completingItem, setCompletingItem] = useState<ClassSessionRead | null>(null);
    const [reschedulingItem, setReschedulingItem] = useState<ClassSessionRead | null>(null);
    const [managingAttendanceItem, setManagingAttendanceItem] = useState<ClassSessionRead | null>(null);

    const { data: items = [], isLoading } = useListClassSessionsQuery({});
    const { data: classGroups = [] } = useListClassGroupsQuery();
    const { data: rooms = [] } = useListRoomsQuery();
    const { data: instructors = [] } = useListInstructorsQuery();
    const [createItem, { isLoading: isCreating }] = useCreateClassSessionMutation();
    const [updateItem, { isLoading: isUpdating }] = useUpdateClassSessionMutation();
    const [deleteItem, { isLoading: isDeleting }] = useDeleteClassSessionMutation();
    const [cancelItem, { isLoading: isCancelling }] = useCancelClassSessionMutation();
    const [completeItem, { isLoading: isCompleting }] = useCompleteClassSessionMutation();
    const [rescheduleItem, { isLoading: isRescheduling }] = useRescheduleClassSessionMutation();

    const handleCreate = useCallback(
        async (data: ClassSessionCreate) => {
            try {
                await createItem(data).unwrap();
                publish(t("admin.sessionCreateSuccess"), "success");
                setIsCreateModalOpen(false);
            } catch {
                publish(t("admin.sessionCreateError"), "error");
            }
        },
        [createItem, publish, t],
    );

    const handleUpdate = useCallback(
        async (data: ClassSessionCreate) => {
            if (!editingItem) return;
            try {
                await updateItem({ sessionId: editingItem.id, data }).unwrap();
                publish(t("admin.sessionUpdateSuccess"), "success");
                setEditingItem(null);
            } catch {
                publish(t("admin.sessionUpdateError"), "error");
            }
        },
        [editingItem, updateItem, publish, t],
    );

    const handleDelete = useCallback(async () => {
        if (!deletingItem) return;
        try {
            await deleteItem(deletingItem.id).unwrap();
            publish(t("admin.sessionDeleteSuccess"), "success");
            setDeletingItem(null);
        } catch {
            publish(t("admin.sessionDeleteError"), "error");
        }
    }, [deletingItem, deleteItem, publish, t]);

    const handleCancel = useCallback(
        async (data: ClassSessionCancel) => {
            if (!cancellingItem) return;
            try {
                await cancelItem({ sessionId: cancellingItem.id, data }).unwrap();
                publish(t("admin.sessionCancelSuccess"), "success");
                setCancellingItem(null);
            } catch {
                publish(t("admin.sessionCancelError"), "error");
            }
        },
        [cancellingItem, cancelItem, publish, t],
    );

    const handleComplete = useCallback(
        async (data: ClassSessionComplete) => {
            if (!completingItem) return;
            try {
                await completeItem({ sessionId: completingItem.id, data }).unwrap();
                publish(t("admin.sessionCompleteSuccess"), "success");
                setCompletingItem(null);
            } catch {
                publish(t("admin.sessionCompleteError"), "error");
            }
        },
        [completingItem, completeItem, publish, t],
    );

    const handleReschedule = useCallback(
        async (data: ClassSessionReschedule) => {
            if (!reschedulingItem) return;
            try {
                await rescheduleItem({ sessionId: reschedulingItem.id, data }).unwrap();
                publish(t("admin.sessionRescheduleSuccess"), "success");
                setReschedulingItem(null);
            } catch {
                publish(t("admin.sessionRescheduleError"), "error");
            }
        },
        [reschedulingItem, rescheduleItem, publish, t],
    );

    const getClassGroupName = useCallback(
        (id: number) => classGroups.find((cg) => cg.id === id)?.name || id,
        [classGroups],
    );
    const getRoomName = useCallback(
        (id: number | null) => (id ? rooms.find((r) => r.id === id)?.name || id : "-"),
        [rooms],
    );

    const getSessionStatusLabel = useCallback(
        (status: string) => {
            switch (status) {
                case CLASS_SESSION_STATUS.SCHEDULED:
                    return t("admin.sessionStatusScheduled");
                case CLASS_SESSION_STATUS.COMPLETED:
                    return t("admin.sessionStatusCompleted");
                case CLASS_SESSION_STATUS.CANCELLED:
                    return t("admin.sessionStatusCancelled");
                default:
                    return status;
            }
        },
        [t],
    );

    const formattedInstructors = useMemo(
        () =>
            instructors.map((i) => ({
                id: i.id,
                firstName: i.firstName || "",
                lastName: i.lastName || "",
            })),
        [instructors],
    );

    return {
        items,
        isLoading,
        classGroups,
        rooms,
        instructors: formattedInstructors,
        isCreateModalOpen,
        setIsCreateModalOpen,
        editingItem,
        setEditingItem,
        deletingItem,
        setDeletingItem,
        cancellingItem,
        setCancellingItem,
        completingItem,
        setCompletingItem,
        reschedulingItem,
        setReschedulingItem,
        managingAttendanceItem,
        setManagingAttendanceItem,
        isCreating,
        isUpdating,
        isDeleting,
        isCancelling,
        isCompleting,
        isRescheduling,
        handleCreate,
        handleUpdate,
        handleDelete,
        handleCancel,
        handleComplete,
        handleReschedule,
        getClassGroupName,
        getRoomName,
        getSessionStatusLabel,
    };
};
