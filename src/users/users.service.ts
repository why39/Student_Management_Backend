import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '../common/enums/user.interface';
import { UserRole } from '../common/enums/role.enum';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  private convertPrismaUser(prismaUser: any): User {
    return {
      ...prismaUser,
      role: prismaUser.role as UserRole
    };
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    return user ? this.convertPrismaUser(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    return user ? this.convertPrismaUser(user) : null;
  }

  async create(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
  }): Promise<User> {
    const user = await this.prisma.user.create({
      data,
    });
    return this.convertPrismaUser(user);
  }

  async findAll(): Promise<User[]> {
    const users = await this.prisma.user.findMany();
    return users.map(this.convertPrismaUser);
  }

  async findByRole(role: UserRole): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      where: { role },
    });
    return users.map(this.convertPrismaUser);
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    const user = await this.prisma.user.update({
      where: { id },
      data,
    });
    return this.convertPrismaUser(user);
  }

  async delete(id: string): Promise<User> {
    const user = await this.prisma.user.delete({
      where: { id },
    });
    return this.convertPrismaUser(user);
  }
}