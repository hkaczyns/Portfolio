import { useCallback, useMemo } from "react";
import { Search, ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useStudentSearch } from "../../hooks/useStudentSearch";
import { formatStudentName } from "../../utils/studentUtils";
import styles from "./StudentSearchInput.module.css";

interface StudentSearchInputProps {
    value: string | null;
    onChange: (studentId: string | null) => void;
    excludeIds?: Set<string>;
    allowAll?: boolean;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
}

export const StudentSearchInput = ({
    value,
    onChange,
    excludeIds,
    allowAll = false,
    placeholder,
    disabled = false,
    className = "",
}: StudentSearchInputProps) => {
    const { t } = useTranslation("common");
    const {
        searchQuery,
        isDropdownOpen,
        setIsDropdownOpen,
        filteredStudents,
        availableStudents,
        isLoading,
        dropdownRef,
        inputRef,
        handleSearchChange,
        getStudentName,
    } = useStudentSearch({ excludeIds, allowAll });

    const currentSearchQuery = useMemo(
        () => (value ? getStudentName(value) : searchQuery),
        [value, getStudentName, searchQuery],
    );

    const handleSelect = useCallback(
        (studentId: string) => {
            setIsDropdownOpen(false);
            const student = availableStudents.find((s) => s.id === studentId);
            if (student) {
                handleSearchChange(formatStudentName(student));
            }
            onChange(studentId);
        },
        [availableStudents, handleSearchChange, onChange, setIsDropdownOpen],
    );

    const handleAllSelect = useCallback(() => {
        onChange(null);
        handleSearchChange("");
        setIsDropdownOpen(false);
    }, [onChange, handleSearchChange, setIsDropdownOpen]);

    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            handleSearchChange(e.target.value);
            if (!e.target.value) {
                onChange(null);
            }
        },
        [handleSearchChange, onChange],
    );

    const handleInputFocus = useCallback(() => {
        if (!disabled) {
            setIsDropdownOpen(true);
        }
    }, [disabled, setIsDropdownOpen]);

    return (
        <div className={`${styles.searchInputWrapper} ${className}`}>
            <div className={styles.searchInputInner}>
                <div className={styles.searchIcon}>
                    <Search size={18} />
                </div>
                <input
                    ref={inputRef}
                    type="text"
                    className={styles.searchInput}
                    value={currentSearchQuery}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    placeholder={placeholder || t("admin.selectStudent")}
                    disabled={disabled || availableStudents.length === 0 || isLoading}
                />
                <div className={`${styles.chevronIcon} ${isDropdownOpen ? styles.chevronIconOpen : ""}`}>
                    <ChevronDown size={16} />
                </div>
            </div>
            {isDropdownOpen && (filteredStudents.length > 0 || allowAll) && (
                <div ref={dropdownRef} className={styles.dropdownList}>
                    {allowAll && (
                        <div
                            onClick={handleAllSelect}
                            className={`${styles.dropdownItem} ${!value ? styles.dropdownItemSelected : ""}`}
                        >
                            {t("admin.allStudents")}
                        </div>
                    )}
                    {filteredStudents.map((student) => (
                        <div
                            key={student.id}
                            onClick={() => handleSelect(student.id)}
                            className={`${styles.dropdownItem} ${value === student.id ? styles.dropdownItemSelected : ""}`}
                        >
                            {formatStudentName(student)}
                        </div>
                    ))}
                </div>
            )}
            {isDropdownOpen && searchQuery && filteredStudents.length === 0 && (
                <div className={styles.dropdownEmpty}>{t("admin.noStudentsFound")}</div>
            )}
        </div>
    );
};
