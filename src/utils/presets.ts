// Agricultural Presets for Product Photos and Seasonal Scheme Posters

export interface ProductPhotoPreset {
  id: string;
  name: string;
  category: string;
  url: string;
  description: string;
}

export interface PosterPreset {
  id: string;
  title: string;
  description: string;
  url: string;
  tag: string;
}

export const DEFAULT_PESTICIDE_BOTTLE = "https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=800&q=80";
export const DEFAULT_FERTILIZER_BAG = "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=800&q=80";
export const DEFAULT_SEEDS_PACK = "https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=800&q=80";
export const DEFAULT_BIO_STIMULANT = "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=800&q=80";
export const DEFAULT_HERBICIDE = "https://images.unsplash.com/photo-1592417817098-8f3d6ef23d06?auto=format&fit=crop&w=800&q=80";
export const DEFAULT_FUNGICIDE = "https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?auto=format&fit=crop&w=800&q=80";

export const PRODUCT_PHOTO_PRESETS: ProductPhotoPreset[] = [
  {
    id: "preset_fungicide_1",
    name: "Fungicide Spray Pouch / Bottle",
    category: "Fungicides",
    url: DEFAULT_FUNGICIDE,
    description: "High quality crop protection fungicide solution"
  },
  {
    id: "preset_insecticide_1",
    name: "Systemic Insecticide Bottle",
    category: "Insecticides",
    url: DEFAULT_PESTICIDE_BOTTLE,
    description: "Broad-spectrum pest control formulation"
  },
  {
    id: "preset_fertilizer_1",
    name: "Organic & Nano Fertilizer",
    category: "Fertilizers",
    url: DEFAULT_FERTILIZER_BAG,
    description: "Balanced NPK and high-efficiency crop nutrient"
  },
  {
    id: "preset_seeds_1",
    name: "Certified Hybrid Seeds Pack",
    category: "Seeds",
    url: DEFAULT_SEEDS_PACK,
    description: "High germination, drought & disease resistant hybrid seeds"
  },
  {
    id: "preset_herbicide_1",
    name: "Weedicide & Herbicide Canister",
    category: "Herbicides",
    url: DEFAULT_HERBICIDE,
    description: "Selective post-emergence weed control"
  },
  {
    id: "preset_bio_1",
    name: "Bio-Stimulant & Plant Growth Booster",
    category: "Bio-Nutrients",
    url: DEFAULT_BIO_STIMULANT,
    description: "Amino acids and seaweed extract plant tonic"
  }
];

export const POSTER_PRESETS: PosterPreset[] = [
  {
    id: "poster_monsoon_1",
    title: "Monsoon Special Crop Protection Offer",
    description: "Get extra 10% cash discount + free freight on orders above ₹50,000 this monsoon season.",
    url: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80",
    tag: "Seasonal Scheme"
  },
  {
    id: "poster_seeds_1",
    title: "Kharif Hybrid Seeds Carnival",
    description: "Buy 10 packs of certified Mahyco or Syngenta hybrid seeds and get 1 pack complimentary!",
    url: "https://images.unsplash.com/photo-1628352081506-83c43123ed6d?auto=format&fit=crop&w=1200&q=80",
    tag: "Seeds Festival"
  },
  {
    id: "poster_fertilizer_1",
    title: "Nano Urea & DAP Pre-Booking Bonanza",
    description: "Guaranteed priority allocation and zero price escalation on early booking for next month.",
    url: "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=1200&q=80",
    tag: "Fertilizer Discount"
  },
  {
    id: "poster_bio_1",
    title: "Bio-Stimulant Cashback Drive",
    description: "Flat ₹500 instant ledger credit for every 20 bottles of organic growth booster ordered.",
    url: "https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?auto=format&fit=crop&w=1200&q=80",
    tag: "Cashback"
  },
  {
    id: "poster_early_bird",
    title: "Distributor Early Bird Payment Reward",
    description: "Clear outstanding balance within 3 days of invoice and get 1.5% instant cash discount!",
    url: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=1200&q=80",
    tag: "Payment Incentive"
  }
];

export function getAutomaticProductPhoto(category: string, itemName: string): string {
  const cat = (category || '').toLowerCase();
  const name = (itemName || '').toLowerCase();
  if (cat.includes("seed") || name.includes("seed")) return DEFAULT_SEEDS_PACK;
  if (cat.includes("fert") || name.includes("urea") || name.includes("dap") || name.includes("npk")) return DEFAULT_FERTILIZER_BAG;
  if (cat.includes("bio") || cat.includes("nutrient") || name.includes("tonic") || name.includes("growth")) return DEFAULT_BIO_STIMULANT;
  if (cat.includes("herb") || name.includes("weed")) return DEFAULT_HERBICIDE;
  if (cat.includes("fungi") || name.includes("saaf") || name.includes("nativo")) return DEFAULT_FUNGICIDE;
  return DEFAULT_PESTICIDE_BOTTLE;
}

export function getAutomaticPosterPhoto(title: string): string {
  const t = (title || '').toLowerCase();
  if (t.includes("seed")) return POSTER_PRESETS[1].url;
  if (t.includes("fertilizer") || t.includes("urea")) return POSTER_PRESETS[2].url;
  if (t.includes("bio") || t.includes("cashback")) return POSTER_PRESETS[3].url;
  if (t.includes("payment") || t.includes("clear") || t.includes("due")) return POSTER_PRESETS[4].url;
  return POSTER_PRESETS[0].url;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(amount);
}

export function formatDateShort(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

export function formatDateFull(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
