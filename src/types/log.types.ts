export interface Log {
    id: string;
    workflowId: string;
    actionId: string;
    status: LogStatus;
    message: string;
    createdAt: Date;
    executionTime: number;
}

export type LogStatus = 'success' | 'error' | 'pending';