# Simple Student Backend

A NestJS GraphQL API for student management system, enabling teachers to create groups, manage students, and coordinate activities.

## Features

- **Authentication**: JWT-based authentication with role-based access control
- **User Management**: Create and manage student, teacher, and admin user accounts
- **Groups**: Create and manage student groups with group leaders and members
- **Activities**: Schedule and manage activities for student groups
- **Notifications**: System notifications for users

## Tech Stack

- **Framework**: [NestJS](https://nestjs.com/)
- **API**: [GraphQL](https://graphql.org/) with Apollo Server
- **Database**: PostgreSQL with [Prisma ORM](https://www.prisma.io/)
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Class-validator

## Entity Relationships

- **Users**: Can be STUDENT, TEACHER, or ADMIN
- **Groups**: Created by teachers, can contain multiple students
- **GroupMembers**: Join table tracking students' group membership and roles
- **Activities**: Events created by teachers for specific groups
- **Notifications**: System messages for users

## Getting Started

### Prerequisites

- Node.js (>=14.x)
- PostgreSQL
- npm or yarn

### Environment Setup

Create a `.env` file in the root directory with:

```
DATABASE_URL="postgresql://username:password@localhost:5432/simplestudent"
JWT_SECRET="your-jwt-secret"
JWT_EXPIRATION_TIME="1d"
```

### Installation

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Optional: Seed the database
npm run seed
```

### Running the Application

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

The GraphQL API will be available at `http://localhost:3000/graphql`

## API Documentation

The GraphQL schema documentation is available in the GraphQL Playground at `http://localhost:3000/graphql` when running in development mode.

### Main Queries & Mutations

#### Authentication
- `login(loginInput)`: Authenticate user and receive JWT token
- `register(registerInput)`: Create a new user account

#### Users
- `users`: List all users (admin only)
- `user(id)`: Get a specific user
- `me`: Get the current logged-in user

#### Groups
- `groups`: List all groups
- `group(id)`: Get a specific group
- `myGroups`: Get groups created by the current teacher
- `myStudentGroups`: Get groups the current student belongs to
- `createGroup`: Create a new group
- `updateGroup`: Update group details
- `removeGroup`: Delete a group
- `addGroupMember`: Add a student to a group
- `removeGroupMember`: Remove a student from a group

#### Activities
- `activitiesByGroup`: List activities for a group
- `myActivitiesAsTeacher`: Get activities created by the current teacher
- `myActivitiesAsStudent`: Get activities for groups the student belongs to
- `myJoinedActivities`: Get activities the student has joined
- `createActivity`: Create a new activity
- `updateActivityState`: Update activity status (NEW, IN_PROGRESS, COMPLETED, CANCELED)
- `joinActivity`: Join an activity as a student
