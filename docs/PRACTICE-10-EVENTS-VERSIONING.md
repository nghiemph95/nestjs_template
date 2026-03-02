# Bài thực hành 10: Events và API Versioning

Mục tiêu: Sau bài này bạn sẽ biết dùng **EventEmitter2** (hoặc `@nestjs/event-emitter`) để phát và lắng nghe **sự kiện nội bộ** (khi tạo item thì gửi event, handler khác xử lý), và cấu hình **API versioning** (vd: `/v1/items`, `/v2/items`).

**Yêu cầu:** Đã làm Bài 1–4.

---

## Trước khi bắt đầu

- **Events**: Thay vì gọi trực tiếp service B từ service A, A **emit event** (vd: `item.created`); handler (listener) đăng ký nhận event và xử lý (log, gửi email, cập nhật cache…). Giúp tách biệt logic, dễ mở rộng.
- **Versioning**: Cho phép nhiều phiên bản API cùng tồn tại (vd: `/v1/items`, `/v2/items`). Nest hỗ trợ URI versioning, Header versioning, v.v.

---

## Thực hành 1: EventEmitter – Phát và lắng nghe sự kiện

**Mục tiêu:** Khi POST tạo item mới, ItemsService phát event `item.created`; một listener in log (hoặc gửi vào service khác) để minh họa.

### Bước 1.1 – Cài package

```bash
npm i @nestjs/event-emitter
```

### Bước 1.2 – Đăng ký EventEmitterModule

Trong `src/app.module.ts`:

```ts
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    // ... ItemsModule, CommonModule, ...
  ],
  // ...
})
export class AppModule {}
```

### Bước 1.3 – Phát event từ Service

Trong `ItemsService`, inject `EventEmitter2` và emit sau khi tạo item:

```ts
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ItemsService {
  constructor(private eventEmitter: EventEmitter2) {}

  create(dto: CreateItemDto): Item {
    const item: Item = { id: this.nextId++, name: dto.name, ... };
    this.items.push(item);
    this.eventEmitter.emit('item.created', { item });
    return item;
  }
}
```

### Bước 1.4 – Listener (handler)

Tạo file `src/items/listeners/item.listeners.ts`:

```ts
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class ItemListeners {
  @OnEvent('item.created')
  handleItemCreated(payload: { item: { id: number; name: string } }) {
    console.log('[Event] Item created:', payload.item);
  }
}
```

Đăng ký `ItemListeners` trong `ItemsModule` (providers). Khi có event `item.created`, method `handleItemCreated` được gọi.

### Kiểm tra

- POST tạo item mới → xem terminal in ra `[Event] Item created: ...`.

**Ý chính:** `EventEmitter2.emit('event.name', payload)` phát event; `@OnEvent('event.name')` đăng ký handler. Handler có thể là service khác (log, gửi queue, cập nhật cache).

---

## Thực hành 2: API Versioning (URI)

**Mục tiêu:** Bật versioning theo URI: `/v1/items`, `/v2/items` (có thể có hai controller hoặc một controller xử lý nhiều version).

### Bước 2.1 – Bật versioning trong main.ts

```ts
import { VERSION_NEUTRAL, VersioningType } from '@nestjs/common';

const app = await NestFactory.create(AppModule);
app.enableVersioning({
  type: VersioningType.URI,
  prefix: 'v',
  defaultVersion: '1',
});
```

Sau đó route mặc định sẽ có prefix version: `/v1/...` nếu controller không chỉ định khác.

### Bước 2.2 – Gắn version cho controller

Trong controller:

```ts
@Controller({ path: 'items', version: '1' })
export class ItemsController {}
```

Hoặc `version: ['1', '2']` để một controller phục vụ nhiều version. Client gọi: GET `/v1/items`, GET `/v2/items`.

### Kiểm tra

- GET `http://localhost:3000/v1/items` → 200 (thay vì GET `/items` nếu chỉ dùng defaultVersion).

**Ý chính:** `enableVersioning` + `VersioningType.URI` + `prefix: 'v'` → URL dạng `/v1/...`. Controller chỉ định `version: '1'` hoặc `version: ['1','2']`.

---

## Thực hành 3: Version trung lập (VERSION_NEUTRAL)

Một số route không cần version (vd: health, webhook). Dùng `version: VERSION_NEUTRAL`:

```ts
@Controller({ path: 'health', version: VERSION_NEUTRAL })
export class HealthController {}
```

Route sẽ là `/health` (không có `/v1`).

---

## Tóm tắt bài 10

| Khái niệm | Ý nghĩa ngắn |
|-----------|--------------|
| **EventEmitter2** | emit('event', payload); @OnEvent('event') để lắng nghe; tách logic, không gọi trực tiếp. |
| **enableVersioning** | type: URI, prefix: 'v' → URL /v1/..., /v2/...; controller chỉ định version. |
| **VERSION_NEUTRAL** | Route không có prefix version. |

---

## Gợi ý mở rộng

- Throttler (giới hạn request), CORS, Helmet (security headers).
- Microservice (TCP, Redis transport), Queue (Bull).
