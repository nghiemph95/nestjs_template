# Bài tập phỏng vấn Backend (NestJS)

**Thư mục này** dùng để ôn trước khi phỏng vấn live code backend. Các file mô phỏng đề bài và cách triển khai với **NestJS**.

Mỗi file gồm:

- **Đề bài** — Câu hỏi / yêu cầu như interviewer đưa ra.
- **Hướng dẫn triển khai** — Nên tạo/chỉnh file nào, cấu trúc thư mục, code nằm ở đâu.
- **Cách xử lý** — Ý tưởng và các bước.
- **Code mẫu** — Đoạn code tham khảo (toàn bộ bằng tiếng Anh).

---

## Cài đặt NestJS (khi chưa có project)

Nếu buổi phỏng vấn yêu cầu làm backend với NestJS mà môi trường **chưa cài NestJS**, làm lần lượt:

### 1. Yêu cầu

- **Node.js** ≥ 18 (kiểm tra: `node -v`).
- **npm** hoặc **yarn** / **pnpm**.

### 2. Cài Nest CLI (global, một lần)

```bash
npm i -g @nestjs/cli
```

Kiểm tra: `nest --version`.

### 3. Tạo project mới

```bash
# Tạo folder và vào thư mục
mkdir my-api && cd my-api

# Tạo app NestJS (chọn package manager: npm / yarn / pnpm)
nest new . --package-manager npm
```

Khi hỏi **Which package manager would you like to use?** chọn npm (hoặc yarn/pnpm tùy môi trường).

### 4. Chạy project

```bash
npm run start:dev
```

Ứng dụng chạy tại `http://localhost:3000`.

### 5. Tạo module/controller/service (khi làm bài)

```bash
# Tạo resource "items" (controller + service + module)
nest g resource items --no-spec
```

Hoặc tách riêng:

```bash
nest g module items
nest g controller items --no-spec
nest g service items --no-spec
```

### 6. Validation (cho bài validation)

```bash
npm i class-validator class-transformer
```

Trong `main.ts` bật ValidationPipe:

```typescript
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  await app.listen(3000);
}
```

---

## Cách dùng

1. Ôn và làm bài trong project **nestjs_template** (hoặc project NestJS mới tạo như trên).
2. Đọc **Đề bài** → **Hướng dẫn triển khai** → tự làm → so **Cách xử lý** và **Code mẫu**.

## Cấu trúc project (nestjs_template)

```
nestjs_template/
  src/
    app.module.ts
    main.ts
    items/
      items.controller.ts
      items.service.ts
      items.module.ts
      dto/
        create-item.dto.ts
        update-item.dto.ts
    common/
      guard/           ← Auth guard (API Key, JWT)
      pipes/           ← ParsePositiveIntPipe, ...
      filters/        ← Exception filter (optional)
```

## Danh sách bài

| File | Chủ đề |
|------|--------|
| [01-backend-rest-crud.md](./01-backend-rest-crud.md) | REST API CRUD với NestJS: Controller, Service, in-memory, 404 |
| [02-backend-validation-error-handling.md](./02-backend-validation-error-handling.md) | DTO + class-validator, Exception Filter / HTTP exception |
| [03-backend-auth-guard.md](./03-backend-auth-guard.md) | Guard: API Key / Bearer, 401 Unauthorized |
| [04-backend-pagination-filter.md](./04-backend-pagination-filter.md) | Query params: pagination, filter by name, response { data, total } |
