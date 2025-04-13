import { Module } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { ActivityResolver } from './activity.resolver';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [ActivityService, ActivityResolver, PrismaService],
  exports: [ActivityService],
})
export class ActivityModule {}
