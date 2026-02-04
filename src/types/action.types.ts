

export interface Action {
    id: string;
    workflowId: string;
    actionType: ActionType;
    order: number;
    actionConfig: Record<string, any>;
    createdAt: Date;
}

export type ActionType = 
| 'notion_create_task' 
| 'notion_create_text'
| 'email_send'
| 'slack_send_message'
;

