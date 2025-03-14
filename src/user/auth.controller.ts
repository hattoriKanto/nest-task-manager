import {
  Body,
  Controller,
  Delete,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserDto } from './dtos/user.dtos';
import { AuthGuard } from './guards/auth.guard';
import { UpdateUserDto } from './dtos/update-user.dtos';
import { DeleteUserDto } from './dtos/delete-user.dtos';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() userData: UserDto): Promise<{ access_token: string }> {
    return this.authService.register(userData);
  }

  @Post('login')
  logIn(@Body() userData: UserDto): Promise<{ access_token: string }> {
    return this.authService.logIn(userData);
  }

  @UseGuards(AuthGuard)
  @Delete('me')
  async delete(
    @Request() request,
    @Body() userData: DeleteUserDto,
  ): Promise<{ message: string }> {
    const { userId } = request.user;
    return this.authService.deleteUser({ userId, ...userData });
  }

  @UseGuards(AuthGuard)
  @Patch('me')
  update(
    @Request() request,
    @Body() userData: UpdateUserDto,
  ): Promise<{ access_token: string }> {
    const { userId } = request.user;
    return this.authService.updatePassword({ userId, ...userData });
  }
}
