// src/components/listings/Pagination.jsx
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const items = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((n) => n === 1 || n === totalPages || Math.abs(n - page) <= 2)
    .reduce((acc, n, i, arr) => {
      if (i > 0 && n - arr[i - 1] > 1) acc.push('…');
      acc.push(n);
      return acc;
    }, []);

  return (
    <div className="lp-pagination">
      <button className="lp-pg-btn lp-pg-nav" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        <ChevronLeft size={15} strokeWidth={2.5} />Prev
      </button>

      {items.map((item, i) =>
        item === '…' ? (
          <span key={`dot-${i}`} className="lp-pg-dots">…</span>
        ) : (
          <button key={item} className={`lp-pg-btn${page === item ? ' active' : ''}`} onClick={() => onPageChange(item)}>
            {item}
          </button>
        )
      )}

      <button className="lp-pg-btn lp-pg-nav" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
        Next<ChevronRight size={15} strokeWidth={2.5} />
      </button>
    </div>
  );
}