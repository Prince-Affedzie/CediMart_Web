// src/components/Home/SourcingStory.jsx
import Image from 'next/image';
import { Sprout, Handshake, MapPinned, BadgeCheck } from 'lucide-react';
import FarmPhoto from '@/assets/cedimartlandingpage_img_1.png';
// TODO: replace with a real photo — a partner farm, a farmer
// handing over crates, or a loading scene. This is the single most
// valuable image on the page for building trust.

const PILLARS = [
  {
    Icon: Sprout,
    title: 'Partnered farms',
    desc: 'Fresh produce sourced directly from farms we work with — not bought blindly off a wholesale floor.',
  },
  {
    Icon: Handshake,
    title: 'Trusted supplier network',
    desc: 'Staples and dry goods come from established suppliers we have vetted and buy from repeatedly.',
  },
  {
    Icon: BadgeCheck,
    title: 'Checked before it moves',
    desc: 'Every item is inspected for quantity, quality, and condition before it leaves for your kitchen.',
  },
  {
    Icon: MapPinned,
    title: 'Coordinated, not scattered',
    desc: 'Instead of five pickups from five places, we consolidate everything into one delivery.',
  },
];

export default function SourcingStory({ reveal, sectionRef }) {
  return (
    <section className="section sourcing-section" ref={sectionRef}>
      <div className={`section-inner reveal ${reveal ? 'shown' : ''}`}>
        <div className="sourcing-split">
          {/* Left: editorial copy */}
          <div className="sourcing-copy">
            <span className="section-eyebrow" style={{ '--ec': 'var(--brand)' }}>
              Where your food comes from
            </span>
            <h2 className="section-h2">
              Sourced from trusted partnered farms.<br />
              Delivered to kitchens we serve.
            </h2>
            <p className="section-sub">
              CediMart isn't a middleman reselling whatever's on the market floor.
              We've built a working network of partnered farms and trusted
              suppliers across Ghana — and we coordinate your entire order
              through it, so you get consistent quality without the legwork.
            </p>

            <ul className="sourcing-pillars">
              {PILLARS.map(({ Icon, title, desc }) => (
                <li className="sourcing-pillar" key={title}>
                  <span className="sourcing-pillar-icon">
                    <Icon size={18} strokeWidth={2} />
                  </span>
                  <div>
                    <h3 className="sourcing-pillar-title">{title}</h3>
                    <p className="sourcing-pillar-desc">{desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: image */}
          <div className="sourcing-media">
            <Image
              src={FarmPhoto}
              alt="A CediMart partner farm supplying fresh produce"
              fill
              sizes="(max-width: 900px) 100vw, 45vw"
              className="sourcing-media-img"
            />
            <div className="sourcing-media-caption">
              <span className="sourcing-media-dot" />
              Partnered farm · Ghana
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}