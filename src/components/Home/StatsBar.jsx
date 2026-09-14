// src/components/Home/StatsBar.jsx

const STATS = [
  { v: '10K+', l: 'Students', c: '#0D9488' },
  { v: '2,500+', l: 'Businesses', c: '#F97316' },
  { v: '50K+', l: 'Listings', c: '#DC2626' },
  { v: '8', l: 'Campuses', c: '#059669' },
];

export default function StatsBar() {
  return (
    <div className="stats-bar">
      <div className="stats-inner">
        {STATS.map((s, i) => (
          <div key={i} className="stat-item" style={{ '--sc': s.c }}>
            <div className="stat-val">{s.v}</div>
            <div className="stat-lbl">{s.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}