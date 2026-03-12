# Bài 2: Backend — Validation & Exception Handling (NestJS)

**Nếu chưa có project NestJS,** xem [README](./README.md) phần **Cài đặt NestJS**.

---

## Đề bài

> "Khi nhận POST /items, nếu thiếu **name** hoặc **name** rỗng thì trả **400** với message lỗi rõ ràng. Dùng **class-validator** cho DTO. Mọi exception (BadRequestException, NotFoundException, ...) trả JSON thống nhất (vd `{ statusCode, message, error }`) và status code phù hợp."

*(Kiểm tra: ValidationPipe, class-validator decorators, HTTP exceptions.)*

---

## Hướng dẫn triển khai (file / cấu trúc)

- **Nên tạo / chỉnh file nào**
  - **Cài đặt:** `npm i class-validator class-transformer`.
  - **Chỉnh:** `src/main.ts` — `app.useGlobalPipes(new ValidationPipe({ whitelist: true }))` để Nest tự validate DTO và trả 400 khi invalid.
  - **Chỉnh:** `src/items/dto/create-item.dto.ts` — thêm decorator `@IsString()`, `@IsNotEmpty({ message: '...' })`, `@MinLength(1)` cho `name`; optional `description` với `@IsOptional()`, `@IsString()`.

- **Có cần tạo thêm file không**
  - Không bắt buộc. Có thể dùng **Exception Filter** (custom) để format response lỗi thống nhất nếu interviewer yêu cầu.

- **Code nằm ở đâu (map file → nội dung)**

| File | Nội dung |
|------|----------|
| `src/main.ts` | ValidationPipe global (whitelist: true). |
| `src/items/dto/create-item.dto.ts` | class-validator: @IsNotEmpty, @MinLength cho name. |
| Controller | Đã throw NotFoundException, BadRequest do ValidationPipe xử lý khi DTO invalid. |

---

## Cách xử lý

1. **ValidationPipe:** Trong `main.ts`, sau `NestFactory.create()`, gọi `app.useGlobalPipes(new ValidationPipe({ whitelist: true }))`. Khi body không thỏa DTO, Nest trả 400 với message từ class-validator.
2. **DTO:** Import từ `class-validator`: `IsString`, `IsNotEmpty`, `MinLength`, `IsOptional`. Trên field `name`: `@IsString()`, `@IsNotEmpty({ message: 'Name is required' })`, `@MinLength(1)`.
3. **Exception:** Controller tiếp tục dùng `throw new NotFoundException('...')`; Nest có sẵn exception filter, response dạng `{ statusCode, message, error }`.

---

## Code mẫu

### File: `src/main.ts` (excerpt)

```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strip properties not in DTO
      forbidNonWhitelisted: true, // optional: 400 if extra props sent
    }),
  );
  await app.listen(3000);
}
bootstrap();
```

### File: `src/items/dto/create-item.dto.ts`

```typescript
import { IsString, IsNotEmpty, MinLength, IsOptional } from 'class-validator';

export class CreateItemDto {
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  @MinLength(1, { message: 'Name must not be empty' })
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}
```

**Kết quả:** Gửi POST /items với `{}` hoặc `{ name: '' }` → 400 và message từ validator. NotFoundException trong controller → 404 với format chuẩn NestJS.
