import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { ActivityType } from './dto/activity.type';
import { CreateActivityInput, JoinActivityInput, UpdateActivityStateInput } from './dto/activity.input';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../common/enums/user.interface';

@Resolver(() => ActivityType)
@UseGuards(JwtAuthGuard)
export class ActivityResolver {
  constructor(private readonly activityService: ActivityService) {}

  @Mutation(() => ActivityType)
  async createActivity(
    @CurrentUser() user: User,
    @Args('createActivityInput') createActivityInput: CreateActivityInput,
  ) {
    return this.activityService.createActivity(user.id, createActivityInput);
  }

  @Query(() => [ActivityType])
  async activitiesByGroup(
    @Args('groupId', { type: () => ID }) groupId: string,
  ) {
    return this.activityService.getActivitiesByGroup(groupId);
  }

  @Query(() => [ActivityType])
  async myActivitiesAsTeacher(@CurrentUser() user: User) {
    return this.activityService.getTeacherActivities(user.id);
  }

  @Query(() => [ActivityType])
  async myActivitiesAsStudent(@CurrentUser() user: User) {
    return this.activityService.getActivitiesByStudent(user.id);
  }

  @Query(() => [ActivityType])
  async myJoinedActivities(@CurrentUser() user: User) {
    return this.activityService.getStudentActivities(user.id);
  }

  @Query(() => ActivityType)
  async activity(@Args('id', { type: () => ID }) id: string) {
    return this.activityService.getActivityById(id);
  }

  @Mutation(() => ActivityType)
  async updateActivityState(
    @CurrentUser() user: User,
    @Args('updateActivityStateInput') updateActivityStateInput: UpdateActivityStateInput,
  ) {
    return this.activityService.updateActivityState(user.id, updateActivityStateInput);
  }

  @Mutation(() => ActivityType)
  async joinActivity(
    @CurrentUser() user: User,
    @Args('joinActivityInput') joinActivityInput: JoinActivityInput,
  ) {
    return this.activityService.joinActivity(user.id, joinActivityInput);
  }
}

