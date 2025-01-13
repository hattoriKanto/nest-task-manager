import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  endingDate: string;

  @IsOptional()
  @IsString()
  priority: string;

  @IsOptional()
  @IsBoolean()
  status: boolean;
}
