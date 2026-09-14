// src/components/Home/constants.js
import {
  Laptop,
  Smartphone,
  Monitor,
  Gamepad2,
  Shirt,
  BookOpen,
  Home as HomeIcon,
  Plug,
  Armchair,
  Sparkles,
  Dumbbell,
  UtensilsCrossed,
  Wrench,
  Watch,
  Package,
} from 'lucide-react';

export const CONDITION_MAP = {
  'new':           { label: 'New',        bg: '#05966915', color: '#059669' },
  'like-new':      { label: 'Like New',   bg: '#05966915', color: '#059669' },
  'excellent':     { label: 'Excellent',  bg: '#0D948815', color: '#0D9488' },
  'good':          { label: 'Good',       bg: '#F9731615', color: '#D97706' },
  'fair':          { label: 'Fair',       bg: '#DC262615', color: '#DC2626' },
  'slightly-used': { label: 'Used',       bg: '#DC262615', color: '#DC2626' },
  'for-parts':     { label: 'Parts',      bg: '#64748B15', color: '#64748B' },
};

// Lucide icon components, one per category. Values are components
// (not elements) so consumers can render them as <Icon size={...} />
// with whatever props they need at the call site.
export const CATEGORY_ICONS = {
  'electronics':              Laptop,
  'phones and tablets':       Smartphone,
  'computers and laptops':    Monitor,
  'gaming':                   Gamepad2,
  'fashion':                  Shirt,
  'books-course-materials':   BookOpen,
  'hostel-items':             HomeIcon,
  'appliances':               Plug,
  'furniture':                Armchair,
  'beauty and grooming':      Sparkles,
  'sports and fitness':       Dumbbell,
  'food and drinks':          UtensilsCrossed,
  'services':                 Wrench,
  'accessories':              Watch,
  'other':                    Package,
};

// Safe fallback for unknown categories.
export const DEFAULT_CATEGORY_ICON = Package;

// Product rails shown on the homepage. Each pulls from getProductsByTag —
// tag values match TAG_CONFIG on the product detail page, so a listing
// tagged there shows up in the matching rail here automatically.
export const TAG_RAILS = [
  { tag: 'featured',         title: 'Featured Products', subtitle: 'Hand-picked just for you',          accent: '#DC2626' },
  { tag: 'urgent-sale',      title: 'Urgent Sales',      subtitle: 'Sellers need these gone today',     accent: '#DC2626' },
  { tag: 'popular',          title: 'Popular This Week', subtitle: 'What everyone is buying',           accent: '#0D9488' },
  { tag: 'new-arrival',      title: 'New Arrivals',      subtitle: 'Fresh listings just posted',        accent: '#F97316' },
  { tag: 'student-favorite', title: 'Student Favorites', subtitle: 'Loved by students like you',        accent: '#059669' },
  { tag: 'discounted',       title: 'On Sale',           subtitle: 'Real savings, no gimmicks',         accent: '#DC2626' },
];

// Category rails — a handful of CediMart's busiest categories, mirroring
// the tag rails but pulled via getProductsByCategory instead.
export const CATEGORY_RAILS = [
  { category: 'electronics',            title: 'Electronics',              accent: '#0D9488' },
  { category: 'fashion',                title: 'Fashion',                  accent: '#F97316' },
  { category: 'food and drinks',        title: 'Food & Drinks',            accent: '#059669' },
  { category: 'books-course-materials', title: 'Books & Course Materials', accent: '#7E22CE' },
];