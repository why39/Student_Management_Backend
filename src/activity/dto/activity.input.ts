import { Field, InputType, ID } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { ActivityState } from 'src/common/enums/activity.state.enum';

@InputType()
export class CreateActivityInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  description: string;

  @Field(() => ID)
  @IsUUID()
  @IsNotEmpty()
  groupId: string;

  @Field(() => Date)
  scheduledAt: Date;

  @Field(() => ActivityState, { defaultValue: ActivityState.NEW })
  state: ActivityState;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  location?: string;
}

@InputType()
export class UpdateActivityStateInput {
  @Field(() => ID)
  @IsUUID()
  @IsNotEmpty()
  activityId: string;

  @Field(() => ActivityState)
  state: ActivityState;
}

@InputType()
export class JoinActivityInput {
  @Field(() => ID)
  @IsUUID()
  @IsNotEmpty()
  activityId: string;
}