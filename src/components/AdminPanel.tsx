import React, { useState, useRef } from "react";
import { Product, AppSettings, BankAccount } from "../types";
import { 
  Plus, Edit2, Trash2, Save, X, Phone, CreditCard, Key, 
  Image as ImageIcon, Upload, Check, ChevronRight, RefreshCw, LogOut 
} from "lucide-react";

interface AdminPanelProps {
  products: Product[];
  settings: AppSettings;
  onSaveProducts: (products: Product[]) => void;
  onSaveSettings: (settings: AppSettings) => void;
  onCloseAdmin: () => void;
  isSystemAdmin: boolean;
  currentUser: any;
  onGoogleLogin: () => void;
  onGoogleLogout: () => void;
  isQuotaExceeded?: boolean;
}

export default function AdminPanel({
  products,
  settings,
  onSaveProducts,
  onSaveSettings,
  onCloseAdmin,
  isSystemAdmin,
  currentUser,
  onGoogleLogin,
  onGoogleLogout,
  isQuotaExceeded = false,
}: AdminPanelProps) {
  // Tabs: "produk" | "pengaturan"
  const [activeTab, setActiveTab] = useState<"produk" | "pengaturan">("produk");

  // Product CRUD states
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Handbag");
  const [image, setImage] = useState("");
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Settings states
  const [whatsappNumber, setWhatsappNumber] = useState(settings.whatsappNumber);
  const [bankName, setBankName] = useState(settings.bankAccount.bankName);
  const [accountNumber, setAccountNumber] = useState(settings.bankAccount.accountNumber);
  const [accountHolder, setAccountHolder] = useState(settings.bankAccount.accountHolder);
  const [adminPin, setAdminPin] = useState(settings.adminPin);

  const [notification, setNotification] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerNotification = (text: string, type: "success" | "error" = "success") => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Convert uploaded image to Base64 String
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        triggerNotification("Ukuran file terlalu besar! Maksimal 2MB untuk kinerja optimal.", "error");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setImage(reader.result);
          triggerNotification("Gambar berhasil diunggah!");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Reset product form
  const resetProductForm = () => {
    setEditingProduct(null);
    setName("");
    setDescription("");
    setPrice("");
    setCategory("Handbag");
    setImage("");
    setIsAddingNew(false);
  };

  // Handle Edit product trigger
  const handleStartEdit = (product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setDescription(product.description);
    setPrice(product.price.toString());
    setCategory(product.category);
    setImage(product.image);
    setIsAddingNew(true);
  };

  // Handle Save product (Add or Edit)
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim() || !price || !image) {
      triggerNotification("Mohon lengkapi seluruh formulir produk termasuk foto!", "error");
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      triggerNotification("Harga harus berupa angka positif!", "error");
      return;
    }

    let updatedProducts: Product[] = [];

    if (editingProduct) {
      // Edit mode
      updatedProducts = products.map((p) =>
        p.id === editingProduct.id
          ? { ...p, name, description, price: priceNum, category, image }
          : p
      );
      triggerNotification("Produk berhasil diperbarui!");
    } else {
      // Add mode
      const newProduct: Product = {
        id: "enji-" + Date.now(),
        name,
        description,
        price: priceNum,
        category,
        image,
      };
      updatedProducts = [newProduct, ...products];
      triggerNotification("Produk baru berhasil ditambahkan!");
    }

    onSaveProducts(updatedProducts);
    resetProductForm();
  };

  // Delete product
  const handleDeleteProduct = (id: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus produk ini dari katalog?")) {
      const updated = products.filter((p) => p.id !== id);
      onSaveProducts(updated);
      triggerNotification("Produk telah dihapus.");
    }
  };

  // Save Settings
  const handleSaveSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!whatsappNumber || !bankName || !accountNumber || !accountHolder || !adminPin) {
      triggerNotification("Mohon isi seluruh data pengaturan!", "error");
      return;
    }

    const updatedSettings: AppSettings = {
      ...settings,
      whatsappNumber: whatsappNumber.trim().replace("+", ""),
      bankAccount: {
        bankName,
        accountNumber,
        accountHolder,
      },
      adminPin: adminPin.trim(),
    };

    onSaveSettings(updatedSettings);
    triggerNotification("Pengaturan toko berhasil disimpan!");
  };

  return (
    <div className="rounded-3xl border border-sky-100 bg-white p-6 shadow-xl shadow-sky-100/30">
      
      {/* Header Admin Panel */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="font-serif text-2xl font-bold text-sky-950">Panel Editor Owner & Admin</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Kelola stok produk, upload foto tas terbaru, atur rekening transfer, dan kustomisasi nomor WhatsApp.
          </p>
        </div>
        <button
          onClick={onCloseAdmin}
          className="flex items-center gap-1.5 rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          <span>Keluar Mode Admin</span>
        </button>
      </div>

      {/* Cloud Integration Banner */}
      {isQuotaExceeded ? (
        <div className="mt-4 p-4 rounded-2xl border flex flex-col sm:flex-row items-col sm:items-center justify-between gap-3 bg-amber-50/70 border-amber-200 shadow-sm">
          <div className="flex gap-3 items-start">
            <div className="mt-1">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-800 font-bold text-sm">⚠️</span>
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-amber-900 tracking-wide uppercase">
                Mode Resiliensi Lokal Aktif (Kuota Cloud Terlampaui)
              </h4>
              <p className="text-[11px] text-amber-800/90 mt-1 max-w-xl leading-relaxed">
                Tenang saja sista! Batas gratis harian database Cloud Firestore saat ini sedang terlampaui, namun <strong>katalog toko sista tetap online & bisa diakses 100% lancar oleh pelanggan</strong>. Pelanggan tetap bisa melihat semua gambar, detail harga tas, dan mengorder langsung via WhatsApp sista. Perubahan yang sista buat saat ini disimpan dengan aman di local browser sista dan disinkronkan ke Cloud setelah limit direset pihak Google.
              </p>
            </div>
          </div>
          <div className="shrink-0 w-full sm:w-auto flex items-center lg:justify-end">
            <span className="text-[10px] bg-amber-100/60 text-amber-900 py-1.5 px-3 font-semibold rounded-lg border border-amber-200">
              Offline Resilient Active
            </span>
          </div>
        </div>
      ) : (
        <div className="mt-4 p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-gradient-to-r from-sky-50/50 to-white dark:from-sky-950/20 dark:to-slate-900 transition-all duration-300 shadow-sm border-dashed border-sky-200/50">
          <div className="flex gap-3 items-start">
            <div className="mt-0.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100/90 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 font-bold text-sm">✓</span>
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-slate-900 dark:text-white tracking-wide uppercase">
                Cloud Database & Sinkronisasi Aktif
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-xl leading-relaxed">
                Anda terautentikasi sebagai Admin! Setiap kali sista menambah, mengedit, atau menghapus produk dan mengklik simpan, katalog online pelanggan akan langsung diperbarui secara instan dan real-time di semua ponsel dan komputer mereka.
              </p>
            </div>
          </div>
          <div className="shrink-0 w-full sm:w-auto flex items-center gap-2">
            {isSystemAdmin ? (
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-emerald-55 dark:bg-emerald-950/55 text-emerald-700 dark:text-emerald-400 py-1.5 px-3 font-semibold rounded-lg border border-emerald-100 dark:border-emerald-900 truncate">
                  {currentUser?.email || "sukardimen95@gmail.com"}
                </span>
                <button
                  onClick={onGoogleLogout}
                  className="text-[11px] font-bold text-rose-600 hover:text-rose-700 transition-colors hover:underline cursor-pointer"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={onGoogleLogin}
                className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs py-2 px-4 shadow-sm transition-transform active:scale-95 cursor-pointer"
                title="Hubungkan akun Google utama"
              >
                <span>Login Google Admin</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Notifications */}
      {notification && (
        <div
          className={`mt-4 rounded-xl px-4 py-3 text-sm flex items-center gap-2 font-medium ${
            notification.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-150"
              : "bg-rose-50 text-rose-800 border border-rose-150"
          }`}
        >
          <Check className="h-4 w-4" />
          <span>{notification.text}</span>
        </div>
      )}

      {/* Admin Tab Controller */}
      <div className="mt-6 flex border-b border-slate-100">
        <button
          onClick={() => { setActiveTab("produk"); resetProductForm(); }}
          className={`px-5 py-3 text-sm font-semibold transition-all border-b-2 cursor-pointer ${
            activeTab === "produk"
              ? "border-sky-500 text-sky-600"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          Kelola Produk ({products.length})
        </button>
        <button
          onClick={() => setActiveTab("pengaturan")}
          className={`px-5 py-3 text-sm font-semibold transition-all border-b-2 cursor-pointer ${
            activeTab === "pengaturan"
              ? "border-sky-500 text-sky-600"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          Pengaturan WhatsApp & Rekening
        </button>
      </div>

      {/* Content Panels */}
      <div className="mt-6">
        
        {/* TAB 1: KELOLA PRODUK */}
        {activeTab === "produk" && (
          <div>
            {!isAddingNew ? (
              <div className="flex flex-col gap-5">
                {/* Trigger Add Form */}
                <div className="flex justify-between items-center bg-sky-50/50 p-4 rounded-2xl border border-sky-100/40">
                  <span className="text-sm text-sky-950 font-medium">Tambah koleksi tas terbaru wanita hari ini</span>
                  <button
                    onClick={() => { resetProductForm(); setIsAddingNew(true); }}
                    className="flex items-center gap-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white px-4 py-2.5 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Tambah Tas Baru</span>
                  </button>
                </div>

                {/* Products Inventory Grid */}
                {products.length === 0 ? (
                  <div className="text-center py-12 rounded-2xl border border-dashed border-slate-200">
                    <p className="text-slate-400 text-sm">Belum ada produk tas wanita dalam katalog. Tambah sekarang!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {products.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center gap-4 p-3 rounded-2xl border border-slate-100 hover:border-sky-100 transition-all bg-slate-50/30"
                      >
                        <img
                          src={p.image}
                          alt={p.name}
                          className="h-16 w-16 rounded-xl object-cover bg-sky-100"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-slate-900 truncate">{p.name}</h4>
                          <span className="inline-block rounded-full bg-sky-100 px-2.5 py-0.5 text-[10px] font-bold text-sky-800 uppercase mt-0.5">
                            {p.category}
                          </span>
                          <p className="text-xs font-bold text-sky-950 mt-1">
                            {new Intl.NumberFormat("id-ID", {
                              style: "currency",
                              currency: "IDR",
                              maximumFractionDigits: 0,
                            }).format(p.price)}
                          </p>
                        </div>
                        <div className="flex gap-1.1">
                          <button
                            onClick={() => handleStartEdit(p)}
                            className="p-2 rounded-lg bg-sky-50 text-sky-600 hover:bg-sky-100 transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
                            title="Hapus"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* Add/Edit Product Interactive Form */
              <form onSubmit={handleSaveProduct} className="space-y-5 bg-sky-50/20 p-5 rounded-3xl border border-sky-100/50">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-sky-950 font-serif">
                    {editingProduct ? "Edit Informasi Tas" : "Tambah Koleksi Tas Baru"}
                  </h3>
                  <button
                    type="button"
                    onClick={resetProductForm}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Left Column: Form Text Details */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Nama Tas / Seri Produk</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Contoh: En-ji Sora Handbag"
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-sky-500 focus:outline-hidden"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Kategori</label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-sky-500 focus:outline-hidden"
                        >
                          <option value="Handbag">Handbag</option>
                          <option value="Shoulder Bag">Shoulder Bag</option>
                          <option value="Tote Bag">Tote Bag</option>
                          <option value="Crossbody">Crossbody</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Harga Rupiah (IDR)</label>
                        <input
                          type="number"
                          required
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          placeholder="350000"
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-sky-500 focus:outline-hidden"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Deskripsi Tas Wanita</label>
                      <textarea
                        required
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Deskripsikan material kulit, pilihan tali, ritsleting, compartments, dsb."
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-sky-500 focus:outline-hidden resize-none"
                      />
                    </div>
                  </div>

                  {/* Right Column: Image Setter Upload and Preview */}
                  <div className="space-y-4 flex flex-col justify-between">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Foto Produk / Image</label>
                      
                      {/* Image Source Toggle (URL vs Local Files) */}
                      <div className="flex flex-col gap-3 rounded-2xl bg-white p-3.5 border border-slate-100">
                        {/* URL Method */}
                        <div>
                          <input
                            type="text"
                            value={image.startsWith("data:") ? "" : image}
                            onChange={(e) => setImage(e.target.value)}
                            placeholder="Tempel tautan URL gambar (https://...)"
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-sky-500 focus:outline-hidden"
                          />
                        </div>

                        {/* Mid separator */}
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                          <span className="h-px bg-slate-100 flex-1 mr-3" />
                          <span>ATAU UNGGUH BERKAS LOKAL</span>
                          <span className="h-px bg-slate-100 flex-1 ml-3" />
                        </div>

                        {/* Drag and Drop Input */}
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="border-2 border-dashed border-sky-200 hover:border-sky-400 hover:bg-sky-50/30 transition-all rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer gap-1"
                        >
                          <Upload className="h-5 w-5 text-sky-500" />
                          <span className="text-xs font-semibold text-sky-700">Pilih Berkas Foto Tas</span>
                          <span className="text-[10px] text-slate-400">PNG, JPG up to 2MB</span>
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                            accept="image/*"
                            className="hidden"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Image Live Preview */}
                    <div className="flex-1 flex items-center justify-center bg-white border border-slate-100 rounded-2xl p-3 min-h-[140px]">
                      {image ? (
                        <div className="relative group/prev h-28 w-28 rounded-xl overflow-hidden shadow-xs border border-sky-100">
                          <img
                            src={image}
                            alt="Pratinjau tas"
                            className="h-full w-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <button
                            type="button"
                            onClick={() => setImage("")}
                            className="absolute inset-0 bg-black/60 opacity-0 group-hover/prev:opacity-100 text-white flex items-center justify-center text-xs font-bold transition-all cursor-pointer"
                          >
                            Hapus Foto
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-slate-400 text-center">
                          <ImageIcon className="h-8 w-8 text-sky-200 mb-1" />
                          <span className="text-[11px]">Belum ada foto tas terpilih</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Submit row */}
                <div className="flex justify-end gap-2 border-t border-slate-150/55 pt-4">
                  <button
                    type="button"
                    onClick={resetProductForm}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white px-5 py-2.5 text-xs font-semibold shadow-xs cursor-pointer"
                  >
                    <Save className="h-4 w-4" />
                    <span>{editingProduct ? "Simpan Perubahan" : "Simpan Produk Baru"}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* TAB 2: PENGATURAN TOKO */}
        {activeTab === "pengaturan" && (
          <form onSubmit={handleSaveSettingsSubmit} className="space-y-6 max-w-2xl bg-sky-50/20 p-5 rounded-3xl border border-sky-100/50">
            <h3 className="text-base font-bold text-sky-950 font-serif mb-4 flex items-center gap-2">
              <RefreshCw className="h-4.5 w-4.5 text-sky-500" />
              <span>Kustomisasi Konfigurasi en-ji indonesia</span>
            </h3>

            {/* WA Target */}
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase">
                <Phone className="h-4 w-4 text-emerald-500" />
                <span>Nomor WhatsApp Admin (Aktif)</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="Contoh: 628123456789"
                  className="w-full rounded-xl border border-slate-200 bg-white pl-4 pr-12 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-sky-500 focus:outline-hidden font-mono"
                />
              </div>
              <p className="text-[10px] text-slate-400 leading-normal">
                Gunakan kode negara lengkap (misal <strong>628123456789</strong> untuk nomor Indonesia 08123456789) tanpa tanda + atau spasi.
              </p>
            </div>

            {/* Bank Accounts */}
            <div className="space-y-4 rounded-2xl bg-white p-4 border border-slate-100">
              <h4 className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase border-b border-slate-100 pb-2">
                <CreditCard className="h-4 w-4 text-sky-500" />
                <span>Informasi Rekening Bank Toko (Pembayaran Transfer)</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Nama Bank</label>
                  <input
                    type="text"
                    required
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="Contoh: BCA / Mandiri / BNI"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50/20 px-3 py-2 text-xs text-slate-800 focus:border-sky-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Nomor Rekening</label>
                  <input
                    type="text"
                    required
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="8291039485"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50/20 px-3 py-2 text-xs text-slate-800 focus:border-sky-500 focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Nama Pemilik Rekening</label>
                <input
                  type="text"
                  required
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                  placeholder="Contoh: PT EN-JI INDONESIA"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50/20 px-3 py-2 text-xs text-slate-800 focus:border-sky-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Change PIN Code */}
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase">
                <Key className="h-4 w-4 text-amber-500" />
                <span>PIN Pengaman Admin Website</span>
              </label>
              <input
                type="text"
                required
                value={adminPin}
                onChange={(e) => setAdminPin(e.target.value)}
                placeholder="PIN"
                className="w-32 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-800 font-bold tracking-widest focus:border-sky-500 focus:outline-hidden font-mono"
              />
              <p className="text-[10px] text-slate-400">
                Penting untuk menjaga agar kustomisasi katalog tidak diakses oleh pelanggan sembarangan.
              </p>
            </div>

            {/* Form actions */}
            <div className="flex justify-end gap-2 border-t border-slate-150/55 pt-4">
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white px-5 py-2.5 text-xs font-semibold shadow-xs cursor-pointer"
              >
                <Check className="h-4 w-4" />
                <span>Simpan Pengaturan</span>
              </button>
            </div>
          </form>
        )}

      </div>

    </div>
  );
}
