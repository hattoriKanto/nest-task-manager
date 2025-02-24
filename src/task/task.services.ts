import { Repository } from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { TaskDto } from './dtos/task.dto';

@Injectable()
export class TaskServices {
  constructor(
    @InjectRepository(Task) private taskRepository: Repository<Task>,
  ) {}

  findOneById(id: string): Promise<Task> {
    return this.taskRepository.findOneBy({ id });
  }

  findAll(): Promise<Task[]> {
    return this.taskRepository.find();
  }

  create(taskData: TaskDto): Promise<Task> {
    const task = this.taskRepository.create(taskData);
    return this.taskRepository.save(task);
  }

  async update(id: string, taskData: Partial<TaskDto>): Promise<Task> {
    const task = await this.findOneById(id);
    if (!task) throw new NotFoundException(`Task with ${id} does not exist.`);
    Object.assign(task, taskData);
    return this.taskRepository.save(task);
  }

  async deleteById(id: string): Promise<Task> {
    const task = await this.findOneById(id);
    if (!task) throw new NotFoundException(`Task with ${id} does not exist.`);
    return this.taskRepository.remove(task);
  }
}
