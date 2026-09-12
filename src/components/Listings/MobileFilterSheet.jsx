// src/components/listings/MobileFilterSheet.jsx
import { useEffect } from 'react';
import { X } from 'lucide-react';
import CategoryTree from './CategoryTree';

export default function MobileFilterSheet({ open, onClose, activeCategory, activeSub, onCategory, onSub }) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <>
      <div className="lp-sheet-backdrop" onClick={onClose} />
      <div className="lp-sheet">
        <div className="lp-sheet-header">
          <div className="lp-sheet-handle" />
          <div className="lp-sheet-title-row">
            <span className="lp-sheet-title">Categories</span>
            <button className="lp-sheet-close" onClick={onClose} aria-label="Close"><X size={18} strokeWidth={2} /></button>
          </div>
        </div>
        <div className="lp-sheet-body">
          <CategoryTree
            activeCategory={activeCategory}
            activeSub={activeSub}
            onCategory={onCategory}
            onSub={onSub}
            onClose={onClose}
          />
        </div>
      </div>
    </>
  );
}