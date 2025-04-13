import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateActivityInput, JoinActivityInput, UpdateActivityStateInput } from './dto/activity.input';
import { ActivityState } from '../common/enums/activity.state.enum';
import { UserRole } from '../common/enums/role.enum';

@Injectable()
export class ActivityService {
  constructor(private prisma: PrismaService) {}

  async createActivity(userId: string, createActivityInput: CreateActivityInput) {
    // Check if user is a teacher
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    
    if (!user || user.role !== UserRole.TEACHER) {
      throw new ForbiddenException('Only teachers can create activities');
    }
    
    // Check if group exists and user is the owner
    const group = await this.prisma.group.findUnique({
      where: { id: createActivityInput.groupId },
    });
    
    if (!group) {
      throw new NotFoundException(`Group with ID ${createActivityInput.groupId} not found`);
    }
    
    if (group.ownerId !== userId) {
      throw new ForbiddenException('You can only create activities for groups you own');
    }
    
    // Create the activity
    return this.prisma.activity.create({
      data: {
        title: createActivityInput.title,
        description: createActivityInput.description,
        scheduledAt: createActivityInput.scheduledAt,
        location: createActivityInput.location,
        state: createActivityInput.state,
        createdById: userId,
        groupId: createActivityInput.groupId,
      },
      include: {
        createdBy: true,
        group: true,
        attendees: true,
      },
    });
  }

  async getActivitiesByGroup(groupId: string) {
    const activities = await this.prisma.activity.findMany({
      where: { groupId },
      include: {
        createdBy: true,
        group: true,
        attendees: true,
      },
      orderBy: {
        scheduledAt: 'asc',
      },
    });
    return activities;
  }

  async getActivitiesByStudent(studentId: string) {
    // Get all groups the student is part of
    const groupMembers = await this.prisma.groupMember.findMany({
      where: { userId: studentId },
    });
    
    const groupIds = groupMembers.map(member => member.groupId);
    
    // Find all activities for these groups
    const activities = await this.prisma.activity.findMany({
      where: { groupId: { in: groupIds } },
      include: {
        createdBy: true,
        group: true,
        attendees: true,
      },
      orderBy: {
        scheduledAt: 'asc',
      },
    });
    
    return activities;
  }

  async getActivityById(id: string) {
    const activity = await this.prisma.activity.findUnique({
      where: { id },
      include: {
        createdBy: true,
        group: true,
        attendees: true,
      },
    });
    
    if (!activity) {
      throw new NotFoundException(`Activity with ID ${id} not found`);
    }
    
    return activity;
  }

  async updateActivityState(teacherId: string, input: UpdateActivityStateInput) {
    const activity = await this.prisma.activity.findUnique({
      where: { id: input.activityId },
      include: { group: true },
    });
    
    if (!activity) {
      throw new NotFoundException(`Activity with ID ${input.activityId} not found`);
    }
    
    if (activity.createdById !== teacherId) {
      throw new ForbiddenException('Only the creator can update this activity');
    }
    
    return this.prisma.activity.update({
      where: { id: input.activityId },
      data: { state: input.state },
      include: {
        createdBy: true,
        group: true,
        attendees: true,
      },
    });
  }

  async joinActivity(studentId: string, input: JoinActivityInput) {
    const activity = await this.prisma.activity.findUnique({
      where: { id: input.activityId },
      include: { group: { include: { members: true } } },
    });
    
    if (!activity) {
      throw new NotFoundException(`Activity with ID ${input.activityId} not found`);
    }
    
    // Check if student is part of the group
    const isMember = activity.group.members.some(member => member.userId === studentId);
    if (!isMember) {
      throw new ForbiddenException('You must be a member of the group to join this activity');
    }
    
    // Check if activity is still open to join
    if (activity.state !== ActivityState.NEW && activity.state !== ActivityState.IN_PROGRESS) {
      throw new ForbiddenException('This activity is no longer open for joining');
    }
    
    // Add student to attendees
    return this.prisma.activity.update({
      where: { id: input.activityId },
      data: {
        attendees: {
          connect: { id: studentId },
        },
      },
      include: {
        createdBy: true,
        group: true,
        attendees: true,
      },
    });
  }

  async getStudentActivities(studentId: string) {
    // Get activities the student has joined
    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
      include: {
        attendedActivities: {
          include: {
            createdBy: true,
            group: true,
            attendees: true,
          },
        },
      },
    });
    
    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }
    
    return student.attendedActivities;
  }

  async getTeacherActivities(teacherId: string) {
    return this.prisma.activity.findMany({
      where: { createdById: teacherId },
      include: {
        createdBy: true,
        group: true,
        attendees: true,
      },
      orderBy: {
        scheduledAt: 'asc',
      },
    });
  }
}