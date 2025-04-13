import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Group } from '../common/enums/group.interface';
import { GroupMemberRole } from '../common/enums/role.enum';
import { AddGroupMemberInput } from './dto/group.input';
import { UserRole } from '../common/enums/role.enum';

@Injectable()
export class GroupsService {
  constructor(private prisma: PrismaService) {}

  private convertPrismaGroup(prismaGroup: any): Group {
    return {
      ...prismaGroup,
      description: prismaGroup.description ?? undefined,
      members: prismaGroup.members?.map(member => ({
        ...member,
        role: member.role as GroupMemberRole
      }))
    };
  }

  async findAll(): Promise<Group[]> {
    const groups = await this.prisma.group.findMany({
      include: {
        owner: true,
        members: {
          include: {
            user: true,
          },
        },
      },
    });
    return groups.map(this.convertPrismaGroup);
  }

  async findById(id: string): Promise<Group | null> {
    const group = await this.prisma.group.findUnique({
      where: { id },
      include: {
        owner: true,
        members: {
          include: {
            user: true,
          },
        },
      },
    });
    return group ? this.convertPrismaGroup(group) : null;
  }

  /**
   * Find a single group by ID
   * @param id The ID of the group to find
   * @returns The group if found
   * @throws NotFoundException if group not found
   */
  async findOne(id: string): Promise<Group> {
    const group = await this.prisma.group.findUnique({
      where: { id },
      include: {
        owner: true,
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!group) {
      throw new NotFoundException(`Group with ID ${id} not found`);
    }

    return this.convertPrismaGroup(group);
  }

  async create(data: {
    name: string;
    description?: string;
    ownerId: string;
  }): Promise<Group> {
    
    const existingGroup = await this.prisma.group.findUnique({
      where: { name: data.name },
    });
    if (existingGroup) {
      throw new ConflictException(`Group with name ${data.name} already exists`);
    }
    
    const group = await this.prisma.group.create({
      data,
      include: {
        owner: true,
      },
    });
    return this.convertPrismaGroup(group);
  }

  async update(
    id: string,
    data: {
      name?: string;
      description?: string;
    },
  ): Promise<Group> {
    const group = await this.prisma.group.update({
      where: { id },
      data,
      include: {
        owner: true,
        members: {
          include: {
            user: true,
          },
        },
      },
    });
    return this.convertPrismaGroup(group);
  }

  async delete(id: string): Promise<Group> {
    const group = await this.prisma.group.delete({
      where: { id },
      include: {
        owner: true,
      },
    });
    return this.convertPrismaGroup(group);
  }

  async addMember(
    teacherId: string,
    addGroupMemberInput: AddGroupMemberInput,
  ): Promise<any> {
    const { groupId, userId, role } = addGroupMemberInput;

    // Check if group exists
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
    });
    if (!group) {
      throw new NotFoundException(`Group with ID ${groupId} not found`);
    }

    // Check if teacher is the owner of this group
    if (group.ownerId !== teacherId) {
      throw new ForbiddenException('You do not have permission to modify this group');
    }

    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Check if user is already a member of this group
    const existingMember = await this.prisma.groupMember.findFirst({
      where: {
        AND: [
          { groupId: groupId },
          { userId: userId }
        ]
      },
    });

    if (existingMember) {
      throw new ConflictException(`User is already a member of this group`);
    }

    // Create new group member
    const newMember = await this.prisma.groupMember.create({
      data: {
        groupId,
        userId,
        role,
        joinedAt: new Date(),
      },
    });

    return {
      ...newMember,
      role: newMember.role as GroupMemberRole,
    };
  }

  async remove(id: string, userId: string, userRole: UserRole): Promise<Group> {
    // Find the group
    const group = await this.prisma.group.findUnique({
      where: { id },
    });

    if (!group) {
      throw new NotFoundException(`Group with ID ${id} not found`);
    }

    // Check if user has permission to delete the group
    if (userRole !== UserRole.ADMIN && group.ownerId !== userId) {
      throw new ForbiddenException('You do not have permission to delete this group');
    }

    // Remove all group members first to maintain referential integrity
    await this.prisma.groupMember.deleteMany({
      where: { groupId: id },
    });

    // Remove the group
    const removedGroup = await this.prisma.group.delete({
      where: { id },
    });

    return this.convertPrismaGroup(removedGroup);
  }

  async removeMember(groupId: string, userId: string): Promise<boolean> {
    // First check if the member exists
    const member = await this.prisma.groupMember.findFirst({
      where: {
        AND: [
          { groupId: groupId },
          { userId: userId }
        ]
      },
    });
    
    if (!member) {
      return false;
    }
    
    // Delete the member using deleteMany since it supports multiple conditions
    await this.prisma.groupMember.deleteMany({
      where: {
        AND: [
          { groupId: groupId },
          { userId: userId }
        ]
      },
    });
    
    return true;
  }

  async findUserGroups(userId: string): Promise<Group[]> {
    const groups = await this.prisma.group.findMany({
      where: {
        OR: [
          { ownerId: userId },
          {
            members: {
              some: {
                userId,
              },
            },
          },
        ],
      },
      include: {
        owner: true,
        members: {
          include: {
            user: true,
          },
        },
      },
    });
    return groups.map(this.convertPrismaGroup);
  }

  async findGroupsByOwnerId(ownerId: string): Promise<Group[]> {
    const groups = await this.prisma.group.findMany({
      where: { ownerId },
      include: {
        owner: true,
        members: {
          include: {
            user: true,
          },
        },
      },
    });
    return groups.map(this.convertPrismaGroup);
  }

  /**
   * Find all groups associated with a specific teacher
   * @param teacherId The ID of the teacher
   * @returns Array of groups where the user is a teacher
   */
  async getGroupsByTeacher(teacherId: string): Promise<Group[]> {
    const groups = await this.prisma.group.findMany({
      where: { ownerId: teacherId },
      include: {
        owner: true,
        members: {
          include: {
            user: true,
          },
        },
      },
    });
    return groups.map(this.convertPrismaGroup);
  }

  /**
   * Find all groups associated with a specific student
   * @param studentId The ID of the student
   * @returns Array of groups where the user is a student member
   */
  async getGroupsByStudent(studentId: string): Promise<Group[]> {
    const groupMembers = await this.prisma.groupMember.findMany({
      where: { userId: studentId },
    });

    if (!groupMembers.length) {
      return [];
    }

    const groupIds = groupMembers.map(member => member.groupId);

    const groups = await this.prisma.group.findMany({
      where: { id: { in: groupIds } },
      include: {
        owner: true,
        members: {
          include: {
            user: true,
          },
        },
      },
    });
    return groups.map(this.convertPrismaGroup);
  }
}