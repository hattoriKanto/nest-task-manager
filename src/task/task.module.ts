import { Module } from '@nestjs/common';
import { TaskServices } from './task.services';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { TaskController } from './task.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Task])],
  controllers: [TaskController],
  providers: [TaskServices],
})
export class TaskModule {}
