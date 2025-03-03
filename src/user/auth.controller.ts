import { Body, Controller, Post } from '@nestjs/common';
import { AuthServices } from './auth.services';
import { UserDto } from './dtos/user.dtos';

@Controller('auth')
export class AuthController {
  constructor(private authServices: AuthServices) {}

  @Post('register')
  register(@Body() userData: UserDto): Promise<{ access_token: string }> {
    return this.authServices.register(userData);
  }

  @Post('login')
  logIn(@Body() userData: UserDto): Promise<{ access_token: string }> {
    return this.authServices.logIn(userData);
  }
}
