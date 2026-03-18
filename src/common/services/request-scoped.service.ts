import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.REQUEST })
export class RequestScopedService {
  private requestId: string;

  constructor() {
    this.requestId = Math.random().toString(36).substring(2, 15);
  }

  getRequestId(): string {
    return this.requestId;
  }
}
