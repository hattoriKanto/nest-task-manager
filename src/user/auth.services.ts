import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserServices } from './user.services';
import { UserDto } from './dtos/user.dtos';
import { ValidationUserDto } from './dtos/validation-user.dtos';
import getHashedPassword from './utils/getHashedPassword';
import messages from './constants/messages';

@Injectable()
export class AuthServices {
  constructor(
    private userServices: UserServices,
    private jwtServices: JwtService,
  ) {}

  async validateUserById({
    userId,
    password,
  }: ValidationUserDto): Promise<void> {
    const user = await this.userServices.findById(userId);
    if (!user) {
      throw new NotFoundException(messages.userNotFoundById);
    }

    const [salt, storedHash] = user.password.split('.');
    const { hash } = await getHashedPassword(password, salt);

    if (hash !== storedHash) {
      throw new UnauthorizedException(messages.wrongPassword);
    }
  }

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
      throw new NotFoundException(messages.userNotFoundByEmail);
    }

    const [salt, storedHash] = user.password.split('.');
    const { hash } = await getHashedPassword(password, salt);

    if (hash !== storedHash) {
      throw new UnauthorizedException(messages.wrongPassword);
    }

    const payload = { sub: user.id, email };
    return {
      access_token: await this.jwtServices.signAsync(payload),
    };
  }

  async updatePassword({
    userId,
    password,
    newPassword,
  }: ValidationUserDto): Promise<{ access_token: string }> {
    await this.validateUserById({ userId, password });

    const { hash: newHash, salt: newSalt } =
      await getHashedPassword(newPassword);
    const updatedUser = await this.userServices.updatePassword(
      userId,
      `${newSalt}.${newHash}`,
    );

    const payload = {
      sub: updatedUser.id,
      email: updatedUser.email,
    };
    return {
      access_token: await this.jwtServices.signAsync(payload),
    };
  }

  async deleteUser({
    userId,
    password,
  }: ValidationUserDto): Promise<{ message: string }> {
    await this.validateUserById({ userId, password });
    await this.userServices.delete(userId);
    return { message: messages.userDeleted };
  }
}
