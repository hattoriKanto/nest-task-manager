import { Expose } from 'class-transformer';

export class SanitizedUserDto {
  @Expose()
  id: string;

  @Expose()
  email: string;
}
