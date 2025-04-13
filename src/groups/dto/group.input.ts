import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { GroupMemberRole } from 'src/common/enums/role.enum';

@InputType()
export class CreateGroupInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;
}

@InputType()
export class UpdateGroupInput {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;
}

@InputType()
export class AddGroupMemberInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  groupId: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  userId: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  role: GroupMemberRole; // "GROUP_LEADER" or "COMMON_MEMBER"
}