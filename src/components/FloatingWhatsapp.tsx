import React, { useState, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface FloatingProps {
  phoneNumber: string;
}

export default function FloatingWhatsapp({ phoneNumber }: FloatingProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  // Auto show tooltip after 3 seconds, hide after 12 seconds
  useEffect(() => {
    const timerShow = setTimeout(() => setShowTooltip(true), 3000);
    const timerHide = setTimeout(() => setShowTooltip(false), 12000);
    return () => {
      clearTimeout(timerShow);
      clearTimeout(timerHide);
    };
  }, []);

  const handleWhatsappRedirect = () => {
    // Sanitize phone number (remove leading zero if necessary, ensure code)
    let sanitized = phoneNumber.replace(/[^0-9]/g, "");
    if (sanitized.startsWith("0")) {
      sanitized = "62" + sanitized.slice(1);
    }
    const message = encodeURIComponent("Halo Admin en-ji indonesia, saya sedang menjelajahi website Anda dan ingin bertanya tentang produk tas.");
    window.open(`https://wa.me/${sanitized}?text=${message}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 pointer-events-none">
      
      {/* Interactive Tooltip Card */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="pointer-events-auto relative max-w-xs sm:max-w-sm rounded-2xl bg-white p-4 shadow-xl border border-sky-100 flex flex-col gap-2"
          >
            <button
              onClick={() => setShowTooltip(false)}
              className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
            <span className="text-xs font-bold text-sky-600 tracking-wider uppercase">en-ji Admin Chat</span>
            <p className="text-xs text-slate-600 pr-4 leading-relaxed">
              Halo Sista! 💖 Ada tipe tas idamanmu yang ingin ditanyakan? Yuk chat langsung untuk konsultasi gratis dengan Admin kami!
            </p>
            <button
              onClick={handleWhatsappRedirect}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg py-1.5 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              <span>Tanya Admin Sekarang</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Floating Bubble */}
      <div className="pointer-events-auto relative">
        {/* Ring animations for pulse */}
        <div className="absolute inset-0 rounded-full bg-emerald-500 animate-pulse-ring pointer-events-none" />
        
        <button
          onClick={handleWhatsappRedirect}
          className="relative flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white hover:bg-emerald-600 transition-all hover:scale-105 shadow-lg shadow-emerald-200/50 cursor-pointer group"
          title="Chat WhatsApp Admin"
        >
          <MessageCircle className="h-8 w-8 transition-transform group-hover:rotate-12" />
          
          {/* Notification bubble badge */}
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs">
            1
          </span>
        </button>
      </div>

    </div>
  );
}
