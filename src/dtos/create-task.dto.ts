import { IsBoolean, IsString } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsString()
  creationDate: string;

  @IsString()
  endingDate: string;

  @IsString()
  priority: string;

  @IsBoolean()
  status: boolean;
}
