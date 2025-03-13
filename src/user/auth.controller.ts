import {
  Body,
  Controller,
  Delete,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthServices } from './auth.service';
import { UserDto } from './dtos/user.dtos';
import { AuthGuard } from './guards/auth.guard';
import { UpdateUserDto } from './dtos/update-user.dtos';
import { DeleteUserDto } from './dtos/delete-user.dtos';

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

  @UseGuards(AuthGuard)
  @Delete('me')
  async delete(
    @Request() request,
    @Body() userData: DeleteUserDto,
  ): Promise<{ message: string }> {
    const { userId } = request.user;
    return this.authServices.deleteUser({ userId, ...userData });
  }

  @UseGuards(AuthGuard)
  @Patch('me')
  update(
    @Request() request,
    @Body() userData: UpdateUserDto,
  ): Promise<{ access_token: string }> {
    const { userId } = request.user;
    return this.authServices.updatePassword({ userId, ...userData });
  }
}
