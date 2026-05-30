import React, { useState } from "react";
import { Product } from "../types";
import { ShoppingCart, Plus, Minus, Edit, Trash2, Heart, Send, Share2 } from "lucide-react";

interface ProductCardProps {
  key?: string;
  product: Product;
  isAdmin: boolean;
  isLiked: boolean;
  onToggleWishlist: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onInstantBuy: (product: Product, quantity: number) => void;
  onShare: (product: Product) => void;
  isHighlighted?: boolean;
}

export default function ProductCard({
  product,
  isAdmin,
  isLiked,
  onToggleWishlist,
  onEdit,
  onDelete,
  onAddToCart,
  onInstantBuy,
  onShare,
  isHighlighted = false,
}: ProductCardProps) {
  const [quantity, setQuantity] = useState<number>(1);

  const incrementQty = () => setQuantity((prev) => prev + 1);
  const decrementQty = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div
      id={`product-${product.id}`}
      className={`group relative flex flex-col overflow-hidden rounded-3xl border transition-all duration-300 ${
        isHighlighted
          ? "border-amber-400 dark:border-amber-400 ring-4 ring-amber-400/45 dark:ring-amber-500/45 shadow-2xl scale-[1.02] bg-amber-50/15 dark:bg-amber-950/10"
          : "border-sky-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:-translate-y-1 hover:shadow-xl hover:shadow-sky-100/40 dark:hover:shadow-sky-950/50"
      }`}
    >
      
      {/* Product Image Stage */}
      <div className="relative aspect-square w-full overflow-hidden bg-sky-50/50">
        
        {/* Admin Quick Overlays */}
        {isAdmin && (
          <div className="absolute top-3 left-3 z-10 flex gap-1.5">
            <button
              onClick={() => onEdit(product)}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500 text-white hover:bg-amber-600 shadow-md transition-transform active:scale-95 cursor-pointer"
              title="Edit Produk"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete(product.id)}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-500 text-white hover:bg-rose-600 shadow-md transition-transform active:scale-95 cursor-pointer"
              title="Hapus Produk"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Favorite Button */}
        <button
          onClick={() => onToggleWishlist(product)}
          className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs text-slate-500 hover:text-rose-500 transition-colors shadow-xs active:scale-90 cursor-pointer"
          title="Tambah ke Favorit"
        >
          <Heart
            className={`h-4.5 w-4.5 transition-all ${
              isLiked ? "fill-rose-500 text-rose-500 scale-110" : "text-slate-400 dark:text-slate-400"
            }`}
          />
        </button>

        {/* Share Button (Vertical Stack aligned nicely) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onShare(product);
          }}
          className="absolute top-[48px] right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs text-slate-500 hover:text-sky-600 dark:hover:text-sky-400 transition-colors shadow-xs active:scale-90 cursor-pointer"
          title="Bagikan Produk"
        >
          <Share2 className="h-4 w-4" />
        </button>

        {/* Dynamic Image with Fallback */}
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          referrerPolicy="no-referrer"
          onError={(e) => {
            // Fallback image in case the custom image fails loaded
            (e.target as HTMLImageElement).src =
              "https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6?w=600&auto=format&fit=crop&q=80";
          }}
        />

        {/* Category Label */}
        <span className="absolute bottom-3 left-3 rounded-full bg-white/90 backdrop-blur-xs px-3 py-1 text-[10px] font-bold tracking-wider uppercase text-sky-800 border border-sky-100/50">
          {product.category || "Casual Bag"}
        </span>
      </div>

      {/* Product Details Section */}
      <div className="flex flex-1 flex-col p-5">
        
        {/* Title */}
        <h3 className="font-serif text-lg font-semibold tracking-tight text-sky-950 group-hover:text-sky-700 transition-colors line-clamp-1">
          {product.name}
        </h3>

        {/* Description */}
        <p className="mt-2 text-xs font-light tracking-wide text-slate-500 leading-relaxed flex-1 line-clamp-2">
          {product.description}
        </p>

        {/* Pricing */}
        <div className="mt-4 flex items-baseline gap-1">
          <span className="text-xl font-bold tracking-tight text-sky-900">
            {formatPrice(product.price)}
          </span>
          <span className="text-[10px] text-slate-400 line-through">
            {formatPrice(product.price * 1.3)}
          </span>
        </div>

        {/* Interactive Quantity Selector */}
        <div className="mt-4 flex items-center justify-between rounded-2xl bg-sky-50/50 p-2 border border-sky-100/40">
          <span className="pl-2 text-xs font-medium text-sky-950">Jumlah</span>
          <div className="flex items-center gap-3">
            <button
              onClick={decrementQty}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-sky-700 border border-sky-100/60 hover:bg-sky-100/50 transition-colors active:scale-95 cursor-pointer disabled:opacity-50"
              disabled={quantity <= 1}
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="w-4 text-center text-sm font-bold text-sky-950">
              {quantity}
            </span>
            <button
              onClick={incrementQty}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-sky-700 border border-sky-100/60 hover:bg-sky-100/50 transition-colors active:scale-95 cursor-pointer"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          {/* Add to Cart */}
          <button
            onClick={() => {
              onAddToCart(product, quantity);
              // Reset selector back to 1
              setQuantity(1);
            }}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-sky-200 bg-white py-2.5 text-xs font-semibold text-sky-700 hover:bg-sky-50 transition-all cursor-pointer hover:border-sky-300"
          >
            <ShoppingCart className="h-4 w-4" />
            <span>+ Keranjang</span>
          </button>

          {/* Quick Buy Directly */}
          <button
            onClick={() => onInstantBuy(product, quantity)}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 py-2.5 text-xs font-semibold text-white transition-all shadow-xs hover:shadow-md cursor-pointer"
          >
            <Send className="h-4 w-4" />
            <span>Beli Langsung</span>
          </button>
        </div>

      </div>
    </div>
  );
}
