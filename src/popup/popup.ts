import { WORKFLOW_ENDPOINTS } from '../api/workflows/workflow.endpoints';
import type { MessageRequest, MessageResponse } from '../api/types';


async function loadWorkflows() {
    try {
        const response: MessageResponse = await chrome.runtime.sendMessage({ endpoint: WORKFLOW_ENDPOINTS.LIST });
        console.log(response);
        if (!response.success) {
            throw new Error(response.error || 'Erreur lors de la récupération des workflows');
        }
        const workflows = response.data;
        renderWorkflows(workflows as Record<string, { id: string; name: string }>);
    } catch (error) {
        console.error('Erreur lors de la récupération des workflows:', error);
    }
}

function renderWorkflows(workflows: Record<string, { id: string; name: string }>) {
    const listElement = document.getElementById('workflow-list');
    if (!listElement) return;

    listElement.innerHTML = Object.values(workflows).map((w: any) => `<li>${w.name}</li>`).join('');
}

async function createWorkflow() {
    try {
        const name = (document.getElementById('workflow-name') as HTMLInputElement)?.value;

        if (!name) return;

        const response: MessageResponse = await chrome.runtime.sendMessage({ endpoint: WORKFLOW_ENDPOINTS.CREATE, payload: { name } });
        
        if (!response.success) {
            throw new Error(response.error || 'Erreur lors de la création du workflow');
        }
        
        loadWorkflows();
        console.log('Workflow created');
    } catch (error) {
        console.error('Erreur lors de la création du workflow:', error);
    }
}

const createWorkflowBtn = document.getElementById('create-workflow-btn');
if (createWorkflowBtn) {
    createWorkflowBtn.addEventListener('click', createWorkflow);
}

document.addEventListener('DOMContentLoaded', loadWorkflows);

