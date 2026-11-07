// =====================================================================
// app.js – VẼ CÁC TRANG và xử lý bấm nút. KHÔNG chứa luật nghiệp vụ.
// Việc tính điểm, kiểm tra thời hạn, voucher, tổng tiền... đều nằm sau hàm api().
// Điều hướng bằng địa chỉ dạng  #/đường-dẫn?tham_số=giá_trị
// =====================================================================

const $app = document.getElementById("app");

/* ---------- Tiện ích ---------- */
// Escape: biến ký tự đặc biệt thành mã an toàn trước khi chèn vào HTML (chống chèn mã độc).
// QUY TẮC: dữ liệu từ người dùng / từ C++ luôn phải bọc esc() khi đưa vào trang.
function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
const money = n => Number(n).toLocaleString("vi-VN") + "đ";
function toast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg; t.classList.add("show");
  clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove("show"), 2400);
}
const lsGet = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v === null ? d : v; } catch (e) { return d; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };

/* ---------- Trạng thái ---------- */
let cart = lsGet("swap2_cart", []);          // [{id, qty}] – chỉ nhớ món đã chọn
let user = lsGet("swap2_user", null);        // người đang đăng nhập hoặc null

function setSession(u, token) {
  user = u;
  if (u) { lsSet("swap2_user", u); try { localStorage.setItem("swap2_token", token || getToken()); } catch (e) {} }
  else { try { localStorage.removeItem("swap2_user"); localStorage.removeItem("swap2_token"); } catch (e) {} }
  renderHeader();
}
function saveCart() { lsSet("swap2_cart", cart); const b = document.getElementById("cartCount"); if (b) b.textContent = cart.reduce((s, i) => s + i.qty, 0); }
function addToCart(id) {
  const it = cart.find(i => i.id == id);
  if (it) it.qty++; else cart.push({ id: +id, qty: 1 });
  saveCart(); toast("Đã thêm vào giỏ hàng");
}

/* ---------- Thành phần dùng lại ---------- */
// Ảnh sản phẩm: nếu có p.image thì hiện ảnh, không có (hoặc ảnh lỗi) thì hiện icon demo p.icon
function thumb(p, big) {
  const inner = p.image ? `<img class="pimg" src="${esc(p.image)}" alt="${esc(p.name)}" data-icon="${esc(p.icon)}">` : esc(p.icon);
  return `<div class="thumb${big ? " big" : ""}">${inner}</div>`;
}
document.addEventListener("error", e => {
  const t = e.target;
  if (t && t.classList && t.classList.contains("pimg")) {
    const s = document.createElement("span"); s.textContent = t.dataset.icon || "🏷️"; t.replaceWith(s);
  }
}, true);

function productCard(p, extra = "") {
  return `<div class="card product ${extra}" data-id="${p.id}">${thumb(p)}
    <div class="info"><h3>${esc(p.name)}</h3><div class="muted">${esc(p.category)} · ${esc(p.gender)}</div>
    <div class="price">${money(p.price)}</div></div></div>`;
}
const bindCards = () => $app.querySelectorAll(".product[data-id]").forEach(el => { if (!el.dataset.custom) el.onclick = () => (location.hash = "#/product/" + el.dataset.id); });
const loading = () => ($app.innerHTML = `<div class="loading muted">Đang tải...</div>`);
const showError = e => ($app.innerHTML = `<div class="error">⚠ ${esc(e.message)}</div>`);
const needLogin = () => { toast("Vui lòng đăng nhập trước"); location.hash = "#/login"; };

