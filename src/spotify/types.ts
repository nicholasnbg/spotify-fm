interface CallbackQuery {
  code?: string;
  error?: string;
  state?: string;
}

interface TokenResponse {
  access_token: string,
  refresh_token: string,
  scope: string
}