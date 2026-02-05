import { Action } from "../types/action.types";
import { Integration } from "../types/integration.types";
import { Log } from "../types/log.types";
import { Workflow } from "../types/workflow.types";

type CollectionName = 'workflows' | 'actions' | 'integrations' | 'logs';

export class StorageManager {
    private static instance: StorageManager;
    private workflows: Workflow[];
    private actions: Action[];
    private integrations: Integration[];
    private logs: Log[];

    private constructor() {
        this.workflows = [];
        this.actions = [];
        this.integrations = [];
        this.logs = [];
    }

    public static getInstance(): StorageManager {
        try {
            if (!StorageManager.instance) {
                StorageManager.instance = new StorageManager();
            }
            return StorageManager.instance;
        }
        catch (error) {
            console.error('Error getting StorageManager instance:', error);
            throw error;
        }
    }
        

    async set<T>(collection: CollectionName, id: string, item: T ): Promise<void> {
        try {
            const data = await chrome.storage.local.get(collection);
            const items = data[collection] || {};
            
            items[id] = item;
        
            await chrome.storage.local.set({ [collection]: items });
        } catch (error) {
            console.error('Error setting item in StorageManager:', error);
            throw error;
        }
    }

    async get<T>(collection: CollectionName, id: string): Promise<T | undefined> {
        try {
            const data = await chrome.storage.local.get(collection);
            const items = (data[collection] || {}) as Record<string, T>

            return items[id] || undefined;
        } catch (error) {
            console.error('Error getting item in StorageManager:', error);
            throw error;
        }
    }

    async getAll<T>(collection: CollectionName): Promise<Record<string, T>> {
        try {
            const data = await chrome.storage.local.get(collection);
            return (data[collection] || {}) as Record<string, T>;
        } catch (error) {
            console.error('Error getting all items in StorageManager:', error);
            throw error;
        }
    }

    async remove<T>(collection: CollectionName, id: string): Promise<void> {
        try {
            const data = await chrome.storage.local.get(collection);
            const items = (data[collection] || {}) as Record<string, T>;

            delete items[id];

            await chrome.storage.local.set({ [collection]: items });
        } catch (error) {
            console.error('Error removing item in StorageManager:', error);
            throw error;
        }
    }

    async clear<T>(collection: CollectionName): Promise<void> {
        try {
            await chrome.storage.local.remove(collection);
        } catch (error) {
            console.error('Error clearing items in StorageManager:', error);
            throw error;
        }
        
    }

    async update<T>(collection: CollectionName, id: string, item: T): Promise<void> {
        try {
            const data = await chrome.storage.local.get(collection);
            const items = (data[collection] || {}) as Record<string, T>;

            items[id] = item;

            await chrome.storage.local.set({ [collection]: items });
        } catch (error) {
            console.error('Error updating item in StorageManager:', error);
            throw error;
        }
    }

    async exists<T>(collection: CollectionName, id: string): Promise<boolean> {
        try {
            const data = await chrome.storage.local.get(collection);
            if (!data[collection]) {
                return false;
            }

            const items = data[collection] as Record<string, T>;

            if (!items) {
                return false;
            }

            return id in items;
        } catch (error) {
            console.error('Error checking if item exists in StorageManager:', error);
            return false;
        }
    }

    async count<T>(collection: CollectionName): Promise<number> {
        try {
            const data = await chrome.storage.local.get(collection);
            const items = data[collection] as Record<string, T>;
            return items ? Object.keys(items).length : 0;
        } catch (error) {
            console.error('Error counting items in StorageManager:', error);
            return 0;
        }
    }

    async find<T>(collection: CollectionName, predicate: (item: T) => boolean): Promise<T | undefined> {
        try {
            const data = await chrome.storage.local.get(collection);
            const items = data[collection] as Record<string, T>;
            return items ? Object.values(items).find(predicate) : undefined;
        } catch (error) {
            console.error('Error finding item in StorageManager:', error);
            return undefined;
        }
    }
}
