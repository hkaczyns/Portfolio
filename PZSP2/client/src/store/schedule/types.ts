export interface ClassGroupResponse {
    semesterId: number;
    name: string;
    description: string;
    levelId: number;
    topicId: number;
    roomId: number;
    capacity: number;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    instructorId: string;
    isPublic: boolean;
    status: "DRAFT" | "OPEN" | "CLOSED" | "ARCHIVED";
    id: number;
    createdAt: string;
    updatedAt: string;
    enrolledCount: number;
    availableSpots: number;
    waitlistCount: number;
    isFull: boolean;
    canJoinWaitlist: boolean;
    nextSessionAt: string;
}
