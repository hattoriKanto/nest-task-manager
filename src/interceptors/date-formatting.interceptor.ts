import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { CreateTaskDto } from 'src/task/dtos/create-task.dto';
import { UpdateTaskDto } from 'src/task/dtos/update-task.dto';

export class DateFormmatingInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<CreateTaskDto | UpdateTaskDto>,
  ): Observable<CreateTaskDto | UpdateTaskDto> {
    const request = context.switchToHttp().getRequest();
    const {
      method,
      body: { creationDate, endingDate },
    } = request;

    if (method === 'POST') {
      if (creationDate) {
        request.body.creationDate = new Date(creationDate).toISOString();
      }
    }

    if (method === 'POST' || method === 'PATCH') {
      if (endingDate) {
        request.body.endingDate = new Date(endingDate).toISOString();
      }
    }

    return next.handle();
  }
}
