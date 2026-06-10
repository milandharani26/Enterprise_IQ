export interface Role {
  id: string;
  name: string;
  role_code: string;
  assistant_ids: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface RoleResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: Role[];
}
