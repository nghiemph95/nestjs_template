# Mục lục bài thực hành NestJS

Danh sách đầy đủ các bài thực hành theo thứ tự gợi ý. Mỗi bài có mục tiêu, bước làm, code mẫu và phần kiểm tra.

| # | File | Nội dung chính |
|---|------|----------------|
| 1 | [PRACTICE-01-BASICS.md](./PRACTICE-01-BASICS.md) | Controller, Service, Module; route GET/POST; Items module |
| 2 | [PRACTICE-02-DTO-VALIDATION-EXCEPTION.md](./PRACTICE-02-DTO-VALIDATION-EXCEPTION.md) | DTO, ValidationPipe, NotFoundException |
| 3 | [PRACTICE-03-DATABASE-CRUD.md](./PRACTICE-03-DATABASE-CRUD.md) | CRUD in-memory; Item interface; PATCH, DELETE |
| 4 | [PRACTICE-04-GUARD-MIDDLEWARE.md](./PRACTICE-04-GUARD-MIDDLEWARE.md) | Guard (API Key), Middleware (logger) |
| 5 | [PRACTICE-05-INTERCEPTOR-PIPE.md](./PRACTICE-05-INTERCEPTOR-PIPE.md) | Interceptor (transform response), Custom Pipe (ParsePositiveInt) |
| 6 | [PRACTICE-06-EXCEPTION-FILTER-CONFIG.md](./PRACTICE-06-EXCEPTION-FILTER-CONFIG.md) | Exception Filter (format lỗi), ConfigModule, ConfigService |
| 7 | [PRACTICE-07-SCOPE-TESTING.md](./PRACTICE-07-SCOPE-TESTING.md) | Provider scope (REQUEST), Unit test (service + controller mock) |
| 8 | [PRACTICE-08-CUSTOM-DECORATORS.md](./PRACTICE-08-CUSTOM-DECORATORS.md) | Custom param decorator, composite decorator (@Public), Reflector |
| 9 | [PRACTICE-09-SHARED-MODULES.md](./PRACTICE-09-SHARED-MODULES.md) | Shared/Common module, export/import, @Global(), re-export |
| 10 | [PRACTICE-10-EVENTS-VERSIONING.md](./PRACTICE-10-EVENTS-VERSIONING.md) | EventEmitter (emit/OnEvent), API versioning (URI) |

---

**Tài liệu bổ sung**

- [NESTJS-ARCHITECTURE.md](./NESTJS-ARCHITECTURE.md) – Các tầng (Middleware, Guard, Interceptor, Pipe), module, thứ tự xử lý request.
- [PLAN-API-FROM-JSON.md](./PLAN-API-FROM-JSON.md) – Plan đọc API từ file JSON (nếu bạn muốn dùng lại data từ file).
