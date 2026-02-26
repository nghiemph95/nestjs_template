# Bài thực hành 3: CRUD với lưu trữ in-memory

Mục tiêu: Sau bài này bạn sẽ làm **CRUD đầy đủ** (Create, Read, Update, Delete) cho Items, dùng **bộ nhớ trong máy (in-memory)** làm nơi lưu trữ — không cần cài database.

**Yêu cầu:** Đã xong Bài 1, 2 (Items module, DTO, ValidationPipe, NotFoundException).

---

## Trước khi bắt đầu

- **Không cần cài thêm package** (không dùng TypeORM hay SQLite).
- Dữ liệu lưu trong **mảng (array)** hoặc **Map** trong service. Khi tắt app thì dữ liệu mất; khi chạy lại thì bắt đầu từ trạng thái trống (hoặc vài item mẫu nếu bạn khởi tạo sẵn).
- Bài này tập trung: **interface/type Item**, **service với CRUD trên mảng**, **controller với GET/POST/PATCH/DELETE**.

---

## Thực hành 1: Định nghĩa kiểu Item và cập nhật Service

**Mục tiêu:** Có kiểu dữ liệu Item thống nhất và service lưu trong memory (mảng).

### Bước 1.1 – Tạo interface Item

Tạo file `src/items/item.interface.ts`:

```ts
export interface Item {
  id: number;
  name: string;
  description: string;
  price: number;
  createdAt: Date;
}
```

### Bước 1.2 – Service: lưu trong memory, CRUD cơ bản

Trong `items.service.ts`:

- Import: `import { Item } from './item.interface';`
- Dùng **mảng trong memory** và biến đếm id:

```ts
@Injectable()
export class ItemsService {
  private items: Item[] = [];
  private nextId = 1;

  findAll(): Item[] {
    return [...this.items]; // hoặc return this.items
  }

  findOne(id: number): Item | null {
    return this.items.find((item) => item.id === id) ?? null;
  }

  create(dto: { name: string; description?: string; price?: number }): Item {
    const item: Item = {
      id: this.nextId++,
      name: dto.name,
      description: dto.description ?? '',
      price: dto.price ?? 0,
      createdAt: new Date(),
    };
    this.items.push(item);
    return item;
  }
}
```

(Nếu bạn đã có DTO từ Bài 2, dùng `CreateItemDto` thay cho object trong `create`.)

### Kiểm tra

- GET `/items` → `[]`.
- POST `/items` với `{ "name": "Item 1" }` → 200, trả về item vừa tạo.
- GET `/items` → thấy 1 item. GET `/items/1` → 200; GET `/items/999` → 404 (nếu controller throw NotFoundException khi null).

**Ý chính:** Dữ liệu chỉ tồn tại trong RAM; restart app là mất. Không cần DB, phù hợp để tập CRUD và cách tổ chức code.

---

## Thực hành 2: Update (PATCH) và Delete (DELETE)

**Mục tiêu:** Thêm cập nhật và xóa item trong mảng.

### Bước 2.1 – DTO Update (tùy chọn)

Tạo `src/items/dto/update-item.dto.ts`:

```ts
import { IsString, IsNumber, Min, IsOptional } from 'class-validator';

export class UpdateItemDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;
}
```

### Bước 2.2 – Service: update và remove

Trong `items.service.ts` thêm hai method:

```ts
update(id: number, dto: UpdateItemDto): Item | null {
  const index = this.items.findIndex((item) => item.id === id);
  if (index === -1) return null;
  this.items[index] = {
    ...this.items[index],
    ...dto,
  };
  return this.items[index];
}

remove(id: number): boolean {
  const index = this.items.findIndex((item) => item.id === id);
  if (index === -1) return false;
  this.items.splice(index, 1);
  return true;
}
```

(Import `UpdateItemDto` nếu dùng.)

### Bước 2.3 – Controller: PATCH và DELETE

Trong `items.controller.ts`:

- Import: `Patch`, `Delete` từ `@nestjs/common`; `UpdateItemDto` từ `./dto/update-item.dto`.
- Thêm hai route:

```ts
@Patch('items/:id')
update(@Param('id') id: string, @Body() body: UpdateItemDto) {
  const item = this.itemsService.update(parseInt(id, 10), body);
  if (item === null) throw new NotFoundException('Item không tồn tại');
  return item;
}

@Delete('items/:id')
remove(@Param('id') id: string) {
  const ok = this.itemsService.remove(parseInt(id, 10));
  if (!ok) throw new NotFoundException('Item không tồn tại');
  return { message: 'Đã xóa' };
}
```

### Kiểm tra

- POST tạo vài item. PATCH `/items/1` với `{ "name": "Tên mới" }` → 200, item cập nhật.
- DELETE `/items/1` → 200; GET `/items/1` → 404.

**Ý chính:** Update = tìm theo id rồi ghi đè field; Delete = tìm rồi splice khỏi mảng. Tất cả chỉ thao tác trên mảng trong memory.

---

## Tóm tắt bài 3

| Khái niệm     | Ý nghĩa ngắn |
|---------------|--------------|
| **In-memory**  | Dữ liệu lưu trong biến (mảng/Map) trong process; tắt app là mất. |
| **Item**       | Interface/type thống nhất: id, name, description, price, createdAt. |
| **CRUD**       | Create (POST), Read (GET all / GET :id), Update (PATCH), Delete (DELETE). |
| **UpdateItemDto** | DTO với field tùy chọn (@IsOptional), dùng cho PATCH. |

---

## Gợi ý bài tiếp theo

- **Bài 4:** [PRACTICE-04-GUARD-MIDDLEWARE.md](./PRACTICE-04-GUARD-MIDDLEWARE.md) – Guard (bảo vệ route), Middleware (log request).
