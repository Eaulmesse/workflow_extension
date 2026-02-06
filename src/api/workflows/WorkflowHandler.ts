import { Workflow } from '../../types/workflow.types';
import type { MessageResponse } from '../types';
import { StorageManager } from '../../storage/StorageManager';

declare const crypto: Crypto;


export class WorkflowHandler {

  async handleList(): Promise<MessageResponse<Record<string, { id: string; name: string }>>> {
    try {
      const storageManager = StorageManager.getInstance();
      const workflows = await storageManager.getAll<Workflow>('workflows');
      return { success: true, data: workflows };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      };
    }
  }

  async handleGet(payload: { id?: string }): Promise<MessageResponse<{ id: string; name: string }>> {
    try {
      if (!payload?.id?.trim()) {
        return { success: false, error: 'id manquant' };
      }
      const workflow = { id: payload.id, name: `Workflow ${payload.id}` };
      return { success: true, data: workflow };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        
      };
    }
  }

  async handleCreate(payload: { name: string }): Promise<MessageResponse<{ id: string; name: string }>> {
    try {
      if (!payload?.name?.trim()) {
        return { success: false, error: 'Nom manquant' };
      }
      const newWorkflow: Workflow = {
        id: uuidv4(),
        name: payload.name,
        description: '',
        triggerType: 'manual',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      const storageManager = StorageManager.getInstance();
      await storageManager.set('workflows', newWorkflow.id, newWorkflow);

      // return { success: true, data: newWorkflow };
      return { success: true, data: { id: newWorkflow.id, name: newWorkflow.name } };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      };
    }
  }
}

function uuidv4(): string {
  return crypto.randomUUID();
}

