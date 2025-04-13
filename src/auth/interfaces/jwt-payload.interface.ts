export interface JwtPayload {
  sub: string;    // User ID
  email: string;
  role: string;   // User role (STUDENT, TEACHER, ADMIN)
}