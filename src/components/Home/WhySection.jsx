// src/components/Home/WhySection.jsx

const WHY_ITEMS = [
  { icon: '🛡️', title: 'Verified Sellers', color: '#0D9488',
    desc: 'Every vendor submits a national ID and student card. Green badge = fully checked.' },
  { icon: '⚡', title: 'List in 60 Seconds', color: '#F97316',
    desc: 'Photo, price, publish. Median listing time: 48 seconds. Your buyer could message within the hour.' },
  { icon: '🔒', title: 'Private Messaging', color: '#DC2626',
    desc: 'Chat inside the app. Your phone number stays private until you choose to share it.' },
  { icon: '📊', title: 'Live Analytics', color: '#059669',
    desc: 'See real-time views, saves, and conversion rates on every product you list. No weekly reports.' },
];

export default function WhySection({ reveal, sectionRef }) {
  return (
    <section className="section" style={{ background: 'var(--void)' }} ref={sectionRef}>
      <div className="section-inner">
        <div className={`reveal ${reveal ? 'shown' : ''}`} style={{ textAlign: 'center', maxWidth: 540, margin: '0 auto 52px' }}>
          <p className="section-eyebrow" style={{ '--ec': '#DC2626', textAlign: 'center' }}>— Why CediMart</p>
          <h2 className="section-h2">Built specifically<br /><span style={{ color: '#DC2626' }}>for campus life.</span></h2>
          <p className="section-sub" style={{ margin: '0 auto', textAlign: 'center' }}>Not a clone of Jumia. Not a WhatsApp group. A marketplace designed from the ground up for how students buy and sell.</p>
        </div>
        <div className="why-grid">
          {WHY_ITEMS.map((item, i) => (
            <div key={i} className={`why-card reveal ${reveal ? 'shown' : ''}`} style={{ '--wc': item.color, '--wb': item.color + '12', transitionDelay: `${i * 60}ms` }}>
              <div className="why-icon">{item.icon}</div>
              <div className="why-title">{item.title}</div>
              <div className="why-desc">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}