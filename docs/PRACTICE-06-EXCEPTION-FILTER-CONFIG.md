# Bài thực hành 6: Exception Filter và Config

Mục tiêu: Sau bài này bạn sẽ biết viết **Exception Filter** (bắt exception và trả response lỗi thống nhất) và dùng **ConfigModule** để đọc biến môi trường.

**Yêu cầu:** Đã làm Bài 1–5.

---

## Trước khi bắt đầu

- **Exception Filter**: Bắt mọi exception (từ Guard, Pipe, Controller, Service). Có thể format lại body lỗi (statusCode, message, error, timestamp) thay vì để Nest format mặc định.
- **ConfigModule** (@nestjs/config): Load biến từ `.env`, dùng `ConfigService` để inject và đọc giá trị trong service/controller.

---

## Thực hành 1: Exception Filter – Format response lỗi thống nhất

**Mục tiêu:** Mọi exception trả về đều có dạng `{ statusCode, message, error, timestamp }`.

### Bước 1.1 – Cài package (nếu chưa có)

```bash
npm i @nestjs/config
```

(Không bắt buộc cho Exception Filter; cần cho phần Config.)

### Bước 1.2 – Tạo Exception Filter

Tạo file `src/common/filters/http-exception.filter.ts`:

```ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    const body =
      typeof message === 'object' && message !== null && 'message' in message
        ? (message as { message: string | string[] }).message
        : String(message);

    response.status(status).json({
      statusCode: status,
      message: Array.isArray(body) ? body : [body],
      error: exception instanceof HttpException ? exception.name : 'Error',
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
```

### Bước 1.3 – Đăng ký Filter toàn cục

Trong `src/main.ts`:

- Import: `import { AllExceptionsFilter } from './common/filters/http-exception.filter';`
- Sau khi tạo app: `app.useGlobalFilters(new AllExceptionsFilter());`

### Kiểm tra

- GET `/items/999` → 404; body có `statusCode: 404`, `message`, `error`, `timestamp`, `path`.
- Gửi POST với body không hợp lệ (validation lỗi) → 400 với format tương tự.

**Ý chính:** `@Catch()` bắt mọi exception. Dùng `ArgumentsHost` để lấy `Request`/`Response`, kiểm tra exception có phải `HttpException` để lấy status và message.

---

## Thực hành 2: ConfigModule – Đọc biến môi trường

**Mục tiêu:** Dùng `ConfigService` để đọc `PORT`, `NODE_ENV` (hoặc biến tùy chỉnh) thay vì `process.env` trực tiếp.

### Bước 2.1 – Đăng ký ConfigModule

Trong `src/app.module.ts`:

- Import: `import { ConfigModule } from '@nestjs/config';`
- Trong `imports` thêm (ưu tiên đầu mảng):

```ts
ConfigModule.forRoot({
  isGlobal: true,  // dùng được ConfigService ở mọi module, không cần import
}),
```

### Bước 2.2 – Tạo file .env (nếu chưa có)

Trong thư mục gốc project, tạo `.env`:

```
PORT=3000
NODE_ENV=development
APP_NAME=nestjs_template
```

(Đảm bảo `.env` đã có trong `.gitignore`.)

### Bước 2.3 – Dùng ConfigService trong code

**Ví dụ 1 – Trong `main.ts` (bootstrap):**

Nest chưa khởi tạo xong nên không inject ConfigService trong main được. Có thể dùng `process.env` trong main, hoặc đọc config sau khi `app.listen()`.

**Ví dụ 2 – Trong service hoặc controller:**

```ts
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private config: ConfigService) {}

  getConfig() {
    return {
      port: this.config.get<number>('PORT', 3000),
      env: this.config.get<string>('NODE_ENV', 'development'),
      appName: this.config.get<string>('APP_NAME'),
    };
  }
}
```

Trong controller: inject `ConfigService` tương tự, gọi `this.config.get('KEY')`.

### Kiểm tra

- Tạo route GET `/config` (hoặc dùng route có sẵn) trả về object từ `getConfig()` → thấy giá trị đọc từ `.env`.

**Ý chính:** `ConfigModule.forRoot({ isGlobal: true })` load file `.env` từ thư mục gốc. `ConfigService.get('KEY', default?)` dùng để đọc giá trị; có thể type: `get<number>('PORT')`.

---

## Tóm tắt bài 6

| Khái niệm | Ý nghĩa ngắn |
|-----------|--------------|
| **Exception Filter** | Catch exception, dùng ArgumentsHost lấy Request/Response, trả JSON format thống nhất. |
| **@Catch()** | Bắt mọi exception; @Catch(HttpException) chỉ bắt HttpException. |
| **ConfigModule** | forRoot() load .env; isGlobal: true để dùng ConfigService mọi nơi. |
| **ConfigService** | Inject vào service/controller; get('KEY', default) đọc biến môi trường. |

---

## Gợi ý bài tiếp theo

- **Bài 7:** Provider scope (REQUEST, TRANSIENT), Unit test (test service với mock), E2E test.
