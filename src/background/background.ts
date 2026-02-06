import { migrateStorage } from '../storage/migrations';
import { Router } from './router';
import { StorageManager } from '../storage/StorageManager';

const storageManager = StorageManager.getInstance();
storageManager.initialize();

const router = new Router();

chrome.runtime.onInstalled.addListener(async () => {
  console.log('[Background] Extension installée ou mise à jour');
  await migrateStorage();
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  router
    .handle(message)
    .then(sendResponse)
    .catch((err) => sendResponse({ success: false, error: String(err) }));
  return true;
});
