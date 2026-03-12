# Bài 4: Backend — Pagination & Filter (Query Params) (NestJS)

**Nếu chưa có project NestJS,** xem [README](./README.md) phần **Cài đặt NestJS**.

---

## Đề bài

> "GET /items hỗ trợ **query**: `_page` và `_limit` để phân trang (vd page 1, mỗi trang 10 phần tử); và `name` để **lọc** theo tên (contains, không phân biệt hoa thường). Ví dụ: GET /items?_page=2&_limit=5&name=apple trả về trang 2, mỗi trang 5 item, chỉ những item có tên chứa 'apple'. Trả kèm **total** (tổng số bản ghi sau khi filter) để frontend biết tổng trang."

*(Kiểm tra: Query decorator, DTO cho query, filter và slice trong Service, response shape { data, total }.)*

---

## Hướng dẫn triển khai (file / cấu trúc)

- **Nên tạo / chỉnh file nào**
  - **Tạo (tùy chọn):** `src/items/dto/query-items.dto.ts` — class với `_page?`, `_limit?`, `name?`; có thể dùng `@IsOptional()`, `@Type(() => Number)` từ class-transformer để parse number.
  - **Chỉnh:** `src/items/items.controller.ts` — GET /items nhận `@Query() query: QueryItemsDto`; gọi service.findAll(query).
  - **Chỉnh:** `src/items/items.service.ts` — `findAll(query?)`: filter theo name (nếu có), tính total, slice theo page/limit; return `{ data, total }`.

- **Có cần tạo thêm file không**
  - Không bắt buộc; có thể truyền query trực tiếp trong controller và xử lý trong service.

- **Code nằm ở đâu (map file → nội dung)**

| File | Nội dung |
|------|----------|
| `src/items/items.controller.ts` | GET /items với @Query(); gọi service.findAll(query). |
| `src/items/items.service.ts` | findAll(query): filter by name, total = length, slice(page, limit), return { data, total }. |
| `src/items/dto/query-items.dto.ts` (tùy chọn) | _page, _limit, name; optional; transform to number. |

---

## Cách xử lý

1. **Query:** Trong controller dùng `@Query('_page') page: string`, `@Query('_limit') limit: string`, `@Query('name') name: string` hoặc một DTO với `@Query() query: QueryItemsDto`.
2. **Parse:** page = Math.max(1, parseInt(query._page, 10) || 1); limit = Math.min(50, Math.max(1, parseInt(query._limit, 10) || 10)).
3. **Service:** Bắt đầu từ mảng items; nếu có name thì filter `list.filter(i => i.name.toLowerCase().includes(name.toLowerCase()))`; total = list.length; start = (page - 1) * limit; data = list.slice(start, start + limit); return { data, total }.

---

## Code mẫu

### File: `src/items/dto/query-items.dto.ts` (optional)

```typescript
import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryItemsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  _page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  _limit?: number = 10;

  @IsOptional()
  @IsString()
  name?: string;
}
```

### File: `src/items/items.service.ts` (findAll with query)

```typescript
findAll(query?: { _page?: number; _limit?: number; name?: string }) {
  let list = [...this.items];
  const nameQuery = query?.name?.trim();
  if (nameQuery) {
    const q = nameQuery.toLowerCase();
    list = list.filter((i) => i.name.toLowerCase().includes(q));
  }

  const total = list.length;
  const page = Math.max(1, query?._page ?? 1);
  const limit = Math.min(50, Math.max(1, query?._limit ?? 10));
  const start = (page - 1) * limit;
  const data = list.slice(start, start + limit);

  return { data, total };
}
```

### File: `src/items/items.controller.ts` (GET only)

```typescript
@Get()
findAll(@Query('_page') page?: string, @Query('_limit') limit?: string, @Query('name') name?: string) {
  const _page = Math.max(1, parseInt(page ?? '1', 10) || 1);
  const _limit = Math.min(50, Math.max(1, parseInt(limit ?? '10', 10) || 10));
  return this.itemsService.findAll({ _page, _limit, name });
}
```

**Ví dụ:** GET /items?_page=2&_limit=5&name=Item → trang 2, 5 phần tử, chỉ item có tên chứa "Item"; response `{ data: [...], total: N }`.
