// Define the UserRole enum to match the Prisma schema definition
export enum UserRole {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
  ADMIN = 'ADMIN',
}

// Define the GroupMemberRole enum to match the Prisma schema definition
export enum GroupMemberRole {
  GROUP_LEADER = 'GROUP_LEADER',
  COMMON_MEMBER = 'COMMON_MEMBER',
}