import { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    useGetSessionAttendanceQuery,
    useUpdateSessionAttendanceMutation,
    useGetStudentsQuery,
    useMarkMakeupMutation,
} from "../../store/schedule/api";
import { useAlert } from "../../components/Alert/AlertContext";
import styles from "./AttendanceManagementPage.module.css";

const getStatusLabel = (status: string): string => {
    switch (status) {
        case "PRESENT":
            return "Obecny";
        case "ABSENT":
            return "Nieobecny";
        case "EXCUSED":
            return "Usprawiedliwiony";
        default:
            return status;
    }
};

const getStatusClassName = (status: string | null): string => {
    switch (status) {
        case "PRESENT":
            return styles.statusPresent;
        case "ABSENT":
            return styles.statusAbsent;
        case "EXCUSED":
            return styles.statusExcused;
        default:
            return "";
    }
};

export const AttendanceManagementPage = () => {
    const { sessionId } = useParams<{ sessionId: string }>();
    const navigate = useNavigate();
    const sessionIdNum = sessionId ? parseInt(sessionId, 10) : 0;
    const { publish } = useAlert();

    const {
        data: attendance,
        isLoading,
        isError,
        error,
    } = useGetSessionAttendanceQuery(sessionIdNum, {
        skip: !sessionId || isNaN(sessionIdNum),
        refetchOnMountOrArgChange: true,
    });

    const [updateAttendance, { isLoading: isSaving }] = useUpdateSessionAttendanceMutation();
    const [markMakeup] = useMarkMakeupMutation();
    const { data: allStudents = [] } = useGetStudentsQuery();

    const [statusChanges, setStatusChanges] = useState<Record<string, "PRESENT" | "ABSENT" | "EXCUSED">>({});
    const [makeupStudents, setMakeupStudents] = useState<string[]>([]);

    const handleStatusChange = useCallback((studentId: string, newStatus: "PRESENT" | "ABSENT" | "EXCUSED") => {
        setStatusChanges((prev) => {
            const newChanges = { ...prev };
            newChanges[studentId] = newStatus;
            return newChanges;
        });
    }, []);

    const handleSaveAttendance = async () => {
        if (!attendance) return;

        const regularItems = attendance
            .map((record) => {
                const changedStatus = statusChanges[record.studentId];
                const currentStatus = changedStatus !== undefined ? changedStatus : record.status;

                if (!currentStatus) {
                    return null;
                }

                return {
                    studentId: record.studentId,
                    status: currentStatus as "PRESENT" | "ABSENT" | "EXCUSED",
                    isMakeup: false,
                };
            })
            .filter((item): item is NonNullable<typeof item> => item !== null);

        const makeupItems = makeupStudents.map((studentId) => {
            const status = statusChanges[studentId] || "PRESENT";
            return {
                studentId,
                status: status as "PRESENT" | "ABSENT" | "EXCUSED",
                isMakeup: true,
            };
        });

        const items = [...regularItems, ...makeupItems];

        if (items.length === 0) {
            publish("Nie można zapisać obecności. Zaznacz przynajmniej jeden status.", "error");
            return;
        }

        try {
            if (makeupStudents.length > 0) {
                await Promise.all(
                    makeupStudents.map((studentId) => markMakeup({ sessionId: sessionIdNum, studentId }).unwrap()),
                );
            }

            await updateAttendance({
                sessionId: sessionIdNum,
                body: { items },
            }).unwrap();

            setStatusChanges({});
            setMakeupStudents([]);
            publish("Obecność została zapisana pomyślnie!", "success");
            navigate("/my-classes");
        } catch (err) {
            console.error("Failed to save attendance:", err);
            publish("Wystąpił błąd podczas zapisywania obecności.", "error");
        }
    };

    const handleAddMakeupStudent = (studentId: string) => {
        if (!makeupStudents.includes(studentId)) {
            setMakeupStudents((prev) => [...prev, studentId]);
            setStatusChanges((prev) => ({ ...prev, [studentId]: "PRESENT" }));
        }
    };

    const handleRemoveMakeupStudent = (studentId: string) => {
        setMakeupStudents((prev) => prev.filter((id) => id !== studentId));
        setStatusChanges((prev) => {
            const newChanges = { ...prev };
            delete newChanges[studentId];
            return newChanges;
        });
    };

    const hasChanges = Object.keys(statusChanges).length > 0 || makeupStudents.length > 0;

    if (!sessionId || isNaN(sessionIdNum)) {
        return (
            <div className={styles.container}>
                <div className={styles.content}>
                    <h1 className={styles.title}>Zarządzanie obecnością</h1>
                    <p>Nieprawidłowy identyfikator sesji.</p>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className={styles.container}>
                <div className={styles.content}>
                    <h1 className={styles.title}>Zarządzanie obecnością</h1>
                    <p>Ładowanie...</p>
                </div>
            </div>
        );
    }

    if (isError) {
        const errorMessage =
            error && "status" in error && error.status === 404
                ? "Sesja nie została znaleziona."
                : error && "status" in error && error.status === 403
                  ? "Brak uprawnień do wyświetlenia obecności."
                  : "Wystąpił błąd podczas pobierania danych o obecności.";

        return (
            <div className={styles.container}>
                <div className={styles.content}>
                    <h1 className={styles.title}>Zarządzanie obecnością</h1>
                    <p>{errorMessage}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Zarządzanie obecnością</h1>
                    <div className={styles.headerButtons}>
                        <button
                            className={styles.saveButton}
                            onClick={handleSaveAttendance}
                            disabled={!hasChanges || isSaving}
                        >
                            {isSaving ? "Zapisywanie..." : "Zatwierdź obecność"}
                        </button>
                        <button className={styles.backButton} onClick={() => navigate(-1)}>
                            Powrót
                        </button>
                    </div>
                </div>

                {!attendance || attendance.length === 0 ? (
                    <p style={{ marginTop: "20px", color: "#000" }}>Brak uczestników do wyświetlenia.</p>
                ) : (
                    <>
                        <table className={styles.attendanceTable}>
                            <thead>
                                <tr>
                                    <th>Imię</th>
                                    <th>Nazwisko</th>
                                    <th>Email</th>
                                    <th>Status</th>
                                    <th>Akcje</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attendance?.map((record) => {
                                    const originalStatus = record.status;
                                    const changedStatus = statusChanges[record.studentId];
                                    const currentStatus = changedStatus !== undefined ? changedStatus : originalStatus;
                                    const studentId = record.studentId;

                                    return (
                                        <tr key={studentId}>
                                            <td>{record.firstName}</td>
                                            <td>{record.lastName}</td>
                                            <td>{record.email}</td>
                                            <td>
                                                {currentStatus ? (
                                                    <span
                                                        className={`${styles.statusBadge} ${getStatusClassName(currentStatus)}`}
                                                    >
                                                        {getStatusLabel(currentStatus)}
                                                    </span>
                                                ) : (
                                                    <span className={styles.statusBadge}>Nie zaznaczono</span>
                                                )}
                                            </td>
                                            <td>
                                                <div className={styles.statusButtons}>
                                                    <button
                                                        type="button"
                                                        key={`${studentId}-PRESENT`}
                                                        className={`${styles.statusButton} ${
                                                            currentStatus === "PRESENT" ? styles.statusButtonActive : ""
                                                        }`}
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            handleStatusChange(studentId, "PRESENT");
                                                        }}
                                                    >
                                                        Obecny
                                                    </button>
                                                    <button
                                                        type="button"
                                                        key={`${studentId}-ABSENT`}
                                                        className={`${styles.statusButton} ${
                                                            currentStatus === "ABSENT" ? styles.statusButtonActive : ""
                                                        }`}
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            handleStatusChange(studentId, "ABSENT");
                                                        }}
                                                    >
                                                        Nieobecny
                                                    </button>
                                                    <button
                                                        type="button"
                                                        key={`${studentId}-EXCUSED`}
                                                        className={`${styles.statusButton} ${
                                                            currentStatus === "EXCUSED" ? styles.statusButtonActive : ""
                                                        }`}
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            handleStatusChange(studentId, "EXCUSED");
                                                        }}
                                                    >
                                                        Usprawiedliwiony
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        <div className={styles.makeupSection}>
                            <h2 className={styles.sectionTitle}>Odrabiający</h2>
                            <div className={styles.makeupControls}>
                                <select
                                    className={styles.studentSelect}
                                    onChange={(e) => {
                                        if (e.target.value) {
                                            handleAddMakeupStudent(e.target.value);
                                            e.target.value = "";
                                        }
                                    }}
                                    value=""
                                >
                                    <option value="">Wybierz studenta do dodania...</option>
                                    {allStudents
                                        .filter((student) => {
                                            const isInAttendance = attendance?.some(
                                                (record) => record.studentId === student.id,
                                            );
                                            const isInMakeup = makeupStudents.includes(student.id);
                                            return !isInAttendance && !isInMakeup;
                                        })
                                        .map((student) => (
                                            <option key={student.id} value={student.id}>
                                                {student.firstName} {student.lastName} ({student.email})
                                            </option>
                                        ))}
                                </select>
                            </div>

                            {makeupStudents.length === 0 ? (
                                <p className={styles.emptyMessage}>Brak odrabiających studentów.</p>
                            ) : (
                                <table className={styles.attendanceTable}>
                                    <thead>
                                        <tr>
                                            <th>Imię</th>
                                            <th>Nazwisko</th>
                                            <th>Email</th>
                                            <th>Status</th>
                                            <th>Akcje</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {makeupStudents.map((studentId) => {
                                            const student = allStudents.find((s) => s.id === studentId);
                                            if (!student) return null;

                                            const currentStatus = statusChanges[studentId] || "PRESENT";

                                            return (
                                                <tr key={studentId}>
                                                    <td>{student.firstName}</td>
                                                    <td>{student.lastName}</td>
                                                    <td>{student.email}</td>
                                                    <td>
                                                        <span
                                                            className={`${styles.statusBadge} ${getStatusClassName(currentStatus)}`}
                                                        >
                                                            {getStatusLabel(currentStatus)}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className={styles.makeupActions}>
                                                            <div className={styles.statusButtons}>
                                                                <button
                                                                    type="button"
                                                                    className={`${styles.statusButton} ${
                                                                        currentStatus === "PRESENT"
                                                                            ? styles.statusButtonActive
                                                                            : ""
                                                                    }`}
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        e.stopPropagation();
                                                                        handleStatusChange(studentId, "PRESENT");
                                                                    }}
                                                                >
                                                                    Obecny
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className={`${styles.statusButton} ${
                                                                        currentStatus === "ABSENT"
                                                                            ? styles.statusButtonActive
                                                                            : ""
                                                                    }`}
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        e.stopPropagation();
                                                                        handleStatusChange(studentId, "ABSENT");
                                                                    }}
                                                                >
                                                                    Nieobecny
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className={`${styles.statusButton} ${
                                                                        currentStatus === "EXCUSED"
                                                                            ? styles.statusButtonActive
                                                                            : ""
                                                                    }`}
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        e.stopPropagation();
                                                                        handleStatusChange(studentId, "EXCUSED");
                                                                    }}
                                                                >
                                                                    Usprawiedliwiony
                                                                </button>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                className={styles.removeButton}
                                                                onClick={() => handleRemoveMakeupStudent(studentId)}
                                                            >
                                                                Usuń
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
