// =====================================================================
// api.js – CHỖ DUY NHẤT giao diện "nói chuyện" với phần xử lý (C++).
//
// Hình dung: app.js là NHÂN VIÊN PHỤC VỤ, C++ là BẾP. api.js là CÁI CỬA SỔ chuyển món.
// app.js chỉ viết:   const ds = await api("products", { category: "Áo thun" });
// rồi nhận về kết quả. Nó không cần biết kết quả đến từ đâu:
//   - USE_MOCK = true  -> lấy từ "bếp giả" ngay bên dưới (chưa cần C++)
//   - USE_MOCK = false -> gửi yêu cầu qua CGI cho chương trình C++ thật
// Nhờ vậy khi bạn của bạn viết xong C++, chỉ cần đổi true -> false, giao diện không phải sửa.
// =====================================================================

const USE_MOCK = true;
const CGI_URL = "/cgi-bin/api.cgi";

function getToken() { try { return localStorage.getItem("swap2_token") || ""; } catch (e) { return ""; } }

async function api(action, params = {}, body = null) {
  params = { ...params };
  const token = getToken();
  if (token) params.token = token;                     // "thẻ đăng nhập" gửi kèm mọi yêu cầu
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 120));
    return mockApi(action, params, body);
  }
  const qs = new URLSearchParams({ action, ...params }).toString();
  const opt = body
    ? { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }
    : { method: "GET" };
  const res = await fetch(CGI_URL + "?" + qs, opt);
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || "Lỗi không rõ từ máy chủ");
  return json.data;
}

/* =====================================================================
   BẾP GIẢ – mô phỏng C++ và AI. Chỉ để demo khi chưa có C++.
   Dữ liệu lưu trong localStorage của trình duyệt nên tải lại trang vẫn còn.
   ===================================================================== */

function dbGet(key, fallback) {
  try { const v = JSON.parse(localStorage.getItem(key)); if (v !== null) return v; } catch (e) {}
  return JSON.parse(JSON.stringify(fallback));
}
function dbSet(key, v) { try { localStorage.setItem(key, JSON.stringify(v)); } catch (e) {} }

const slotOfCategory = name => (SITE.categories.find(c => c.name === name) || {}).slot || "accessory";
const withSlot = p => ({ ...p, slot: slotOfCategory(p.category) });
const allProducts = () => dbGet("swap2_products", MOCK.products);
const publicUser = a => ({ name: a.name, email: a.email, role: a.role, phone: a.phone || "", address: a.address || "" });
const today = () => new Date().toISOString().slice(0, 10);

function authUser(p, needAdmin) {
  const accounts = dbGet("swap2_accounts", MOCK.accounts);
  const acc = p.token ? accounts.find(a => "tok_" + a.email === p.token) : null;
  if (!acc) throw new Error("Vui lòng đăng nhập");
  if (needAdmin && acc.role !== "admin") throw new Error("Chỉ quản trị viên mới được thực hiện");
  return acc;
}
function hash(str) { let h = 0; for (const c of str) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; }

