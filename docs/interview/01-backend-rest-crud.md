# Bài 1: Backend — REST API CRUD (NestJS)

**Nếu chưa có project NestJS,** xem [README](./README.md) phần **Cài đặt NestJS**.

---

## Đề bài

> "Viết một REST API với **NestJS**: resource **items** (id, name, description). Có đủ 4 thao tác: **GET /items** (list), **GET /items/:id** (chi tiết), **POST /items** (tạo mới, body JSON), **DELETE /items/:id** (xóa). Dữ liệu lưu in-memory (mảng trong Service). Khi không tìm thấy id thì trả **404**."

*(Kiểm tra: Controller, Service, decorators Get/Post/Delete, NotFoundException, DTO.)*

---

## Hướng dẫn triển khai (file / cấu trúc)

- **Nên tạo / chỉnh file nào**
  - **Tạo resource:** `nest g resource items --no-spec` (tạo module, controller, service) hoặc tạo thủ công.
  - **Chỉnh:** `src/items/items.controller.ts` — decorators `@Get()`, `@Get(':id')`, `@Post()`, `@Delete(':id')`; gọi service; throw `NotFoundException` khi không tìm thấy.
  - **Chỉnh:** `src/items/items.service.ts` — mảng in-memory `items`, `findAll()`, `findOne(id)`, `create(dto)`, `remove(id)`; trả `null` hoặc `false` khi không tìm thấy để controller throw 404.
  - **Tạo:** `src/items/dto/create-item.dto.ts` — class với `name`, `description` (optional) cho POST body.

- **Có cần tạo thêm file không**
  - Có thể thêm `update-item.dto.ts` và endpoint PATCH nếu đề bài yêu cầu cập nhật.

- **Code nằm ở đâu (map file → nội dung)**

| File | Nội dung |
|------|----------|
| `src/items/items.controller.ts` | @Controller('items'); GET, GET :id, POST, DELETE; inject ItemsService; throw NotFoundException. |
| `src/items/items.service.ts` | Private array items, nextId; findAll, findOne, create, remove. |
| `src/items/dto/create-item.dto.ts` | Class với name (string), description (string, optional). |
| `src/items/items.module.ts` | Import Module, controllers [ItemsController], providers [ItemsService]. |

---

## Cách xử lý

1. **Service:** Mảng `private items: Item[]`, `private nextId`; `findOne(id)` return `items.find(...) ?? null`; `create(dto)` push item mới, return item; `remove(id)` tìm index, splice, return boolean.
2. **Controller:** Inject `ItemsService`; GET /items → `findAll()`; GET /items/:id → `findOne(id)`, nếu null thì `throw new NotFoundException('Item not found')`; POST → `create(body)`; DELETE → `remove(id)`, nếu false throw NotFoundException.
3. **Param id:** Dùng `@Param('id') id: string` rồi `parseInt(id, 10)` hoặc dùng pipe `ParseIntPipe` / custom `ParsePositiveIntPipe`.

---

## Code mẫu

### File: `src/items/dto/create-item.dto.ts`

```typescript
export class CreateItemDto {
  name: string;
  description?: string;
}
```

### File: `src/items/items.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { CreateItemDto } from './dto/create-item.dto';

export interface Item {
  id: number;
  name: string;
  description: string;
}

@Injectable()
export class ItemsService {
  private items: Item[] = [
    { id: 1, name: 'Item 1', description: 'First item' },
  ];
  private nextId = 2;

  findAll(): Item[] {
    return [...this.items];
  }

  findOne(id: number): Item | null {
    return this.items.find((i) => i.id === id) ?? null;
  }

  create(dto: CreateItemDto): Item {
    const item: Item = {
      id: this.nextId++,
      name: dto.name,
      description: dto.description ?? '',
    };
    this.items.push(item);
    return item;
  }

  remove(id: number): boolean {
    const index = this.items.findIndex((i) => i.id === id);
    if (index === -1) return false;
    this.items.splice(index, 1);
    return true;
  }
}
```

### File: `src/items/items.controller.ts`

```typescript
import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import { ItemsService } from './items.service';
import { CreateItemDto } from './dto/create-item.dto';

@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Get()
  findAll() {
    return this.itemsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    const item = this.itemsService.findOne(id);
    if (!item) throw new NotFoundException('Item not found');
    return item;
  }

  @Post()
  create(@Body() body: CreateItemDto) {
    return this.itemsService.create(body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    const ok = this.itemsService.remove(id);
    if (!ok) throw new NotFoundException('Item not found');
    return { deleted: true };
  }
}
```

**Ghi chú:** Có thể thêm PATCH /items/:id với UpdateItemDto (partial) tương tự.
