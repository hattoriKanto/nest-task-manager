import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { CreateTaskDto } from 'src/task/dtos/create-task.dto';
import { UpdateTaskDto } from 'src/task/dtos/update-task.dto';

@Injectable()
export class TaskService {
  constructor(@InjectRepository(Task) private repo: Repository<Task>) {}

  async findOne(id: number): Promise<Task> {
    const task = await this.repo.findOne({ where: { id } });
    if (!task) throw new NotFoundException(`Task with ${id} id was not found`);
    return task;
  }

  findAll(): Promise<Task[]> {
    return this.repo.find();
  }

  create(task: CreateTaskDto): Promise<Task> {
    const newTask = this.repo.create(task);
    return this.repo.save(newTask);
  }

  async delete(id: number): Promise<void> {
    const task = await this.findOne(id);
    await this.repo.remove(task);
  }

  async update(id: number, data: UpdateTaskDto): Promise<Task> {
    const task = await this.findOne(id);
    Object.assign(task, data);
    return this.repo.save(task);
  }
}
