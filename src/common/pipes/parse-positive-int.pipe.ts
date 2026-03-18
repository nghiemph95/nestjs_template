import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';

@Injectable()
export class ParsePositiveIntPipe implements PipeTransform<string, number> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  transform(value: string, metadata: ArgumentMetadata): number {
    const num = parseInt(value, 10);
    if (isNaN(num) || num <= 0) {
      throw new BadRequestException('value must be a positive integer');
    }
    return num;
  }
}
