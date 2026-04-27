export interface LmsTokenResponse {
  access_token: string;
  access_token_expires_on: string;
  token_type: string;
  refresh_token: string;
  refresh_token_expires_on: string;
  username: string;
  name: string;
  employee_id: string;
  email: string;
  roles: string[];
}

export interface LmsApiError {
  error_message: string;
  errors: { [field: string]: string[] };
}
