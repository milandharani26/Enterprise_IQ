export interface assistant {
  id: string;
  name: string;
  assistant_code: string;
  config: {
    model: string;
    temperature: number;
    system_prompt: string;
  };
  tools: {
    type: string;
    source: string;
  }[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface assistantResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: assistant[];
}
