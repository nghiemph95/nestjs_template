import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const RequestId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string | null => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const headerName = (data as string) || 'x-request-id';
    const value = request.get(headerName);
    return value ?? null;
  },
);
