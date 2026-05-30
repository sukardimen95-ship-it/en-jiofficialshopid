import React from "react";
import { Product } from "../types";
import { X, Heart, ShoppingCart, Trash2, ArrowRight } from "lucide-react";
import { motion } from "motion/react";

interface WishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistItems: Product[];
  onRemoveFromWishlist: (productId: string) => void;
  onAddToCart: (product: Product, quantity: number) => void;
}

export default function WishlistModal({
  isOpen,
  onClose,
  wishlistItems,
  onRemoveFromWishlist,
  onAddToCart,
}: WishlistModalProps) {
  if (!isOpen) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-xs">
      
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Drawer Container */}
      <div className="relative h-full w-full max-w-md bg-white p-6 shadow-2xl flex flex-col justify-between border-l border-sky-100 animate-slide-in">
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-0">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-sky-50 pb-4">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-rose-500 fill-rose-500" />
              <h3 className="font-serif text-xl font-bold text-sky-950">Wishlist Sista 💖</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="h-5.5 w-5.5" />
            </button>
          </div>

          {/* List Section */}
          <div className="mt-6 flex-1 overflow-y-auto space-y-4 pr-1">
            {wishlistItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
                <Heart className="h-12 w-12 text-rose-100 mb-3 animate-pulse" />
                <p className="text-sm font-semibold text-slate-700">Wishlist Anda Masih Kosong</p>
                <p className="text-xs text-slate-500 max-w-[240px] mt-1">
                  Jelajahi koleksi tas wanita masa kini dan klik ikon hati untuk menyimpannya di sini sista!
                </p>
              </div>
            ) : (
              wishlistItems.map((product) => (
                <div
                  key={product.id}
                  className="flex gap-3.5 p-3 rounded-2xl border border-sky-50 shadow-xs bg-slate-50/20 hover:border-sky-200 transition-all group"
                >
                  <div className="relative h-16 w-16 rounded-xl overflow-hidden bg-sky-50 shrink-0">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="text-xs font-semibold text-sky-950 truncate group-hover:text-sky-700 transition-colors">
                          {product.name}
                        </h4>
                        <button
                          onClick={() => onRemoveFromWishlist(product.id)}
                          className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Hapus dari Wishlist"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <span className="inline-block rounded-full bg-sky-50 border border-sky-100/50 px-2 py-0.5 text-[9px] font-bold text-sky-800 uppercase mt-0.5">
                        {product.category}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 mt-2">
                      <span className="text-xs font-bold text-sky-900">{formatPrice(product.price)}</span>
                      
                      <button
                        onClick={() => {
                          onAddToCart(product, 1);
                          onRemoveFromWishlist(product.id);
                        }}
                        className="flex items-center gap-1 bg-sky-600 hover:bg-sky-755 text-white rounded-lg px-2.5 py-1 text-[10px] font-bold transition-all shadow-xs cursor-pointer"
                      >
                        <ShoppingCart className="h-3 w-3" />
                        <span>Kirim ke Keranjang</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Closing Row */}
        <div className="border-t border-sky-100 pt-4 mt-4 bg-white flex justify-end gap-2 text-slate-500">
          <button
            onClick={onClose}
            className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-sky-200 hover:bg-sky-50 hover:text-sky-700 py-3.5 text-xs font-bold transition-all cursor-pointer"
          >
            <span>Lanjut Berbelanja Tas</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
