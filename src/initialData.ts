import { Product, AppSettings } from "./types";

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "enji-1",
    name: "En-ji Sora Handbag (Sky Blue Edition)",
    description: "Tas tangan berdesain minimalis dengan aksen jahit yang anggun dan modern. Menggunakan kulit sintetis premium bertekstur lembut dengan kompartemen luas untuk kebutuhan sehari-hari wanita masa kini.",
    price: 210000,
    image: "/src/assets/images/regenerated_image_1779624410343.png",
    category: "Handbag"
  },
  {
    id: "enji-2",
    name: "En-ji Hana Shoulder Bag (Charcoal & White)",
    description: "Tas bahu klasik bernuansa putih gading dan abu-abu dengan rantai elegan. Sangat serbaguna untuk melengkapi outfit kasual maupun semi-formal untuk tampilan berkelas.",
    price: 240000,
    image: "/src/assets/images/regenerated_image_1779628856246.png",
    category: "Shoulder Bag"
  },
  {
    id: "enji-3",
    name: "En-ji Yuri Tote Bag (Elegant Cream)",
    description: "Tas jinjing berstruktur kokoh dengan material premium. Dilengkapi penutup ritsleting yang aman serta saku dalam, kapasitas maksimal untuk menampung tablet, makeup pouch, dan berkas kerja Anda.",
    price: 250000,
    image: "/src/assets/images/regenerated_image_1779628857610.png",
    category: "Tote Bag"
  },
  {
    id: "enji-4",
    name: "En-ji Mei Crossbody (Sweet Rose)",
    description: "Tas selempang praktis berbalut warna feminin yang manis. Tali ranting dapat disesuaikan panjangnya, memberikan kenyamanan maksimal bagi wanita aktif sepanjang hari.",
    price: 218000,
    image: "/src/assets/images/regenerated_image_1779628858954.png",
    category: "Crossbody"
  },
  {
    id: "enji-5",
    name: "En-ji Solwa Crossbody (Coral Blue)",
    description: "Kombinasi warna biru terumbu karang yang menawan dengan detail metal brass vintage. Pilihan tepat untuk mendampingi waktu bersantai atau traveling santai Anda.",
    price: 219000,
    image: "/src/assets/images/regenerated_image_1779624326433.png",
    category: "Crossbody"
  },
  {
    id: "enji-6",
    name: "En-ji Risa Handbag (Ivory Classic)",
    description: "Desain siluet elegan berbahan kulit sintetis Saffiano berkekuatan tinggi. Dilengkapi dengan gantungan logo khas En-ji dan tali panjang opsional.",
    price: 269999,
    image: "/src/assets/images/regenerated_image_1779624410343.png",
    category: "Handbag"
  },
  {
    id: "enji-7",
    name: "En-ji Kimyon Shoulder Bag (Nougat Velvet)",
    description: "Tas bahu dengan desain melengkung organik yang futuristik namun anggun. Sentuhan warna nougat lembut menambah kehangatan dan keindahan pada setiap gaya berpakaian pilihan Anda.",
    price: 299000,
    image: "/src/assets/images/regenerated_image_1779628856246.png",
    category: "Shoulder Bag"
  },
  {
    id: "enji-8",
    name: "En-ji Jesol Crossbody (Dusty Cream)",
    description: "Tas anyaman minimalis modern yang dinamis. Dilengkapi dengan dual kompartemen utama yang memudahkan pengorganisasian ponsel, kunci, dan dompet mungil Anda.",
    price: 289000,
    image: "/src/assets/images/regenerated_image_1779628857610.png",
    category: "Crossbody"
  },
  {
    id: "enji-9",
    name: "En-ji Junhyo Shoulder Bag (Midnight Olive)",
    description: "Warna zaitun gelap mistis beradu mewah dengan kunci putar berlapis emas. Tali lebar berbahan empuk memastikan kenyamanan maksimal di pundak Anda seharian penuh.",
    price: 319000,
    image: "/src/assets/images/regenerated_image_1779628858954.png",
    category: "Shoulder Bag"
  },
  {
    id: "enji-10",
    name: "En-ji Yubu Crossbody (Latte Brown)",
    description: "Bentuk setengah lingkaran yang menggemaskan dengan flap bertekstur kerikil (pebbled). Cocok dipadukan dengan gaun floral atau setelan blazer kasual andalan Anda.",
    price: 229000,
    image: "/src/assets/images/regenerated_image_1779624326433.png",
    category: "Crossbody"
  },
  {
    id: "enji-11",
    name: "En-ji Wonra Tote Bag (Gentle Sage)",
    description: "Tote bag berkapasitas besar bernuansa hijau sage yang menenangkan psikologis. Menggunakan closure magnetik kuat dan saku zip belakang agar barang berharga tetap terlindungi.",
    price: 359000,
    image: "/src/assets/images/regenerated_image_1779624410343.png",
    category: "Tote Bag"
  },
  {
    id: "enji-12",
    name: "En-ji Songbi Tote Bag (Charcoal Minimalist)",
    description: "Desain uniseks geometris kaku yang memberikan aura profesional tangguh. Sempurna untuk membawa laptop hingga ukuran 13 inci serta dokumen bisnis Anda.",
    price: 279000,
    image: "/src/assets/images/regenerated_image_1779628856246.png",
    category: "Tote Bag"
  },
  {
    id: "enji-13",
    name: "En-ji Yesul Shoulder Bag (Apricot Pastel)",
    description: "Aksen kerutan manis pada bagian atas tas memancarkan aura imut dan trendi ala Korea Selatan. Dilengkapi ritsleting logam ykk super lancar.",
    price: 259000,
    image: "/src/assets/images/regenerated_image_1779628857610.png",
    category: "Shoulder Bag"
  },
  {
    id: "enji-14",
    name: "En-ji Myungha Tote Bag (Ash Grey)",
    description: "Tote bag beralas lebar dengan saku botol air internal yang sangat praktis. Dibuat ekstra tahan air dari tumpahan ringan guna memastikan keamanan tanpa batas.",
    price: 339000,
    image: "/src/assets/images/regenerated_image_1779628858954.png",
    category: "Tote Bag"
  },
  {
    id: "enji-15",
    name: "En-ji Zizi Handbag (Almond Gold)",
    description: "Sentuhan mewah dari hardware bernuansa keemasan halus dipadu warna almond hangat. Dilengkapi pegangan kulit melengkung tebal yang nyaman digenggam.",
    price: 289000,
    image: "/src/assets/images/regenerated_image_1779624326433.png",
    category: "Handbag"
  },
  {
    id: "enji-16",
    name: "En-ji Rin Crossbody (Teal Spark)",
    description: " crossbody praktis dengan aksen rumbai trendi di bagian sampingnya. Ringan, imut, dan siap menemani malam mingguan terseru bersama sahabat.",
    price: 369000,
    image: "/src/assets/images/regenerated_image_1779624410343.png",
    category: "Crossbody"
  },
  {
    id: "enji-17",
    name: "En-ji Aemi Shoulder Bag (Soft Terracotta)",
    description: "Menampilkan palet warna bumi yang hangat and bersahabat. Ruang penyimpanan utama yang luas dilapisi kain beludru lembut pelindung gores.",
    price: 389000,
    image: "/src/assets/images/regenerated_image_1779628856246.png",
    category: "Shoulder Bag"
  },
  {
    id: "enji-18",
    name: "En-ji Kina Tote Bag (Midnight Navy)",
    description: "Biru laut pekat berpadu dengan jahitan kontras ganda yang kokoh dan artistik. Kombinasi sempurna untuk agenda kuliah, kantor, hingga berakhir pekan.",
    price: 249000,
    image: "/src/assets/images/regenerated_image_1779628857610.png",
    category: "Tote Bag"
  },
  {
    id: "enji-19",
    name: "En-ji Chae Shoulder Bag (Warm Chestnut)",
    description: "Retro dan timeless. Menampilkan nuansa klasik abad pertengahan dengan kepraktisan modern masa kini berkat tali yang dapat disesuaikan sesuka hati.",
    price: 279000,
    image: "/src/assets/images/regenerated_image_1779628858954.png",
    category: "Shoulder Bag"
  },
  {
    id: "enji-20",
    name: "En-ji Nara Handbag (Crimson Berry)",
    description: "Pernyataan berani melalui polesan merah berry menyala yang penuh rasa percaya diri. Sempurna untuk menghadiri acara formal malam hari atau pesta istimewa.",
    price: 299000,
    image: "/src/assets/images/regenerated_image_1779624326433.png",
    category: "Handbag"
  }
];

export const DEFAULT_SETTINGS: AppSettings = {
  whatsappNumber: "6285198975617", // Contoh nomor WhatsApp admin (Format internasional tanpa +)
  bankAccount: {
    bankName: "OCBC INDONESIA",
    accountNumber: "9408 1006 3823",
    accountHolder: "SALMI AIDI ANASTY"
  },
  adminPin: "031195" // Default PIN untuk masuk ke mode admin
};
