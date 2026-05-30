import React, { useState } from "react";
import { Key, ShieldCheck, X, AlertCircle } from "lucide-react";

interface PinDialogProps {
  isOpen: boolean;
  onClose: () => void;
  correctPin: string;
  onSuccess: () => void;
}

export default function PinDialog({
  isOpen,
  onClose,
  correctPin,
  onSuccess,
}: PinDialogProps) {
  const [pinInput, setPinInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === correctPin) {
      onSuccess();
      setPinInput("");
      setErrorMsg("");
    } else {
      setErrorMsg("PIN yang dimasukkan salah! Silakan coba lagi.");
      setPinInput("");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-sky-100 flex flex-col gap-4 animate-scale-up">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-650 transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col items-center gap-2 text-center mt-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-50 text-sky-650 shadow-inner">
            <Key className="h-6 w-6" />
          </div>
          <h3 className="font-serif text-lg font-bold text-sky-950">Autentikasi Owner & Admin</h3>
          <p className="text-xs text-slate-500 max-w-[240px]">
            Silakan masukkan PIN pengaman Anda untuk mengakses mode pengeditan katalog en-ji indonesia.
          </p>
          <span className="text-[10px] font-semibold text-sky-500 bg-sky-50 px-2 py-0.5 rounded-full mt-1">
            Petunjuk: Gunakan PIN default &ldquo;031195&rdquo;
          </span>
        </div>

        {/* Form Input */}
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <input
              type="password"
              maxLength={8}
              value={pinInput}
              autoFocus
              onChange={(e) => {
                setPinInput(e.target.value);
                if (errorMsg) setErrorMsg("");
              }}
              placeholder="Masukkan PIN Admin"
              className="w-full text-center rounded-xl border border-slate-200 bg-slate-50/20 py-3.5 text-base font-bold text-sky-950 tracking-widest focus:border-sky-500 focus:outline-hidden font-mono"
            />
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="flex items-center gap-1.5 justify-center text-xs font-semibold text-rose-600">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Action Button */}
          <button
            type="submit"
            className="w-full py-3 bg-sky-650 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-colors shadow-md shadow-sky-100 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Aktifkan Akses Admin</span>
          </button>
        </form>

      </div>
    </div>
  );
}