function mockApi(action, p, body) {
  switch (action) {

    /* ---------- Sản phẩm ---------- */
    case "products": {
      let list = allProducts().filter(x => !x.hidden);
      if (p.q)        list = list.filter(x => (x.name + " " + x.category).toLowerCase().includes(p.q.toLowerCase()));
      if (p.gender)   list = list.filter(x => x.gender === p.gender || x.gender === "Unisex");
      if (p.category) list = list.filter(x => x.category === p.category);
      if (p.style)    list = list.filter(x => x.style.includes(p.style));
      if (p.season)   list = list.filter(x => x.season === p.season);
      if (p.min)      list = list.filter(x => x.price >= +p.min);
      if (p.max)      list = list.filter(x => x.price <= +p.max);
      if (p.limit)    list = list.slice(0, +p.limit);
      return list.map(withSlot);
    }
    case "product": {
      const all = allProducts();
      const x = all.find(i => i.id == p.id && !i.hidden);
      if (!x) throw new Error("Không tìm thấy sản phẩm");
      const related = all.filter(i => !i.hidden && i.id != x.id && (i.category === x.category || i.style.some(s => x.style.includes(s)))).slice(0, 4);
      return { ...withSlot(x), related: related.map(withSlot) };
    }

    /* ---------- Tài khoản ---------- */
    case "register": {
      if (!body.name || !body.email || !body.password) throw new Error("Vui lòng điền đủ tên, email, mật khẩu");
      if (body.password.length < 6) throw new Error("Mật khẩu tối thiểu 6 ký tự");
      const accounts = dbGet("swap2_accounts", MOCK.accounts);
      if (accounts.some(a => a.email === body.email)) throw new Error("Email đã được đăng ký");
      const acc = { email: body.email, password: body.password, name: body.name, role: "user", phone: "", address: "" };
      accounts.push(acc); dbSet("swap2_accounts", accounts);
      return { token: "tok_" + acc.email, user: publicUser(acc) };
    }
    case "login": {
      const acc = dbGet("swap2_accounts", MOCK.accounts).find(a => a.email === body.email && a.password === body.password);
      if (!acc) throw new Error("Sai email hoặc mật khẩu");
      return { token: "tok_" + acc.email, user: publicUser(acc) };
    }
    case "me": return publicUser(authUser(p));
    case "update_profile": {
      const me = authUser(p);
      const accounts = dbGet("swap2_accounts", MOCK.accounts);
      const acc = accounts.find(a => a.email === me.email);
      acc.name = body.name || acc.name; acc.phone = body.phone || ""; acc.address = body.address || "";
      dbSet("swap2_accounts", accounts);
      return publicUser(acc);
    }
    case "change_password": {
      const me = authUser(p);
      const accounts = dbGet("swap2_accounts", MOCK.accounts);
      const acc = accounts.find(a => a.email === me.email);
      if (acc.password !== body.old_password) throw new Error("Mật khẩu cũ không đúng");
      if (!body.new_password || body.new_password.length < 6) throw new Error("Mật khẩu mới tối thiểu 6 ký tự");
      acc.password = body.new_password; dbSet("swap2_accounts", accounts);
      return { changed: true };
    }

    /* ---------- Giỏ hàng / đơn mua ---------- */
    case "checkout": {
      const me = authUser(p);
      if (!body.items || !body.items.length) throw new Error("Giỏ hàng trống");
      if (!body.name || !body.phone || !body.address) throw new Error("Vui lòng điền đủ tên, số điện thoại, địa chỉ");
      const prods = allProducts();
      const lines = body.items.map(it => {
        const x = prods.find(y => y.id == it.id && !y.hidden);
        if (!x) throw new Error("Có sản phẩm không còn bán");
        return { id: x.id, name: x.name, icon: x.icon, price: x.price, qty: Math.max(1, +it.qty || 1) };
      });
      const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
      let discount = 0;
      if (body.voucher_code) {
        const vs = dbGet("swap2_vouchers_" + me.email, []);
        const v = vs.find(y => y.code === body.voucher_code);
        if (!v || v.used) throw new Error("Voucher không hợp lệ hoặc đã dùng");
        if (v.expires < today()) throw new Error("Voucher đã hết hạn");
        discount = Math.round(subtotal * v.discount / 100);
        v.used = true; dbSet("swap2_vouchers_" + me.email, vs);
      }
      const orders = dbGet("swap2_orders", []);
      const order = { order_id: "DH" + (1001 + orders.length), email: me.email, date: new Date().toLocaleString("vi-VN"),
                      items: lines, subtotal, discount, total: subtotal - discount, status: "Đang xử lý" };
      orders.push(order); dbSet("swap2_orders", orders);
      return order;
    }
    case "orders": {
      const me = authUser(p);
      return dbGet("swap2_orders", []).filter(o => o.email === me.email).reverse();
    }

    /* ---------- Game Fashion Battle ---------- */
    case "challenges": return MOCK.challenges.map(c => ({ ...c, open: c.deadline >= today() }));
    case "challenge": {
      const c = MOCK.challenges.find(i => i.id == p.id);
      if (!c) throw new Error("Không tìm thấy thử thách");
      return { ...c, open: c.deadline >= today() };
    }
    case "submit_outfit": {
      const me = authUser(p);
      const c = MOCK.challenges.find(i => i.id == body.challenge_id);
      if (!c) throw new Error("Thử thách không tồn tại");
      // --- Bước C++: kiểm tra điều kiện cơ bản (đúng thời hạn, đủ loại món) ---
      if (c.deadline < today()) throw new Error("Thử thách đã hết hạn");
      const ids = [...new Set(body.product_ids || [])];
      const prods = allProducts();
      const items = ids.map(id => prods.find(x => x.id == id && !x.hidden)).filter(Boolean).map(withSlot);
      const has = s => items.some(i => i.slot === s);
      const missing = [];
      if (!has("top") && !has("full")) missing.push("áo");
      if (!has("bottom") && !has("full")) missing.push("quần/chân váy");
      if (!has("shoes")) missing.push("giày");
      if (!has("accessory")) missing.push("phụ kiện");
      if (missing.length) throw new Error("Outfit chưa đủ: thiếu " + missing.join(", "));
      // --- Bước AI (giả): điểm thành phần + nhận xét ---
      const h = hash(items.map(i => i.id).sort().join("-") + c.id);
      const matched = items.filter(i => i.style.includes(c.theme)).length;
      const theme = Math.round(30 * (0.35 + 0.65 * matched / items.length));
      const color = Math.round(25 * (0.6 + (h % 40) / 100));
      const harmony = Math.round(20 * (0.6 + ((h >> 3) % 40) / 100));
      const creative = Math.round(15 * (0.5 + ((h >> 5) % 50) / 100));
      const practical = Math.round(10 * (0.6 + ((h >> 7) % 40) / 100));
      const parts = { theme: [theme, 30, "độ phù hợp chủ đề"], color: [color, 25, "phối màu"], harmony: [harmony, 20, "sự hài hòa"],
                      creative: [creative, 15, "tính sáng tạo"], practical: [practical, 10, "tính ứng dụng"] };
      const ratio = k => parts[k][0] / parts[k][1];
      const keys = Object.keys(parts).sort((a, b) => ratio(b) - ratio(a));
      const comment = `Điểm mạnh là ${parts[keys[0]][2]}. Bạn có thể cải thiện thêm ${parts[keys[4]][2]} để outfit nổi bật hơn.`;
      // --- Bước C++: tổng hợp điểm, xếp hạng, trao thưởng ---
      const total = theme + color + harmony + creative + practical;
      let board = dbGet("swap2_board", MOCK.leaderboard);
      const old = board.find(e => e.challenge_id == c.id && e.email === me.email);
      if (!old) board.push({ challenge_id: c.id, email: me.email, player: me.name, outfit_name: body.outfit_name || "Outfit của tôi", score: total });
      else if (total > old.score) { old.score = total; old.outfit_name = body.outfit_name || old.outfit_name; }
      dbSet("swap2_board", board);
      const mine = board.filter(e => e.challenge_id == c.id);
      const best = Math.max(total, old ? old.score : 0);
      const rank = mine.filter(e => e.score > best).length + 1;
      let voucher = null;
      const mk = (discount, reason) => ({ code: "SWAP-" + c.id + "-" + (hash(me.email + c.id + discount) % 9000 + 1000), discount, expires: "2027-02-28", reason, used: false });
      if (rank === 1) voucher = mk(30, "Hạng 1 – " + c.title);
      else if (rank <= 3) voucher = mk(20, "Top 3 – " + c.title);
      else if (rank <= 10) voucher = mk(10, "Top 10 – " + c.title);
      else voucher = mk(5, "Phần thưởng tham gia – " + c.title);
      const vs = dbGet("swap2_vouchers_" + me.email, []);
      if (!vs.some(v => v.code === voucher.code)) { vs.push(voucher); dbSet("swap2_vouchers_" + me.email, vs); }
      return { score: { theme, color, harmony, creative, practical, total }, ai_comment: comment, rank, total_players: mine.length, voucher, items };
    }
    case "leaderboard": {
      let b = dbGet("swap2_board", MOCK.leaderboard);
      if (p.challenge_id) b = b.filter(e => e.challenge_id == p.challenge_id);
      return b.slice().sort((x, y) => y.score - x.score).slice(0, 20)
        .map((e, i) => ({ rank: i + 1, challenge_id: e.challenge_id, challenge: (MOCK.challenges.find(c => c.id == e.challenge_id) || {}).title,
                          player: e.player, outfit_name: e.outfit_name, score: e.score }));
    }
    case "my_vouchers": {
      const me = authUser(p);
      return dbGet("swap2_vouchers_" + me.email, []);
    }

    /* ---------- Quản trị (chỉ admin) ---------- */
    case "admin_products": { authUser(p, true); return allProducts().map(withSlot); }
    case "admin_save_product": {
      authUser(p, true);
      if (!body.name || !String(body.name).trim()) throw new Error("Thiếu tên sản phẩm");
      if (!SITE.categories.some(c => c.name === body.category)) throw new Error("Phân loại không hợp lệ");
      if (!(+body.price >= 0) || body.price === "") throw new Error("Giá không hợp lệ");
      const all = allProducts();
      const data = { name: body.name.trim(), gender: body.gender || "Unisex", category: body.category, style: body.style || [],
                     season: body.season || "Quanh năm", price: +body.price, icon: body.icon || "🏷️", image: body.image || "",
                     desc: body.desc || "", hidden: !!body.hidden };
      if (body.id) {
        const i = all.findIndex(x => x.id == body.id);
        if (i < 0) throw new Error("Không tìm thấy sản phẩm");
        all[i] = { ...all[i], ...data };
      } else {
        all.push({ id: Math.max(0, ...all.map(x => x.id)) + 1, ...data });
      }
      dbSet("swap2_products", all);
      return { saved: true };
    }
    case "admin_toggle_hidden": {
      authUser(p, true);
      const all = allProducts(); const x = all.find(i => i.id == p.id);
      if (!x) throw new Error("Không tìm thấy sản phẩm");
      x.hidden = !x.hidden; dbSet("swap2_products", all);
      return { id: x.id, hidden: x.hidden };
    }
    case "admin_delete_product": {
      authUser(p, true);
      dbSet("swap2_products", allProducts().filter(x => x.id != p.id));
      return { deleted: +p.id };
    }
    case "admin_reset_demo": {            // chỉ có ở bản giả: khôi phục dữ liệu mẫu
      authUser(p, true);
      ["swap2_products", "swap2_board", "swap2_orders"].forEach(k => { try { localStorage.removeItem(k); } catch (e) {} });
      return { reset: true };
    }
  }
  throw new Error("Action không tồn tại: " + action);
}
