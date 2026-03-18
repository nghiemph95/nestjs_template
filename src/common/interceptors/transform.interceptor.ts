import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import type { Request } from 'express';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const startedAt = Date.now();
    const req = context.switchToHttp().getRequest<Request>();
    return next.handle().pipe(
      map((data) => ({
        data: data as object,
        meta: {
          method: req?.method,
          path: req?.originalUrl ?? req?.url,
          durationMs: Date.now() - startedAt,
        },
        timestamp: new Date(startedAt).toISOString(),
      })),
    );
  }
}
