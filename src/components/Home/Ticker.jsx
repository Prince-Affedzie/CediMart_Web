// src/components/Home/Ticker.jsx

const TICKER_ITEMS = [
  '🔥 Flash sale — Samsung Galaxy A54 · GH₵ 1,800 · KNUST',
  '✅ Ama sold her fan in 40 minutes · UG',
  '🆕 Kofi just listed a Dell laptop · GH₵ 2,200 · UCC',
  '👀 94 students browsing Electronics right now',
  "🎉 Serwaa's Fashion shop crossed 200 sales · UPSA",
  '⚡ 500 new listings today across all campuses',
  '📚 Past questions for all courses — GH₵ 20 · KNUST',
  '🍚 Jollof Rice delivery — Legon Hall area',
];

export default function Ticker() {
  return (
    <div className="ticker-outer">
      <div className="ticker-track">
        {[...TICKER_ITEMS, ...TICKER_ITEMS].map((t, i) => (
          <span key={i} className="ticker-item">{t}</span>
        ))}
      </div>
    </div>
  );
}