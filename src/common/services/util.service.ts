import { Injectable } from '@nestjs/common';

@Injectable()
export class UtilService {
  generateId(): string {
    return (
      Date.now().toString(36) + Math.random().toString(36).substring(2, 15)
    );
  }

  slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/ /g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/^-+|-+$/g, '');
  }
}
