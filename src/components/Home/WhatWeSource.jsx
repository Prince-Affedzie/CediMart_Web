// src/components/Home/WhatWeSource.jsx
import { Leaf, ShoppingBasket, PlusCircle } from 'lucide-react';

const SOURCE_GROUPS = [
  {
    Icon: Leaf,
    title: 'Fresh produce',
    subtitle: 'Sourced from partnered farms',
    items: ['Tomatoes', 'Onions', 'Pepper', 'Plantain', 'Yam', 'Cassava', 'Cabbage', 'Carrots', 'Garden eggs', 'Okro'],
  },
  {
    Icon: ShoppingBasket,
    title: 'Staples & dry goods',
    subtitle: 'From trusted suppliers',
    items: ['Rice', 'Beans', 'Flour', 'Sugar', 'Cooking oil', 'Spaghetti', 'Canned tomatoes', 'Eggs', 'Sachet water'],
  },
];

export default function WhatWeSource({ reveal, sectionRef }) {
  return (
    <section className="section source-section" ref={sectionRef}>
      <div className={`section-inner reveal ${reveal ? 'shown' : ''}`}>
        <div className="source-head">
          <span className="section-eyebrow" style={{ '--ec': 'var(--accent)' }}>
            What we source
          </span>
          <h2 className="section-h2">The everyday staples your kitchen runs on</h2>
          <p className="section-sub">
            We start with the items food businesses reorder every week — sourced
            from our partnered farms and trusted supplier network.
          </p>
        </div>

        <div className="source-grid">
          {SOURCE_GROUPS.map((g) => (
            <div className="source-card" key={g.title}>
              <div className="source-card-head">
                <div className="source-icon"><g.Icon size={22} strokeWidth={2} /></div>
                <div>
                  <h3 className="source-title">{g.title}</h3>
                  <p className="source-subtitle">{g.subtitle}</p>
                </div>
              </div>
              <div className="source-items">
                {g.items.map((item) => (
                  <span className="source-item" key={item}>{item}</span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="source-escape">
          <PlusCircle size={18} strokeWidth={2} />
          <span>
            Need something outside this list? <strong>Add it to your order</strong> —
            if it's something our network can source, we'll quote it alongside
            everything else.
          </span>
        </div>
      </div>
    </section>
  );
}