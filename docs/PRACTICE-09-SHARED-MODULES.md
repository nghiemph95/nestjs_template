# Bài thực hành 9: Shared modules và cấu trúc module

Mục tiêu: Sau bài này bạn sẽ hiểu **export / import** giữa các module, cách tạo **SharedModule** (hoặc CommonModule) để gom provider dùng chung, tránh lặp code và inject đúng phạm vi.

**Yêu cầu:** Đã làm Bài 1–4 (ItemsModule, Guard, Middleware).

---

## Trước khi bắt đầu

- **Module** trong Nest: gom **controllers**, **providers**, **imports** (module khác). Chỉ **controller** và **provider** trong cùng module (hoặc module được import) mới inject được lẫn nhau.
- **Export**: Module A khai báo `exports: [SomeService]` → module B **import** A thì B mới dùng được `SomeService` (inject vào controller/provider của B).
- **Shared module**: Module không có controller, chỉ có **providers** (và có thể **import** module khác); export các provider để nhiều feature module dùng chung (vd: helper, format, request-scoped service chung).

---

## Thực hành 1: Tạo CommonModule và export service dùng chung

**Mục tiêu:** Tạo module chứa service tiện ích (vd: `UtilService` có method format string hoặc generate ID). Export service đó; ItemsModule import CommonModule và dùng UtilService trong ItemsService.

### Bước 1.1 – Tạo UtilService

Tạo file `src/common/services/util.service.ts`:

```ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class UtilService {
  generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
  }

  slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  }
}
```

### Bước 1.2 – Tạo CommonModule và export UtilService

Tạo file `src/common/common.module.ts`:

```ts
import { Global, Module } from '@nestjs/common';
import { UtilService } from './services/util.service';

@Global() // optional: nếu dùng @Global() thì mọi module đều dùng được UtilService mà không cần import
@Module({
  providers: [UtilService],
  exports: [UtilService],
})
export class CommonModule {}
```

Nếu **không** dùng `@Global()`: module nào cần `UtilService` thì phải **import** `CommonModule` (vd: `ItemsModule` có `imports: [CommonModule]`).

### Bước 1.3 – Dùng trong ItemsModule

Trong `src/items/items.module.ts`:

```ts
import { CommonModule } from '../common/common.module';

@Module({
  imports: [CommonModule],
  controllers: [ItemsController],
  providers: [ItemsService, ...],
})
export class ItemsModule {}
```

Trong `ItemsService` (hoặc ItemsController):

```ts
constructor(private readonly util: UtilService) {}
// dùng: this.util.generateId(), this.util.slugify(...)
```

### Kiểm tra

- Gọi API Items (vd: POST create) — nếu bạn dùng `util.generateId()` trong logic thì không lỗi inject; có thể log hoặc trả về để thấy UtilService đã hoạt động.

**Ý chính:** Export provider trong module A → chỉ module nào **import A** mới inject được provider đó. `@Global()` làm cho module đó được coi như “đã import” ở mọi nơi (tiện nhưng dễ làm dependency ẩn).

---

## Thực hành 2: Không dùng @Global – Import rõ ràng

**Mục tiêu:** Bỏ `@Global()` khỏi CommonModule. Chỉ những module nào **imports: [CommonModule]** mới dùng được UtilService. AppModule cần import CommonModule một lần (hoặc mỗi feature module import nếu cần).

- Trong `CommonModule`: xóa decorator `@Global()`.
- Trong `ItemsModule`: giữ `imports: [CommonModule]`.
- Module khác (vd: AppModule) nếu có controller/provider cần UtilService thì cũng phải `imports: [CommonModule]`.

**Ý chính:** Import rõ ràng giúp thấy dependency giữa các module; tránh “magic” Global.

---

## Thực hành 3: Re-export module

**Mục tiêu:** Module A import Module B và **re-export** B. Khi module C import A thì C cũng dùng được providers từ B (không cần C import B trực tiếp).

Ví dụ: `CommonModule` import `ConfigModule` và re-export:

```ts
@Module({
  imports: [ConfigModule],
  providers: [UtilService],
  exports: [UtilService, ConfigModule],
})
export class CommonModule {}
```

Khi `ItemsModule` chỉ `imports: [CommonModule]`, nó vẫn dùng được `ConfigService` (vì ConfigModule được export qua CommonModule). Thường dùng khi muốn gom nhiều dependency chung vào một “cửa” (CommonModule).

---

## Tóm tắt bài 9

| Khái niệm | Ý nghĩa ngắn |
|-----------|--------------|
| **exports** | Provider (hoặc module) được export thì module khác **import** mới inject được. |
| **imports** | Import module khác để dùng controller/provider mà module đó **export**. |
| **@Global()** | Module được coi như có mặt ở mọi nơi; không cần import trong từng feature module. |
| **Re-export** | exports: [SomeService, SomeModule] để vừa export provider vừa “chuyển tiếp” module con. |

---

## Gợi ý bài tiếp theo

- **Bài 10:** [PRACTICE-10-EVENTS-VERSIONING.md](./PRACTICE-10-EVENTS-VERSIONING.md) – EventEmitter (sự kiện nội bộ), API versioning hoặc CORS.
