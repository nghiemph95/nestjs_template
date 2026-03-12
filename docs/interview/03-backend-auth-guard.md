# Bài 3: Backend — Auth Guard (API Key / Bearer) (NestJS)

**Nếu chưa có project NestJS,** xem [README](./README.md) phần **Cài đặt NestJS**.

---

## Đề bài

> "Một số route cần **bảo vệ**: chỉ khi request gửi đúng **API Key** (vd header `X-API-Key: secret123`) hoặc **Bearer token** thì mới cho qua; không có hoặc sai thì trả **401 Unauthorized**. Hãy viết **Guard** và áp dụng cho toàn bộ ItemsController (hoặc chỉ POST/DELETE). Có thể dùng decorator **@Public()** để đánh dấu route không cần auth."

*(Kiểm tra: Guard, CanActivate, ExecutionContext, Request headers, UnauthorizedException.)*

---

## Hướng dẫn triển khai (file / cấu trúc)

- **Nên tạo / chỉnh file nào**
  - **Tạo mới:** `src/common/guard/api-key.guard.ts` — class implement `CanActivate`; đọc header `X-API-Key` hoặc `Authorization: Bearer <token>`; so sánh với giá trị cố định (hoặc ConfigService); nếu sai/thiếu → `throw new UnauthorizedException('Unauthorized')`; đúng return `true`.
  - **Tạo mới (tùy chọn):** `src/common/decorators/public.decorator.ts` — `@Public()` dùng `SetMetadata('isPublic', true)` để Guard bỏ qua.
  - **Chỉnh:** `src/items/items.controller.ts` — `@UseGuards(ApiKeyGuard)` ở class level (áp toàn bộ) hoặc chỉ trên từng method; nếu dùng @Public thì trong Guard check metadata và return true.

- **Có cần tạo thêm file không**
  - Có thể dùng `process.env.API_KEY` hoặc `ConfigService` để không hardcode secret.

- **Code nằm ở đâu (map file → nội dung)**

| File | Nội dung |
|------|----------|
| `src/common/guard/api-key.guard.ts` | CanActivate; Reflector check @Public; đọc header; so sánh API_KEY; 401 hoặc return true. |
| `src/common/decorators/public.decorator.ts` | SetMetadata('isPublic', true). |
| `src/items/items.controller.ts` | @UseGuards(ApiKeyGuard); @Public() trên GET nếu cần. |

---

## Cách xử lý

1. **Guard:** Implement `CanActivate`; inject `Reflector` để đọc metadata; nếu handler/class có `isPublic` thì `return true`. Ngược lại: lấy request từ `context.switchToHttp().getRequest()`, đọc `headers['x-api-key']` hoặc `Authorization` (Bearer); so với expected key; không khớp thì `throw new UnauthorizedException()`.
2. **@Public():** Tạo decorator `export const Public = () => SetMetadata('isPublic', true)`; gắn lên route không cần auth.
3. **Áp dụng:** Trên controller `@UseGuards(ApiKeyGuard)`; hoặc chỉ trên `@Post()` và `@Delete()` nếu chỉ bảo vệ write.

---

## Code mẫu

### File: `src/common/decorators/public.decorator.ts`

```typescript
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

### File: `src/common/guard/api-key.guard.ts`

```typescript
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  private readonly apiKey = process.env.API_KEY || 'secret123';

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const key =
      request.headers['x-api-key'] ??
      (request.headers.authorization?.startsWith('Bearer ')
        ? request.headers.authorization.slice(7)
        : null);

    if (!key || key !== this.apiKey) {
      throw new UnauthorizedException('Unauthorized');
    }
    return true;
  }
}
```

### File: `src/items/items.controller.ts` (excerpt)

```typescript
import { UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from '../common/guard/api-key.guard';
import { Public } from '../common/decorators/public.decorator';

@Controller('items')
@UseGuards(ApiKeyGuard)
export class ItemsController {
  // All routes require API Key by default.

  @Get()
  @Public() // optional: allow GET without auth
  findAll() {
    return this.itemsService.findAll();
  }

  @Post()
  create(@Body() body: CreateItemDto) {
    return this.itemsService.create(body);
  }
}
```

**Ghi chú:** Với JWT: dùng Guard + `@nestjs/jwt` verify token, gắn payload vào `request.user`; 401 khi token invalid hoặc hết hạn.
