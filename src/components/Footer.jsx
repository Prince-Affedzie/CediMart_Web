// src/components/Footer.jsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Footer() {
  const [currentYear, setCurrentYear] = useState('');

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    < div className='overflow-hidden'>
      <style>{`
        .footer { background: #13131E; border-top: 1px solid #27273A; padding: 60px clamp(20px,5vw,80px) 32px; }
        .footer-inner { max-width: 1280px; margin: 0 auto; }
        .footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 48px; margin-bottom: 48px; }
        @media(max-width:768px){ .footer-grid{grid-template-columns:1fr 1fr;} }
        .footer-brand-sub { font-size: 13px; color: #F1F0FF; line-height: 1.75; max-width: 260px; margin-top: 12px; }
        .footer-col-title { font-size: 10px; font-weight: 700; color: #F1F0FF; letter-spacing: .14em; text-transform: uppercase; margin-bottom: 18px; font-family: 'JetBrains Mono',monospace; }
        .footer-links { display: flex; flex-direction: column; gap: 12px; }
        .footer-link { font-size: 13.5px; color: #F1F0FF; text-decoration: none; transition: color .2s; }
        .footer-link:hover { color: #F1F0FF; }
        .footer-bottom { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; border-top: 1px solid #27273A; padding-top: 24px; }
        .footer-copy { font-size: 12px; color: #52525B; font-family: 'JetBrains Mono',monospace; }
        .footer-socials { display: flex; gap: 10px; }
        .footer-social { width: 32px; height: 32px; border-radius: 8px; background: #1C1C2E; border: 1px solid #27273A; display: flex; align-items: center; justify-content: center; font-size: 14px; text-decoration: none; transition: all .2s; }
        .footer-social:hover { border-color: #818CF8; background: rgba(99,102,241,0.12); }
        .nav-logo {
          display: flex; align-items: center; gap: 9px;
          text-decoration: none;
        }
        .nav-logo-mark {
          width: 32px; height: 32px; border-radius: 9px;
          background: linear-gradient(135deg, #6366F1, #818CF8);
          display: flex; align-items: center; justify-content: center;
          font-weight: 900; font-size: 16px; color: #fff;
        }
        .nav-logo-text { font-size: 17px; font-weight: 800; color: #F1F0FF; letter-spacing: -.3px; }
        .nav-logo-text span { color: #818CF8; }
      `}</style>
      
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-grid">
            <div>
              <Link href="/" className="nav-logo" style={{ marginBottom:0 }}>
                <div className="nav-logo-mark">C</div>
                <span className="nav-logo-text">Cedi<span>Mart</span></span>
              </Link>
              <p className="footer-brand-sub">Ghana's campus marketplace. Buy, sell, and discover from verified student sellers across the country.</p>
            </div>
            {[
              { title:'Product',  links:['Listings','Ask Cedi','For Sellers','Mobile App']   },
              { title:'Company',  links:['About','Blog','Careers','Press']                    },
              { title:'Support',  links:['Help Center','Contact','Safety','Community']        },
            ].map(col => (
              <div key={col.title}>
                <p className="footer-col-title">{col.title}</p>
                <div className="footer-links">
                  {col.links.map(l => <a key={l} href="#" className="footer-link">{l}</a>)}
                </div>
              </div>
            ))}
          </div>
          <div className="footer-bottom">
            <span className="footer-copy">
              {currentYear ? `© ${currentYear} CediMart · Made in Ghana 🇬🇭` : '© CediMart · Made in Ghana 🇬🇭'}
            </span>
            <div className="footer-socials">
              {['𝕏','📸','💼','▶'].map((icon, i) => (
                <a key={i} href="#" className="footer-social">{icon}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}