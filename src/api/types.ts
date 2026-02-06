
export interface MessageRequest {
  endpoint: string;
  payload?: unknown;
}


export interface MessageResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
