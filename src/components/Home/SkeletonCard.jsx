// src/components/Home/SkeletonCard.jsx

export default function SkeletonCard() {
  return (
    <div className="sk-card">
      <div className="sk-img" />
      <div style={{ padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div className="sk-line" style={{ width: '60%', height: 10 }} />
        <div className="sk-line" style={{ width: '90%', height: 14 }} />
        <div className="sk-line" style={{ width: '80%', height: 12 }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          <div className="sk-line" style={{ width: '35%', height: 18 }} />
          <div className="sk-line" style={{ width: '28%', height: 30, borderRadius: 8 }} />
        </div>
      </div>
    </div>
  );
}