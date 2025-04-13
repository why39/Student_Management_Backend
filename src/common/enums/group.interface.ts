import { User } from './user.interface';
import { GroupMemberRole } from './role.enum';

// Define the Group interface to match the Prisma schema
export interface Group {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  ownerId: string;
  owner?: User;
  members?: GroupMember[];
}

// Define the GroupMember interface to match the Prisma schema
export interface GroupMember {
  id: string;
  role: GroupMemberRole;
  joinedAt: Date;
  userId: string;
  user?: User;
  groupId: string;
  group?: Group;
}