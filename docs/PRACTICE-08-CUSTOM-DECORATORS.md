# Bài thực hành 8: Custom Decorators

Mục tiêu: Sau bài này bạn sẽ biết tạo **custom decorator** (param decorator lấy user/request, composite decorator gộp nhiều decorator) để code controller gọn và tái sử dụng.

**Yêu cầu:** Đã làm Bài 1–4.

---

## Trước khi bắt đầu

- **Decorator** trong Nest/TypeScript: hàm nhận (target, key?, descriptor?) hoặc (target, key?, index?) dùng để đánh dấu class, method, tham số.
- **Param decorator**: Tạo decorator cho tham số (vd: `@Param('id')`, `@Body()`). Nest cung cấp `createParamDecorator` để tạo decorator tùy chỉnh — nhận dữ liệu từ request (body, query, header, user sau khi auth) và trả về giá trị inject vào tham số.
- **Composite decorator**: Gộp nhiều decorator vào một (vd: `@Public()`, `@Roles('admin')`) dùng `applyDecorators`.

---

## Thực hành 1: Param decorator – Lấy IP hoặc User-Agent

**Mục tiêu:** Tạo decorator `@ClientInfo()` để lấy object `{ ip, userAgent }` từ request và inject vào tham số controller.

### Bước 1.1 – Tạo Param Decorator

Tạo file `src/common/decorators/client-info.decorator.ts`:

```ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const ClientInfo = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return {
      ip: request.ip || request.connection?.remoteAddress,
      userAgent: request.get('user-agent') || '',
    };
  },
);
```

### Bước 1.2 – Dùng trong controller

Trong bất kỳ controller nào (vd: `ItemsController` hoặc `AppController`):

```ts
import { ClientInfo } from '../common/decorators/client-info.decorator';

@Get('info')
getInfo(@ClientInfo() info: { ip: string; userAgent: string }) {
  return info;
}
```

### Kiểm tra

- GET `http://localhost:3000/info` (hoặc route bạn đặt) → response có `ip`, `userAgent`.

**Ý chính:** `createParamDecorator((data, ctx) => ...)` nhận `ExecutionContext`; `ctx.switchToHttp().getRequest()` lấy request. Giá trị return sẽ được inject vào tham số có gắn decorator.

---

## Thực hành 2: Param decorator có tham số (data)

**Mục tiêu:** Decorator `@Headers('key')` hoặc `@CustomHeader('x-request-id')` trả về giá trị một header cụ thể. Nest đã có `@Headers()` — ở đây chỉ minh họa cách dùng tham số `data`.

```ts
// src/common/decorators/request-id.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const RequestId = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const headerName = data || 'x-request-id';
    return request.get(headerName) || null;
  },
);
```

Dùng: `@RequestId() id: string | null` hoặc `@RequestId('x-correlation-id') id: string | null`.

---

## Thực hành 3: Composite decorator (gộp nhiều decorator)

**Mục tiêu:** Tạo decorator `@Public()` = route không cần check API Key (trong project đang dùng ApiKeyGuard toàn cục). Thực tế là gộp `@SetMetadata('public', true)` và có thể thêm decorator khác.

### Bước 3.1 – SetMetadata

Nest dùng metadata để guard đọc. Tạo decorator:

```ts
// src/common/decorators/public.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

### Bước 3.2 – Guard đọc metadata và bỏ qua route public

Trong `ApiKeyGuard` (hoặc guard đang dùng), kiểm tra metadata trước khi check API Key:

```ts
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    // ... logic check API Key như cũ
  }
}
```

Guard phải nhận `Reflector` qua constructor (Nest tự inject). Khi gọi `getAllAndOverride(IS_PUBLIC_KEY, [handler, class])` thì nếu handler hoặc class có `@Public()` → trả `true` → guard cho qua.

### Bước 3.3 – Gắn @Public() lên route

```ts
@Public()
@Get('health')
health() {
  return { status: 'ok' };
}
```

### Kiểm tra

- GET `/health` không cần header `x-api-key` vẫn 200 (nếu guard đã sửa như trên).

**Ý chính:** Composite decorator = dùng `SetMetadata` (hoặc `applyDecorators`) để gắn metadata; Guard/Interceptor dùng `Reflector` để đọc và quyết định hành vi.

---

## Tóm tắt bài 8

| Khái niệm | Ý nghĩa ngắn |
|-----------|--------------|
| **createParamDecorator** | Tạo decorator cho tham số; nhận (data, ctx), return giá trị inject vào param. |
| **ExecutionContext** | context.switchToHttp().getRequest() để lấy request. |
| **SetMetadata** | Gắn metadata lên handler/class; key + value. |
| **Reflector** | getAllAndOverride(key, [handler, class]) để guard/pipe đọc metadata. |

---

## Gợi ý bài tiếp theo

- **Bài 9:** [PRACTICE-09-SHARED-MODULES.md](./PRACTICE-09-SHARED-MODULES.md) – Export/import module, SharedModule (CommonModule), cấu trúc module.
