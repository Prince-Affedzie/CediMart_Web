// src/components/listings/CategoryTree.jsx
import { useEffect, useState } from 'react';
import { ChevronRight, Check, ShoppingBag } from 'lucide-react';
import { CATEGORIES } from '@/constants/listings/categories';
import { C } from '@/constants/listings/tokens';

export default function CategoryTree({ activeCategory, activeSub, onCategory, onSub, onClose }) {
  const [openKeys, setOpenKeys] = useState(() => {
    const init = {};
    if (activeCategory) init[activeCategory] = true;
    return init;
  });

  useEffect(() => {
    if (activeCategory) setOpenKeys((prev) => ({ ...prev, [activeCategory]: true }));
  }, [activeCategory]);

  const toggle = (key) => setOpenKeys((prev) => ({ ...prev, [key]: !prev[key] }));

  const pickCategory = (cat) => {
    if (cat.key === activeCategory) { onCategory(''); onSub(''); }
    else { onCategory(cat.key); onSub(''); setOpenKeys((prev) => ({ ...prev, [cat.key]: true })); }
    onClose?.();
  };

  const pickSub = (e, catKey, subLabel) => {
    e.stopPropagation();
    onCategory(catKey);
    onSub(activeSub === subLabel ? '' : subLabel);
    onClose?.();
  };

  return (
    <div className="lp-cat-tree">
      <button
        className={`lp-cat-row lp-all-row${!activeCategory ? ' lp-cat-active' : ''}`}
        onClick={() => { onCategory(''); onSub(''); onClose?.(); }}
      >
        <ShoppingBag size={15} strokeWidth={2} className="lp-cat-icon-svg" />
        <span className="lp-cat-label">All Products</span>
        {!activeCategory && <Check size={14} strokeWidth={2.5} style={{ marginLeft: 'auto', color: C.brand, flexShrink: 0 }} />}
      </button>

      <div className="lp-sidebar-divider" />
      <p className="lp-sidebar-section-label">Shop by Category</p>

      {CATEGORIES.map((cat) => {
        const isActive = activeCategory === cat.key;
        const isOpen = !!openKeys[cat.key];
        const Icon = cat.icon;
        return (
          <div key={cat.key} className="lp-cat-group">
            <button
              className={`lp-cat-row${isActive ? ' lp-cat-active' : ''}`}
              onClick={() => { pickCategory(cat); if (cat.sub?.length) toggle(cat.key); }}
            >
              <Icon size={15} strokeWidth={2} className="lp-cat-icon-svg" />
              <span className="lp-cat-label">{cat.label}</span>
              {isActive && !isOpen && <Check size={13} strokeWidth={2.5} style={{ color: C.brand, flexShrink: 0, marginRight: 4 }} />}
              {cat.sub?.length > 0 && (
                <span
                  className="lp-chevron-wrap"
                  onClick={(e) => { e.stopPropagation(); toggle(cat.key); }}
                  role="button"
                  aria-label={isOpen ? 'Collapse' : 'Expand'}
                >
                  <ChevronRight
                    size={15}
                    strokeWidth={2}
                    className="lp-cat-chevron"
                    style={{
                      transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                      transition: 'transform .22s cubic-bezier(.4,0,.2,1)',
                      color: isActive ? C.brandL : C.muted,
                    }}
                  />
                </span>
              )}
            </button>

            {isOpen && cat.sub?.length > 0 && (
              <div className="lp-sub-list">
                {cat.sub.map((sub) => {
                  const subActive = isActive && activeSub === sub;
                  return (
                    <button key={sub} className={`lp-sub-row${subActive ? ' lp-sub-active' : ''}`} onClick={(e) => pickSub(e, cat.key, sub)}>
                      <span className="lp-sub-dot-wrap">{subActive ? <span className="lp-sub-dot-filled" /> : <span className="lp-sub-dot-empty" />}</span>
                      <span className="lp-sub-label">{sub}</span>
                      {subActive && <Check size={11} strokeWidth={2.5} style={{ marginLeft: 'auto', color: C.brandL, flexShrink: 0 }} />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}