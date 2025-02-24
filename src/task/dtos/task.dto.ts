import {
  IsString,
  IsNotEmpty,
  IsIn,
  IsISO8601,
  IsOptional,
} from 'class-validator';
import { TaskPriorityType, TaskPriorityValues } from '../task-priority';

export class TaskDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string | null;

  @IsISO8601()
  @IsNotEmpty()
  creationDate: string;

  @IsISO8601()
  @IsOptional()
  endingDate?: string | null;

  @IsISO8601()
  @IsOptional()
  actualEndDate?: string | null;

  @IsIn(TaskPriorityValues)
  @IsNotEmpty()
  priority: TaskPriorityType;
}
