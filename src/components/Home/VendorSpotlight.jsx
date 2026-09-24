// src/components/Home/VendorSpotlight.jsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getVendors } from '@/apis/vendorApi';

export default function VendorSpotlight({ title = 'Featured vendors', subtitle, limit = 6 }) {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getVendors({ page: 1, limit })
      .then((res) => {
        if (cancelled) return;
        const list = res?.data?.data || [];
        setVendors(list.slice(0, limit));
      })
      .catch(() => { if (!cancelled) setVendors([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [limit]);

  if (!loading && vendors.length === 0) return null;

  return (
    <section className="home-section" aria-label={title}>
      <div className="home-section-head">
        <div>
          <h2 className="home-section-title">{title}</h2>
          {subtitle && <p className="home-section-sub">{subtitle}</p>}
        </div>
        <Link href="/vendors" className="home-section-link">View all →</Link>
      </div>

      {loading ? (
        <div className="vendor-row">
          {Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="vendor-bubble-skeleton" />
          ))}
        </div>
      ) : (
        <div className="vendor-row">
          {vendors.map((v) => {
            const name = v.storeName || v.name || 'Vendor';
            const hasImg = v.profileImage && /^https?:/i.test(v.profileImage);
            return (
              <Link key={v._id} href={`/vendors/${v._id}`} className="vendor-bubble">
                <div className="vendor-bubble-img-wrap">
                  {hasImg ? (
                    <img src={v.profileImage} alt="" className="vendor-bubble-img" loading="lazy" />
                  ) : (
                    <div className="vendor-bubble-initial">{name.charAt(0).toUpperCase()}</div>
                  )}
                  {v.isVerified && <span className="vendor-bubble-check" aria-label="Verified">✓</span>}
                </div>
                <span className="vendor-bubble-label">{name}</span>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}