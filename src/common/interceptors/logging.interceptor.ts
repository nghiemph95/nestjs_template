import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const now = Date.now();
    return next.handle().pipe(
      tap(() =>
        console.log(`[${context.getHandler().name}] ${Date.now() - now}ms`),
      ),
      map((data) => ({
        data: data as object,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
