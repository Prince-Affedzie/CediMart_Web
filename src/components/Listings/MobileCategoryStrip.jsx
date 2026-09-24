// src/components/listings/MobileCategoryStrip.jsx
import { useEffect, useRef, useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { CATEGORIES } from '@/constants/listings/categories';

export default function MobileCategoryStrip({
  activeCategory,
  activeSub,
  onCategory,
  onSub,
  subcategories = {},           // { [catId]: [{ value, label }] }
}) {
  const scrollRef = useRef(null);
  const subScrollRef = useRef(null);
  const [localOpenSubs, setLocalOpenSubs] = useState(false);

  // Auto-scroll the active category pill into view when it changes.
  useEffect(() => {
    if (!scrollRef.current || !activeCategory) return;
    const el = scrollRef.current.querySelector(
      `[data-cat-key="${activeCategory}"]`
    );
    if (el) {
      el.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  }, [activeCategory]);

  // Auto-scroll the active sub pill into view when it changes.
  useEffect(() => {
    if (!subScrollRef.current || !activeSub) return;
    const el = subScrollRef.current.querySelector(
      `[data-sub-key="${activeSub}"]`
    );
    if (el) {
      el.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  }, [activeSub]);

  // Open the sub-row automatically when a category with subs is picked.
  useEffect(() => {
    if (!activeCategory) {
      setLocalOpenSubs(false);
      return;
    }
    const subs = subcategories[activeCategory] || [];
    setLocalOpenSubs(subs.length > 0);
  }, [activeCategory, subcategories]);

  const subsForActive = activeCategory
    ? (subcategories[activeCategory] || [])
    : [];

  const handleCategoryTap = (cat) => {
    if (cat.key === activeCategory) {
      // Tapping the active category toggles its subcategory row.
      setLocalOpenSubs((v) => !v);
      return;
    }
    onCategory(cat.key);
    onSub('');
  };

  const handleSubTap = (subValue) => {
    onSub(activeSub === subValue ? '' : subValue);
  };

  return (
    <div className="lp-mcat">
      <div className="lp-mcat-scroll" ref={scrollRef}>
        {/* "All" pill */}
        <button
          type="button"
          className={`lp-mcat-pill${!activeCategory ? ' is-active' : ''}`}
          onClick={() => {
            onCategory('');
            onSub('');
            setLocalOpenSubs(false);
          }}
        >
          <ShoppingBag size={13} strokeWidth={2.4} />
          <span>All</span>
        </button>

        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.key;
          const hasSubs = (subcategories[cat.key] || []).length > 0;

          return (
            <button
              key={cat.key}
              type="button"
              data-cat-key={cat.key}
              className={`lp-mcat-pill${isActive ? ' is-active' : ''}`}
              onClick={() => handleCategoryTap(cat)}
            >
              {Icon && <Icon size={13} strokeWidth={2.4} />}
              <span>{cat.label}</span>
              {/* Small dot hint that this category has subcategories */}
              {hasSubs && <span className="lp-mcat-dot" />}
            </button>
          );
        })}
      </div>

      {/* Subcategory chips — shown whenever the active category has subs */}
      {activeCategory && subsForActive.length > 0 && localOpenSubs && (
        <div className="lp-mcat-subs" ref={subScrollRef}>
          {/* "All in category" chip */}
          <button
            type="button"
            className={`lp-mcat-sub${!activeSub ? ' is-active' : ''}`}
            onClick={() => onSub('')}
          >
            All
          </button>

          {subsForActive.map((sub) => {
            const subValue = sub.value || sub.key || sub;
            const subLabel = sub.label || sub;
            const subActive = activeSub === subValue;

            return (
              <button
                key={subValue}
                type="button"
                data-sub-key={subValue}
                className={`lp-mcat-sub${subActive ? ' is-active' : ''}`}
                onClick={() => handleSubTap(subValue)}
              >
                {subLabel}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}