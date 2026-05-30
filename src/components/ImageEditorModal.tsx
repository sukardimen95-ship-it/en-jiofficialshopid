import React, { useState, useRef } from "react";
import { motion } from "motion/react";
import { 
  X, SlidersHorizontal, Image, Link, Upload, RefreshCcw, 
  RotateCw, Plus, Minus, Check, Sparkles, Sliders
} from "lucide-react";
import { ImageFilters } from "../types";

interface ImageEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentImage: string;
  currentFilters: ImageFilters;
  onSave: (imageUrl: string, filters: ImageFilters) => void;
}

const PRESET_IMAGES = [
  {
    id: "enji-blue-box",
    name: "Enji Blue Paperbox (Utama)",
    url: "/src/assets/images/regenerated_image_1779773414384.webp",
  },
  {
    id: "enji-red-bag",
    name: "Koleksi Tas Crimson",
    url: "/src/assets/images/regenerated_image_1779624410343.png",
  },
  {
    id: "enji-grey-shoulder",
    name: "Slingbag Grey Elegant",
    url: "/src/assets/images/regenerated_image_1779628856246.png",
  },
  {
    id: "enji-taupe-classic",
    name: "Classic Taupe Edition",
    url: "/src/assets/images/regenerated_image_1779628857610.png",
  },
  {
    id: "enji-black-gold",
    name: "Executive Black Gold",
    url: "/src/assets/images/regenerated_image_1779628858954.png",
  },
  {
    id: "enji-pastel-pink",
    name: "Pastel Sweetie Edition",
    url: "/src/assets/images/regenerated_image_1779624326433.png",
  }
];

