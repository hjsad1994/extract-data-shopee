# Trình trích xuất bình luận Shopee

Đây là một ứng dụng web được thiết kế để trích xuất bình luận từ các trang sản phẩm của Shopee. Nó bao gồm một backend Node.js/Express để xử lý việc trích xuất dữ liệu và một frontend Next.js/React để cung cấp giao diện người dùng.

## Tính năng

- **Trích xuất bình luận:** Dán mã HTML của trang sản phẩm Shopee để trích xuất tất cả các bình luận.
- **Xuất ra CSV:** Lưu các bình luận đã trích xuất vào một tệp CSV.
- **Gộp tệp CSV:** Gộp nhiều tệp CSV chứa bình luận thành một tệp duy nhất.
- **Giao diện thân thiện:** Giao diện người dùng đơn giản và dễ sử dụng.
- **Xóa dữ liệu:** Xóa các bình luận đã trích xuất khỏi máy chủ sau khi tải xuống.

## Cách sử dụng

1.  **Lấy mã HTML:**
    *   Mở một trang sản phẩm trên Shopee.
    *   Cuộn xuống để tải tất cả các bình luận bạn muốn trích xuất.
    *   Mở Developer Tools (nhấn `F12` hoặc `Ctrl+Shift+I`).
    *   Trong tab `Console`, gõ `document.documentElement.outerHTML` và nhấn Enter.
    *   Nhấp chuột phải vào kết quả, chọn "Copy string contents".

2.  **Dán mã HTML:**
    *   Mở ứng dụng web trích xuất bình luận.
    *   Dán mã HTML đã sao chép vào ô "Nhập HTML".

3.  **Trích xuất:**
    *   Nhấp vào nút "Trích xuất bình luận".
    *   Ứng dụng sẽ xử lý HTML và hiển thị số lượng bình luận được tìm thấy.

4.  **Tải xuống:**
    *   Nhấp vào nút "Tải xuống CSV" để lưu các bình luận vào máy tính của bạn.
    *   Dữ liệu trên máy chủ sẽ tự động bị xóa sau khi tải xuống.

5.  **Gộp tệp CSV (Tùy chọn):**
    *   Nếu bạn có nhiều tệp CSV từ các lần trích xuất khác nhau, bạn có thể gộp chúng lại.
    *   Nhấp vào "Chọn tệp" trong phần "Gộp tệp CSV".
    *   Chọn ít nhất hai tệp CSV.
    *   Nhấp vào "Gộp & Tải xuống" để nhận một tệp CSV đã gộp.

## Dành cho nhà phát triển

### Công nghệ sử dụng

**Backend:**

- Node.js
- Express.js
- Cheerio (để phân tích HTML)
- json2csv (để chuyển đổi JSON sang CSV)

**Frontend:**

- Next.js
- React
- TypeScript
- Tailwind CSS
- Papaparse (để phân tích CSV phía client)

### Cấu trúc dự án

```
/
├── backend/
│   ├── server.js         # Máy chủ Express
│   ├── package.json
│   └── shopee_comments.csv # Tệp CSV được tạo
└── frontend/
    ├── src/
    │   └── app/
    │       └── page.tsx  # Giao diện người dùng
    └── package.json
```

### Bắt đầu

**1. Clone repository:**

```bash
git clone <repository_url>
cd extract-shopee-website
```

**2. Cài đặt và chạy Backend:**

```bash
cd backend
npm install
npm run dev
```

Máy chủ backend sẽ chạy tại `http://localhost:3001`.

**3. Cài đặt và chạy Frontend:**

```bash
cd frontend
npm install
npm run dev
```

Ứng dụng frontend sẽ có tại `http://localhost:3000`.

### API Endpoints

Tất cả các endpoint đều có tiền tố là `/api`.

- `POST /extract`:
  - **Chức năng:** Trích xuất bình luận từ mã HTML được cung cấp.
  - **Body:** `{ "html": "<html>...</html>" }`
  - **Phản hồi thành công:** `{ "message": "Extraction successful", "count": 123 }`

- `GET /download`:
  - **Chức năng:** Tải xuống tệp `shopee_comments.csv`. Tự động xóa tệp sau khi tải xuống.
  - **Phản hồi thành công:** Tệp CSV.

- `POST /clear`:
  - **Chức năng:** Xóa tệp `shopee_comments.csv` trên máy chủ.
  - **Phản hồi thành công:** `{ "message": "Extraction data cleared." }`

- `POST /clear-after-merge`:
    - **Chức năng:** Xóa tệp `shopee_comments.csv` trên máy chủ sau khi gộp file.
    - **Phản hồi thành công:** `{ "message": "Data cleared after merge operation." }`

## Tác giả

- **Trần Tài**