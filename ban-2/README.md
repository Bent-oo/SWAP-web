# SWAP – bản 2

Web thời trang + game Fashion Battle theo tài liệu "IDEA WEB SWAP". Frontend HTML/CSS/JS, backend C++ qua CGI.
Bản 1 (ở thư mục cha `SWAP`) được giữ nguyên.

## Chạy
VS Code → File → Open Folder → chọn `ban-2` → chuột phải `index.html` → **Open with Live Server**.
Hiện đang dùng **dữ liệu giả** (`USE_MOCK = true` trong `js/api.js`). Admin demo: `admin@swap.local` / `admin123`.

## Các tệp
| Tệp | Vai trò |
|---|---|
| `index.html` | Khung trang |
| `css/style.css` | Màu sắc (khối `:root`), bố cục |
| `js/site-config.js` | **Nội dung sửa được**: tên, logo, danh mục, topic mùa, chân trang, ẩn/hiện khu vực |
| `js/app.js` | Vẽ các trang, xử lý bấm nút |
| `js/api.js` | Cửa sổ nói chuyện với C++ + "bếp giả" |
| `js/mock-data.js` | Dữ liệu mẫu ban đầu |
| `images/` | Chỗ bỏ ảnh sản phẩm và logo |
| `SPEC.md` | Hợp đồng dữ liệu với bạn làm C++ |
| `HUONG-DAN-SUA.md` | Muốn sửa gì thì sửa ở đâu |

## Ghép với C++
1. Gửi `SPEC.md` cho bạn của bạn; bạn ấy viết `cgi/main.cpp` theo đó, biên dịch ra `api.cgi`.
2. Đặt vào `cgi-bin` của XAMPP/Apache, giao diện vào `htdocs/swap/`.
3. Đổi `USE_MOCK = false` trong `js/api.js`.
