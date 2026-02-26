# Plan: API lấy data từ file JSON

Mục tiêu: Cho phép API **Items** đọc dữ liệu từ `src/data/items.json` thay vì mảng cứng trong code.

---

## Bước 1: Copy file JSON khi build

- **Việc cần làm:** Cấu hình Nest CLI để khi `nest build` chạy, thư mục `src/data/` (hoặc ít nhất `items.json`) được copy sang `dist/`.
- **Lý do:** Lúc chạy production, code nằm trong `dist/`, nên phải có file JSON bên cạnh thì mới đọc được.
- **Cách làm:** Trong `nest-cli.json`, thêm `compilerOptions.assets` (ví dụ copy `data/**/*.json`). Có thể bật `watchAssets: true` để dev mode cũng copy khi đổi file.

---

## Bước 2: Định nghĩa kiểu dữ liệu (interface)

- **Việc cần làm:** Tạo interface/type cho 1 item trùng với cấu trúc trong JSON (id, name, description, price).
- **Nơi đặt:** Có thể đặt trong `src/items/` (ví dụ `item.interface.ts` hoặc cuối file `items.service.ts`).
- **Lý do:** TypeScript biết kiểu, service trả về đúng type, dễ bảo trì.

---

## Bước 3: Service đọc file JSON

- **Việc cần làm:** Trong `ItemsService`:
  - Dùng `fs` (ví dụ `fs.promises.readFile` hoặc `readFileSync`) và `path` để đọc file.
  - Đường dẫn file: dùng `path.join(__dirname, '..', 'data', 'items.json')` (khi chạy từ `dist/items/`, `..` là `dist/`, nên cần Bước 1 để có `dist/data/items.json`).
  - Parse nội dung bằng `JSON.parse()` → mảng item.
  - Lưu vào biến private (ví dụ `private items: Item[]`) và load **một lần** khi khởi động (trong `constructor` hoặc `onModuleInit()`).
- **Kết quả:** `findAll()` trả về mảng từ file; `findOne(id)` tìm theo `item.id` (số) trong mảng đó.

---

## Bước 4: Cập nhật Controller (nếu cần)

- **Việc cần làm:** Đảm bảo controller vẫn gọi đúng method của service (`findAll()`, `findOne(id)`). Nếu trước đây `findOne` nhận index còn giờ cần tìm theo `id`, chỉ cần đổi logic ở service; controller có thể giữ `@Get('items/:id')` và truyền `id` (parse sang number) cho service.

---

## Bước 5: Xử lý lỗi & edge case

- **File không tồn tại hoặc JSON lỗi:** Trong service, bọc đọc file bằng try/catch; có thể throw một exception Nest (ví dụ `InternalServerErrorException`) hoặc trả về mảng rỗng tùy quy ước.
- **findOne không tìm thấy:** Trả về `null` hoặc throw `NotFoundException` (sẽ trả 404) – nên dùng NotFound để API chuẩn REST.

---

## Bước 6: (Tùy chọn) POST / create

- **Hiện tại:** Có thể vẫn thêm item vào mảng trong memory (không ghi lại file).
- **Nâng cao:** Nếu muốn “thêm xong còn lưu vào file”, sau khi push vào mảng thì dùng `fs.writeFile` ghi lại `items.json` (cẩn thận concurrent request, có thể queue hoặc lock đơn giản).

---

## Thứ tự thực hiện gợi ý

| # | Nội dung |
|---|----------|
| 1 | Cấu hình `nest-cli.json` (assets) |
| 2 | Thêm interface `Item` |
| 3 | Sửa `ItemsService`: đọc JSON, `findAll` / `findOne` dùng data từ file |
| 4 | Sửa controller nếu cần (vd. throw NotFound khi findOne = null) |
| 5 | Test: GET /items, GET /items/1, GET /items/999 (404) |
| 6 | (Tùy chọn) Xử lý lỗi đọc file và POST/ghi file |

Sau khi làm xong các bước trên, API sẽ lấy data từ file JSON đúng như mong muốn.
