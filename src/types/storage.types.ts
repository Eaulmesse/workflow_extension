import { Workflow } from "./workflow.types";
import { Action } from "./action.types";
import { Integration } from "./integration.types";
import { Log } from "./log.types";

export interface Storage {
    workflows: Workflow[];
    actions: Action[];
    integrations: Integration[];
    logs: Log[];
}