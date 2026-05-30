import React from "react";
import { Shield, Sparkles, Heart, Sun, Moon } from "lucide-react";
import EnjiLogo from "./EnjiLogo";

interface NavbarProps {
  isAdmin: boolean;
  onAdminToggle: () => void;
  onScrollToCatalog: () => void;
  onScrollToBank: () => void;
  onWishlistOpen: () => void;
  wishlistCount: number;
  isDark: boolean;
  onDarkToggle: () => void;
}

export default function Navbar({
  isAdmin,
  onAdminToggle,
  onScrollToCatalog,
  onScrollToBank,
  onWishlistOpen,
  wishlistCount,
  isDark,
  onDarkToggle,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-sky-100 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl h-18 items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Name */}
        <div className="flex items-center gap-2">
          <EnjiLogo height={34} />
          <span className="font-sans text-[10px] font-bold tracking-widest text-sky-500/80 uppercase self-end mb-1 ml-0.5 hidden xs:inline">
            indonesia
          </span>
        </div>

        {/* Center navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <button
            onClick={onScrollToCatalog}
            className="text-sm font-medium text-slate-600 hover:text-sky-600 transition-colors cursor-pointer"
          >
            Katalog Produk
          </button>
          <button
            onClick={onScrollToBank}
            className="text-sm font-medium text-slate-600 hover:text-sky-600 transition-colors cursor-pointer"
          >
            Rekening Pembayaran
          </button>
          <a
            href="#tentang-kami"
            className="text-sm font-medium text-slate-600 hover:text-sky-600 transition-colors"
          >
            Tentang Kami
          </a>
        </nav>

        {/* Right CTA */}
        <div className="flex items-center gap-3">
          {/* Dark Mode Toggle Button */}
          <button
            onClick={onDarkToggle}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-sky-100 bg-white text-slate-500 hover:text-amber-500 hover:bg-amber-50 transition-all shadow-xs active:scale-95 cursor-pointer"
            title={isDark ? "Ubah ke Mode Terang" : "Ubah ke Mode Malam"}
          >
            {isDark ? (
              <Sun className="h-4.5 w-4.5 text-amber-500 animate-spin" style={{ animationDuration: '20s' }} />
            ) : (
              <Moon className="h-4.5 w-4.5 text-slate-600" />
            )}
          </button>

          <button
            onClick={onWishlistOpen}
            className="relative flex h-9 w-9 items-center justify-center rounded-full border border-sky-100 bg-white text-slate-500 hover:text-rose-500 hover:bg-rose-50 transition-all shadow-xs active:scale-95 cursor-pointer"
            title="Buka Wishlist Sista"
          >
            <Heart className="h-4.5 w-4.5" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[9px] font-bold text-white">
                {wishlistCount}
              </span>
            )}
          </button>

          {isAdmin && (
            <button
              onClick={onAdminToggle}
              className="flex items-center gap-2 rounded-full px-4 py-2 text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
            >
              <Shield className="h-4 w-4 animate-pulse" />
              <span>Keluar Mode Admin</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
