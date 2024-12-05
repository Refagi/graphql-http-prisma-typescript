export interface Payload {
  sub: string;
  iat: number;
  exp: number;
  type: string;
}

export interface TokenResponse {
  access: {
    token: string;
    expires: Date;
  };
  refresh: {
    token: string;
    expires: Date;
  };
}
