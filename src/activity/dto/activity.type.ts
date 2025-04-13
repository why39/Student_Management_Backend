import { Field, ObjectType, ID } from '@nestjs/graphql';
import { UserType } from '../../users/dto/user.type';
import { GroupType } from '@groups/dto/group.type';
import { ActivityState } from 'src/common/enums/activity.state.enum';

@ObjectType()
export class ActivityType {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field()
  description: string;

  @Field()
  scheduledAt: Date;
  
  @Field(() => Date)
  createdAt: Date;

  @Field({ nullable: true })
  location?: string;

  @Field(() => UserType)
  createdBy: UserType;
  
  @Field(() => String)
  createdById: string;

  @Field(() => GroupType)
  group: GroupType;
  
  @Field(() => String)
  groupId: string;

  @Field(() => ActivityState)
  state: ActivityState;
  
  @Field(() => [UserType], { nullable: true })
  attendees?: UserType[];
}
