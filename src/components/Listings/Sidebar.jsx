// src/components/Listings/Sidebar.jsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown, LayoutGrid } from 'lucide-react';
import { CATEGORIES } from '@/constants/listings/categories';
import { SUBCATEGORIES } from '@/constants/listings/subcategories';

// Accepts ['A','B'] or [{ value, label }] — whichever shape the constant uses.
function normalizeSubs(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((s) =>
      typeof s === 'string'
        ? { value: s, label: s }
        : {
            value: s.value ?? s.key ?? s.id ?? s.label,
            label: s.label ?? s.value ?? s.key,
          }
    )
    .filter((s) => s.value);
}

const isModifiedClick = (e) =>
  e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button === 1;

export default function Sidebar({ activeCategory, activeSub, onCategory, onSub }) {
  const [openKey, setOpenKey] = useState(activeCategory || '');

  // Keep the expanded group in step with the active category
  // (also covers the URL seeding the category after first render).
  useEffect(() => {
    setOpenKey(activeCategory || '');
  }, [activeCategory]);

  // Real <a href> for crawlers and "open in new tab", in-page filtering for normal clicks.
  const handleSelect = (e, key) => {
    if (isModifiedClick(e)) return;
    e.preventDefault();
    onCategory(key);
    setOpenKey(key);
  };

  return (
    <aside className="lp-sidebar" aria-label="Categories">
      <div className="lp-side-head">
        <LayoutGrid size={14} strokeWidth={2.4} />
        <h2 className="lp-side-title">Categories</h2>
      </div>

      <nav className="lp-side-scroll">
        <Link
          href="/listings"
          className={`lp-side-all ${!activeCategory ? 'is-active' : ''}`}
          aria-current={!activeCategory ? 'page' : undefined}
          onClick={(e) => handleSelect(e, '')}
        >
          <span className="lp-side-chip">
            <LayoutGrid size={16} strokeWidth={2.2} />
          </span>
          <span className="lp-side-label">All categories</span>
        </Link>

        <ul className="lp-side-list">
          {CATEGORIES.map((c) => {
            const Icon = c.icon;
            const subs = normalizeSubs(SUBCATEGORIES?.[c.key]);
            const isActive = activeCategory === c.key;
            const isOpen = openKey === c.key && subs.length > 0;

            return (
              <li key={c.key} className="lp-side-item">
                <div className={`lp-side-row ${isActive ? 'is-active' : ''}`}>
                  <Link
                    href={`/categories/${encodeURIComponent(c.key)}`}
                    className="lp-side-link"
                    aria-current={isActive ? 'page' : undefined}
                    onClick={(e) => handleSelect(e, c.key)}
                  >
                    <span className="lp-side-chip">
                      {Icon && <Icon size={16} strokeWidth={2.2} />}
                    </span>
                    <span className="lp-side-label">{c.label}</span>
                  </Link>

                  {subs.length > 0 && (
                    <button
                      type="button"
                      className={`lp-side-toggle ${isOpen ? 'is-open' : ''}`}
                      onClick={() => setOpenKey(isOpen ? '' : c.key)}
                      aria-expanded={isOpen}
                      aria-label={`${isOpen ? 'Hide' : 'Show'} ${c.label} subcategories`}
                    >
                      <ChevronDown size={15} strokeWidth={2.4} />
                    </button>
                  )}
                </div>

                {isOpen && (
                  <ul className="lp-side-subs">
                    <li>
                      <button
                        type="button"
                        className={`lp-side-sub ${isActive && !activeSub ? 'is-active' : ''}`}
                        onClick={() => {
                          if (!isActive) onCategory(c.key);
                          onSub('');
                        }}
                      >
                        All {c.label}
                      </button>
                    </li>
                    {subs.map((s) => (
                      <li key={s.value}>
                        <button
                          type="button"
                          className={`lp-side-sub ${isActive && activeSub === s.value ? 'is-active' : ''}`}
                          onClick={() => {
                            if (!isActive) onCategory(c.key);
                            onSub(isActive && activeSub === s.value ? '' : s.value);
                          }}
                        >
                          {s.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}