/* ---------- Thanh trên cùng (thứ tự: logo | giới tính | game | tìm kiếm | giỏ | tài khoản) ---------- */
function renderHeader() {
  const logo = SITE.logoUrl ? `<img src="${esc(SITE.logoUrl)}" alt="logo">` : "LOGO";
  const acct = user
    ? `<button class="icon-btn" id="acctBtn" style="padding:9px 14px">👤 ${esc(user.name)} ▾</button>
       <div class="menu hidden" id="acctMenu">
         <a href="#/account">Quản lý tài khoản</a><a href="#/account?tab=vouchers">Voucher của tôi</a>
         <a href="#/cart?tab=orders">Đơn mua</a>
         ${user.role === "admin" ? `<a href="#/admin">⚙ Trang quản trị</a>` : ""}
         <button id="logout">Đăng xuất</button></div>`
    : `<a class="icon-btn" href="#/login" style="padding:9px 14px;display:inline-block">Đăng nhập / Đăng ký</a>`;
  document.getElementById("hdr").innerHTML = `<div class="container hdr">
    <a class="logo" href="#/" title="Trang chủ">${logo}</a>
    <nav class="genders">${SITE.genders.map(g => `<a href="#/search?gender=${encodeURIComponent(g)}">${esc(g)}</a>`).join("")}</nav>
    <a class="game-btn" href="#/battle">🎮 Fashion Battle</a>
    <form class="search" id="sf" autocomplete="off">
      <input class="q" name="q" placeholder="Bạn đang tìm gì?">
      <button type="button" class="icon-btn" id="ft">Bộ lọc ▾</button>
      <button class="icon-btn" title="Tìm">🔍</button>
      <div class="fpanel hidden" id="fp">
        <div><label>Giá từ (đ)</label><input name="min" type="number" min="0" step="1000"></div>
        <div><label>Đến (đ)</label><input name="max" type="number" min="0" step="1000"></div>
        <div><label>Phân loại</label><select name="category"><option value="">Tất cả</option>${SITE.categories.map(c => `<option>${esc(c.name)}</option>`).join("")}</select></div>
        <div><label>Phong cách</label><select name="style"><option value="">Tất cả</option>${SITE.styles.map(s => `<option>${esc(s)}</option>`).join("")}</select></div>
        <div class="full" style="margin-top:12px"><button class="btn btn-primary" style="width:100%">Áp dụng</button></div>
      </div>
    </form>
    <a class="cart-link" href="#/cart" title="Giỏ hàng">🛒<span class="badge" id="cartCount">0</span></a>
    <div class="acct">${acct}</div></div>`;
  saveCart();
  const fp = document.getElementById("fp");
  document.getElementById("ft").onclick = e => { e.stopPropagation(); fp.classList.toggle("hidden"); };
  fp.onclick = e => e.stopPropagation();
  document.getElementById("sf").onsubmit = e => {
    e.preventDefault();
    const qs = new URLSearchParams();
    new FormData(e.target).forEach((v, k) => { if (String(v).trim()) qs.set(k, String(v).trim()); });
    fp.classList.add("hidden");
    location.hash = "#/search?" + qs.toString();
  };
  const ab = document.getElementById("acctBtn");
  if (ab) {
    ab.onclick = e => { e.stopPropagation(); document.getElementById("acctMenu").classList.toggle("hidden"); };
    document.getElementById("logout").onclick = () => { setSession(null); toast("Đã đăng xuất"); location.hash = "#/"; };
  }
}
document.addEventListener("click", () => { document.querySelectorAll("#fp,#acctMenu").forEach(el => el.classList.add("hidden")); });

/* ---------- Chân trang (nội dung lấy từ SITE.footer) ---------- */
function renderFooter() {
  const f = SITE.footer;
  document.getElementById("ftr").innerHTML = `<div class="container">
    <h3 style="color:#fff">${esc(SITE.storeName)}</h3><p>${esc(f.about)}</p>
    <div class="cols">${f.columns.map(c => `<div><h4>${esc(c.title)}</h4>${c.lines.map(l => `<p>${esc(l)}</p>`).join("")}</div>`).join("")}</div>
    <div class="copy">${esc(f.copyright)} · ${USE_MOCK ? "Đang dùng DỮ LIỆU GIẢ" : "Đã kết nối C++ (CGI)"}</div></div>`;
}

