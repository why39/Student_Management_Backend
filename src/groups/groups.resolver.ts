import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { GroupsService } from './groups.service';
import { GroupType, GroupMemberType } from './dto/group.type';
import { CreateGroupInput, UpdateGroupInput, AddGroupMemberInput } from './dto/group.input';
import { UseGuards, NotFoundException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../common/enums/user.interface';
import { UserRole } from '../common/enums/role.enum';
import { Group, GroupMember } from '../common/enums/group.interface';

@Resolver(() => GroupType)
export class GroupsResolver {
  constructor(private readonly groupsService: GroupsService) {}

  @Query(() => [GroupType])
  @UseGuards(JwtAuthGuard)
  async groups(): Promise<GroupType[]> {
    const groups = await this.groupsService.findAll();
    return groups.map(group => group as unknown as GroupType);
  }

  @Query(() => GroupType)
  @UseGuards(JwtAuthGuard)
  async group(@Args('id', { type: () => ID }) id: string): Promise<GroupType> {
    const group = await this.groupsService.findOne(id);
    return group as unknown as GroupType;
  }

  @Query(() => [GroupType])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  async myGroups(@CurrentUser() user: User): Promise<GroupType[]> {
    const groups = await this.groupsService.getGroupsByTeacher(user.id);
    return groups.map(group => group as unknown as GroupType);
  }

  @Query(() => [GroupType])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  async myStudentGroups(@CurrentUser() user: User): Promise<GroupType[]> {
    const groups = await this.groupsService.getGroupsByStudent(user.id);
    return groups.map(group => group as unknown as GroupType);
  }

  @Mutation(() => GroupType)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  async createGroup(
    @CurrentUser() user: User,
    @Args('createGroupInput') createGroupInput: CreateGroupInput,
  ): Promise<GroupType> {
    const group = await this.groupsService.create({ ...createGroupInput, ownerId: user.id });
    return group as unknown as GroupType;
  }

  @Mutation(() => GroupType)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  async updateGroup(
    @CurrentUser() user: User,
    @Args('id', { type: () => ID }) id: string,
    @Args('updateGroupInput') updateGroupInput: UpdateGroupInput,
  ): Promise<GroupType> {
    const group = await this.groupsService.update(id, updateGroupInput);
    return group as unknown as GroupType;
  }

  @Mutation(() => GroupType)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  async removeGroup(
    @CurrentUser() user: User,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<GroupType> {
    const group = await this.groupsService.remove(id, user.id, user.role);
    return group as unknown as GroupType;
  }

  @Mutation(() => GroupMemberType)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  async addGroupMember(
    @CurrentUser() user: User,
    @Args('addGroupMemberInput') addGroupMemberInput: AddGroupMemberInput,
  ): Promise<GroupMemberType> {
    const member = await this.groupsService.addMember(user.id, addGroupMemberInput);
    return member as unknown as GroupMemberType;
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  async removeGroupMember(
    @CurrentUser() user: User,
    @Args('groupId', { type: () => ID }) groupId: string,
    @Args('userId', { type: () => ID }) userId: string,
  ): Promise<boolean> {
    return await this.groupsService.removeMember(groupId, userId);
  }
}