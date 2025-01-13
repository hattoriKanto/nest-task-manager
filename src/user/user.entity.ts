import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BeforeInsert,
  BeforeRemove,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  password: string;

  @BeforeInsert()
  logInsert() {
    console.log(`User with ${this.email} was created.`);
  }

  @BeforeRemove()
  logDelete() {
    console.log(`User with ${this.id} id was deleted.`);
  }
}