/* ---------- Router ---------- */
const routes = [
  [/^\/?$/, pageHome], [/^\/search$/, pageSearch], [/^\/product\/(\d+)$/, pageProduct],
  [/^\/cart$/, pageCart], [/^\/battle$/, pageBattleList], [/^\/battle\/(\d+)$/, pageBattle],
  [/^\/leaderboard$/, pageLeaderboard], [/^\/login$/, pageLogin], [/^\/account$/, pageAccount], [/^\/admin$/, pageAdmin]
];
async function route() {
  const raw = location.hash.replace(/^#/, "") || "/";
  const [path, qs] = raw.split("?");
  const params = Object.fromEntries(new URLSearchParams(qs || ""));
  for (const [re, fn] of routes) {
    const m = path.match(re);
    if (m) {
      window.scrollTo(0, 0); loading();
      document.querySelectorAll(".genders a").forEach(a => a.classList.toggle("on", path === "/search" && decodeURIComponent(a.hash.split("gender=")[1] || "") === (params.gender || "\0")));
      try { await fn(...m.slice(1), params); } catch (e) { showError(e); }
      return;
    }
  }
  $app.innerHTML = `<div class="error">Không tìm thấy trang. <a href="#/" style="color:var(--blue)">Về trang chủ</a></div>`;
}
window.addEventListener("hashchange", route);

/* ================= TRANG CHỦ ================= */
async function pageHome() {
  const pr = SITE.promo;
  const promoOn = pr && pr.enabled && new Date(pr.end) > new Date();
  let html = `<section class="hero"><h1>${esc(SITE.storeName)}</h1><p>${esc(SITE.tagline)}</p>
    ${promoOn ? `<div class="promo-title">${esc(pr.title)}</div><div>${esc(pr.dates)}</div><p style="margin-bottom:0">${esc(pr.label)}</p>
      <div class="count" id="count"></div>` : `<div style="height:14px"></div>`}
    <a class="btn btn-dark" href="#/battle">Chơi Fashion Battle</a></section>`;

  if (SITE.show.categories) {
    const limit = SITE.categoriesPerRow * SITE.categoriesMaxRows;
    const cell = (c, hide) => `<div class="cat ${hide ? "more hidden" : ""}" data-cat="${esc(c.name)}"><span class="ic">${esc(c.icon)}</span>${esc(c.name)}</div>`;
    html += `<h2>Tìm theo danh mục</h2>
      <div class="cats" style="grid-template-columns:repeat(${SITE.categoriesPerRow},1fr)">${SITE.categories.map((c, i) => cell(c, i >= limit)).join("")}</div>
      ${SITE.categories.length > limit ? `<p style="text-align:center;margin-top:14px"><button class="btn btn-outline" id="allCats">Hiện tất cả danh mục</button></p>` : ""}`;
  }
  if (SITE.show.seasonTopics) {
    const lists = await Promise.all(SITE.seasons.map(s => api("products", { season: s.season, limit: 4 })));
    html += `<h2>Gợi ý theo mùa</h2>` + SITE.seasons.map((s, i) => lists[i].length ? `<div class="topic">
      <div class="row between"><div><h3>${esc(s.icon)} ${esc(s.title)}</h3><span class="muted">${esc(s.desc)}</span></div>
      <a class="btn btn-sm btn-outline" href="#/search?season=${encodeURIComponent(s.season)}">Xem thêm</a></div>
      <div class="grid" style="margin-top:14px">${lists[i].map(p => productCard(p)).join("")}</div></div>` : "").join("");
  }
  if (SITE.show.gameBanner) {
    html += `<div class="banner"><h2 style="margin:0">🎮 Fashion Battle</h2>
      <p>Phối outfit theo chủ đề từ sản phẩm thật, AI chấm điểm, nhận voucher theo thứ hạng.</p>
      <a class="btn btn-primary" href="#/battle">Vào chơi ngay</a></div>`;
  }
  $app.innerHTML = html;
  bindCards();
  if (promoOn) {                      // đồng hồ đếm ngược: chỉ hiển thị thời gian còn lại
    const box = document.getElementById("count");
    const tick = () => {
      let s = Math.max(0, Math.floor((new Date(pr.end) - new Date()) / 1000));
      const d = Math.floor(s / 86400); s %= 86400; const h = Math.floor(s / 3600); s %= 3600; const m = Math.floor(s / 60); s %= 60;
      box.innerHTML = [[d, "ngày"], [h, "giờ"], [m, "phút"], [s, "giây"]].map(([n, l]) => `<div>${n}<small>${l}</small></div>`).join("");
    };
    tick(); clearInterval(window.countTimer); window.countTimer = setInterval(() => document.getElementById("count") ? tick() : clearInterval(window.countTimer), 1000);
  }
  $app.querySelectorAll(".cat").forEach(el => el.onclick = () => (location.hash = "#/search?category=" + encodeURIComponent(el.dataset.cat)));
  const all = document.getElementById("allCats");
  if (all) all.onclick = () => {
    const hid = $app.querySelectorAll(".cat.more");
    const show = hid[0].classList.contains("hidden");
    hid.forEach(el => el.classList.toggle("hidden", !show));
    all.textContent = show ? "Thu gọn danh mục" : "Hiện tất cả danh mục";
  };
}

/* ================= TÌM KIẾM / LỌC ================= */
async function pageSearch(params) {
  const list = await api("products", params);
  const labels = { q: "Từ khóa", gender: "Giới tính", category: "Phân loại", style: "Phong cách", season: "Mùa", min: "Giá từ", max: "Đến" };
  const chips = Object.keys(labels).filter(k => params[k]).map(k => `<span class="tag">${labels[k]}: ${esc(params[k])}</span>`).join("");
  $app.innerHTML = `<h1>Sản phẩm</h1><div>${chips || `<span class="muted">Tất cả sản phẩm</span>`}</div>
    <p class="muted" style="margin:8px 0 16px">${list.length} kết quả</p>
    <div class="grid">${list.map(p => productCard(p)).join("") || `<p class="muted">Không có sản phẩm phù hợp.</p>`}</div>`;
  bindCards();
}

async function pageProduct(id) {
  const p = await api("product", { id });
  $app.innerHTML = `<p><a class="muted" href="javascript:history.back()">← Quay lại</a></p>
    <div class="two">${thumb(p, true)}<div><h1>${esc(p.name)}</h1>
    <p class="muted">${esc(p.category)} · ${esc(p.gender)} · Mùa: ${esc(p.season)}</p>
    <p class="price" style="font-size:1.6rem;margin:10px 0">${money(p.price)}</p>
    <p>${esc(p.desc)}</p><p>${p.style.map(s => `<span class="tag">${esc(s)}</span>`).join("")}</p>
    <div class="row" style="margin-top:20px"><button class="btn btn-primary" id="add">Thêm vào giỏ</button>
    <a class="btn btn-outline" href="#/battle">Dùng trong Fashion Battle</a></div></div></div>
    <h2>Có thể bạn thích</h2><div class="grid">${p.related.map(r => productCard(r)).join("")}</div>`;
  document.getElementById("add").onclick = () => addToCart(p.id);
  bindCards();
}

/* ================= GIỎ HÀNG + ĐƠN MUA ================= */
async function pageCart(params) {
  const tab = params.tab === "orders" ? "orders" : "cart";
  const head = `<h1>Giỏ hàng</h1><div class="tabs"><a class="tab ${tab === "cart" ? "on" : ""}" href="#/cart">Giỏ hàng</a>
    <a class="tab ${tab === "orders" ? "on" : ""}" href="#/cart?tab=orders">Đơn mua</a></div>`;
  if (tab === "orders") {
    if (!user) { $app.innerHTML = head + `<p class="muted">Bạn cần <a href="#/login" style="color:var(--blue)">đăng nhập</a> để xem đơn mua.</p>`; return; }
    const orders = await api("orders");
    $app.innerHTML = head + (orders.length ? orders.map(o => `<div class="card" style="margin-bottom:12px">
      <div class="row between"><b>${esc(o.order_id)}</b><span class="tag">${esc(o.status)}</span></div>
      <p class="muted">${esc(o.date)}</p>
      <table>${o.items.map(i => `<tr><td>${esc(i.icon)} ${esc(i.name)}</td><td>x${esc(i.qty)}</td><td>${money(i.price * i.qty)}</td></tr>`).join("")}</table>
      <p style="margin-top:8px">Tạm tính ${money(o.subtotal)} · Giảm ${money(o.discount)} · <b class="price">Tổng ${money(o.total)}</b></p></div>`).join("")
      : `<p class="muted">Bạn chưa có đơn mua nào.</p>`);
    return;
  }
  if (!cart.length) { $app.innerHTML = head + `<p class="muted">Giỏ hàng trống. <a href="#/search" style="color:var(--blue)">Đi mua sắm</a></p>`; return; }
  const all = await api("products");
  const byId = Object.fromEntries(all.map(p => [p.id, p]));
  cart = cart.filter(i => byId[i.id]); saveCart();
  if (!cart.length) { $app.innerHTML = head + `<p class="muted">Các sản phẩm trong giỏ không còn bán.</p>`; return; }
  const vouchers = user ? (await api("my_vouchers")).filter(v => !v.used) : [];
  const sub = cart.reduce((s, i) => s + byId[i.id].price * i.qty, 0);     // chỉ hiển thị; máy chủ tính lại khi đặt
  $app.innerHTML = head + `<div class="side"><div class="card"><table><tr><th>Sản phẩm</th><th>Giá</th><th>SL</th><th></th></tr>
    ${cart.map(i => `<tr><td>${esc(byId[i.id].icon)} ${esc(byId[i.id].name)}</td><td>${money(byId[i.id].price)}</td>
    <td><button class="tab" data-d="${i.id}">−</button> ${i.qty} <button class="tab" data-u="${i.id}">+</button></td>
    <td><button class="btn btn-sm btn-danger" data-r="${i.id}">Xóa</button></td></tr>`).join("")}</table>
    <p style="margin-top:14px">Tạm tính: <b class="price">${money(sub)}</b></p></div>
    <form class="card" id="f"><h3>Thông tin nhận hàng</h3>
      <label>Họ tên</label><input name="name" value="${esc(user ? user.name : "")}">
      <label>Số điện thoại</label><input name="phone" value="${esc(user ? user.phone : "")}">
      <label>Địa chỉ</label><input name="address" value="${esc(user ? user.address : "")}">
      <label>Voucher</label><select name="voucher_code"><option value="">Không dùng</option>
      ${vouchers.map(v => `<option value="${esc(v.code)}">${esc(v.code)} – giảm ${esc(v.discount)}%</option>`).join("")}</select>
      <button class="btn btn-primary" style="margin-top:16px;width:100%">Đặt hàng</button>
      ${user ? "" : `<p class="muted" style="margin-top:8px">Bạn cần đăng nhập để đặt hàng.</p>`}</form></div>`;
  const redo = () => { saveCart(); pageCart(params); };
  $app.querySelectorAll("[data-u]").forEach(b => b.onclick = () => { cart.find(i => i.id == b.dataset.u).qty++; redo(); });
  $app.querySelectorAll("[data-d]").forEach(b => b.onclick = () => { const it = cart.find(i => i.id == b.dataset.d); if (it.qty > 1) it.qty--; redo(); });
  $app.querySelectorAll("[data-r]").forEach(b => b.onclick = () => { cart = cart.filter(i => i.id != b.dataset.r); redo(); });
  document.getElementById("f").onsubmit = async e => {
    e.preventDefault();
    if (!user) return needLogin();
    const body = Object.fromEntries(new FormData(e.target)); body.items = cart;
    try {
      const o = await api("checkout", {}, body);
      cart = []; saveCart();
      $app.innerHTML = `<div class="card" style="text-align:center"><h1>✅ Đặt hàng thành công</h1><p>Mã đơn: <b>${esc(o.order_id)}</b></p>
        <p>Tạm tính ${money(o.subtotal)} · Giảm ${money(o.discount)}</p><p class="price" style="font-size:1.5rem">Tổng: ${money(o.total)}</p>
        <a class="btn btn-primary" href="#/cart?tab=orders">Xem đơn mua</a></div>`;
    } catch (err) { toast(err.message); }
  };
}

/* ================= FASHION BATTLE ================= */
async function pageBattleList() {
  const list = await api("challenges");
  $app.innerHTML = `<h1>🎮 Fashion Battle</h1><p class="muted">Chọn thử thách → chọn sản phẩm → gửi outfit → AI đánh giá → C++ xếp hạng → nhận voucher.</p>
    <div class="grid grid-3" style="margin-top:18px">${list.map(c => `<div class="card">
      <span class="tag ${c.open ? "" : "off"}">${c.open ? "Đang mở" : "Đã hết hạn"}</span>
      <h3 style="margin:8px 0">${esc(c.title)}</h3><p class="muted">${esc(c.desc)}</p>
      <p class="muted" style="margin:8px 0">Hạn: ${esc(c.deadline)} · ${esc(c.players)} người chơi</p>
      ${c.open ? `<a class="btn btn-primary" href="#/battle/${c.id}">Tham gia</a>` : `<button class="btn btn-primary" disabled>Hết hạn</button>`}</div>`).join("")}</div>
    <p style="margin-top:20px"><a class="btn btn-outline" href="#/leaderboard">Xem bảng xếp hạng</a></p>`;
}

async function pageBattle(id) {
  if (!user) return needLogin();
  const [c, products] = await Promise.all([api("challenge", { id }), api("products")]);
  const byId = Object.fromEntries(products.map(p => [p.id, p]));
  const picked = { top: null, bottom: null, shoes: null, accessory: null };   // ô -> id sản phẩm
  const groups = [{ label: "Áo / Đầm", slots: ["top", "full"] }, { label: "Quần / Chân váy", slots: ["bottom"] },
                  { label: "Giày", slots: ["shoes"] }, { label: "Phụ kiện", slots: ["accessory"] }];
  let g = 0;
  $app.innerHTML = `<p><a class="muted" href="#/battle">← Các thử thách</a></p>
    <h1>${esc(c.title)}</h1><p class="muted">${esc(c.desc)} · Hạn: ${esc(c.deadline)}</p>
    <div class="side" style="margin-top:14px"><div><div class="tabs" id="gt"></div><div class="grid" id="pl"></div></div>
    <div class="card" style="position:sticky;top:84px"><h3>Outfit của bạn</h3><div class="slots" id="slots"></div>
    <label>Tên outfit</label><input id="oname" placeholder="VD: Phố đêm">
    <button class="btn btn-primary" id="go" style="width:100%;margin-top:14px" disabled>Gửi outfit</button><div id="result"></div></div></div>`;

  const chosenIds = () => [...new Set(Object.values(picked).filter(Boolean))];
  function drawTabs() {
    document.getElementById("gt").innerHTML = groups.map((x, i) => `<button class="tab ${i === g ? "on" : ""}" data-g="${i}">${x.label}</button>`).join("");
    $app.querySelectorAll("[data-g]").forEach(b => b.onclick = () => { g = +b.dataset.g; drawTabs(); drawList(); });
  }
  function drawList() {
    const list = products.filter(p => groups[g].slots.includes(p.slot));
    document.getElementById("pl").innerHTML = list.map(p => productCard(p, chosenIds().includes(p.id) ? "selected" : "")).join("") || `<p class="muted">Chưa có sản phẩm.</p>`;
    $app.querySelectorAll("#pl .product").forEach(el => { el.dataset.custom = 1; el.onclick = () => choose(+el.dataset.id); });
  }
  function choose(pid) {
    const p = byId[pid];
    if (chosenIds().includes(pid)) return unchoose(pid);
    if (p.slot === "full") {                       // đầm/váy liền: chiếm cả ô áo và ô quần
      picked.top = pid; picked.bottom = pid;
    } else {
      if (picked[p.slot] && byId[picked[p.slot]].slot === "full") { picked.top = null; picked.bottom = null; }
      picked[p.slot] = pid;
    }
    refresh();
  }
  function unchoose(pid) { Object.keys(picked).forEach(k => { if (picked[k] === pid) picked[k] = null; }); refresh(); }
  function refresh() {
    document.getElementById("slots").innerHTML = SITE.slots.map(s => {
      const p = byId[picked[s.key]];
      return p ? `<div class="slot full" data-rm="${p.id}"><div><span class="e">${esc(p.icon)}</span>${esc(p.name)}</div></div>`
               : `<div class="slot">${esc(s.label)}<br>(trống)</div>`;
    }).join("");
    document.getElementById("go").disabled = Object.values(picked).some(v => !v);
    $app.querySelectorAll("[data-rm]").forEach(el => el.onclick = () => unchoose(+el.dataset.rm));
    drawList();
  }
  document.getElementById("go").onclick = async () => {
    const btn = document.getElementById("go"); btn.disabled = true; btn.textContent = "AI đang đánh giá...";
    try {
      const r = await api("submit_outfit", {}, { challenge_id: c.id, product_ids: chosenIds(), outfit_name: document.getElementById("oname").value });
      showResult(r);
    } catch (e) { toast(e.message); }
    btn.textContent = "Gửi outfit"; btn.disabled = false;
  };
  function showResult(r) {
    const rows = [["Phù hợp chủ đề", r.score.theme, 30], ["Phối màu & kiểu dáng", r.score.color, 25], ["Hài hòa tổng thể", r.score.harmony, 20],
                  ["Sáng tạo", r.score.creative, 15], ["Tính ứng dụng", r.score.practical, 10]];
    document.getElementById("result").innerHTML = `<hr style="margin:16px 0;border:0;border-top:1px solid var(--line)">
      <div class="score-big">${esc(r.score.total)}<small style="font-size:1rem">/100</small></div>
      <span class="muted">Hạng ${esc(r.rank)}/${esc(r.total_players)}</span>
      <div style="margin-top:12px">${rows.map(([n, v, m]) => `<div class="row between"><span>${n}</span><b>${esc(v)}/${m}</b></div>
        <div class="bar-bg"><div class="bar-fill" style="width:${(v / m) * 100}%"></div></div>`).join("")}</div>
      <p class="muted">🤖 ${esc(r.ai_comment)}</p>
      ${r.voucher ? `<div class="voucher" style="margin-top:12px">🎁 ${esc(r.voucher.reason)}<br><span class="code">${esc(r.voucher.code)}</span><br>Giảm ${esc(r.voucher.discount)}% · HSD ${esc(r.voucher.expires)}</div>` : ""}
      <a class="btn btn-outline btn-sm" style="margin-top:12px" href="#/leaderboard">Bảng xếp hạng</a>`;
  }
  drawTabs(); refresh();
}

async function pageLeaderboard() {
  const [chs, rows] = await Promise.all([api("challenges"), api("leaderboard")]);
  $app.innerHTML = `<h1>Bảng xếp hạng</h1><div style="max-width:300px;margin-bottom:14px"><select id="sel"><option value="">Tất cả thử thách</option>
    ${chs.map(c => `<option value="${c.id}">${esc(c.title)}</option>`).join("")}</select></div><div class="card" id="tb"></div>`;
  const draw = list => document.getElementById("tb").innerHTML = `<table><tr><th>Hạng</th><th>Người chơi</th><th>Outfit</th><th>Thử thách</th><th>Điểm</th></tr>
    ${list.map(r => `<tr><td>${esc(r.rank)}</td><td>${esc(r.player)}</td><td>${esc(r.outfit_name)}</td><td>${esc(r.challenge)}</td><td><b>${esc(r.score)}</b></td></tr>`).join("")}</table>`;
  draw(rows);
  document.getElementById("sel").onchange = async e => draw(await api("leaderboard", e.target.value ? { challenge_id: e.target.value } : {}));
}

/* ================= ĐĂNG NHẬP / ĐĂNG KÝ ================= */
async function pageLogin() {
  let mode = "login";
  const draw = () => {
    $app.innerHTML = `<div class="card" style="max-width:420px;margin:auto"><h1>${mode === "login" ? "Đăng nhập" : "Đăng ký"}</h1>
      <form id="f">${mode === "register" ? `<label>Họ tên</label><input name="name">` : ""}
      <label>Email</label><input name="email" type="email"><label>Mật khẩu</label><input name="password" type="password">
      <button class="btn btn-primary" style="margin-top:16px;width:100%">${mode === "login" ? "Đăng nhập" : "Tạo tài khoản"}</button></form>
      <p style="margin-top:12px"><a href="#" id="sw" style="color:var(--blue)">${mode === "login" ? "Chưa có tài khoản? Đăng ký" : "Đã có tài khoản? Đăng nhập"}</a></p>
      ${USE_MOCK ? `<p class="muted" style="margin-top:10px;font-size:.85rem">Bản demo: tài khoản admin <b>admin@swap.local</b> / <b>admin123</b></p>` : ""}</div>`;
    document.getElementById("sw").onclick = e => { e.preventDefault(); mode = mode === "login" ? "register" : "login"; draw(); };
    document.getElementById("f").onsubmit = async e => {
      e.preventDefault();
      try {
        const r = await api(mode, {}, Object.fromEntries(new FormData(e.target)));
        setSession(r.user, r.token); toast("Xin chào " + r.user.name); location.hash = "#/";
      } catch (err) { toast(err.message); }
    };
  };
  draw();
}

/* ================= QUẢN LÝ TÀI KHOẢN ================= */
async function pageAccount(params) {
  if (!user) return needLogin();
  const tab = params.tab === "vouchers" ? "vouchers" : "profile";
  const head = `<h1>Tài khoản</h1><div class="tabs"><a class="tab ${tab === "profile" ? "on" : ""}" href="#/account">Thông tin</a>
    <a class="tab ${tab === "vouchers" ? "on" : ""}" href="#/account?tab=vouchers">Voucher</a></div>`;
  if (tab === "vouchers") {
    const vs = await api("my_vouchers");
    $app.innerHTML = head + (vs.length ? `<div class="grid grid-3">${vs.map(v => `<div class="voucher ${v.used ? "used" : ""}">🎁 ${esc(v.reason)}<br>
      <span class="code">${esc(v.code)}</span><br>Giảm ${esc(v.discount)}% · HSD ${esc(v.expires)} ${v.used ? "· <b>Đã dùng</b>" : ""}</div>`).join("")}</div>`
      : `<p class="muted">Chưa có voucher. <a href="#/battle" style="color:var(--blue)">Chơi Fashion Battle</a> để nhận.</p>`);
    return;
  }
  $app.innerHTML = head + `<div class="two"><form class="card" id="pf"><h3>Thông tin cá nhân</h3>
    <label>Email</label><input value="${esc(user.email)}" disabled><label>Họ tên</label><input name="name" value="${esc(user.name)}">
    <label>Số điện thoại</label><input name="phone" value="${esc(user.phone)}"><label>Địa chỉ</label><input name="address" value="${esc(user.address)}">
    <button class="btn btn-primary" style="margin-top:14px">Lưu</button></form>
    <form class="card" id="pw"><h3>Đổi mật khẩu</h3><label>Mật khẩu cũ</label><input name="old_password" type="password">
    <label>Mật khẩu mới</label><input name="new_password" type="password"><button class="btn btn-dark" style="margin-top:14px">Đổi mật khẩu</button></form></div>`;
  document.getElementById("pf").onsubmit = async e => {
    e.preventDefault();
    try { const u = await api("update_profile", {}, Object.fromEntries(new FormData(e.target))); setSession(u); toast("Đã lưu"); }
    catch (err) { toast(err.message); }
  };
  document.getElementById("pw").onsubmit = async e => {
    e.preventDefault();
    try { await api("change_password", {}, Object.fromEntries(new FormData(e.target))); e.target.reset(); toast("Đã đổi mật khẩu"); }
    catch (err) { toast(err.message); }
  };
}

/* ================= TRANG QUẢN TRỊ (chỉ admin) ================= */
async function pageAdmin() {
  if (!user || user.role !== "admin") { $app.innerHTML = `<div class="error">Trang này chỉ dành cho quản trị viên. <a href="#/login" style="color:var(--blue)">Đăng nhập</a></div>`; return; }
  const list = await api("admin_products");
  $app.innerHTML = `<div class="row between"><h1>⚙ Quản trị sản phẩm</h1>
    <div class="row"><button class="btn btn-primary" id="add">+ Thêm sản phẩm</button>
    ${USE_MOCK ? `<button class="btn btn-outline" id="reset">Khôi phục dữ liệu mẫu</button>` : ""}</div></div>
    <div class="card" style="margin-top:14px;overflow:auto"><table><tr><th></th><th>Tên</th><th>Giới tính</th><th>Phân loại</th><th>Giá</th><th>Trạng thái</th><th></th></tr>
    ${list.map(p => `<tr><td style="font-size:1.6rem">${esc(p.icon)}</td><td>${esc(p.name)}</td><td>${esc(p.gender)}</td><td>${esc(p.category)}</td><td>${money(p.price)}</td>
    <td><span class="tag ${p.hidden ? "off" : ""}">${p.hidden ? "Đang ẩn" : "Đang bán"}</span></td>
    <td style="white-space:nowrap"><button class="btn btn-sm btn-outline" data-e="${p.id}">Sửa</button>
    <button class="btn btn-sm btn-outline" data-h="${p.id}">${p.hidden ? "Hiện" : "Ẩn"}</button>
    <button class="btn btn-sm btn-danger" data-x="${p.id}">Xóa</button></td></tr>`).join("")}</table></div>`;
  document.getElementById("add").onclick = () => productDialog(null);
  const reset = document.getElementById("reset");
  if (reset) reset.onclick = async () => { if (confirm("Khôi phục sản phẩm, bảng xếp hạng, đơn hàng về dữ liệu mẫu?")) { await api("admin_reset_demo"); pageAdmin(); } };
  $app.querySelectorAll("[data-e]").forEach(b => b.onclick = () => productDialog(list.find(p => p.id == b.dataset.e)));
  $app.querySelectorAll("[data-h]").forEach(b => b.onclick = async () => { try { await api("admin_toggle_hidden", { id: b.dataset.h }); pageAdmin(); } catch (e) { toast(e.message); } });
  $app.querySelectorAll("[data-x]").forEach(b => b.onclick = async () => {
    if (confirm("Xóa hẳn sản phẩm này? Không khôi phục được (chỉ muốn tạm ngừng bán thì dùng nút Ẩn).")) { try { await api("admin_delete_product", { id: b.dataset.x }); pageAdmin(); } catch (e) { toast(e.message); } }
  });
}

function productDialog(p) {
  const v = p || { name: "", gender: SITE.genders[0], category: SITE.categories[0].name, style: [], season: "Quanh năm", price: "", icon: "🏷️", image: "", desc: "", hidden: false };
  const seasons = [...SITE.seasons.map(s => s.season), "Quanh năm"];
  const opt = (arr, cur) => arr.map(x => `<option ${x === cur ? "selected" : ""}>${esc(x)}</option>`).join("");
  document.getElementById("modal").innerHTML = `<div class="overlay" id="ov"><form class="dialog" id="pf">
    <h2 style="margin-top:0">${p ? "Sửa sản phẩm" : "Thêm sản phẩm"}</h2>
    <label>Tên</label><input name="name" value="${esc(v.name)}">
    <div class="two" style="gap:12px"><div><label>Giới tính</label><select name="gender">${opt(SITE.genders, v.gender)}</select></div>
    <div><label>Phân loại</label><select name="category">${opt(SITE.categories.map(c => c.name), v.category)}</select></div></div>
    <div class="two" style="gap:12px"><div><label>Giá (đồng)</label><input name="price" type="number" min="0" value="${esc(v.price)}"></div>
    <div><label>Mùa</label><select name="season">${opt(seasons, v.season)}</select></div></div>
    <label>Phong cách</label><div class="checks">${SITE.styles.map(s => `<label><input type="checkbox" name="style" value="${esc(s)}" ${v.style.includes(s) ? "checked" : ""}>${esc(s)}</label>`).join("")}</div>
    <div class="two" style="gap:12px"><div><label>Icon demo (emoji)</label><input name="icon" value="${esc(v.icon)}"></div>
    <div><label>Đường dẫn ảnh (vd images/ao-1.jpg)</label><input name="image" value="${esc(v.image)}"></div></div>
    <label>Mô tả</label><textarea name="desc" rows="3">${esc(v.desc)}</textarea>
    <label class="row" style="margin-top:12px"><input type="checkbox" name="hidden" style="width:auto" ${v.hidden ? "checked" : ""}> Ẩn sản phẩm (khách không thấy)</label>
    <div class="row" style="margin-top:16px;justify-content:flex-end"><button type="button" class="btn btn-outline" id="cancel">Hủy</button><button class="btn btn-primary">Lưu</button></div></form></div>`;
  const close = () => (document.getElementById("modal").innerHTML = "");
  document.getElementById("cancel").onclick = close;
  document.getElementById("ov").onclick = e => { if (e.target.id === "ov") close(); };
  document.getElementById("pf").onsubmit = async e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const body = Object.fromEntries(fd); body.style = fd.getAll("style"); body.hidden = fd.has("hidden");
    if (p) body.id = p.id;
    try { await api("admin_save_product", {}, body); close(); toast("Đã lưu"); pageAdmin(); } catch (err) { toast(err.message); }
  };
}

/* ---------- Khởi động ---------- */
renderHeader();
renderFooter();
route();
if (user) api("me").then(u => { user = u; lsSet("swap2_user", u); renderHeader(); }).catch(() => setSession(null));
