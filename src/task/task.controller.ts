import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { TaskServices } from './task.services';
import { Task } from './task.entity';
import { TaskDto } from './dtos/task.dto';

@Controller('task')
export class TaskController {
  constructor(private taskServices: TaskServices) {}

  @Get(':id')
  getOne(@Param('id') id: string): Promise<Task> {
    return this.taskServices.findOneById(id);
  }

  @Get()
  getAll(): Promise<Task[]> {
    return this.taskServices.findAll();
  }

  @Post()
  create(@Body() taskData: TaskDto): Promise<Task> {
    return this.taskServices.create(taskData);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() taskData: Partial<TaskDto>,
  ): Promise<Task> {
    return this.taskServices.update(id, taskData);
  }

  @Delete(':id')
  delete(@Param('id') id: string): Promise<Task> {
    return this.taskServices.deleteById(id);
  }
}
