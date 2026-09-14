// src/components/listings/MobileCategoryStrip.jsx
import { useEffect, useRef, useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { CATEGORIES } from '@/constants/listings/categories';

export default function MobileCategoryStrip({
  activeCategory,
  activeSub,
  onCategory,
  onSub,
}) {
  const scrollRef = useRef(null);
  const [localOpenSubs, setLocalOpenSubs] = useState(false);

  // Auto-scroll the active pill into view whenever it changes.
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

  // Open the sub-row automatically when a category with subcategories is picked.
  useEffect(() => {
    if (activeCategory) {
      const cat = CATEGORIES.find((c) => c.key === activeCategory);
      setLocalOpenSubs(!!cat?.sub?.length);
    } else {
      setLocalOpenSubs(false);
    }
  }, [activeCategory]);

  const handleCategoryTap = (cat) => {
    if (cat.key === activeCategory) {
      // Tapping the active category re-shows its subcategories.
      setLocalOpenSubs((v) => !v);
      return;
    }
    onCategory(cat.key);
    onSub('');
    setLocalOpenSubs(!!cat.sub?.length);
  };

  const handleSubTap = (sub) => {
    onSub(activeSub === sub ? '' : sub);
  };

  const activeCat = CATEGORIES.find((c) => c.key === activeCategory);
  const subs = activeCat?.sub || [];

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
              {cat.sub?.length > 0 && <span className="lp-mcat-dot" />}
            </button>
          );
        })}
      </div>

      {/* Subcategory chips — only when a category with subs is active */}
      {activeCategory && subs.length > 0 && localOpenSubs && (
        <div className="lp-mcat-subs">
          {subs.map((sub) => {
            const subActive = activeSub === sub;
            return (
              <button
                key={sub}
                type="button"
                className={`lp-mcat-sub${subActive ? ' is-active' : ''}`}
                onClick={() => handleSubTap(sub)}
              >
                {sub}
              </button>
            );
          })}
          {activeSub && (
            <button
              type="button"
              className="lp-mcat-sub lp-mcat-sub-clear"
              onClick={() => onSub('')}
            >
              ✕ Clear
            </button>
          )}
        </div>
      )}
    </div>
  );
}