// src/components/Feed/ReelSkeleton.jsx

// Shaped like a real reel (full-bleed media, text bars bottom-left, rail circles
// right), so loading doesn't jump when real content arrives.
export default function ReelSkeleton() {
  return (
    <div className="fd-skel" aria-hidden="true">
      <div className="fd-skel-bottom">
        <div className="fd-skel-left">
          <span className="fd-skel-bar" style={{ width: 120, height: 13 }} />
          <span className="fd-skel-bar" style={{ width: '85%', height: 15, marginTop: 4 }} />
          <span className="fd-skel-bar" style={{ width: '55%', height: 15 }} />
          <span className="fd-skel-bar" style={{ width: '70%', height: 12 }} />
        </div>
        <div className="fd-skel-rail">
          <span className="fd-skel-circle" style={{ width: 46, height: 46 }} />
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="fd-skel-circle" style={{ width: 30, height: 30 }} />
          ))}
        </div>
      </div>
    </div>
  );
}