/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class UpdateItemDto {
  @IsString()
  @IsNotEmpty({ message: 'name không được để trống' })
  @MinLength(1, { message: 'name phải có ít nhất 1 ký tự' })
  name: string;
}
