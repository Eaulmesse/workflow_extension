export interface Integration {
    id: string;
    serviceName: ServiceName;
    apiKey: string;
    config: Record<string, any>;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export type ServiceName = 'notion' | 'slack' | 'email';
    