export interface JwtPayloadType {
  sub: string; // atau number, tergantung schema Anda
  type: string;
  iat: number;
  exp: number;
}
