# Bài thực hành 5: Interceptor và Custom Pipe

Mục tiêu: Sau bài này bạn sẽ biết dùng **Interceptor** (transform response, log thời gian xử lý) và viết **Custom Pipe** (transform/validate tham số theo ý mình).

**Yêu cầu:** Đã làm Bài 1–4 (Items CRUD, Guard, Middleware).

---

## Trước khi bắt đầu

- **Interceptor**: Chạy trước và sau route handler. Có thể: transform response (bọc trong object `{ data, timestamp }`), log thời gian xử lý, cache. Dùng `rxjs` (Observable).
- **Pipe**: Validate hoặc transform **một tham số** (param, query, body) trước khi vào controller. Có sẵn: `ValidationPipe`, `ParseIntPipe`, `ParseUUIDPipe`. **Custom Pipe** = class implement interface `PipeTransform`.

---

## Thực hành 1: Interceptor – Bọc response và log thời gian

**Mục tiêu:** Mọi response trả về đều có dạng `{ data, timestamp }` và in ra console thời gian xử lý (ms).

### Bước 1.1 – Tạo Interceptor

Tạo file `src/common/interceptors/transform.interceptor.ts`:

```ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const now = Date.now();
    return next.handle().pipe(
      map((data) => ({
        data,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
```

(Để log thời gian xử lý, trong `pipe` bạn có thể dùng `tap(() => console.log(`Duration: ${Date.now() - now}ms`))` — cần import `tap` từ `rxjs/operators`.)

### Bước 1.2 – Đăng ký Interceptor toàn cục

Trong `src/main.ts`:

- Import: `import { TransformInterceptor } from './common/interceptors/transform.interceptor';`
- Sau khi tạo app: `app.useGlobalInterceptors(new TransformInterceptor());`

### Kiểm tra

- GET `http://localhost:3000/items` → response dạng `{ "data": [...], "timestamp": "2025-02-24T..." }` thay vì chỉ mảng.

**Ý chính:** Interceptor dùng `next.handle()` trả về Observable; dùng `map()` để transform value trước khi trả về client.

---

## Thực hành 2: Interceptor – Log duration (thời gian xử lý)

**Mục tiêu:** In ra console thời gian (ms) từ lúc request vào đến lúc response trả về.

### Bước 2.1 – Sửa hoặc tạo Interceptor mới

Trong `transform.interceptor.ts` (hoặc tạo `logging.interceptor.ts`):

```ts
import { tap } from 'rxjs/operators';

// Trong intercept():
const now = Date.now();
return next.handle().pipe(
  tap(() => console.log(`[${context.getHandler().name}] ${Date.now() - now}ms`)),
  map((data) => ({ data, timestamp: new Date().toISOString() })),
);
```

(Thứ tự: `tap` trước `map` để log trước khi transform. Nếu chỉ cần log duration, có thể bỏ `map` hoặc tách interceptor riêng.)

### Kiểm tra

- Gọi bất kỳ route nào, xem terminal in ra thời gian ms.

---

## Thực hành 3: Custom Pipe – Parse và validate ID

**Mục tiêu:** Tạo Pipe kiểm tra `:id` phải là số nguyên dương; nếu không thì throw `BadRequestException`.

### Bước 3.1 – Tạo Pipe

Tạo file `src/common/pipes/parse-positive-int.pipe.ts`:

```ts
import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';

@Injectable()
export class ParsePositiveIntPipe implements PipeTransform<string, number> {
  transform(value: string, metadata: ArgumentMetadata): number {
    const num = parseInt(value, 10);
    if (Number.isNaN(num) || num < 1) {
      throw new BadRequestException('ID phải là số nguyên dương');
    }
    return num;
  }
}
```

### Bước 3.2 – Dùng Pipe trong controller

Trong `items.controller.ts`, với route `findOne`, `update`, `remove`:

- Import: `import { ParsePositiveIntPipe } from '../common/pipes/parse-positive-int.pipe';`
- Thêm pipe vào `@Param('id')`:

```ts
@Get('items/:id')
findOne(@Param('id', ParsePositiveIntPipe) id: number) {
  const item = this.itemsService.findOne(id);
  if (item === null) throw new NotFoundException(`Item với id ${id} không tồn tại`);
  return item;
}
```

(Khi dùng pipe, `id` đã là `number`, không cần `parseInt` trong controller.)

### Kiểm tra

- GET `/items/abc` → 400 Bad Request, message "ID phải là số nguyên dương".
- GET `/items/0` hoặc `/items/-1` → 400.
- GET `/items/1` → 200 (nếu có item id 1).

**Ý chính:** Pipe nhận `value` (string từ param) và `metadata`; return giá trị đã transform hoặc throw exception. Nest tự inject pipe khi khai báo ở vị trí tham số.

---

## Tóm tắt bài 5

| Khái niệm | Ý nghĩa ngắn |
|-----------|--------------|
| **Interceptor** | NestInterceptor: intercept(context, next) → next.handle().pipe(map/tap). Transform response hoặc side effect (log). |
| **Pipe** | PipeTransform: transform(value, metadata) → giá trị mới hoặc throw. Validate/transform từng tham số. |
| **Observable** | Interceptor dùng RxJS; next.handle() trả Observable, dùng map/tap để xử lý. |
| **useGlobalInterceptors** | Đăng ký interceptor cho mọi route (trong main.ts). |

---

## Gợi ý bài tiếp theo

- **Bài 6:** [PRACTICE-06-EXCEPTION-FILTER-CONFIG.md](./PRACTICE-06-EXCEPTION-FILTER-CONFIG.md) – Exception Filter (format lỗi thống nhất), ConfigModule (biến môi trường).
