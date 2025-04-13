import { Field, ObjectType, ID } from '@nestjs/graphql';
import { UserType } from '../../users/dto/user.type';

@ObjectType()
export class GroupType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => UserType)
  owner: UserType;

  @Field(() => String)
  ownerId: string;

  @Field(() => [GroupMemberType], { nullable: true })
  members?: GroupMemberType[];

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

@ObjectType()
export class GroupMemberType {
  @Field(() => ID)
  id: string;

  @Field(() => UserType, { nullable: true })
  user?: UserType;

  @Field(() => String)
  userId: string;

  @Field(() => GroupType)
  group: GroupType;

  @Field(() => String)
  groupId: string;

  @Field(() => String)
  role: string;  // GROUP_LEADER or COMMON_MEMBER

  @Field(() => Date)
  joinedAt: Date;
}