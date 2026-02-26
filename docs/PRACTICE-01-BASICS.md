# Bài thực hành 1: NestJS căn bản – Controller, Service, Module

Mục tiêu: Sau bài này bạn sẽ hiểu **luồng xử lý request** và biết cách tạo **route**, **service** và **module** mới.

---

## Trước khi bắt đầu

- Chạy app: `npm run start:dev`
- Mở trình duyệt hoặc dùng curl/Postman: `http://localhost:3000`
- Bạn sẽ thấy `Hello World!` → đó là kết quả của **AppController** gọi **AppService**.

### Luồng đơn giản

```
Request (GET /) → AppController.getHello() → AppService.getHello() → "Hello World!"
```

- **Controller**: Nhận HTTP request, gọi service, trả response.
- **Service**: Chứa logic (tính toán, gọi DB, …).
- **Module**: Gắn controller + service lại với nhau.

---

## Thực hành 1: Thêm route GET mới

**Mục tiêu:** Tự thêm một route `GET /hello` trả về lời chào.

### Bước 1.1 – Trong `app.service.ts`

Thêm method:

```ts
getHelloCustom(): string {
  return 'Xin chào, đây là route /hello!';
}
```

### Bước 1.2 – Trong `app.controller.ts`

- Import decorator (nếu chưa có): `Get` đã có rồi.
- Thêm method mới với đường dẫn `/hello`:

```ts
@Get('hello')
getHelloCustom(): string {
  return this.appService.getHelloCustom();
}
```

### Kiểm tra

- GET `http://localhost:3000` → vẫn "Hello World!"
- GET `http://localhost:3000/hello` → "Xin chào, đây là route /hello!"

**Ý chính:** `@Get('hello')` = route `GET /hello`. Controller chỉ gọi service và return; logic nằm trong service.

---

## Thực hành 2: Tạo module mới (Items)

**Mục tiêu:** Tạo một **module** riêng cho “Items” (danh sách món đồ), có **controller** và **service** riêng.

### Bước 2.1 – Tạo file

Tạo 3 file trong `src/items/`:

- `items.module.ts`
- `items.controller.ts`
- `items.service.ts`

### Bước 2.2 – `items.service.ts`

```ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class ItemsService {
  private items: string[] = ['Item 1', 'Item 2', 'Item 3'];

  findAll(): string[] {
    return this.items;
  }
}
```

### Bước 2.3 – `items.controller.ts`

```ts
import { Controller, Get } from '@nestjs/common';
import { ItemsService } from './items.service';

@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Get()
  findAll() {
    return this.itemsService.findAll();
  }
}
```

### Bước 2.4 – `items.module.ts`

```ts
import { Module } from '@nestjs/common';
import { ItemsController } from './items.controller';
import { ItemsService } from './items.service';

@Module({
  controllers: [ItemsController],
  providers: [ItemsService],
})
export class ItemsModule {}
```

### Bước 2.5 – Đăng ký module trong `app.module.ts`

- Import: `import { ItemsModule } from './items/items.module';`
- Trong `@Module({ imports: [...] })` thêm `ItemsModule`:

```ts
imports: [ItemsModule],
```

### Kiểm tra

- GET `http://localhost:3000/items` → mảng `["Item 1", "Item 2", "Item 3"]`

**Ý chính:** Mỗi module gom controller + provider (service). `@Controller('items')` = tiền tố route là `/items`.

---

## Thực hành 3: Route có tham số (GET /items/:id)

**Mục tiêu:** Lấy một item theo chỉ số (id).

### Bước 3.1 – Trong `items.service.ts`

Thêm method:

```ts
findOne(id: number): string | null {
  if (id < 0 || id >= this.items.length) return null;
  return this.items[id];
}
```

### Bước 3.2 – Trong `items.controller.ts`

- Import: `import { Get, Param } from '@nestjs/common';`
- Thêm route:

```ts
@Get(':id')
findOne(@Param('id') id: string) {
  const index = parseInt(id, 10);
  return this.itemsService.findOne(index);
}
```

### Kiểm tra

- GET `http://localhost:3000/items/0` → "Item 1"
- GET `http://localhost:3000/items/10` → `null` (hoặc 404, tùy bạn muốn xử lý thế nào sau)

**Ý chính:** `@Param('id')` lấy giá trị từ URL (`:id`). Nhớ parse string sang number khi cần.

---

## Thực hành 4: Thêm POST (tạo item mới)

**Mục tiêu:** Gửi body JSON để thêm item vào danh sách in-memory.

### Bước 4.1 – Trong `items.service.ts`

Thêm:

```ts
create(name: string): string[] {
  this.items.push(name);
  return this.items;
}
```

### Bước 4.2 – Trong `items.controller.ts`

- Import: `import { Get, Param, Post, Body } from '@nestjs/common';`
- Thêm route:

```ts
@Post()
create(@Body() body: { name: string }) {
  return this.itemsService.create(body.name);
}
```

### Kiểm tra (Postman / curl)

- POST `http://localhost:3000/items`  
  Body (JSON): `{ "name": "Item mới" }`  
  → Trả về mảng items đã có thêm "Item mới".
- GET `http://localhost:3000/items` → thấy "Item mới" trong mảng.

**Ý chính:** `@Body()` lấy body của request. Nest tự parse JSON thành object.

---

## Tóm tắt bài 1

| Khái niệm    | Ý nghĩa ngắn |
|-------------|---------------|
| **Controller** | Nhận request, gọi service, trả response. Dùng `@Get()`, `@Post()`, `@Param()`, `@Body()`. |
| **Service**    | Chứa logic, được inject vào controller qua `constructor`. |
| **Module**     | Nhóm controller + provider; import vào `AppModule`. |
| **Route**      | `@Controller('items')` + `@Get(':id')` → `GET /items/:id`. |

---

## Gợi ý bài tiếp theo (sau khi xong bài 1)

- **Bài 2:** [PRACTICE-02-DTO-VALIDATION-EXCEPTION.md](./PRACTICE-02-DTO-VALIDATION-EXCEPTION.md) – DTO, ValidationPipe, NotFoundException.
- **Bài 3:** [PRACTICE-03-DATABASE-CRUD.md](./PRACTICE-03-DATABASE-CRUD.md) – TypeORM + SQLite, Entity, Repository, CRUD thật.
- **Bài 4:** [PRACTICE-04-GUARD-MIDDLEWARE.md](./PRACTICE-04-GUARD-MIDDLEWARE.md) – Guard (API Key), Middleware (logger).
- **Bài 5:** [PRACTICE-05-INTERCEPTOR-PIPE.md](./PRACTICE-05-INTERCEPTOR-PIPE.md) – Interceptor, Custom Pipe.
- **Bài 6:** [PRACTICE-06-EXCEPTION-FILTER-CONFIG.md](./PRACTICE-06-EXCEPTION-FILTER-CONFIG.md) – Exception Filter, ConfigModule.
- **Bài 7:** [PRACTICE-07-SCOPE-TESTING.md](./PRACTICE-07-SCOPE-TESTING.md) – Provider scope (REQUEST), Unit test (service + controller mock).

Bạn cứ làm xong từng bước rồi chạy và gọi API kiểm tra. Nếu muốn, mình có thể tạo sẵn code mẫu cho từng bước trong repo để bạn so sánh.
