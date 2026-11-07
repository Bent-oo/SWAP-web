# SPEC bản 2 – Hợp đồng dữ liệu giữa giao diện và C++

Yêu cầu: `GET /cgi-bin/api.cgi?action=TÊN&tham_số=...` hoặc `POST` cùng URL với JSON trong body.
Phản hồi: `{"ok":true,"data":...}` hoặc `{"ok":false,"error":"thông báo tiếng Việt"}`.
**Đăng nhập:** `login`/`register` trả `token`; giao diện gửi lại `token=...` trong mọi yêu cầu sau đó.
Bản giả: `js/api.js` (hàm `mockApi`) + `js/mock-data.js`. Phải đúng hình dạng dưới đây.

## Action
| action | Method | Quyền | Tham số / body | `data` trả về |
|---|---|---|---|---|
| `products` | GET | ai cũng | `q, gender, category, style, season, min, max, limit` (đều tùy chọn; **không trả sản phẩm ẩn**; gender lọc cả "Unisex") | `[Product]` |
| `product` | GET | ai cũng | `id` | `Product + {related:[Product]}` |
| `register` | POST | – | `{name,email,password}` (mk ≥ 6 ký tự) | `{token, user}` |
| `login` | POST | – | `{email,password}` | `{token, user}` |
| `me` | GET | đăng nhập | – | `User` |
| `update_profile` | POST | đăng nhập | `{name,phone,address}` | `User` |
| `change_password` | POST | đăng nhập | `{old_password,new_password}` | `{changed:true}` |
| `checkout` | POST | đăng nhập | `{items:[{id,qty}], name, phone, address, voucher_code?}` | `Order` |
| `orders` | GET | đăng nhập | – | `[Order]` (mới nhất trước) |
| `challenges` | GET | ai cũng | – | `[Challenge]` |
| `challenge` | GET | ai cũng | `id` | `Challenge` |
| `submit_outfit` | POST | đăng nhập | `{challenge_id, product_ids:[số], outfit_name}` | `SubmitResult` |
| `leaderboard` | GET | ai cũng | `challenge_id?` | `[{rank,challenge_id,challenge,player,outfit_name,score}]` |
| `my_vouchers` | GET | đăng nhập | – | `[Voucher]` |
| `admin_products` | GET | admin | – | `[Product]` (**gồm cả sản phẩm ẩn**) |
| `admin_save_product` | POST | admin | `Product` không có `slot`; có `id` = sửa, không có = thêm | `{saved:true}` |
| `admin_toggle_hidden` | GET | admin | `id` | `{id,hidden}` |
| `admin_delete_product` | GET | admin | `id` | `{deleted:id}` |
| `admin_reset_demo` | GET | admin | – | chỉ bản giả, C++ không cần làm |

## Kiểu dữ liệu
```
Product   = {id, name, gender("Nữ"|"Nam"|"Unisex"), category, slot, style:[chuỗi], season, price(số, đồng),
             icon(emoji), image(đường dẫn hoặc ""), desc, hidden:bool}
            slot do C++ suy ra từ category: top | bottom | full(đầm, váy liền) | shoes | accessory
User      = {name, email, role:"user"|"admin", phone, address}
Challenge = {id, title, theme, desc, deadline:"YYYY-MM-DD", players, open:bool}
Voucher   = {code, discount(% số), expires:"YYYY-MM-DD", reason, used:bool}
Order     = {order_id, date, items:[{id,name,icon,price,qty}], subtotal, discount, total, status}
SubmitResult = {
  score:{theme(0-30), color(0-25), harmony(0-20), creative(0-15), practical(0-10), total(0-100)},
  ai_comment, rank, total_players, voucher: Voucher, items:[Product]
}
```

## Luồng `submit_outfit` (phần C++ lo)
1. **Kiểm tra điều kiện:** còn hạn (`deadline`), outfit **đủ loại**: có áo (hoặc `full`), quần (hoặc `full`), giày, phụ kiện. Thiếu thì trả `ok:false` kèm lý do (VD "Outfit chưa đủ: thiếu giày").
2. **AI đánh giá:** gọi AI API → 5 điểm thành phần + lời nhận xét `ai_comment`. Không cộng điểm theo giá/thương hiệu.
3. **C++ tổng hợp:** cộng thành `total`, xếp `rank` (mỗi người một dòng/thử thách, giữ điểm cao nhất).
4. **Trao thưởng:** hạng 1 → 30%, top 3 → 20%, top 10 → 10%, còn lại → 5% (phần thưởng tham gia). Có `expires`.

## Quyền & an toàn (C++ phải làm, giao diện chỉ là bề ngoài)
- Kiểm tra `role` ở **mọi** action `admin_*`; ẩn nút trên giao diện không thay được việc này.
- Mật khẩu phải **băm** (hash) khi lưu. Bản giả lưu thô chỉ để demo.
- Tính lại `subtotal/discount/total` từ giá trong dữ liệu thật, không tin số từ giao diện.

> Đổi hợp đồng: sửa file này + `js/api.js` (bản giả) + `cgi/main.cpp` cùng lúc và báo cho bạn của bạn.
