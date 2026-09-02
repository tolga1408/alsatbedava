export interface OAuthTokenEndpointResponse {
  access_token?: string;
  accessToken?: string;
  token_type?: string;
  tokenType?: string;
  expires_in?: number;
  expiresIn?: number;
  refresh_token?: string;
  refreshToken?: string;
  scope?: string;
  id_token?: string;
  idToken?: string;
}

export interface ExchangeTokenResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  refreshToken?: string;
  scope: string;
  idToken: string;
}

export interface OAuthUserInfoResponse {
  sub?: string;
  openId?: string;
  id?: string | number;
  user_id?: string | number;
  name?: string;
  preferred_username?: string;
  email?: string | null;
  platform?: string | null;
  loginMethod?: string | null;
  platforms?: unknown;
}

export interface GetUserInfoResponse {
  openId: string;
  name: string;
  email?: string | null;
  platform?: string | null;
  loginMethod?: string | null;
}
