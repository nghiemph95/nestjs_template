# Bài thực hành 4: Guard và Middleware

Mục tiêu: Sau bài này bạn sẽ hiểu **Guard** (kiểm tra quyền/điều kiện trước khi vào controller) và **Middleware** (chạy trước khi request tới route handler).

**Yêu cầu:** Đã làm Bài 1 (có route Items). Bài 2, 3 không bắt buộc.

---

## Trước khi bắt đầu

- **Guard**: Chạy sau middleware, trước interceptor và controller. Thường dùng để: xác thực (có token không?), phân quyền (có quyền gọi route này không?). Trả `true` → cho qua; `false` hoặc throw exception → chặn.
- **Middleware**: Hàm nhận `(req, res, next)`. Chạy trước khi request tới bất kỳ route nào (hoặc một nhóm route nếu bạn gắn có điều kiện). Dùng để: log, nén response, thêm header, parse body đặc biệt, v.v.

---

## Thực hành 1: Middleware – Log mỗi request

**Mục tiêu:** Tạo middleware in ra method + URL mỗi khi có request.

### Bước 1.1 – Tạo middleware

Tạo file `src/common/middleware/logger.middleware.ts`:

```ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log(`${req.method} ${req.originalUrl}`);
    next();
  }
}
```

### Bước 1.2 – Đăng ký middleware trong module

Middleware gắn vào module (không phải toàn cục). Ví dụ gắn vào `AppModule`:

Trong `src/app.module.ts`:

- Import: `import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';`
- Import middleware: `import { LoggerMiddleware } from './common/middleware/logger.middleware';`
- Cho `AppModule` implement `NestModule`:

```ts
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*'); // * = mọi route
  }
}
```

### Kiểm tra

- Chạy app, gọi GET `http://localhost:3000/items`. Trong terminal in ra: `GET /items`.

**Ý chính:** `configure(consumer)` dùng để áp dụng middleware; `forRoutes('*')` = áp dụng cho mọi route. Có thể thay `'*'` bằng `'items'` hoặc `{ path: 'items', method: RequestMethod.GET }` để chỉ áp dụng cho một số route.

---

## Thực hành 2: Guard – Bảo vệ route bằng API Key

**Mục tiêu:** Chỉ cho phép gọi API nếu header `x-api-key` trùng với giá trị cấu hình (ví dụ chuỗi bí mật). Nếu thiếu hoặc sai → 403 Forbidden.

### Bước 2.1 – Tạo Guard

Tạo file `src/common/guards/api-key.guard.ts`:

```ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  private readonly apiKey = 'my-secret-api-key'; // nên đưa vào biến môi trường

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const key = request.headers['x-api-key'];
    if (key !== this.apiKey) {
      throw new ForbiddenException('API Key không hợp lệ');
    }
    return true;
  }
}
```

### Bước 2.2 – Gắn Guard vào controller hoặc route

**Cách A – Bảo vệ cả controller Items**

Trong `items.controller.ts`:

- Import: `import { UseGuards } from '@nestjs/common';`, `import { ApiKeyGuard } from '../common/guards/api-key.guard';`
- Thêm decorator ở đầu class:

```ts
@Controller()
@UseGuards(ApiKeyGuard)
export class ItemsController {
  // ...
}
```

**Cách B – Chỉ bảo vệ một vài route** (ví dụ chỉ POST):

```ts
@Post('items')
@UseGuards(ApiKeyGuard)
create(@Body() body: CreateItemDto) {
  return this.itemsService.create(body);
}
```

### Kiểm tra

- Gọi GET `http://localhost:3000/items` **không** gửi header → 403, message "API Key không hợp lệ".
- Gọi với header: `x-api-key: my-secret-api-key` → 200.

**Ý chính:** Guard nhận `ExecutionContext`, lấy request từ `switchToHttp().getRequest()`. Trả `true` = cho qua; throw exception = dừng và trả lỗi cho client.

---

## Thực hành 3: Guard toàn cục (tùy chọn)

**Mục tiêu:** Áp dụng ApiKeyGuard cho mọi route mà không cần gắn từng controller.

Trong `src/main.ts` sau khi tạo app:

```ts
import { ApiKeyGuard } from './common/guards/api-key.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalGuards(new ApiKeyGuard());
  // ...
}
```

Lưu ý: Guard dùng toàn cục cần có thể inject dependency (nếu cần dùng service trong guard thì nên đăng ký guard trong module và dùng `APP_GUARD`).

---

## Tóm tắt bài 4

| Khái niệm     | Ý nghĩa ngắn |
|---------------|--------------|
| **Middleware** | Hàm `(req, res, next)`, đăng ký trong module qua `configure(consumer)`. Chạy trước route. |
| **Guard**      | Class implement `CanActivate`, dùng `@UseGuards(Guard)` hoặc global. Chạy trước controller. |
| **forRoutes**  | Chỉ định route nào áp dụng middleware: `'*'`, `'items'`, hoặc object path + method. |
| **ExecutionContext** | Cho guard/interceptor biết request, controller, handler đang chạy. |

---

## Gợi ý bài tiếp theo

- **Bài 5:** [PRACTICE-05-INTERCEPTOR-PIPE.md](./PRACTICE-05-INTERCEPTOR-PIPE.md) – Interceptor (transform response, log duration), Custom Pipe (validate/transform param).

## Gợi ý mở rộng

- **JWT Guard:** Dùng `@nestjs/jwt` + Passport, guard kiểm tra Bearer token và gắn user vào `request.user`.
- **Middleware có dependency:** Tạo module chứa middleware, export và import vào AppModule, dùng `consumer.apply(LoggerMiddleware).forRoutes(...)`.
- **Throttler:** Giới hạn số request theo IP (chống spam) bằng `@nestjs/throttler`.
