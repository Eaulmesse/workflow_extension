export interface Workflow {
    id: string;
    name: string;
    description: string;
    triggerType: 'manual' | 'scheduled' | 'event';
    createdAt: Date;
    updatedAt: Date;
}