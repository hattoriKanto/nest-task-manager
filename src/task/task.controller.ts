import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { Task } from './task.entity';
import { UpdateTaskDto } from 'src/dtos/update-task.dto';
import { CreateTaskDto } from 'src/dtos/create-task.dto';
import { DateFormmatingInterceptor } from 'src/interceptors/date-formatting.interceptor';

@Controller('task')
export class TaskController {
  constructor(private service: TaskService) {}

  @Get('/:id')
  findOne(@Param('id') id: string): Promise<Task> {
    return this.service.findOne(parseInt(id));
  }

  @Get()
  findAll(): Promise<Task[]> {
    return this.service.findAll();
  }

  @UseInterceptors(DateFormmatingInterceptor)
  @Post()
  create(@Body() data: CreateTaskDto) {
    return this.service.create(data);
  }

  @Delete('/:id')
  delete(@Param('id') id: string) {
    return this.service.delete(parseInt(id));
  }

  @UseInterceptors(DateFormmatingInterceptor)
  @Patch('/:id')
  update(@Param('id') id: string, @Body() data: UpdateTaskDto) {
    return this.service.update(parseInt(id), data);
  }
}