// DỮ LIỆU GIẢ (mẫu ban đầu). Hình dạng phải đúng như SPEC.md.
// Khi chạy bản giả, dữ liệu bạn sửa ở trang Quản trị được lưu trong trình duyệt (localStorage),
// còn file này chỉ là dữ liệu MẪU lúc đầu. Khi có C++ thật (USE_MOCK=false) thì file này không dùng nữa.

// P(id, tên, giới tính, phân loại, [phong cách], mùa, giá, icon)
function P(id, name, gender, category, style, season, price, icon) {
  return { id, name, gender, category, style, season, price, icon, image: "", desc: name + " – chất liệu thoải mái, dễ phối đồ.", hidden: false };
}

const MOCK = {
  products: [
    P(1,  "Áo khoác bomber đen",    "Unisex", "Áo khoác",    ["Streetwear"],                                   "Đông",      599000, "🧥"),
    P(2,  "Áo khoác denim",         "Nữ",     "Áo khoác",    ["Streetwear", "Back to School"],                 "Thu",       549000, "🧥"),
    P(3,  "Áo sơ mi trắng",         "Nam",    "Áo sơ mi",    ["Minimalist", "First Date"],                     "Quanh năm", 349000, "👔"),
    P(4,  "Áo sơ mi lụa xanh",      "Nữ",     "Áo sơ mi",    ["First Date", "Minimalist"],                     "Thu",       399000, "👚"),
    P(5,  "Áo nỉ hoodie navy",      "Unisex", "Áo nỉ",       ["Streetwear", "Back to School"],                 "Đông",      459000, "🧥"),
    P(6,  "Áo thun trắng basic",    "Unisex", "Áo thun",     ["Minimalist", "Summer Outfit", "Back to School"],"Hè",        199000, "👕"),
    P(7,  "Áo thun oversize đen",   "Nam",    "Áo thun",     ["Streetwear", "Summer Outfit"],                  "Hè",        249000, "👕"),
    P(8,  "Áo len cổ lọ",           "Nữ",     "Áo len",      ["Minimalist", "First Date"],                     "Đông",      429000, "🧶"),
    P(9,  "Áo vest xanh đen",       "Nam",    "Áo vest",     ["Minimalist", "First Date"],                     "Thu",       899000, "🥼"),
    P(10, "Quần jeans ống rộng",    "Unisex", "Quần jeans",  ["Streetwear", "Back to School"],                 "Quanh năm", 439000, "👖"),
    P(11, "Quần tây đen",           "Nam",    "Quần tây",    ["Minimalist", "First Date"],                     "Quanh năm", 399000, "👖"),
    P(12, "Quần short kaki",        "Nam",    "Quần short",  ["Summer Outfit", "Back to School"],              "Hè",        279000, "🩳"),
    P(13, "Quần jogger nỉ",         "Unisex", "Quần jogger", ["Streetwear", "Back to School"],                 "Đông",      329000, "👖"),
    P(14, "Váy hoa nhí",            "Nữ",     "Váy",         ["Summer Outfit", "First Date"],                  "Hè",        359000, "👗"),
    P(15, "Đầm midi trắng",         "Nữ",     "Đầm",         ["First Date", "Minimalist", "Summer Outfit"],    "Hè",        489000, "👗"),
    P(16, "Chân váy chữ A",         "Nữ",     "Chân váy",    ["Minimalist", "Back to School"],                 "Thu",       319000, "👗"),
    P(17, "Sneaker trắng",          "Unisex", "Giày sneaker",["Streetwear", "Minimalist", "Back to School", "Summer Outfit"], "Quanh năm", 699000, "👟"),
    P(18, "Giày da loafer",         "Nam",    "Giày da",     ["Minimalist", "First Date"],                     "Quanh năm", 799000, "👞"),
    P(19, "Sandal quai ngang",      "Nữ",     "Sandal",      ["Summer Outfit"],                                "Hè",        249000, "🩴"),
    P(20, "Túi tote canvas",        "Nữ",     "Túi xách",    ["Back to School", "Minimalist"],                 "Quanh năm", 229000, "👜"),
    P(21, "Mũ lưỡi trai",           "Unisex", "Mũ",          ["Streetwear", "Summer Outfit"],                  "Hè",        149000, "🧢"),
    P(22, "Kính mát gọng đen",      "Unisex", "Kính",        ["Summer Outfit", "Streetwear"],                  "Hè",        259000, "🕶️"),
    P(23, "Đồng hồ dây da",         "Nam",    "Đồng hồ",     ["Minimalist", "First Date"],                     "Quanh năm", 899000, "⌚"),
    P(24, "Khăn len xám",           "Unisex", "Khăn",        ["Minimalist"],                                   "Đông",      189000, "🧣")
  ],

  challenges: [
    { id: 1, title: "Streetwear",     theme: "Streetwear",     desc: "Cá tính, phóng khoáng, đậm chất đường phố.",      deadline: "2026-12-31", players: 203 },
    { id: 2, title: "Minimalist",     theme: "Minimalist",     desc: "Ít màu, gọn gàng, tinh tế trong từng chi tiết.",  deadline: "2026-12-20", players: 112 },
    { id: 3, title: "First Date",     theme: "First Date",     desc: "Lịch sự, dễ thương, để lại ấn tượng tốt.",        deadline: "2026-11-30", players: 167 },
    { id: 4, title: "Back to School", theme: "Back to School", desc: "Trẻ trung, thoải mái cho ngày đến giảng đường.",  deadline: "2026-12-10", players: 128 },
    { id: 5, title: "Summer Outfit",  theme: "Summer Outfit",  desc: "Mát mẻ, rực rỡ cho ngày hè.",                     deadline: "2027-01-15", players: 95 }
  ],

  leaderboard: [
    { challenge_id: 1, email: "a@demo", player: "Minh Anh",   outfit_name: "Phố đêm",         score: 92 },
    { challenge_id: 1, email: "b@demo", player: "Gia Bảo",    outfit_name: "Hoodie & Jeans",  score: 88 },
    { challenge_id: 2, email: "c@demo", player: "Khánh Linh", outfit_name: "Office minimal",  score: 94 },
    { challenge_id: 2, email: "d@demo", player: "Đức Huy",    outfit_name: "Trắng đen",       score: 86 },
    { challenge_id: 3, email: "e@demo", player: "Ngọc Trâm",  outfit_name: "Hẹn hò mùa thu",  score: 90 },
    { challenge_id: 4, email: "f@demo", player: "Quốc Việt",  outfit_name: "Sinh viên chill", score: 85 },
    { challenge_id: 5, email: "g@demo", player: "Mai Phương", outfit_name: "Nắng biển",       score: 91 }
  ],

  // Tài khoản mẫu (CHỈ cho bản giả). Bản thật do C++ quản lý và phải mã hoá mật khẩu.
  accounts: [
    { email: "admin@swap.local", password: "admin123", name: "Quản trị viên", role: "admin", phone: "", address: "" }
  ]
};
