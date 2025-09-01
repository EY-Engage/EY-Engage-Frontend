import jwt from 'jsonwebtoken';
export function verifyToken(token: string) {
  const secret = process.env.JWT_SECRET!;
  return jwt.verify(token, secret) as Record<string, any>;
}