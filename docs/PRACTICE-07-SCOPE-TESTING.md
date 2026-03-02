# Bài thực hành 7: Provider scope và Testing

Mục tiêu: Sau bài này bạn sẽ hiểu **provider scope** (REQUEST, TRANSIENT) qua ví dụ và biết viết **unit test** cho service và controller (mock dependency).

**Yêu cầu:** Đã làm Bài 1–6.

---

## Trước khi bắt đầu

- **Scope:** DEFAULT (singleton), REQUEST (mỗi request một instance), TRANSIENT (mỗi consumer một instance). Đã học lý thuyết ở phần trước; bài này thực hành đổi scope và quan sát.
- **Unit test:** Test từng class (service, controller) cô lập; dependency được **mock** (giả lập) để không gọi code thật (DB, API ngoài).

---

## Thực hành 1: Thử scope REQUEST (tùy chọn)

**Mục tiêu:** Tạo một service có scope REQUEST, inject vào controller; mỗi request sẽ có instance riêng (có thể dùng để lưu state theo request).

### Bước 1.1 – Tạo service có scope REQUEST

Tạo file `src/common/services/request-scoped.service.ts`:

```ts
import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.REQUEST })
export class RequestScopedService {
  private requestId = Math.random().toString(36).slice(2);

  getRequestId(): string {
    return this.requestId;
  }
}
```

### Bước 1.2 – Đăng ký và dùng trong controller

- Trong module (vd: AppModule hoặc ItemsModule), thêm `RequestScopedService` vào `providers`.
- Trong controller, inject và gọi `getRequestId()`.
- Tạo route GET trả về `requestId` → gọi nhiều lần, mỗi request sẽ có `requestId` khác nhau (vì mỗi request một instance).

**Lưu ý:** Controller inject REQUEST-scoped provider thì chính controller đó cũng trở nên request-scoped (Nest tạo controller mới mỗi request). Dùng khi cần, tránh lạm dụng vì tốn tài nguyên hơn singleton.

---

## Thực hành 2: Unit test Service (với mock)

**Mục tiêu:** Viết test cho `ItemsService`: mock không cần; service hiện tại dùng in-memory array, test trực tiếp.

### Bước 2.1 – Mở file test có sẵn

Project Nest đã tạo sẵn `src/items/items.service.spec.ts` (nếu chưa có thì tạo). Cấu trúc:

```ts
import { Test, TestingModule } from '@nestjs/testing';
import { ItemsService } from './items.service';

describe('ItemsService', () => {
  let service: ItemsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ItemsService],
    }).compile();

    service = module.get<ItemsService>(ItemsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll returns empty array initially', () => {
    expect(service.findAll()).toEqual([]);
  });

  it('create adds item and returns it', () => {
    const created = service.create({ name: 'Test Item' });
    expect(created.name).toBe('Test Item');
    expect(created.id).toBeDefined();
    expect(service.findAll()).toHaveLength(1);
  });

  it('findOne returns null for non-existent id', () => {
    expect(service.findOne(999)).toBeNull();
  });
});
```

### Bước 2.2 – Chạy test

```bash
npm run test
```

Hoặc chỉ file items: `npm run test -- items.service.spec`

**Ý chính:** `Test.createTestingModule({ providers: [ItemsService] })` tạo module ảo; `module.get<ItemsService>(ItemsService)` lấy instance để test. Mỗi `it` chạy trong `beforeEach` nên mảng in-memory được reset (vì tạo module mới mỗi lần).

---

## Thực hành 3: Unit test Controller (mock Service)

**Mục tiêu:** Test `ItemsController` mà không gọi `ItemsService` thật — dùng mock (giả lập) để kiểm tra controller gọi đúng method và trả đúng response.

### Bước 3.1 – Viết spec cho controller

Trong `src/items/items.controller.spec.ts` (tạo nếu chưa có):

```ts
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ItemsController } from './items.controller';
import { ItemsService } from './items.service';

describe('ItemsController', () => {
  let controller: ItemsController;
  let service: ItemsService;

  const mockItemsService = {
    findAll: jest.fn().mockReturnValue([{ id: 1, name: 'Item 1' }]),
    findOne: jest.fn().mockReturnValue({ id: 1, name: 'Item 1' }),
    create: jest.fn().mockImplementation((dto) => ({ id: 1, ...dto })),
    update: jest.fn().mockReturnValue({ id: 1, name: 'Updated' }),
    remove: jest.fn().mockReturnValue(true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ItemsController],
      providers: [
        { provide: ItemsService, useValue: mockItemsService },
      ],
    }).compile();

    controller = module.get<ItemsController>(ItemsController);
    service = module.get<ItemsService>(ItemsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAll returns result from service', () => {
    expect(controller.findAll()).toEqual([{ id: 1, name: 'Item 1' }]);
    expect(mockItemsService.findAll).toHaveBeenCalled();
  });

  it('findOne throws NotFoundException when service returns null', () => {
    mockItemsService.findOne.mockReturnValueOnce(null);
    expect(() => controller.findOne('1')).toThrow(NotFoundException);
  });
});
```

### Bước 3.2 – Chạy test

```bash
npm run test -- items.controller.spec
```

**Ý chính:** `providers: [{ provide: ItemsService, useValue: mockItemsService }]` = inject object giả thay vì ItemsService thật. Jest: `jest.fn()`, `toHaveBeenCalled()`, `mockReturnValueOnce()`.

---

## Tóm tắt bài 7

| Khái niệm | Ý nghĩa ngắn |
|-----------|--------------|
| **Scope.REQUEST** | Mỗi HTTP request một instance; dùng khi cần state theo request. |
| **TestingModule** | Tạo module ảo để test; providers/controllers giống module thật, có thể override bằng useValue/useClass. |
| **Mock (useValue)** | Cung cấp object giả thay cho provider thật; kiểm tra controller gọi đúng method. |
| **Unit test** | Test từng class cô lập; service test logic, controller test với service mock. |

---

## Gợi ý bài tiếp theo

- **Bài 8:** [PRACTICE-08-CUSTOM-DECORATORS.md](./PRACTICE-08-CUSTOM-DECORATORS.md) – Custom param decorator, composite decorator (@Public), Reflector.

## Gợi ý mở rộng

- E2E test: dùng `test/app.e2e-spec.ts`, gọi HTTP thật qua `supertest`, test toàn bộ luồng.
- Integration test: test module (controller + service thật) với DB test hoặc in-memory.
