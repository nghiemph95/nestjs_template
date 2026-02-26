# Bài thực hành 2: DTO, Validation Pipe và Exception

Mục tiêu: Sau bài này bạn sẽ biết dùng **DTO** (class cho body), **ValidationPipe** để validate request, và **NotFoundException** để trả 404 chuẩn REST.

**Yêu cầu:** Đã xong Bài 1 (có Items module với GET/POST, findOne).

---

## Trước khi bắt đầu

- Cài package validation:

```bash
npm i class-validator class-transformer
```

- **DTO**: Class mô tả shape của dữ liệu (request body), dùng decorator từ `class-validator` để validate.
- **ValidationPipe**: Tự động validate body theo DTO; nếu lỗi trả 400 Bad Request.
- **NotFoundException**: Throw trong controller/service → Nest trả HTTP 404.

---

## Thực hành 1: Tạo DTO cho Create Item

**Mục tiêu:** Thay `body: { name: string }` bằng một class DTO và validate `name` bắt buộc.

### Bước 1.1 – Tạo file DTO

Tạo file `src/items/dto/create-item.dto.ts`:

```ts
import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class CreateItemDto {
  @IsString()
  @IsNotEmpty({ message: 'name không được để trống' })
  @MinLength(1, { message: 'name phải có ít nhất 1 ký tự' })
  name: string;
}
```

### Bước 1.2 – Bật ValidationPipe toàn cục

Trong `src/main.ts`:

- Import: `import { ValidationPipe } from '@nestjs/common';`
- Sau khi tạo app: `const app = await NestFactory.create(AppModule);`
- Thêm: `app.useGlobalPipes(new ValidationPipe());`

```ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```

### Bước 1.3 – Dùng DTO trong controller

Trong `items.controller.ts`:

- Import: `import { CreateItemDto } from './dto/create-item.dto';`
- Đổi tham số POST từ `body: { name: string }` sang `body: CreateItemDto`:

```ts
@Post('items')
create(@Body() body: CreateItemDto) {
  return this.itemsService.create(body.name);
}
```

### Kiểm tra

- POST `http://localhost:3000/items` với body `{}` → 400, message lỗi validation.
- POST với body `{ "name": "" }` → 400.
- POST với body `{ "name": "Item mới" }` → 200, trả về mảng items.

**Ý chính:** ValidationPipe dựa trên decorator của class-validator; DTO vừa làm type vừa làm schema validate.

---

## Thực hành 2: Trả 404 khi không tìm thấy item

**Mục tiêu:** Thay vì trả `null` khi `findOne` không có, throw **NotFoundException** để client nhận 404.

### Bước 2.1 – Trong `items.controller.ts`

- Import: `import { NotFoundException } from '@nestjs/common';`
- Trong method `findOne`, sau khi gọi service, nếu kết quả là `null` thì throw:

```ts
@Get('items/:id')
findOne(@Param('id') id: string) {
  const item = this.itemsService.findOne(parseInt(id, 10));
  if (item === null) {
    throw new NotFoundException(`Item với id ${id} không tồn tại`);
  }
  return item;
}
```

### Kiểm tra

- GET `http://localhost:3000/items/0` → 200, trả về item.
- GET `http://localhost:3000/items/999` → 404, body có message lỗi.

**Ý chính:** Trong Nest, throw exception từ `@nestjs/common` (NotFoundException, BadRequestException, …) sẽ tự map sang HTTP status và body response.

---

## Thực hành 3: DTO với nhiều field (tùy chọn)

**Mục tiêu:** Mở rộng DTO: thêm `description` (tùy chọn), `price` (số, không âm).

### Bước 3.1 – Cập nhật `CreateItemDto`

Trong `create-item.dto.ts` thêm:

```ts
import { IsString, IsNotEmpty, MinLength, IsOptional, IsNumber, Min } from 'class-validator';

export class CreateItemDto {
  @IsString()
  @IsNotEmpty({ message: 'name không được để trống' })
  @MinLength(1)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'price phải >= 0' })
  price?: number;
}
```

### Bước 3.2 – Service nhận full body (nếu cần)

Nếu bạn muốn service nhận object (name, description, price) thay vì chỉ name, đổi signature service và controller cho phù hợp; ValidationPipe vẫn validate theo DTO.

### Kiểm tra

- POST với `{ "name": "A", "price": -1 }` → 400.
- POST với `{ "name": "A", "description": "Mô tả", "price": 100 }` → 200.

---

## Tóm tắt bài 2

| Khái niệm        | Ý nghĩa ngắn |
|------------------|--------------|
| **DTO**          | Class mô tả shape + validation cho body/param, dùng với class-validator. |
| **ValidationPipe** | Pipe toàn cục: validate theo DTO, lỗi → 400. |
| **NotFoundException** | Throw khi resource không tồn tại → 404. |
| **class-validator** | Decorator: @IsString(), @IsNotEmpty(), @MinLength(), @IsOptional(), @Min(), … |

---

## Gợi ý bài tiếp theo

- **Bài 3:** Kết nối database (TypeORM hoặc Prisma), CRUD thật với bảng Items.
- **Bài 4:** Guard (bảo vệ route), Middleware (xử lý trước khi vào controller).
