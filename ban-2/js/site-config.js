// =====================================================================
// site-config.js – NƠI SỬA NỘI DUNG GIAO DIỆN (không cần biết lập trình)
// Sửa chữ trong dấu "..." rồi bấm Ctrl+S, trang tự tải lại.
// Đây là cấu hình HIỂN THỊ, không phải dữ liệu sản phẩm (sản phẩm sửa ở trang Quản trị).
// =====================================================================

const SITE = {
  storeName: "SWAP",
  tagline: "Style With A Purpose – Mặc đẹp có mục đích",

  // LOGO: bỏ ảnh logo vào thư mục images/ rồi ghi đường dẫn, ví dụ "images/logo.png".
  // Để "" thì hiện ô "LOGO" trống (chừa chỗ cho chủ dự án).
  logoUrl: "images/logo.png",

  // BANNER KHUYẾN MÃI (kiểu Uniqlo) có đồng hồ đếm ngược. enabled:false để ẩn.
  // end = thời điểm kết thúc; qua thời điểm này đồng hồ tự ẩn.
  promo: {
    enabled: true,
    title: "SWAP DAY – 11.11",
    dates: "06.11.2026 – 12.11.2026",
    label: "Khuyến mãi có hạn sẽ kết thúc sau",
    end: "2026-11-12T23:59:59"
  },

  // BẬT / TẮT từng khu vực trên trang chủ (true = hiện, false = ẩn)
  show: {
    categories: true,     // mục phân loại quần áo
    seasonTopics: true,   // các topic theo mùa
    gameBanner: true      // khung giới thiệu game
  },

  // Danh mục theo giới tính trên thanh trên cùng (thêm/bớt tuỳ ý)
  genders: ["Nữ", "Nam", "Unisex"],

  // Các phong cách (dùng cho bộ lọc, thử thách game, và gán cho sản phẩm)
  styles: ["Streetwear", "Minimalist", "First Date", "Back to School", "Summer Outfit"],

  // Mục phân loại quần áo ở trang chủ: mỗi hàng 5 mục, tối đa 3 hàng, còn lại nằm sau nút "Hiện tất cả".
  categoriesPerRow: 5,
  categoriesMaxRows: 3,

  // slot = món này thuộc ô nào khi phối đồ trong game:
  //   top (áo) | bottom (quần/chân váy) | full (đầm/váy liền = tính cả áo và quần) | shoes (giày) | accessory (phụ kiện)
  // icon = biểu tượng demo (emoji). Chủ dự án sẽ thay bằng icon thật sau.
  categories: [
    { name: "Áo khoác",    icon: "🧥", slot: "top" },
    { name: "Áo sơ mi",    icon: "👔", slot: "top" },
    { name: "Áo nỉ",       icon: "🧥", slot: "top" },
    { name: "Áo thun",     icon: "👕", slot: "top" },
    { name: "Áo len",      icon: "🧶", slot: "top" },
    { name: "Áo vest",     icon: "🥼", slot: "top" },
    { name: "Quần jeans",  icon: "👖", slot: "bottom" },
    { name: "Quần tây",    icon: "👖", slot: "bottom" },
    { name: "Quần short",  icon: "🩳", slot: "bottom" },
    { name: "Quần jogger", icon: "👖", slot: "bottom" },
    { name: "Chân váy",    icon: "👗", slot: "bottom" },
    { name: "Váy",         icon: "👗", slot: "full" },
    { name: "Đầm",         icon: "👗", slot: "full" },
    { name: "Giày sneaker",icon: "👟", slot: "shoes" },
    { name: "Giày da",     icon: "👞", slot: "shoes" },
    { name: "Sandal",      icon: "🩴", slot: "shoes" },
    { name: "Túi xách",    icon: "👜", slot: "accessory" },
    { name: "Mũ",          icon: "🧢", slot: "accessory" },
    { name: "Kính",        icon: "🕶️", slot: "accessory" },
    { name: "Đồng hồ",     icon: "⌚", slot: "accessory" },
    { name: "Khăn",        icon: "🧣", slot: "accessory" }
  ],

  // Topic theo mùa ở trang chủ. "season" phải trùng với mùa gán cho sản phẩm.
  seasons: [
    { season: "Hè",  title: "Hè sôi động",     desc: "Nhẹ, thoáng, đầy màu sắc cho ngày nắng.", icon: "☀️" },
    { season: "Thu", title: "Thu thanh lịch",   desc: "Lớp áo mỏng, tông màu trầm.",             icon: "🍂" },
    { season: "Đông",title: "Đông ấm áp",       desc: "Ấm áp mà vẫn thời trang.",                icon: "❄️" }
  ],

  // Các ô trong game phối đồ
  slots: [
    { key: "top",       label: "Áo / Đầm" },
    { key: "bottom",    label: "Quần / Chân váy" },
    { key: "shoes",     label: "Giày" },
    { key: "accessory", label: "Phụ kiện" }
  ],

  // CHÂN TRANG: chừa chỗ cho chủ dự án tự thêm nội dung giới thiệu store.
  footer: {
    about: "(Chủ dự án tự nhập phần giới thiệu về SWAP tại đây – sửa trong js/site-config.js)",
    columns: [
      { title: "Về SWAP",   lines: ["since 2026", ""] },
      { title: "Hỗ trợ",    lines: ["(Chính sách đổi trả)", "(Hướng dẫn mua hàng)"] },
      { title: "Liên hệ",   lines: ["Địa chỉ: HCMUS - Nguyễn Văn Cừ Q.5", "SĐT: 0326893317", "Email: iamttien.248@gmail.com"] }
    ],
    copyright: "© SWAP – Đồ án môn học"
  }
};
