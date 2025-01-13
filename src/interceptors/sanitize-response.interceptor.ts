import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { map, Observable } from 'rxjs';
import { SanitizedUserDto } from 'src/user/dtos/sanitized-user.dto';

export class SanitizeResponseInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<SanitizedUserDto> {
    return next.handle().pipe(
      map((data: any) => {
        return plainToClass(SanitizedUserDto, data, {
          excludeExtraneousValues: true,
        });
      }),
    );
  }
}
