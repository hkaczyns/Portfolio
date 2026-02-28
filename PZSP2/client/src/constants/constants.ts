export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const LOWERCASE_LETTER_REGEX = /[a-z]/;
export const UPPERCASE_LETTER_REGEX = /[A-Z]/;
export const NUMBER_REGEX = /[0-9]/;
export const SPACE_REGEX = /^\S+$/;

export const DEFAULT_CACHE_TIME = 300;
export const RESEND_VERIFICATION_COOLDOWN_SECONDS = 300;
export const FORGOT_PASSWORD_COOLDOWN_SECONDS = 300;

export const TEXT_COLOR = "#000000";
export const SECONDARY_TEXT_COLOR = "#bcbcbc";

export const UNKNOWN_ERROR = "UNKNOWN_ERROR";

export const CLASS_GROUP_STATUS = {
    DRAFT: "draft",
    ACTIVE: "active",
    OPEN: "open",
    CLOSED: "closed",
    ARCHIVED: "archived",
} as const;

export const CLASS_SESSION_STATUS = {
    SCHEDULED: "scheduled",
    COMPLETED: "completed",
    CANCELLED: "cancelled",
} as const;

export const ENROLLMENT_STATUS = {
    ACTIVE: "ACTIVE",
    CANCELLED: "CANCELLED",
    WAITLISTED: "WAITLISTED",
    MOVED: "MOVED",
    COMPLETED: "COMPLETED",
} as const;

export const CHARGE_TYPE = {
    MONTHLY_FEE: "MONTHLY_FEE",
    ADDITIONAL_CLASSES: "ADDITIONAL_CLASSES",
    ADJUSTMENT: "ADJUSTMENT",
} as const;

export const ATTENDANCE_STATUS = {
    PRESENT: "PRESENT",
    ABSENT: "ABSENT",
    EXCUSED: "EXCUSED",
    MAKEUP: "MAKEUP",
} as const;

export const CHARGE_STATUS = {
    OPEN: "OPEN",
    PAID: "PAID",
    PARTIAL: "PARTIAL",
    CANCELLED: "CANCELLED",
} as const;

export const SCHEDULE_TAB = {
    ROOMS: "rooms",
    SKILL_LEVELS: "skillLevels",
    TOPICS: "topics",
    SEMESTERS: "semesters",
    CLASS_GROUPS: "classGroups",
    SESSIONS: "sessions",
    UNFINISHED_SESSIONS: "unfinishedSessions",
} as const;

export const ATTENDANCE_TAB = {
    SESSIONS: "sessions",
    GROUPS: "groups",
    STUDENTS: "students",
} as const;

export const PAYMENTS_TAB = {
    PAYMENTS: "payments",
    CHARGES: "charges",
    ALLOCATIONS: "allocations",
} as const;

export const ADMIN_VIEW = {
    USERS: "users",
    USER_DETAILS: "userDetails",
    SCHEDULE: "schedule",
    PAYMENTS: "payments",
} as const;
