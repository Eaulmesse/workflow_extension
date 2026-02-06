const CURRENT_VERSION: number = 1;

export async function initializeStorage(): Promise<void> {
    try {
        await chrome.storage.local.set({
            workflows: {},
            actions: {},
            integrations: {},
            logs: {},
            schema_version: CURRENT_VERSION,
            app_initialized: true,
            initialized_at: Date.now(),
        })
    } catch (error) {
        console.error('Error initializing storage:', error);
        throw error;
    }
}

export async function migrateStorage(): Promise<void> {
    try {
        const { app_initialized } = await chrome.storage.local.get('app_initialized');

        if(!app_initialized) {
            await initializeStorage();
            return;
        }

        const result = await chrome.storage.local.get('schema_version');
        const schema_version: number = typeof result.schema_version === 'number' ? result.schema_version : 0;

        if (schema_version < 1) {
            // Migration logic for versions less than 1 would go here
        }
    } catch (error) {
        console.error('Error migrating storage:', error);
        throw error;
    }
}