// src/components/listings/SkeletonCard.jsx

export default function SkeletonCard() {
  return (
    <div className="lp-sk-card">
      <div className="lp-sk-img" />
      <div className="lp-sk-body">
        <div className="lp-sk-line" style={{ width: '45%', height: 10 }} />
        <div className="lp-sk-line" style={{ width: '90%' }} />
        <div className="lp-sk-line" style={{ width: '65%' }} />
        <div className="lp-sk-line" style={{ width: '35%', height: 18, marginTop: 4 }} />
      </div>
    </div>
  );
}