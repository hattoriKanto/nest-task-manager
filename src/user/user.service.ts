import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UserDto } from 'src/user/dtos/user.dto';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  async findOneById(id: number): Promise<User> {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User with ${id} id was not found.`);
    return user;
  }

  async findOneByEmail(email: string): Promise<User | null> {
    const user = await this.repo.findOne({ where: { email } });
    return user || null;
  }

  create(data: UserDto): Promise<User> {
    const user = this.repo.create(data);
    return this.repo.save(user);
  }

  async delete(id: number): Promise<void> {
    const user = await this.findOneById(id);
    await this.repo.remove(user);
  }
}
