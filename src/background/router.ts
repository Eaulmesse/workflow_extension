import type { MessageRequest, MessageResponse } from '../api/types';
import { WORKFLOW_ENDPOINTS } from '../api/workflows/workflow.endpoints';
import { WorkflowHandler } from '../api/workflows/WorkflowHandler';

/**
 * Router : reçoit un message, appelle le bon handler selon l'endpoint.
 */
export class Router {
  private workflowHandler = new WorkflowHandler();

  async handle(message: MessageRequest): Promise<MessageResponse> {
    const { endpoint, payload } = message;

    switch (endpoint) {
      case WORKFLOW_ENDPOINTS.LIST:
        return this.workflowHandler.handleList();

      case WORKFLOW_ENDPOINTS.GET:
        return this.workflowHandler.handleGet((payload as { id: string }) ?? { id: '' });

      case WORKFLOW_ENDPOINTS.CREATE:
        return this.workflowHandler.handleCreate((payload as { name: string }) ?? { name: '' });

      default:
        return { success: false, error: `Endpoint inconnu: ${endpoint}` };
    }
  }
}
