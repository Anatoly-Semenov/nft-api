export interface JwtPayload {
  sub: string;
  walletAddress: string;
  hasMessengerAccess: boolean;
}
