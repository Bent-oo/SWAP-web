# Hướng dẫn: muốn sửa gì thì sửa ở đâu?

Có **3 cách**. Chọn theo bảng này:

| Bạn muốn... | Cách làm | Sửa ở đâu |
|---|---|---|
| Thêm / bớt / sửa / **ẩn** sản phẩm, đổi giá | **Trang Quản trị** (không đụng code) | Web → đăng nhập admin → "⚙ Trang quản trị" |
| Gắn **ảnh** cho sản phẩm | Trang Quản trị + bỏ ảnh vào thư mục `images/` | xem mục 2 |
| Đổi chữ, logo, chân trang, danh mục, tên topic mùa; **ẩn/hiện** khu vực trang chủ | Sửa 1 file chữ | `js/site-config.js` |
| Đổi màu sắc | Sửa vài dòng | `css/style.css` (khối `:root` ở đầu) |
| Thêm tính năng mới, đổi bố cục, thêm trang | **Nhờ Claude Code** (hoặc người biết code) | `js/app.js`, `css/style.css` |
| Đổi luật chấm điểm, voucher, xếp hạng | Bạn của bạn (C++) | `cgi/main.cpp` |

**Mẹo:** việc nào làm được ở Trang Quản trị hoặc `site-config.js` thì tự làm, không cần nhờ ai.

## 1. Quản trị sản phẩm (Trang Quản trị)
1. Mở web, bấm "Đăng nhập / Đăng ký", đăng nhập admin demo: `admin@swap.local` / `admin123`.
2. Bấm tên của bạn ở góc phải → "⚙ Trang quản trị".
3. **Thêm:** "+ Thêm sản phẩm" → điền → Lưu. **Sửa:** nút "Sửa". **Ẩn:** nút "Ẩn" (khách không thấy, nhưng dữ liệu còn, bấm "Hiện" là bán lại). **Xóa:** xóa hẳn, không khôi phục.
4. Bản demo lưu dữ liệu ngay trong trình duyệt của bạn (localStorage). Muốn về dữ liệu mẫu ban đầu: nút "Khôi phục dữ liệu mẫu".

> Lưu ý khi thuyết trình: dữ liệu bản demo chỉ nằm trên máy bạn. Khi nối C++ thật, dữ liệu sẽ lưu ở phía C++ (file/CSDL) do bạn của bạn quyết định.

## 2. Thêm ảnh minh họa quần áo
Hiện mỗi sản phẩm dùng **icon emoji** làm ảnh tạm. Để dùng ảnh thật:
1. Chép ảnh (jpg/png) vào thư mục `images/`, đặt tên không dấu, không khoảng trắng, ví dụ `ao-thun-trang.jpg`.
2. Trang Quản trị → "Sửa" sản phẩm → ô **Đường dẫn ảnh** gõ `images/ao-thun-trang.jpg` → Lưu.
3. Gõ sai tên ảnh thì web tự quay về hiện icon, không bị vỡ.

**Logo:** chép ảnh vào `images/logo.png`, mở `js/site-config.js`, sửa `logoUrl: ""` thành `logoUrl: "images/logo.png"`.

**Đổi icon emoji:** ô "Icon demo" trong form sửa sản phẩm; icon danh mục sửa trong `site-config.js`.

## 3. Ẩn / hiện các khu vực trang chủ
Mở `js/site-config.js`, tìm khối `show`:
```js
show: { categories: true, seasonTopics: true, gameBanner: true }
```
Đổi `true` thành `false` để ẩn, lưu file (Ctrl+S) là xong. Muốn ẩn hẳn một chủ đề mùa thì xóa dòng của nó trong `seasons`.

## 3b. Banner khuyến mãi và đồng hồ đếm ngược
Cũng ở `js/site-config.js`, khối `promo`:
```js
promo: { enabled: true, title: "SWAP DAY – 11.11", dates: "06.11.2026 – 12.11.2026",
         label: "Khuyến mãi có hạn sẽ kết thúc sau", end: "2026-11-12T23:59:59" }
```
- Đổi chữ: sửa `title`, `dates`, `label`.
- Đổi thời điểm kết thúc: sửa `end` theo dạng `năm-tháng-ngàyTgiờ:phút:giây`.
- Ẩn banner: đổi `enabled: true` thành `enabled: false`.
- Qua thời điểm `end` thì phần khuyến mãi và đồng hồ tự ẩn, không cần làm gì.

## 4. Sửa chữ / chân trang
Cũng ở `js/site-config.js`: `storeName`, `tagline`, `footer` (các cột chân trang đang có chữ "(Chủ dự án tự nhập...)" để bạn thay). Giữ nguyên dấu `"` và dấu `,`.

## 5. Khi nào nhờ Claude Code?
Khi bạn muốn **thêm tính năng hoặc đổi cách trang hoạt động**: thêm trang mới, thêm bộ lọc, đổi bố cục, thêm mục trong Trang Quản trị. Khi nhờ, hãy nói rõ: "sửa trong thư mục SWAP/ban-2", nêu điều muốn thấy, và dặn "không đổi hợp đồng dữ liệu trong SPEC.md" trừ khi cần. Nếu cần thêm dữ liệu từ C++ thì phải cập nhật `SPEC.md` rồi báo bạn của bạn.

## Nếu sửa xong bị trang trắng
Nhấn F12 → tab Console, chụp dòng chữ đỏ. Thường là thiếu/thừa dấu `"` hoặc `,` trong `site-config.js`. Dùng Ctrl+Z trong VS Code để quay lại.
