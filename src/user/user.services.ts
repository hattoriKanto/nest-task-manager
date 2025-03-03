import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { UserDto } from './dtos/user.dtos';

@Injectable()
export class UserServices {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOneBy({ id });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOneBy({ email });
  }

  async create({ email, password }: UserDto): Promise<User> {
    const user = await this.findByEmail(email);
    if (user) {
      throw new ConflictException('User with such email already exist.');
    }
    const newUser = this.userRepository.create({ email, password });
    return this.userRepository.save(newUser);
  }

  async updatePassword(id: string, password: string): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User with such id does not exist.');
    }
    Object.assign(user, { password });
    return this.userRepository.save(user);
  }

  async delete(id: string): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User with such id does not exist.');
    }
    return this.userRepository.remove(user);
  }
}
