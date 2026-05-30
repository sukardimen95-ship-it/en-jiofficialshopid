import React, { useState, useEffect, useRef } from "react";
import { 
  ShoppingBag, Sparkles, Check, ChevronRight, Phone, 
  CreditCard, Shield, Star, Search, ShieldAlert, Heart, Calendar,
  MapPin, Mail, Clock, Sliders
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { Product, AppSettings, BankAccount, ImageFilters } from "./types";
import { INITIAL_PRODUCTS, DEFAULT_SETTINGS } from "./initialData";

// Firebase Imports
import { auth, db, handleFirestoreError, OperationType } from "./firebase";
import { onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut, User, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { collection, doc, onSnapshot, setDoc, getDoc, getDocs, writeBatch } from "firebase/firestore";

// Components
import Navbar from "./components/Navbar";
import ProductCard from "./components/ProductCard";
import AdminPanel from "./components/AdminPanel";
import CartModal from "./components/CartModal";
import PinDialog from "./components/PinDialog";
import FloatingWhatsapp from "./components/FloatingWhatsapp";
import WishlistModal from "./components/WishlistModal";
import EnjiLogo from "./components/EnjiLogo";
import ImageEditorModal from "./components/ImageEditorModal";

export default function App() {
  // Store Core State
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem("enji_products");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Product[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Sync check: if any of the items has a price/name/desc mismatch with latest initial data, reject cache
          const hasMismatch = parsed.some((p) => {
            const correct = INITIAL_PRODUCTS.find((ip) => ip.id === p.id);
            return !correct || correct.price !== p.price;
          });
          if (!hasMismatch) {
            return parsed;
          } else {
            console.log("Cached products are outdated compared to latest initialData. Overwriting cache...");
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_PRODUCTS;
  });
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem("enji_settings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        let updated = false;
        if (parsed.whatsappNumber === "628123456789") {
          parsed.whatsappNumber = "6285198975617";
          updated = true;
        }
        if (
          !parsed.bankAccount ||
          parsed.bankAccount.bankName !== "OCBC INDONESIA" ||
          parsed.bankAccount.accountNumber !== "9408 1006 3823" ||
          parsed.bankAccount.accountHolder !== "SALMI AIDI ANASTY"
        ) {
          parsed.bankAccount = {
            bankName: "OCBC INDONESIA",
            accountNumber: "9408 1006 3823",
            accountHolder: "SALMI AIDI ANASTY"
          };
          updated = true;
        }
        if (updated) {
          localStorage.setItem("enji_settings", JSON.stringify(parsed));
        }
        return parsed;
      } catch {
        // Fallback
      }
    }
    return DEFAULT_SETTINGS;
  });

  // Theme state representation
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem("enji_theme") === "dark";
  });

  // Interface State
  const [isAdmin, setIsAdmin] = useState(false);
  const [pinDialogOpen, setPinDialogOpen] = useState(false);

  // Hero Image Edit state & filters
  const [heroImage, setHeroImage] = useState(() => {
    return localStorage.getItem("enji_hero_image") || "/src/assets/images/regenerated_image_1779773414384.webp";
  });

  const [heroFilters, setHeroFilters] = useState<ImageFilters>(() => {
    const saved = localStorage.getItem("enji_hero_filters");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fallback default
      }
    }
    return {
      brightness: 100,
      contrast: 100,
      grayscale: 0,
      saturate: 100,
      sepia: 0,
      blur: 0,
      hueRotate: 0,
      scale: 1,
      rotate: 0,
    };
  });

  const [imageEditorOpen, setImageEditorOpen] = useState(false);

  // Toggle Tailwind's dark class on the HTML tree
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("enji_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("enji_theme", "light");
    }
  }, [isDark]);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedProductId, setHighlightedProductId] = useState<string | null>(null);
  const [footerClicks, setFooterClicks] = useState(0);

  // Wishlist State
  const [wishlist, setWishlist] = useState<string[]>([]);

  // Time-out reference for footer clicks
  const clickTimeoutRef = useRef<number | null>(null);

  // Cart State
  const [cartCount, setCartCount] = useState(0);
  const [cartItems, setCartItems] = useState<{ product: Product; quantity: number }[]>([]);

  // Notification Banner
  const [toast, setToast] = useState<string | null>(null);

  // Refs for smooth navigation
  const catalogRef = useRef<HTMLDivElement>(null);
  const bankRef = useRef<HTMLDivElement>(null);

  // Cloud & Auth States
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isSystemAdmin, setIsSystemAdmin] = useState(false);
  const [isQuotaExceeded, setIsQuotaExceeded] = useState(false);

  // Load and sync real-time database state
  useEffect(() => {
    // 1. Listen to real-time products
    const unsubProducts = onSnapshot(collection(db, "products"), (snapshot) => {
      try {
        if (snapshot.empty) {
          // Fallback to local INITIAL_PRODUCTS initially before any entries are written by the admin
          setProducts(INITIAL_PRODUCTS);
        } else {
          const list: Product[] = [];
          snapshot.forEach((docSnap) => {
            list.push(docSnap.data() as Product);
          });
          // Sort items cleanly based on numeric or alphanumeric enji codes
          list.sort((a, b) => {
            const numA = parseInt(a.id.replace("enji-", ""));
            const numB = parseInt(b.id.replace("enji-", ""));
            if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
            return a.id.localeCompare(b.id);
          });
          setProducts(list);
        }
      } catch (err) {
        console.error("Error parsing product lists from Firestore:", err);
      }
    }, (err) => {
      console.warn("Products onSnapshot connection limit or offline: fallback to initial products.", err);
      const isQuotaMsg = err && typeof err.message === "string" && (
        err.message.toLowerCase().includes("quota") || 
        err.message.toLowerCase().includes("limit") || 
        err.message.toLowerCase().includes("exceeded")
      );
      if (isQuotaMsg) {
        setIsQuotaExceeded(true);
      }
      setProducts(INITIAL_PRODUCTS);
    });

    // 2. Listen to real-time settings
    const unsubSettings = onSnapshot(doc(db, "settings", "global"), (docSnap) => {
      try {
        if (docSnap.exists()) {
          const data = docSnap.data() as AppSettings;
          setSettings(data);
          if (data.heroImage) {
            setHeroImage(data.heroImage);
          }
          if (data.heroFilters) {
            setHeroFilters(data.heroFilters);
          }
        } else {
          setSettings(DEFAULT_SETTINGS);
        }
      } catch (err) {
        console.error("Error reading global settings document from Firestore:", err);
      }
    }, (err) => {
      console.warn("Global settings onSnapshot permission or offline: fallback to initial details.", err);
      const isQuotaMsg = err && typeof err.message === "string" && (
        err.message.toLowerCase().includes("quota") || 
        err.message.toLowerCase().includes("limit") || 
        err.message.toLowerCase().includes("exceeded")
      );
      if (isQuotaMsg) {
        setIsQuotaExceeded(true);
      }
      setSettings(DEFAULT_SETTINGS);
    });

    // 3. Auth Listener
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user && user.email === "sukardimen95@gmail.com") {
        setIsSystemAdmin(true);
        setIsAdmin(true); // Automatically open admin options if authorized matching admin email
      } else {
        setIsSystemAdmin(false);
      }
    });

    // Load wishlist local fallback
    const savedWishlist = localStorage.getItem("enji_wishlist");
    if (savedWishlist) {
      try {
        setWishlist(JSON.parse(savedWishlist));
      } catch (err) {
        console.error(err);
      }
    }

    // Check URL parameters for secret admin pin dialogue
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("admin") === "true") {
      setPinDialogOpen(true);
      showToast("🔑 Membuka autentikasi PIN admin...");
      const newUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, document.title, newUrl);
    }

    return () => {
      unsubProducts();
      unsubSettings();
      unsubAuth();
    };
  }, []);

  // Auto-seed and synchronize database elements to ensure correctness of prices, images, and details in Cloud Firestore
  useEffect(() => {
    // ONLY run seed and sync operations for the logged-in administrator to save Firebase read/write daily free tier quota
    if (!isSystemAdmin) return;

    const checkAndSeed = async () => {
      try {
        const snapshot = await getDocs(collection(db, "products"));
        if (snapshot.empty) {
          console.log("Firestore products collection is empty, seeding catalog models...");
          const localSaved = localStorage.getItem("enji_products");
          let sourceProducts = INITIAL_PRODUCTS;
          if (localSaved) {
            try {
              const parsed = JSON.parse(localSaved);
              if (Array.isArray(parsed) && parsed.length > 0) {
                sourceProducts = parsed;
              }
            } catch (e) {
              console.error(e);
            }
          }
          const batch = writeBatch(db);
          sourceProducts.forEach((p) => {
            const ref = doc(db, "products", p.id);
            batch.set(ref, p);
          });
          await batch.commit();
          console.log("Successfully seeded 20+ bags catalog into Cloud Firestore!");
          showToast("✨ Katalog perdana berhasil disemai ke Cloud Database!");
        } else {
          // Sync database products automatically with client's local initial data
          const existingProductsMap = new Map<string, Product>();
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as Product;
            existingProductsMap.set(data.id, data);
          });

          const batch = writeBatch(db);
          let hasDiscrepancy = false;

          INITIAL_PRODUCTS.forEach((correctProd) => {
            const currentProdInDb = existingProductsMap.get(correctProd.id);
            if (!currentProdInDb) {
              // Add product if it's completely missing from DB
              const ref = doc(db, "products", correctProd.id);
              batch.set(ref, correctProd);
              hasDiscrepancy = true;
              console.log(`Automatic sync: Adding missing product ${correctProd.id} to Firestore`);
            } else if (
              currentProdInDb.price !== correctProd.price ||
              currentProdInDb.name !== correctProd.name ||
              currentProdInDb.description !== correctProd.description ||
              currentProdInDb.image !== correctProd.image ||
              currentProdInDb.category !== correctProd.category
            ) {
              // Update details if any property differs
              const ref = doc(db, "products", correctProd.id);
              batch.set(ref, correctProd);
              hasDiscrepancy = true;
              console.log(`Automatic sync: Updating details of ${correctProd.id} in Firestore`);
            }
          });

          if (hasDiscrepancy) {
            await batch.commit();
            console.log("Automatically synchronized updated product parameters in Cloud Firestore!");
          }
        }

        const settingsSnap = await getDoc(doc(db, "settings", "global"));
        if (!settingsSnap.exists()) {
          const localSettings = localStorage.getItem("enji_settings");
          let sourceSettings = DEFAULT_SETTINGS;
          if (localSettings) {
            try {
              const parsed = JSON.parse(localSettings);
              if (parsed.whatsappNumber === "628123456789") {
                parsed.whatsappNumber = "6285198975617";
              }
              sourceSettings = parsed;
            } catch (e) {
              console.error(e);
            }
          }
          await setDoc(doc(db, "settings", "global"), sourceSettings);
          console.log("Seeded settings into Cloud Firestore!");
        } else {
          const currentData = settingsSnap.data() as AppSettings;
          let needsUpdate = false;
          const updatedDoc = { ...currentData };

          if (currentData && currentData.whatsappNumber === "628123456789") {
            updatedDoc.whatsappNumber = "6285198975617";
            needsUpdate = true;
          }

          if (
            !currentData.bankAccount ||
            currentData.bankAccount.bankName === "BCA" ||
            currentData.bankAccount.accountNumber === "8291039485" ||
            currentData.bankAccount.accountHolder === "PT EN-JI INDONESIA" ||
            currentData.bankAccount.bankName !== "OCBC INDONESIA" ||
            currentData.bankAccount.accountNumber !== "9408 1006 3823" ||
            currentData.bankAccount.accountHolder !== "SALMI AIDI ANASTY"
          ) {
            updatedDoc.bankAccount = {
              bankName: "OCBC INDONESIA",
              accountNumber: "9408 1006 3823",
              accountHolder: "SALMI AIDI ANASTY"
            };
            needsUpdate = true;
          }

          if (needsUpdate) {
            await setDoc(doc(db, "settings", "global"), updatedDoc, { merge: true });
            console.log("Automatically updated database settings to OCBC INDONESIA and 9408 1006 3823");
          }
        }
      } catch (error: any) {
        const errMsg = error && typeof error.message === "string" ? error.message : String(error);
        if (errMsg.toLowerCase().includes("quota") || errMsg.toLowerCase().includes("limit") || errMsg.toLowerCase().includes("exceeded")) {
          setIsQuotaExceeded(true);
          console.warn("Firestore status: Quota limit exceeded. System operates seamlessly in fully resilient local-first mode!");
        } else {
          console.error("Non-quota failure seeding default database files:", error);
        }
      }
    };
    checkAndSeed();
  }, [isSystemAdmin]);

  // Update Cart total count automatically when cart items mutate
  useEffect(() => {
    const total = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    setCartCount(total);
  }, [cartItems]);

  // Handle sharing deep link auto-scroll & highlight
  useEffect(() => {
    if (products.length === 0) return;

    const urlParams = new URLSearchParams(window.location.search);
    const targetProductId = urlParams.get("product") || urlParams.get("id");

    if (targetProductId) {
      const match = products.find((p) => p.id === targetProductId);
      if (match) {
        // Clear filters to ensure product is shown
        setSelectedCategory("All");
        setSearchQuery("");
        setHighlightedProductId(targetProductId);

        // Allow some time for rendering to finish
        setTimeout(() => {
          const element = document.getElementById(`product-${targetProductId}`);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
            showToast(`✨ Menampilkan rekomendasi sista: ${match.name}`);
          }
        }, 650);

        // Auto remove highlight after 6 seconds of breathing duration
        const timer = setTimeout(() => {
          setHighlightedProductId(null);
        }, 6000);

        // Clean up URL parameters beautifully for a clean aesthetic
        const newParams = new URLSearchParams(window.location.search);
        newParams.delete("product");
        newParams.delete("id");
        const queryStr = newParams.toString();
        const cleanUrl = window.location.pathname + (queryStr ? `?${queryStr}` : "") + window.location.hash;
        window.history.replaceState({}, document.title, cleanUrl);

        return () => clearTimeout(timer);
      }
    }
  }, [products]);

  const handleShareProduct = async (product: Product) => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?product=${product.id}`;
    
    // Check if Web Share API is supported (e.g., standard smartphone browsers)
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Tas Enji Indonesia - ${product.name}`,
          text: `Cek koleksi tas cantik premium ${product.name} ini dengan harga terbaik!`,
          url: shareUrl,
        });
        showToast("✓ Berhasil membagikan produk!");
        return;
      } catch (err) {
        // If they cancelled, do nothing. For other errors, fallback to copy.
        if ((err as Error).name === "AbortError") {
          return;
        }
      }
    }

    // Fallback: Copy to Clipboard
    try {
      await navigator.clipboard.writeText(shareUrl);
      showToast(`✓ Link ${product.name} disalin ke clipboard!`);
    } catch (err) {
      console.error("Could not copy link:", err);
      showToast("Gagal menyalin link.");
    }
  };

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  // Scroll Actions
  const scrollToCatalog = () => {
    catalogRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToBank = () => {
    bankRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Auth Helper Triggers
  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      if (user.email === "sukardimen95@gmail.com") {
        setIsSystemAdmin(true);
        setIsAdmin(true);
        showToast("🔑 Akses Google Cloud Admin Terverifikasi!");
      } else {
        setIsSystemAdmin(false);
        showToast(`Masuk sebagai: ${user.email} (Bukan admin utama)`);
      }
    } catch (e) {
      console.error(e);
      showToast("❌ Gagal masuk dengan Akun Google.");
    }
  };

  const handleGoogleLogout = async () => {
    try {
      await signOut(auth);
      setIsSystemAdmin(false);
      setIsAdmin(false);
      showToast("Anda telah keluar dari sesi Google Admin.");
    } catch (e) {
      console.error(e);
    }
  };

  // Admin Actions
  const handleAdminToggleTrigger = () => {
    if (isAdmin) {
      setIsAdmin(false);
      showToast("Kembali ke tampilan pelanggan.");
    } else {
      setPinDialogOpen(true);
    }
  };

  const handleAdminAuthSuccess = async () => {
    setPinDialogOpen(false);
    setIsAdmin(true);
    showToast("Akses admin PIN terverifikasi!");

    // Automatically try to authenticate silently via Email/Password to unleash full Cloud sync!
    try {
      const email = "sukardimen95@gmail.com";
      const key = "enji-admin-secure-pass-2026";
      
      try {
        await signInWithEmailAndPassword(auth, email, key);
        console.log("Logged in successfully to Firebase Cloud with sukardimen95@gmail.com!");
        showToast("✓ Sinkronisasi Cloud Otomatis Aktif!");
      } catch (logErr: any) {
        // If user doesn't exist or credential mismatch, clear/recreate or sign in
        try {
          await createUserWithEmailAndPassword(auth, email, key);
          console.log("Registered and logged in successfully to Firebase Cloud!");
          showToast("✨ Cloud database perdana berhasil diaktifkan!");
        } catch (regErr) {
          // Fallback if user occupied but invalid-credential was thrown
          try {
            await signInWithEmailAndPassword(auth, email, key);
          } catch (secondErr) {
            console.warn("Auth sync retry skipped.", secondErr);
          }
        }
      }
    } catch (e) {
      console.warn("Silent cloud session authentication skipped:", e);
    }
  };

  const handleFooterLogoClick = () => {
    if (clickTimeoutRef.current) {
      window.clearTimeout(clickTimeoutRef.current);
    }

    setFooterClicks((prev) => {
      const next = prev + 1;
      if (next >= 5) {
        setPinDialogOpen(true);
        showToast("🔓 Kode rahasia terpicu! Silakan masukkan PIN Admin.");
        return 0; // reset
      }
      return next;
    });

    clickTimeoutRef.current = window.setTimeout(() => {
      setFooterClicks(0);
    }, 3000); // reset if user is inactive for 3 seconds
  };

  const handleSaveProducts = async (updatedProducts: Product[]) => {
    setProducts(updatedProducts);
    // write to local backup
    localStorage.setItem("enji_products", JSON.stringify(updatedProducts));

    try {
      const currentIds = updatedProducts.map((p) => p.id);
      const snapshot = await getDocs(collection(db, "products"));
      const batch = writeBatch(db);

      // Clean up orphaned documents not in newer list
      snapshot.forEach((docSnap) => {
        if (!currentIds.includes(docSnap.id)) {
          batch.delete(docSnap.ref);
        }
      });

      // Write items
      updatedProducts.forEach((product) => {
        const ref = doc(db, "products", product.id);
        batch.set(ref, product);
      });

      await batch.commit();
      showToast("☁️ Katalog Berhasil Disinkronkan ke Cloud Pelanggan!");
    } catch (err) {
      console.error(err);
      showToast("❌ Gagal menyinkronkan data katalog.");
      handleFirestoreError(err, OperationType.WRITE, "products");
    }
  };

  const handleSaveSettings = async (updatedSettings: AppSettings) => {
    setSettings(updatedSettings);
    localStorage.setItem("enji_settings", JSON.stringify(updatedSettings));

    try {
      await setDoc(doc(db, "settings", "global"), updatedSettings);
      showToast("☁️ Kontak & Rekening berhasil disinkronkan ke Cloud Pelanggan!");
    } catch (err) {
      console.error(err);
      showToast("❌ Gagal menyinkronkan kontak ke real-time database.");
      handleFirestoreError(err, OperationType.WRITE, "settings/global");
    }
  };

  // Wishlist Actions
  const handleToggleWishlist = (product: Product) => {
    setWishlist((prev) => {
      const exists = prev.includes(product.id);
      let updated: string[];
      if (exists) {
        updated = prev.filter((id) => id !== product.id);
        showToast(`💔 ${product.name} dihapus dari wishlist.`);
      } else {
        updated = [...prev, product.id];
        showToast(`💖 ${product.name} disimpan ke wishlist sista!`);
      }
      localStorage.setItem("enji_wishlist", JSON.stringify(updated));
      return updated;
    });
  };

  const handleRemoveFromWishlist = (productId: string) => {
    setWishlist((prev) => {
      const updated = prev.filter((id) => id !== productId);
      localStorage.setItem("enji_wishlist", JSON.stringify(updated));
      return updated;
    });
    const prod = products.find((p) => p.id === productId);
    if (prod) {
      showToast(`💔 ${prod.name} dikeluarkan dari wishlist.`);
    }
  };

  // Cart Actions
  const handleAddToCart = (product: Product, quantity: number) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
    showToast(`🛒 ${quantity} Pcs ${product.name} telah dimasukkan ke keranjang.`);
  };

  const handleUpdateCartQuantity = (productId: string, newQty: number) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity: Math.max(1, newQty) } : item
      )
    );
  };

  const handleRemoveCartItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
    showToast("Produk dikeluarkan dari keranjang belanja sista.");
  };

  // Instant Single-Product Buy (direct to WhatsApp)
  const handleInstantBuy = (product: Product, quantity: number) => {
    let sanitizedNum = settings.whatsappNumber.replace(/[^0-9]/g, "");
    if (sanitizedNum.startsWith("0")) {
      sanitizedNum = "62" + sanitizedNum.slice(1);
    }

    const priceFormatted = new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(product.price);

    const totalFormatted = new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(product.price * quantity);

    let text = `*PESANAN INSTAN - EN-JI INDONESIA* 👜\n`;
    text += `===================================\n\n`;
    text += `Saya tertarik membeli produk ini:\n`;
    text += `• *${product.name}*\n`;
    text += `• Jumlah: *${quantity} Pcs*\n`;
    text += `• Harga: ${priceFormatted}\n`;
    text += `• Subtotal: *${totalFormatted}*\n\n`;
    text += `===================================\n`;
    text += `*INFORMASI TRANSFER PEMBAYARAN:*\n`;
    text += `Bank: *${settings.bankAccount.bankName}*\n`;
    text += `No. Rekening: *${settings.bankAccount.accountNumber}*\n`;
    text += `Atas Nama: *${settings.bankAccount.accountHolder}*\n\n`;
    text += `_Saya akan segera mengirimkan bukti transfer pembayaran segera ke nomor WhatsApp ini setelah melakukan transaksi._\n\n`;
    text += `Mohon segera dikonfirmasi ya Admin, terima kasih sista! 💖`;

    const url = `https://wa.me/${sanitizedNum}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // Filter Logic
  const filteredProducts = products.filter((p) => {
    const categoryMatches = selectedCategory === "All" || p.category === selectedCategory;
    const nameMatches = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return categoryMatches && nameMatches;
  });

  const wishlistProducts = products.filter((p) => wishlist.includes(p.id));

  const categories = ["All", "Handbag", "Shoulder Bag", "Tote Bag", "Crossbody"];

  return (
    <div className="relative min-h-screen bg-[#fafbfc] transition-colors overflow-x-hidden pb-12">
      
      {/* Mini Promotion Ribbon Banner */}
      <div className="bg-sky-600 text-white font-sans text-[11px] sm:text-xs text-center py-2 px-4 shadow-inner flex items-center justify-center gap-2 font-semibold">
        <Sparkles className="h-4 w-4 text-sky-200 animate-spin" />
        <span>Koleksi Terkini Tas Wanita Masa Kini Modern dari <strong className="font-serif italic text-white">en-ji indonesia</strong> - Gratis Ongkir Se-Nusantara! Promo Akhir Pekan!</span>
      </div>

      {/* Main Premium Navbar */}
      <Navbar
        isAdmin={isAdmin}
        onAdminToggle={handleAdminToggleTrigger}
        onScrollToCatalog={scrollToCatalog}
        onScrollToBank={scrollToBank}
        onWishlistOpen={() => setWishlistOpen(true)}
        wishlistCount={wishlist.length}
        isDark={isDark}
        onDarkToggle={() => setIsDark(!isDark)}
      />

      {/* Hero Visual Area (Exquisite layout with warm tone soft blue circles) */}
      <section className="relative overflow-hidden bg-gradient-to-tr from-white via-sky-50/60 to-white pt-10 pb-16 sm:pb-24">
        {/* Soft Background Shapes */}
        <div className="absolute top-1/4 -right-16 h-72 w-72 rounded-full bg-sky-200/30 blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -top-12 h-64 w-64 rounded-full bg-sky-100/40 blur-3xl pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Hero Message */}
          <div className="lg:col-span-7 flex flex-col gap-6 text-left">
            <span className="inline-flex max-w-fit items-center gap-1.5 rounded-full bg-sky-100/60 border border-sky-200/50 px-3.5 py-1 text-xs font-semibold text-sky-900 shadow-inner">
              <Star className="h-3.5 w-3.5 text-sky-500 fill-sky-300" />
              <span>Fashion Terkini & Premium Terjangkau</span>
            </span>

            <h2 className="font-serif text-4xl sm:text-5xl lg:text-6.5xl font-bold tracking-tight text-sky-950 leading-[1.12]">
              Sempurnakan <br className="hidden sm:inline" /> 
              <span className="relative inline-block text-sky-700 font-medium italic mr-2 font-serif">Aesthetica</span> 
              Penampilanmu.
            </h2>

            <p className="text-sm sm:text-base font-light tracking-wide text-slate-500 leading-relaxed max-w-xl">
              Temukan keanggunan sejati dalam setiap detail jahitan koleksi tas khusus wanita buatan <strong className="text-sky-900 font-semibold font-serif">en-ji indonesia</strong>. Didesain secara harmonis untuk melengkapi mobilitas tinggi kaum hawa masa kini dengan balutan material berkelas.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <button
                onClick={scrollToCatalog}
                className="rounded-full bg-sky-650 hover:bg-sky-700 text-white font-semibold text-sm px-7 py-3.5 transition-all shadow-md shadow-sky-200 hover:-translate-y-0.5 cursor-pointer"
              >
                Lihat Koleksi Tas
              </button>
              <button
                onClick={scrollToBank}
                className="rounded-full bg-white border border-sky-200 text-sky-700 hover:bg-sky-50 hover:border-sky-300 font-semibold text-sm px-6 py-3.5 transition-all cursor-pointer"
              >
                Informasi Rekening
              </button>
            </div>

            {/* Micro details counter */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-sky-100 max-w-md">
              <div>
                <span className="block text-2xl font-serif font-bold text-sky-950">100%</span>
                <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Kulit Premium</span>
              </div>
              <div>
                <span className="block text-2xl font-serif font-bold text-sky-950">4.9 ★</span>
                <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Rating Sista</span>
              </div>
              <div>
                <span className="block text-2xl font-serif font-bold text-sky-950">Fast</span>
                <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Respon WA</span>
              </div>
            </div>
          </div>

          {/* Right Hero Image Collage */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            
            {/* Visual Backplate */}
            <div className="relative w-full max-w-sm aspect-square bg-[#ebf5fb] rounded-full flex items-center justify-center overflow-visible border border-white p-6 shadow-2xl">
              <div className="absolute inset-0 rounded-full border-4 border-dashed border-sky-300/40 animate-spin-slow pointer-events-none" style={{ animationDuration: '32s' }} />
              
              {/* Overlapping luxury bag photo stack */}
              <div className="relative z-10 w-full h-full transform hover:scale-102 transition-transform duration-500 rounded-full">
                <div className="relative w-full h-full rounded-full overflow-hidden">
                  <img
                    src={heroImage}
                    alt="Feature Handbag"
                    className="w-full h-full object-cover rounded-full shadow-lg border-2 border-white dark:border-slate-800"
                    style={{
                      filter: `
                        brightness(${heroFilters.brightness}%)
                        contrast(${heroFilters.contrast}%)
                        grayscale(${heroFilters.grayscale}%)
                        saturate(${heroFilters.saturate}%)
                        sepia(${heroFilters.sepia}%)
                        blur(${heroFilters.blur}px)
                        hue-rotate(${heroFilters.hueRotate}deg)
                      `,
                      transform: `scale(${heroFilters.scale}) rotate(${heroFilters.rotate}deg)`,
                      transition: "filter 0.15s ease-out, transform 0.15s ease-out",
                    }}
                    referrerPolicy="no-referrer"
                  />
                  {/* Edit overlay on hover */}
                  <button
                    onClick={() => setImageEditorOpen(true)}
                    className="absolute inset-0 bg-slate-950/45 hover:bg-slate-950/55 transition-colors duration-300 flex flex-col items-center justify-center opacity-0 hover:opacity-100 text-white gap-1 group/btn cursor-pointer z-10"
                    title="Edit Tampilan Paperbox"
                  >
                    <Sliders className="h-5 w-5 text-amber-300 transform group-hover/btn:scale-110 transition-transform duration-300" />
                    <span className="text-[9px] font-extrabold tracking-wide uppercase text-amber-200">Edit Banner</span>
                  </button>
                </div>

                {/* Persistent small floating edit badge */}
                <button
                  onClick={() => setImageEditorOpen(true)}
                  className="absolute bottom-2 right-2 bg-sky-600 hover:bg-sky-700 active:scale-90 text-white p-2 rounded-full shadow-lg border-2 border-white dark:border-slate-800 z-20 cursor-pointer transition-all animate-bounce"
                  style={{ animationDuration: '3s' }}
                  title="Ubah & Edit Gambar Banner"
                >
                  <Sliders className="h-3.5 w-3.5 text-white" />
                </button>

                {/* Floating tags */}
                <div className="absolute bottom-6 -left-6 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl p-3 shadow-lg border border-sky-100 dark:border-slate-800 max-w-[130px] flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-sky-500 animate-ping" />
                  <span className="text-[10px] font-bold text-sky-950 dark:text-white">Terjual 340+ Pcs</span>
                </div>

                <div className="absolute top-8 -right-8 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl p-3 shadow-lg border border-sky-100 dark:border-slate-800 max-w-[120px] text-center">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Mulai Dari</span>
                  <span className="block text-xs font-extrabold text-sky-800 dark:text-sky-400">Rp 299 K</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Store Administrator Module Toggle View */}
      <AnimatePresence>
        {isAdmin && (
          <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-12">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full"
            >
              <AdminPanel
                products={products}
                settings={settings}
                onSaveProducts={handleSaveProducts}
                onSaveSettings={handleSaveSettings}
                onCloseAdmin={() => setIsAdmin(false)}
                isSystemAdmin={isSystemAdmin}
                currentUser={currentUser}
                onGoogleLogin={handleGoogleLogin}
                onGoogleLogout={handleGoogleLogout}
                isQuotaExceeded={isQuotaExceeded}
              />
            </motion.div>
          </section>
        )}
      </AnimatePresence>

      {/* Main Catalog Section */}
      <section ref={catalogRef} id="katalog" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-16 scroll-mt-24">
        
        {/* Catalog Banner title */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold text-sky-600 tracking-widest uppercase">Katalog en-ji indonesia</span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-sky-950">Koleksi Tas Khusus Wanita Terbaik</h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto font-light leading-relaxed">
            Dapatkan tas impian sista sekarang! Silakan pilih tas, sesuaikan jumlah yang diinginkan, dan selesaikan transaksi dengan transfer bank yang langsung terhubung ke WhatsApp Admin.
          </p>
        </div>

        {/* Filter and Search Bar Contoller */}
        <div className="mt-10 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-sky-100 pb-5">
          
          {/* Categories Option pills */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 w-full md:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-4 py-2 text-xs font-bold tracking-wide transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-sky-600 text-white shadow-sm"
                    : "bg-white border border-sky-100 text-slate-600 hover:bg-sky-50"
                }`}
              >
                {cat === "All" ? "Semua Koleksi" : cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-2.5 h-4.5 w-4.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari tipe tas idaman..."
              className="w-full rounded-full border border-sky-100 bg-white pl-10 pr-4 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-sky-400 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Products Core Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-sky-100/80 mt-8">
            <p className="text-slate-500 font-medium text-sm">Tidak ditemukan tas yang cocok dengan kriteria sista.</p>
            <button
              onClick={() => { setSelectedCategory("All"); setSearchQuery(""); }}
              className="text-xs font-bold text-sky-600 underline mt-2 hover:text-sky-800 cursor-pointer"
            >
              Reset Filter Pencarian
            </button>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {filteredProducts.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                isAdmin={isAdmin}
                isLiked={wishlist.includes(prod.id)}
                onToggleWishlist={handleToggleWishlist}
                onEdit={(p) => {
                  // If Admin is edit, we scroll up to the admin form
                  setIsAdmin(true);
                  // We let the editor form receive input
                  showToast("Lakukan pengeditan data tas pada panel di atas.");
                }}
                onDelete={(id) => {
                  const updated = products.filter((p) => p.id !== id);
                  handleSaveProducts(updated);
                  handleRemoveFromWishlist(id);
                  showToast("Tas telah dihapus dari katalog.");
                }}
                onAddToCart={handleAddToCart}
                onInstantBuy={handleInstantBuy}
                onShare={handleShareProduct}
                isHighlighted={highlightedProductId === prod.id}
              />
            ))}
          </div>
        )}

      </section>

      {/* Bank Account info Display section */}
      <section ref={bankRef} id="rekening" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-24 scroll-mt-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-gradient-to-tr from-sky-50/50 to-white border border-sky-100/60 rounded-3xl p-6 sm:p-10 relative overflow-hidden">
          
          {/* Subtle backgrounds */}
          <div className="absolute right-0 bottom-0 h-40 w-40 rounded-full bg-sky-200/20 blur-3xl pointer-events-none" />

          {/* Text Left info */}
          <div className="lg:col-span-7 space-y-4">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-700 uppercase tracking-widest bg-sky-150/50 px-3 py-1 rounded-full">
              <CreditCard className="h-3.5 w-3.5" />
              <span>Instruksi Transaksi Pembayaran</span>
            </span>

            <h3 className="font-serif text-2xl sm:text-3.5xl font-bold text-sky-950">Transfer Langsung Ke Rekening Toko</h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-light">
              Setelah sista menambahkan tas ke keranjang belanja, pesanan akan secara otomatis terformat rapi untuk dikirimkan melalui chat WhatsApp ke Admin kami beserta rincian Transfer Bank. <strong>Sista tidak perlu mengetik detail pesanan lagi secara manual!</strong> Nyaman, cepat, dan aman.
            </p>

            {/* Steps checklist */}
            <div className="space-y-3 pt-2">
              {[
                { step: "1", text: "Pilih tas impian Anda dan tentukan jumlah yang ingin dibeli pada katalog." },
                { step: "2", text: "Klik ikon Keranjang, buka rincian pesanan Anda dan klik tombol WhatsApp." },
                { step: "3", text: "Kirim pesan pesanan terformat ke Admin, lakukan transfer bank sesuai rekening, dan lampirkan bukti pembayaran sista." }
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-3">
                  <div className="flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-full bg-sky-100 text-[11px] font-bold text-sky-700">
                    {item.step}
                  </div>
                  <p className="text-xs font-semibold text-sky-950 leading-tight">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Credit Card mockup details */}
          <div className="lg:col-span-5 flex justify-center">
            
            <div className="relative w-full max-w-sm rounded-[24px] bg-gradient-to-br from-sky-800 to-sky-950 p-6 text-white shadow-2xl overflow-hidden">
              {/* Card visual elements */}
              <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-white/5 blur-xl pointer-events-none" />
              <div className="absolute -left-8 -bottom-8 h-24 w-24 rounded-full bg-sky-500/10 blur-xl pointer-events-none" />

              <div className="flex justify-between items-start">
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-sky-300">Official Bank Account</span>
                  <h4 className="font-serif text-lg font-bold tracking-wider uppercase">en-ji indonesia</h4>
                </div>
                <span className="text-xs font-mono font-extrabold text-white bg-white/20 px-2.5 py-1 rounded-lg">
                  {settings.bankAccount.bankName}
                </span>
              </div>

              {/* Number */}
              <div className="mt-8">
                <span className="text-[10px] text-sky-300 font-bold block mb-1">NOMOR REKENING</span>
                <span className="font-mono text-xl sm:text-2xl font-bold tracking-widest block bg-white/10 p-2 text-center rounded-xl border border-white/10">
                  {settings.bankAccount.accountNumber}
                </span>
              </div>

              {/* Holder */}
              <div className="mt-6 flex justify-between items-end">
                <div>
                  <span className="text-[9px] text-sky-300 font-bold block mb-0.5">ATAS NAMA PENERIMA</span>
                  <span className="text-sm font-semibold tracking-wide block uppercase">{settings.bankAccount.accountHolder}</span>
                </div>
                
                {/* Visual SIM chips */}
                <div className="h-7 w-9 rounded-md bg-amber-400/80 border border-amber-300 flex items-center justify-center">
                  <span className="text-[8px] font-bold text-[#301c0c]">CHIP</span>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* Floating Shopping Cart Activator Button (if cart has items, floating in bottom left so it doesn't overlap with WA bubble on right) */}
      <AnimatePresence>
        {cartCount > 0 && (
          <motion.div
            initial={{ scale: 0.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.1, opacity: 0 }}
            className="fixed bottom-6 left-6 z-40"
          >
            <button
              onClick={() => setCartOpen(true)}
              className="flex h-14 px-5 items-center gap-2.5 rounded-full bg-sky-650 hover:bg-sky-700 text-white shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              <div className="relative">
                <ShoppingBag className="h-5.5 w-5.5" />
                <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold">
                  {cartCount}
                </span>
              </div>
              <span className="text-xs font-bold tracking-wide">Lihat Keranjang</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Area */}
      <footer id="tentang-kami" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-28 pt-12 pb-8 border-t border-sky-100 select-none">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 pb-12">
          
          {/* Column 1: Mengenai en-ji indonesia (col-span-5) */}
          <div className="md:col-span-5 space-y-4 text-center md:text-left">
            <div 
              onClick={handleFooterLogoClick} 
              className="cursor-pointer inline-flex items-center gap-1.5" 
              title="Brand of en-ji indonesia"
            >
              <EnjiLogo height={32} />
              <span className="font-sans text-[10px] font-bold tracking-widest text-sky-500/80 uppercase mt-2">
                indonesia
              </span>
            </div>
            
            <h4 className="text-sm font-semibold tracking-wide text-sky-950 uppercase mt-2">
              Mengenai Kami
            </h4>
            
            <p className="text-xs text-slate-500 font-light leading-relaxed max-w-md">
              <strong>en-ji indonesia</strong> hadir sebagai jawaban atas kebutuhan tas wanita modern yang memadukan desain berkelas, kepraktisan harian, serta harga yang kompetitif. Setiap produk didesain secara teliti untuk mengesankan keanggunan sejati baik untuk gaya formal maupun kasual kaum hawa urban masa kini.
            </p>
            
            <div className="flex justify-center md:justify-start gap-4 text-[10px] uppercase tracking-widest font-bold text-sky-600/80">
              <span>✦ Modern</span>
              <span>✦ Praktis</span>
              <span>✦ Anggun</span>
            </div>
          </div>

          {/* Column 2: Info Kontak (col-span-3) */}
          <div className="md:col-span-3 space-y-4 text-center md:text-left">
            <h4 className="text-sm font-bold tracking-wide text-sky-950 uppercase pb-2 border-b border-sky-50">
              Hubungi Kami
            </h4>
            <div className="space-y-3.5 text-xs text-slate-600 font-light flex flex-col items-center md:items-start">
              
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-50 text-sky-600 shrink-0">
                  <Phone className="h-3.5 w-3.5" />
                </div>
                <div className="text-left">
                  <span className="block text-[9px] font-bold uppercase text-slate-400">WhatsApp Admin</span>
                  <a href="https://wa.me/6285198975617" target="_blank" rel="noreferrer" className="font-semibold text-slate-850 hover:text-sky-600 transition-colors">
                    +62 851-9897-5617
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-50 text-sky-600 shrink-0">
                  <Mail className="h-3.5 w-3.5" />
                </div>
                <div className="text-left">
                  <span className="block text-[9px] font-bold uppercase text-slate-400">Email Layanan</span>
                  <a href="mailto:cs@enji.co.id" className="font-semibold text-slate-850 hover:text-sky-600 transition-colors">
                    cs@enji.co.id
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-50 text-sky-600 shrink-0">
                  <Clock className="h-3.5 w-3.5" />
                </div>
                <div className="text-left">
                  <span className="block text-[9px] font-bold uppercase text-slate-400">Jam Operasional</span>
                  <span className="font-semibold text-slate-850 block">Senin - Jumat | 09:00 - 22:00</span>
                </div>
              </div>

            </div>
          </div>

          {/* Column 3: Alamat Kantor Pusat (col-span-4) */}
          <div className="md:col-span-4 space-y-4 text-center md:text-left">
            <h4 className="text-sm font-bold tracking-wide text-sky-950 uppercase pb-2 border-b border-sky-50">
              Kantor Pusat
            </h4>
            <div className="space-y-3.5 text-xs text-slate-600 font-light flex flex-col items-center md:items-start">
              
              <div className="flex items-start gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-50 text-sky-600 shrink-0 mt-0.5">
                  <MapPin className="h-3.5 w-3.5" />
                </div>
                <div className="text-left">
                  <span className="block text-[9px] font-bold uppercase text-slate-400 mb-0.5">PT Palomino Prima Artha</span>
                  <p className="text-slate-800 leading-relaxed font-normal">
                    Jl. Engku Putri No.5, Belian, Kec. Batam Kota, Kota Batam, Kepulauan Riau 29461
                  </p>
                </div>
              </div>

              <div className="pt-1 text-[10px] text-slate-400 italic text-left">
                * Kantor Pusat & Pusat Distribusi Resmi Brand
              </div>

            </div>
          </div>

        </div>

        {/* Bottom Copyright bar */}
        <div className="pt-8 border-t border-sky-100/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p 
            onClick={handleFooterLogoClick}
            className="text-xs text-slate-450 cursor-pointer text-center sm:text-left"
          >
            © {new Date().getFullYear()} <strong>en-ji indonesia</strong>. Hak Cipta Dilindungi Undang-Undang. Brand of PT Palomino Prima Artha.
          </p>
          <span className="text-[10px] text-sky-650 font-semibold tracking-wider text-center sm:text-right">
            Gratis Ongkir Seluruh Nusantara & Garansi Produk Original ✦
          </span>
        </div>
      </footer>

      {/* Popups & Panels */}

      {/* 1. Pin Autentikasi Dialog */}
      <PinDialog
        isOpen={pinDialogOpen}
        onClose={() => setPinDialogOpen(false)}
        correctPin={settings.adminPin}
        onSuccess={handleAdminAuthSuccess}
      />

      {/* 2. Interactive Cart Modal Drawer */}
      <CartModal
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        bankAccount={settings.bankAccount}
        whatsappNumber={settings.whatsappNumber}
      />

      {/* 2.5. Interactive Wishlist Drawer Overlay */}
      <WishlistModal
        isOpen={wishlistOpen}
        onClose={() => setWishlistOpen(false)}
        wishlistItems={wishlistProducts}
        onRemoveFromWishlist={handleRemoveFromWishlist}
        onAddToCart={handleAddToCart}
      />

      {/* 2.7. Interactive Hero Banner / Paperbox Image Filters Editor Workstation */}
      <AnimatePresence>
        {imageEditorOpen && (
          <ImageEditorModal
            isOpen={imageEditorOpen}
            onClose={() => setImageEditorOpen(false)}
            currentImage={heroImage}
            currentFilters={heroFilters}
            onSave={async (imageUrl, filters) => {
              setHeroImage(imageUrl);
              setHeroFilters(filters);
              localStorage.setItem("enji_hero_image", imageUrl);
              localStorage.setItem("enji_hero_filters", JSON.stringify(filters));
              
              const updatedSettings: AppSettings = {
                ...settings,
                heroImage: imageUrl,
                heroFilters: filters
              };
              setSettings(updatedSettings);
              localStorage.setItem("enji_settings", JSON.stringify(updatedSettings));
              
              try {
                await setDoc(doc(db, "settings", "global"), updatedSettings);
                showToast("✨ Tampilan Banner Enji berhasil diperbarui dan disinkronkan ke Cloud!");
              } catch (err) {
                console.error("Gagal menyinkronkan banner ke Firestore:", err);
                showToast("✨ Tampilan Banner Enji berhasil diperbarui!");
              }
              
              setImageEditorOpen(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* 3. Floating WhatsApp Bubble Indicator (Right Bottom) */}
      <FloatingWhatsapp phoneNumber={settings.whatsappNumber} />

      {/* Global Action Toasts */}
      <AnimatePresence>
        {toast && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-sky-950 text-white rounded-full px-5 py-2.5 text-xs font-semibold shadow-lg shadow-sky-900/10 flex items-center gap-2"
            >
              <Check className="h-4 w-4 text-sky-300" />
              <span>{toast}</span>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
