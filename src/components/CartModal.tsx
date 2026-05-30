import React from "react";
import { Product, BankAccount } from "../types";
import { X, Plus, Minus, Trash2, Send, CreditCard, Copy, ShoppingCart, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface CartItem {
  product: Product;
  quantity: number;
}

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  bankAccount: BankAccount;
  whatsappNumber: string;
}

export default function CartModal({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  bankAccount,
  whatsappNumber,
}: CartModalProps) {
  const [copied, setCopied] = React.useState(false);

  const calculateTotal = () => {
    return cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(`${bankAccount.bankName} ${bankAccount.accountNumber} a.n ${bankAccount.accountHolder}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) return;

    // Sanitize WhatsApp number
    let sanitizedNum = whatsappNumber.replace(/[^0-9]/g, "");
    if (sanitizedNum.startsWith("0")) {
      sanitizedNum = "62" + sanitizedNum.slice(1);
    }

    // Format WhatsApp Message
    let text = `*PESANAN BARU - EN-JI INDONESIA* 👜\n`;
    text += `===================================\n\n`;
    
    cartItems.forEach((item, index) => {
      text += `${index + 1}. *${item.product.name}*\n`;
      text += `   » Jumlah: *${item.quantity} Pcs*\n`;
      text += `   » Harga Satuan: ${formatPrice(item.product.price)}\n`;
      text += `   » Subtotal: *${formatPrice(item.product.price * item.quantity)}*\n\n`;
    });

    text += `===================================\n`;
    text += `*TOTAL PEMBAYARAN:* *${formatPrice(calculateTotal())}*\n\n`;
    text += `*METODE TRANSFER BANK:* \n`;
    text += ` Bank: *${bankAccount.bankName}*\n`;
    text += ` No. Rekening: *${bankAccount.accountNumber}*\n`;
    text += ` Penerima: *${bankAccount.accountHolder}*\n\n`;
    text += `_Saya akan segera mengirimkan bukti transfer pembayaran ke nomor WhatsApp ini setelah melakukan transaksi._\n\n`;
    text += `Mohon segera diproses ya Admin, terima kasih! 💖`;

    const url = `https://wa.me/${sanitizedNum}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-xs">
      
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Cart Drawer */}
      <div className="relative h-full w-full max-w-md bg-white p-6 shadow-2xl flex flex-col justify-between border-l border-sky-100 animate-slide-in">
        
        {/* Header */}
        <div>
          <div className="flex items-center justify-between border-b border-sky-50 pb-4">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-sky-600" />
              <h3 className="font-serif text-xl font-bold text-sky-950">Keranjang Belanja</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-slate-400 hover:text-slate-650 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="h-5.5 w-5.5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="mt-6 max-h-[40vh] overflow-y-auto space-y-4 pr-1">
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
                <ShoppingCart className="h-10 w-10 text-sky-100 mb-2" />
                <p className="text-xs">Keranjang Anda masih kosong sista. Yuk pilih tas cantikmu!</p>
              </div>
            ) : (
              cartItems.map((item) => (
                <div
                  key={item.product.id}
                  className="flex items-start gap-3 p-2 rounded-2xl border border-sky-50 shadow-xs bg-slate-50/20"
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="h-14 w-14 rounded-xl object-cover bg-sky-50"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-sky-950 truncate">{item.product.name}</h4>
                    <p className="text-xs font-bold text-sky-700 mt-1">{formatPrice(item.product.price)}</p>

                    {/* Quantity selectors */}
                    <div className="mt-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-2 bg-white rounded-lg border border-sky-100 px-2 py-1">
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                          className="h-4 w-4 text-sky-700 flex items-center justify-center cursor-pointer hover:bg-sky-50 rounded-sm"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-2.5 w-2.5" />
                        </button>
                        <span className="text-xs font-bold text-sky-950 px-1 w-3 text-center">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                          className="h-4 w-4 text-sky-700 flex items-center justify-center cursor-pointer hover:bg-sky-50 rounded-sm"
                        >
                          <Plus className="h-2.5 w-2.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => onRemoveItem(item.product.id)}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1 cursor-pointer"
                        title="Hapus"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer Area with Price Calculation and Bank Info */}
        <div className="border-t border-sky-150 pt-4 bg-white space-y-4">
          
          {/* Bank Info Box */}
          <div className="rounded-2xl bg-sky-50/70 border border-sky-200/50 p-3.5">
            <div className="flex items-center justify-between border-b border-sky-200/40 pb-2 mb-2">
              <span className="flex items-center gap-1.5 text-xs font-bold text-sky-900">
                <CreditCard className="h-4 w-4 text-sky-600" />
                <span>INFORMASI TRANSFER BANK</span>
              </span>
              <button
                onClick={handleCopyAccount}
                className="flex items-center gap-1 text-[10px] font-bold text-sky-700 hover:text-sky-900 hover:underline cursor-pointer"
                title="Salin No Rekening"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-600" />
                    <span className="text-emerald-600">Disalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>Salin No. Rek</span>
                  </>
                )}
              </button>
            </div>
            
            <div className="text-xs text-slate-700 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500 text-[11px]">Bank Pembayaran:</span>
                <span className="font-bold text-sky-950">{bankAccount.bankName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 text-[11px]">No. Rekening:</span>
                <span className="font-mono font-bold text-sky-950 tracking-wider bg-white rounded-md px-1.5 py-0.5 border border-sky-100">{bankAccount.accountNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 text-[11px]">Atas Nama (A/N):</span>
                <span className="font-semibold text-sky-950">{bankAccount.accountHolder}</span>
              </div>
            </div>
          </div>

          {/* Subtotal Calculation */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500 font-medium">Subtotal Produk</span>
              <span className="font-semibold text-slate-700">{formatPrice(calculateTotal())}</span>
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 pt-2">
              <span className="text-base font-bold text-sky-950">Grand Total</span>
              <span className="text-xl font-extrabold text-sky-900">{formatPrice(calculateTotal())}</span>
            </div>
          </div>

          {/* Trigger WhatsApp Submit */}
          <button
            onClick={handleCheckout}
            disabled={cartItems.length === 0}
            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-250 cursor-pointer"
          >
            <Send className="h-4.5 w-4.5" />
            <span>Kirim Pesanan ke WhatsApp</span>
          </button>
        </div>

      </div>
    </div>
  );
}
