import { UserRole } from './role.enum';

// Define the User interface to match the Prisma schema
export interface User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}