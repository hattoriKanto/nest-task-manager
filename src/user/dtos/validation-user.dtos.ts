import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class ValidationUserDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsOptional()
  newPassword?: string;
}
