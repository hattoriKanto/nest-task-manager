import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { promisify } from 'util';
import { scrypt as _scrypt, randomBytes } from 'crypto';
import { UserDto } from 'src/user/dtos/user.dto';
import { User } from './user.entity';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(private service: UserService) {}

  async signUp(data: UserDto): Promise<User> {
    const { email, password } = data;
    const user = await this.service.findOneByEmail(email);
    if (user)
      throw new BadRequestException('User with such email already exist.');

    const salt = randomBytes(8).toString('hex');
    const hash = (await scrypt(password, salt, 32)) as Buffer;
    const hashedPassword = salt + '.' + hash.toString('hex');

    const newUser = await this.service.create({
      ...data,
      password: hashedPassword,
    });

    return newUser;
  }

  async signIn(data: UserDto): Promise<User> {
    const { email, password } = data;
    const user = await this.service.findOneByEmail(email);
    if (!user)
      throw new NotFoundException('User with this email does not exist.');

    const [salt, storedPassword] = user.password.split('.');
    const hashedPassword = (await scrypt(password, salt, 32)) as Buffer;
    if (hashedPassword.toString('hex') !== storedPassword)
      throw new BadRequestException('Incorrect password.');

    return user;
  }
}
