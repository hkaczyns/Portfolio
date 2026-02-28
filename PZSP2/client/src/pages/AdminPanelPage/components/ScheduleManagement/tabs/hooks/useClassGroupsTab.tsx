import { useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
    useListClassGroupsQuery,
    useCreateClassGroupMutation,
    useUpdateClassGroupMutation,
    useDeleteClassGroupMutation,
    useGenerateClassGroupSessionsMutation,
    useListSemestersQuery,
    useListSkillLevelsQuery,
    useListTopicsQuery,
    useListRoomsQuery,
    useListInstructorsQuery,
    type ClassGroupRead,
    type ClassGroupCreate,
    type ClassGroupUpdate,
} from "../../../../../../store/admin/api";
import { useAlert } from "../../../../../../components/Alert/AlertContext";
import { parseApiError } from "../../../../../../store/helpers";

export const useClassGroupsTab = () => {
    const { t } = useTranslation("common");
    const { publish } = useAlert();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<ClassGroupRead | null>(null);
    const [deletingItem, setDeletingItem] = useState<ClassGroupRead | null>(null);
    const [managingStudentsItem, setManagingStudentsItem] = useState<ClassGroupRead | null>(null);

    const { data: items = [], isLoading } = useListClassGroupsQuery();
    const { data: semesters = [] } = useListSemestersQuery();
    const { data: skillLevels = [] } = useListSkillLevelsQuery();
    const { data: topics = [] } = useListTopicsQuery();
    const { data: rooms = [] } = useListRoomsQuery();
    const { data: instructors = [] } = useListInstructorsQuery();
    const [createItem, { isLoading: isCreating }] = useCreateClassGroupMutation();
    const [updateItem, { isLoading: isUpdating }] = useUpdateClassGroupMutation();
    const [deleteItem, { isLoading: isDeleting }] = useDeleteClassGroupMutation();
    const [generateSessions] = useGenerateClassGroupSessionsMutation();

    const handleCreate = useCallback(
        async (data: ClassGroupCreate) => {
            try {
                const createdGroup = await createItem(data).unwrap();
                publish(t("admin.classGroupCreateSuccess"), "success");

                const semester = semesters.find((s) => s.id === data.semesterId);
                if (semester && semester.startDate && semester.endDate) {
                    try {
                        await generateSessions({
                            classGroupId: createdGroup.id,
                            data: {
                                startDate: semester.startDate,
                                endDate: semester.endDate,
                                skipDates: [],
                            },
                        }).unwrap();
                        publish(t("admin.classGroupSessionsGeneratedSuccess"), "success");
                    } catch {
                        publish(t("admin.classGroupSessionsGeneratedError"), "error");
                    }
                }

                setIsCreateModalOpen(false);
            } catch (error: unknown) {
                const errorMessage = parseApiError(error, t("admin.classGroupCreateError"));
                publish(errorMessage, "error");
            }
        },
        [createItem, generateSessions, semesters, publish, t],
    );

    const handleUpdate = useCallback(
        async (data: ClassGroupCreate) => {
            if (!editingItem) return;
            try {
                const updateData: ClassGroupUpdate = { ...data };
                await updateItem({ classGroupId: editingItem.id, data: updateData }).unwrap();
                publish(t("admin.classGroupUpdateSuccess"), "success");
                setEditingItem(null);
            } catch {
                publish(t("admin.classGroupUpdateError"), "error");
            }
        },
        [editingItem, updateItem, publish, t],
    );

    const handleDelete = useCallback(async () => {
        if (!deletingItem) return;
        try {
            await deleteItem(deletingItem.id).unwrap();
            publish(t("admin.classGroupDeleteSuccess"), "success");
            setDeletingItem(null);
        } catch {
            publish(t("admin.classGroupDeleteError"), "error");
        }
    }, [deletingItem, deleteItem, publish, t]);

    const getSemesterName = useCallback((id: number) => semesters.find((s) => s.id === id)?.name || id, [semesters]);
    const getSkillLevelName = useCallback(
        (id: number) => skillLevels.find((l) => l.id === id)?.name || id,
        [skillLevels],
    );
    const getTopicName = useCallback((id: number) => topics.find((t) => t.id === id)?.name || id, [topics]);

    const daysOfWeek = useMemo(
        () => [
            t("admin.monday"),
            t("admin.tuesday"),
            t("admin.wednesday"),
            t("admin.thursday"),
            t("admin.friday"),
            t("admin.saturday"),
            t("admin.sunday"),
        ],
        [t],
    );

    const getDayName = useCallback((dayIndex: number) => daysOfWeek[dayIndex] || dayIndex, [daysOfWeek]);

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
        semesters,
        skillLevels,
        topics,
        rooms,
        instructors: formattedInstructors,
        isCreateModalOpen,
        setIsCreateModalOpen,
        editingItem,
        setEditingItem,
        deletingItem,
        setDeletingItem,
        managingStudentsItem,
        setManagingStudentsItem,
        isCreating,
        isUpdating,
        isDeleting,
        handleCreate,
        handleUpdate,
        handleDelete,
        getSemesterName,
        getSkillLevelName,
        getTopicName,
        getDayName,
    };
};
