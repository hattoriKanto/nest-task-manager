import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserServices } from './user.services';
import { UserDto } from './dtos/user.dtos';
import { JwtService } from '@nestjs/jwt';
import getHashedPassword from './utils/getHashedPassword';

@Injectable()
export class AuthServices {
  constructor(
    private userServices: UserServices,
    private jwtServices: JwtService,
  ) {}

  async register({
    email,
    password,
  }: UserDto): Promise<{ access_token: string }> {
    const { hash, salt } = await getHashedPassword(password);
    const newUser: UserDto = {
      email,
      password: `${salt}.${hash}`,
    };
    const user = await this.userServices.create(newUser);

    const payload = { sub: user.id, email };
    return {
      access_token: await this.jwtServices.signAsync(payload),
    };
  }

  async logIn({ email, password }: UserDto): Promise<{ access_token: string }> {
    const user = await this.userServices.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User with such email does not exist.');
    }

    const [salt, storedHash] = user.password.split('.');
    const { hash } = await getHashedPassword(password, salt);

    if (hash !== storedHash) {
      throw new UnauthorizedException('Wrong password.');
    }

    const payload = { sub: user.id, email };
    return {
      access_token: await this.jwtServices.signAsync(payload),
    };
  }
}
