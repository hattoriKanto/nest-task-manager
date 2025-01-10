import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  BeforeInsert,
  BeforeRemove,
  BeforeUpdate,
} from 'typeorm';

@Entity()
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  content: string;

  @Column()
  creationDate: Date;

  @Column()
  endingDate: Date;

  @Column()
  priority: string;

  @Column()
  status: boolean;

  @BeforeInsert()
  logInsert() {
    console.log(`Task with "${this.title}" title was created.`);
  }

  @BeforeUpdate()
  logUpdate() {
    console.log(`Task with ${this.id} id was updated. `);
  }

  @BeforeRemove()
  logDelete() {
    console.log(`Task with ${this.id} id was removed.`);
  }
}