const DEFAULT_FILTERS: ImageFilters = {
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

export default function ImageEditorModal({
  isOpen,
  onClose,
  currentImage,
  currentFilters,
  onSave,
}: ImageEditorModalProps) {
  const [selectedImage, setSelectedImage] = useState<string>(currentImage);
  const [filters, setFilters] = useState<ImageFilters>({ ...currentFilters });
  const [inputUrl, setInputUrl] = useState<string>("");
  const [dragActive, setDragActive] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle setting slider values
  const handleSliderChange = (key: keyof ImageFilters, value: number) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Convert image filter states to standard CSS inline style
  const getFilterStyle = () => {
    return {
      filter: `
        brightness(${filters.brightness}%)
        contrast(${filters.contrast}%)
        grayscale(${filters.grayscale}%)
        saturate(${filters.saturate}%)
        sepia(${filters.sepia}%)
        blur(${filters.blur}px)
        hue-rotate(${filters.hueRotate}deg)
      `,
      transform: `scale(${filters.scale}) rotate(${filters.rotate}deg)`,
      transition: "filter 0.15s ease-out, transform 0.15s ease-out",
    };
  };

  // Preset Selectors
  const handleSelectPreset = (url: string) => {
    setSelectedImage(url);
    setInputUrl("");
  };

  // Direct custom URL submit
  const handleApplyUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputUrl.trim()) {
      setSelectedImage(inputUrl.trim());
    }
  };

  // Native Image File processing & base64 encoding for local persistence
  const handleFile = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result && typeof e.target.result === "string") {
          setSelectedImage(e.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const resetFilters = () => {
    setFilters({ ...DEFAULT_FILTERS });
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = () => {
    onSave(selectedImage, filters);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark Blur Overlay Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
      />

      {/* Main Container Window */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative z-10 w-full max-w-5xl bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-sky-100/10 dark:border-slate-800 flex flex-col max-h-[90vh] sm:max-h-[85vh]"
      >
        {/* Header Ribbon bar */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-sky-100/50 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400">
              <Sliders className="h-4.5 w-4.5" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Studio Edit Gambar Banner</h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Kustomisasi Paperbox & Hero Banner Utama Enji Indonesia</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN: LIVE CANVASS PREVIEW (Lg: spans 5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center gap-4 bg-slate-50 dark:bg-slate-950/40 p-4 rounded-3xl border border-sky-50/20 dark:border-slate-800/30">
            <span className="text-[10px] font-extrabold uppercase tracking-wide px-2.5 py-1 rounded-md bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 self-start">
              Live Preview
            </span>
            
            {/* Round Picture Backplate Frame mirroring the App Hero style perfectly */}
            <div className="relative w-full max-w-[270.0px] aspect-square rounded-full flex items-center justify-center bg-[#ebf5fb] dark:bg-sky-950/20 border-2 border-white dark:border-slate-800 shadow-xl p-4 overflow-hidden">
              <div 
                className="w-full h-full rounded-full overflow-hidden shadow-inner flex items-center justify-center relative bg-slate-100 dark:bg-slate-800"
              >
                <img
                  src={selectedImage}
                  alt="Live Filter Adjuster Preview"
                  className="w-full h-full object-cover rounded-full"
                  style={getFilterStyle()}
                  referrerPolicy="no-referrer"
                  onError={() => {
                    // Fallbback to standard box icon if broken image URL is processed
                    console.log("Image preview loader issue, keeping url");
                  }}
                />
              </div>

              {/* Instant Status Tag for applied edits */}
              <div className="absolute bottom-2 inset-x-0 mx-auto w-max bg-sky-950/80 backdrop-blur-xs text-[9px] text-white px-2 py-0.5 rounded-full font-bold">
                Resolusi Adaptif
              </div>
            </div>

            {/* Scale & Rotate mini buttons row */}
            <div className="flex gap-2 items-center bg-white dark:bg-slate-900 border border-sky-100/50 dark:border-slate-800/50 rounded-xl p-1 shadow-xs">
              <button 
                onClick={() => handleSliderChange("scale", Math.max(0.7, filters.scale - 0.05))}
                className="p-1 text-slate-500 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-transform active:scale-90"
                title="Perkecil"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="text-[10px] font-bold text-slate-500 px-1 font-mono">
                S: {filters.scale.toFixed(2)}x
              </span>
              <button 
                onClick={() => handleSliderChange("scale", Math.min(1.8, filters.scale + 0.05))}
                className="p-1 text-slate-500 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-transform active:scale-90"
                title="Perbesar"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
              <div className="h-3.5 w-[1px] bg-slate-200 dark:bg-slate-800 mx-1" />
              <button 
                onClick={() => handleSliderChange("rotate", (filters.rotate + 15) % 360)}
                className="p-1 text-slate-500 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-transform active:scale-90"
                title="Rotasi Gambar"
              >
                <RotateCw className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: PRESETS, UPLOAD, AND FILTER SLIDERS (Lg: spans 7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-5 overflow-y-auto pr-1">
            
            {/* SOURCE SELECTORS: PRESET IMAGES AND FILE UPLOAD */}
            <div className="space-y-3.5">
              <label className="text-[10.5px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 block">
                1. Pilih Sumber Gambar Sista
              </label>

              {/* Grid of high-res presets from our inventory */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {PRESET_IMAGES.map((preset) => {
                  const isSelected = selectedImage === preset.url;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => handleSelectPreset(preset.url)}
                      className={`relative aspect-square rounded-2xl overflow-hidden border p-1 transition-all ${
                        isSelected 
                          ? "border-sky-500 shadow-md ring-2 ring-sky-500/25 bg-sky-50/50 dark:bg-sky-950/20"
                          : "border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-sky-300"
                      }`}
                      title={preset.name}
                    >
                      <img 
                        src={preset.url} 
                        alt={preset.name} 
                        className="w-full h-full object-cover rounded-xl"
                        referrerPolicy="no-referrer"
                      />
                      {isSelected && (
                        <span className="absolute bottom-1 right-1 bg-sky-600 text-white p-0.5 rounded-full flex items-center justify-center">
                          <Check className="h-2 w-2 stroke-[3]" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Drag and Drop Box and URL paste tab */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                {/* File Drop Area */}
                <div 
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={triggerFileInput}
                  className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center gap-1.5 ${
                    dragActive 
                      ? "border-sky-500 bg-sky-55/10 dark:bg-sky-950/30" 
                      : "border-slate-200 dark:border-slate-800 hover:border-sky-400 bg-slate-50/50 dark:bg-slate-900/50"
                  }`}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden" 
                  />
                  <div className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                    <Upload className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">Unggah Gambar Lokal</span>
                    <span className="text-[9px] text-slate-400 block mt-0.5">Drag & Drop atau klik di sini</span>
                  </div>
                </div>

                {/* Web URL input tab */}
                <form 
                  onSubmit={handleApplyUrl}
                  className="flex flex-col gap-2 justify-between p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50"
                >
                  <div className="flex gap-2 items-center">
                    <span className="p-1 bg-sky-50 dark:bg-sky-950/50 text-sky-600 rounded-lg">
                      <Link className="h-3 w-3" />
                    </span>
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Tempel URL Link</span>
                  </div>
                  
                  <div className="flex gap-2 mt-2">
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/... atau link online"
                      value={inputUrl}
                      onChange={(e) => setInputUrl(e.target.value)}
                      className="flex-1 text-[11px] rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 px-2 py-1.5 focus:outline-hidden focus:border-sky-450"
                    />
                    <button
                      type="submit"
                      disabled={!inputUrl.trim()}
                      className="px-2.5 py-1.5 bg-sky-600 hover:bg-sky-700 disabled:opacity-45 text-white text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      Terapkan
                    </button>
                  </div>
                  <span className="text-[9px] text-slate-400 block mt-1">Masukkan URL gambar valid lalu klik Terapkan</span>
                </form>

              </div>
            </div>

            {/* DYNAMIC FILTERS WORKSTATION */}
            <div className="space-y-3.5 border-t border-slate-100 dark:border-slate-800/60 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-[10.5px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 block">
                  2. Atur Filter Estetika Sista
                </span>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="flex items-center gap-1.5 text-[10px] text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 hover:underline transition-all cursor-pointer font-bold"
                >
                  <RefreshCcw className="h-3 w-3" />
                  <span>Reset Filter</span>
                </button>
              </div>

              {/* Grid of highly stylized visual filters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* 1. Brightness / Kecerahan */}
                <div className="space-y-1 bg-slate-50/40 dark:bg-slate-950/20 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/40">
                  <div className="flex justify-between text-[11px] font-semibold">
                    <span className="text-slate-600 dark:text-slate-300">Kecerahan (Brightness)</span>
                    <span className="text-sky-600 dark:text-sky-400 font-mono font-bold">{filters.brightness}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="180"
                    value={filters.brightness}
                    onChange={(e) => handleSliderChange("brightness", Number(e.target.value))}
                    className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-600 dark:accent-sky-450"
                  />
                </div>

                {/* 2. Contrast / Kontras */}
                <div className="space-y-1 bg-slate-50/40 dark:bg-slate-950/20 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/40">
                  <div className="flex justify-between text-[11px] font-semibold">
                    <span className="text-slate-600 dark:text-slate-300">Kontras (Contrast)</span>
                    <span className="text-sky-600 dark:text-sky-400 font-mono font-bold">{filters.contrast}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="180"
                    value={filters.contrast}
                    onChange={(e) => handleSliderChange("contrast", Number(e.target.value))}
                    className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-600 dark:accent-sky-450"
                  />
                </div>

                {/* 3. Saturation / Kejenuhan */}
                <div className="space-y-1 bg-slate-50/40 dark:bg-slate-950/20 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/40">
                  <div className="flex justify-between text-[11px] font-semibold">
                    <span className="text-slate-600 dark:text-slate-300">Kejenuhan Warna (Saturate)</span>
                    <span className="text-sky-600 dark:text-sky-400 font-mono font-bold">{filters.saturate}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={filters.saturate}
                    onChange={(e) => handleSliderChange("saturate", Number(e.target.value))}
                    className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-600 dark:accent-sky-450"
                  />
                </div>

                {/* 4. Grayscale / Abu-Abu */}
                <div className="space-y-1 bg-slate-50/40 dark:bg-slate-950/20 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/40">
                  <div className="flex justify-between text-[11px] font-semibold">
                    <span className="text-slate-600 dark:text-slate-300">Skala Abu-abu (Grayscale)</span>
                    <span className="text-sky-600 dark:text-sky-400 font-mono font-bold">{filters.grayscale}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={filters.grayscale}
                    onChange={(e) => handleSliderChange("grayscale", Number(e.target.value))}
                    className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-600 dark:accent-sky-450"
                  />
                </div>

                {/* 5. Sepia / Klasik Vintage */}
                <div className="space-y-1 bg-slate-50/40 dark:bg-slate-950/20 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/40">
                  <div className="flex justify-between text-[11px] font-semibold">
                    <span className="text-slate-600 dark:text-slate-300">Sentuhan Sepia (Sepia)</span>
                    <span className="text-sky-600 dark:text-sky-400 font-mono font-bold">{filters.sepia}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={filters.sepia}
                    onChange={(e) => handleSliderChange("sepia", Number(e.target.value))}
                    className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-600 dark:accent-sky-450"
                  />
                </div>

                {/* 6. Blur / Sensor Bokeh */}
                <div className="space-y-1 bg-slate-50/40 dark:bg-slate-950/20 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/40">
                  <div className="flex justify-between text-[11px] font-semibold">
                    <span className="text-slate-600 dark:text-slate-300">Kedalaman Blur (Bokeh)</span>
                    <span className="text-sky-600 dark:text-sky-400 font-mono font-bold">{filters.blur}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.5"
                    value={filters.blur}
                    onChange={(e) => handleSliderChange("blur", Number(e.target.value))}
                    className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-600 dark:accent-sky-450"
                  />
                </div>

                {/* 7. Hue Rotate / Pergeseran Rona */}
                <div className="space-y-1 bg-slate-50/40 dark:bg-slate-950/20 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/40 col-span-1 sm:col-span-2">
                  <div className="flex justify-between text-[11px] font-semibold">
                    <span className="text-slate-600 dark:text-slate-300">Geser Rona Warna (Hue Rotate)</span>
                    <span className="text-sky-600 dark:text-sky-400 font-mono font-bold">{filters.hueRotate}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={filters.hueRotate}
                    onChange={(e) => handleSliderChange("hueRotate", Number(e.target.value))}
                    className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-600 dark:accent-sky-450"
                  />
                </div>

              </div>
            </div>

          </div>

        </div>

        {/* Footer actions bottom bar */}
        <div className="px-6 py-4 border-t border-sky-100/50 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 hover:bg-slate-150 text-slate-500 font-bold text-xs rounded-xl border border-slate-250 dark:border-slate-800 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-250"
          >
            Batal
          </button>
          
          <button
            type="button"
            onClick={handleSubmit}
            className="flex items-center gap-2 px-6 py-2 bg-sky-650 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer active:scale-95 transition-transform"
          >
            <Check className="h-4 w-4 stroke-[2.5]" />
            <span>Simpan Perubahan</span>
          </button>
        </div>

      </motion.div>
    </div>
  );
}
