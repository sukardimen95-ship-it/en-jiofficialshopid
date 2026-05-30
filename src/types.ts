export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string; // URL, Base64, or placeholder
  category: string;
}

export interface BankAccount {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
}

export interface ImageFilters {
  brightness: number;
  contrast: number;
  grayscale: number;
  saturate: number;
  sepia: number;
  blur: number;
  hueRotate: number;
  scale: number;
  rotate: number;
}

export interface AppSettings {
  whatsappNumber: string;
  bankAccount: BankAccount;
  adminPin: string;
  heroImage?: string;
  heroFilters?: ImageFilters;
}
