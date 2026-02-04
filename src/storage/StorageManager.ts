type CollectionName = 'workflows' | 'actions' | 'integrations' | 'logs';

export class StorageManager {
    private static instance: StorageManager;

    private constructor() {}

    public static getInstance(): StorageManager {
        if (!StorageManager.instance) {
            StorageManager.instance = new StorageManager();
        }
        return StorageManager.instance;
    }

    async set<T>(collection: CollectionName, id: string, item: T ): Promise<void> {
        const data = await chrome.storage.local.get(collection);
        const items = data[collection] || {};
    
        items[id] = item;
    
        await chrome.storage.local.set({ [collection]: items });
    }

    async get<T>(collection: CollectionName, id: string): Promise<T | undefined> {
        const data = await chrome.storage.local.get(collection);
        const items = (data[collection] || {}) as Record<string, T>

        return items[id] || undefined;
    }

    async getAll<T>(collection: CollectionName): Promise<Record<string, T>> {
        const data = await chrome.storage.local.get(collection);
        return (data[collection] || {}) as Record<string, T>;
    }

    async remove<T>(collection: CollectionName, id: string): Promise<void> {
        const data = await chrome.storage.local.get(collection);
        const items = (data[collection] || {}) as Record<string, T>;

        delete items[id];

        await chrome.storage.local.set({ [collection]: items });
    }

    async clear<T>(collection: CollectionName): Promise<void> {
        await chrome.storage.local.remove(collection);
    }


}

