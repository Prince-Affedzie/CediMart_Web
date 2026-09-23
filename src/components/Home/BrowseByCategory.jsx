// src/components/home/BrowseByCategory.jsx
'use client';

import Link from 'next/link';
import { useRef } from 'react';
import {
  Shirt, Smartphone, Laptop, Gamepad2, BookOpen, Bed,
  Tv, Armchair, Sparkles, Dumbbell, Watch, UtensilsCrossed,
  Ticket, Bike, Wrench, Package, ArrowRight, GraduationCap,
  Camera, Palette, Hammer, Home, ChevronLeft, ChevronRight,
} from 'lucide-react';
import './browse-by-category.css';

// ─── Category list (mirrors CATEGORY_CONFIG order for consistency) ────────
const CATEGORIES = [
  { key: 'fashion',                 label: 'Fashion',           icon: Shirt,           color: '#DC2626', tint: '#FEF2F2' },
  { key: 'electronics',             label: 'Electronics',       icon: Sparkles,        color: '#2563EB', tint: '#EFF6FF' },
  { key: 'phones and tablets',      label: 'Phones & Tablets',  icon: Smartphone,      color: '#7C3AED', tint: '#F5F3FF' },
  { key: 'computers and laptops',   label: 'Computers',         icon: Laptop,          color: '#0891B2', tint: '#ECFEFF' },
  { key: 'gaming',                  label: 'Gaming',            icon: Gamepad2,        color: '#DB2777', tint: '#FDF2F8' },
  { key: 'books-course-materials',  label: 'Books & Notes',     icon: BookOpen,        color: '#B45309', tint: '#FFFBEB' },
  { key: 'hostel-items',            label: 'Hostel Items',      icon: Bed,             color: '#0D9488', tint: '#F0FDFA' },
  { key: 'appliances',              label: 'Appliances',        icon: Tv,              color: '#475569', tint: '#F1F5F9' },
  { key: 'furniture',               label: 'Furniture',         icon: Armchair,        color: '#92400E', tint: '#FEF3C7' },
  { key: 'beauty and grooming',     label: 'Beauty',            icon: Sparkles,        color: '#EC4899', tint: '#FDF2F8' },
  { key: 'sports and fitness',      label: 'Sports',            icon: Dumbbell,        color: '#16A34A', tint: '#F0FDF4' },
  { key: 'accessories',             label: 'Accessories',       icon: Watch,           color: '#CA8A04', tint: '#FEFCE8' },
  { key: 'food and drinks',         label: 'Food & Drinks',     icon: UtensilsCrossed, color: '#EA580C', tint: '#FFF7ED' },
  { key: 'services',                label: 'Services',          icon: Wrench,          color: '#0284C7', tint: '#F0F9FF' },
  { key: 'tutoring-education',      label: 'Tutoring',          icon: GraduationCap,   color: '#4F46E5', tint: '#EEF2FF' },
  { key: 'photography-media',       label: 'Photography',       icon: Camera,          color: '#0EA5E9', tint: '#F0F9FF' },
  { key: 'graphic-design-printing', label: 'Design & Print',    icon: Palette,         color: '#9333EA', tint: '#FAF5FF' },
  { key: 'repair-services',         label: 'Repairs',           icon: Hammer,          color: '#65A30D', tint: '#F7FEE7' },
  { key: 'events-catering',         label: 'Events',            icon: Ticket,          color: '#F59E0B', tint: '#FFFBEB' },
  { key: 'accommodation-housing',   label: 'Housing',           icon: Home,            color: '#0F766E', tint: '#F0FDFA' },
  { key: 'transport and logistics', label: 'Transport',         icon: Bike,            color: '#0369A1', tint: '#F0F9FF' },
  { key: 'other',                   label: 'Other',             icon: Package,         color: '#64748B', tint: '#F8FAFC' },
];

export default function BrowseByCategory() {
  const scrollerRef = useRef(null);

  const scrollBy = (dir) => {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = Math.min(el.clientWidth * 0.8, 480);
    el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <section className="bbc-section">
      {/* ── Section header ── */}
      <div className="bbc-header">
        <div>
          <h2 className="bbc-title">Browse by Category</h2>
          <p className="bbc-subtitle">Find exactly what you need, from fashion to home appliances</p>
        </div>

        <div className="bbc-header-actions">
          <div className="bbc-arrows" aria-hidden="true">
            <button
              type="button"
              className="bbc-arrow-btn"
              onClick={() => scrollBy('left')}
              aria-label="Scroll categories left"
            >
              <ChevronLeft size={16} strokeWidth={2.5} />
            </button>
            <button
              type="button"
              className="bbc-arrow-btn"
              onClick={() => scrollBy('right')}
              aria-label="Scroll categories right"
            >
              <ChevronRight size={16} strokeWidth={2.5} />
            </button>
          </div>
          <Link href="/listings" className="bbc-see-all">
            See all
            <ArrowRight size={14} strokeWidth={2.5} />
          </Link>
        </div>
      </div>

      {/* ── Horizontal scrollable category strip ── */}
      <div className="bbc-strip-wrap">
        <div ref={scrollerRef} className="bbc-strip">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.key}
                href={`/categories/${encodeURIComponent(cat.key)}`}
                className="bbc-tile"
                style={{
                  '--cat-color': cat.color,
                  '--cat-tint': cat.tint,
                }}
              >
                <span className="bbc-tile-icon">
                  <Icon size={12} strokeWidth={2.1} />
                </span>
                <span className="bbc-tile-label">{cat.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}