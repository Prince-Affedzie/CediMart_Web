// src/components/Feed/TypeFilter.jsx
'use client';

export default function TypeFilter({ types, activeType, onSelect }) {
  return (
    <div className="fd-chips" role="tablist" aria-label="Post type">
      {types.map((t) => {
        const active = activeType === t.key;
        return (
          <button
            key={t.key || 'all'}
            type="button"
            role="tab"
            aria-selected={active}
            className={`fd-chip-filter${active ? ' is-active' : ''}`}
            onClick={() => onSelect(t.key)}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}