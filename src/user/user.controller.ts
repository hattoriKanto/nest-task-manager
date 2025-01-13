import {
  Controller,
  Post,
  Delete,
  Param,
  Body,
  UseInterceptors,
  Session,
} from '@nestjs/common';
import { User } from './user.entity';
import { UserDto } from 'src/user/dtos/user.dto';
import { UserService } from './user.service';
import { AuthService } from './auth.service';
import { SanitizeResponseInterceptor } from 'src/interceptors/sanitize-response.interceptor';

@UseInterceptors(SanitizeResponseInterceptor)
@Controller('auth')
export class UserController {
  constructor(
    private userService: UserService,
    private authService: AuthService,
  ) {}

  @Post('/signup')
  async signUp(@Body() data: UserDto, @Session() session: any): Promise<User> {
    const user = await this.authService.signUp(data);
    session.userId = user.id;
    return user;
  }

  @Post('/signin')
  async signIn(@Body() data: UserDto, @Session() session: any): Promise<User> {
    const user = await this.authService.signIn(data);
    session.userId = user.id;
    return user;
  }

  @Post('/signout')
  signOut(@Session() session: any): void {
    session.userId = null;
  }

  @Delete('/:id')
  delete(@Param('id') id: string): Promise<void> {
    return this.userService.delete(parseInt(id));
  }
}
