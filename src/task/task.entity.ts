import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { TaskPriorityType, TaskPriorityValues } from './task-priority';

@Entity()
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 75 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'timestamptz' })
  creationDate: string;

  @Column({ type: 'timestamptz', nullable: true })
  endingDate: string;

  @Column({ type: 'timestamptz', nullable: true })
  actualEndDate: string;

  @Column({
    type: 'enum',
    enum: TaskPriorityValues,
    default: 'normal',
  })
  priority: TaskPriorityType;
}
