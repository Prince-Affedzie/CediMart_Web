
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getVendors } from '@/apis/vendorApi';
import './VendorSpotlight.css';

export default function VendorSpotlight({
  title = 'Shop from our sellers',
  subtitle = 'Explore stores and businesses on CediMart',
  limit = 6
}) {
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
      .catch(() => {
        if (!cancelled) setVendors([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [limit]);

  if (!loading && vendors.length === 0) return null;

  return (
    <section className="home-section vendor-spotlight" aria-label={title}>
      <div className="vendor-spotlight-head">
        <div className="vendor-spotlight-heading">
          <span className="vendor-spotlight-eyebrow">
            <span className="vendor-live-dot" />
            THE CEDIMART COMMUNITY
          </span>

          <h2 className="home-section-title">{title}</h2>

          {subtitle && (
            <p className="home-section-sub">{subtitle}</p>
          )}
        </div>

        <Link href="/vendors" className="vendor-see-all">
          View all sellers <span>→</span>
        </Link>
      </div>

      <div className="vendor-spotlight-track">
        {loading
          ? Array.from({ length: limit }).map((_, i) => (
              <div key={i} className="vendor-card vendor-card-skeleton">
                <div className="vendor-card-avatar skeleton-shimmer" />
                <div className="vendor-card-line skeleton-shimmer" />
                <div className="vendor-card-line short skeleton-shimmer" />
                <div className="vendor-card-button skeleton-shimmer" />
              </div>
            ))
          : vendors.map((v) => {
              const name = v.storeName || v.name || 'Vendor';
              const hasImg =
                v.profileImage && /^https?:/i.test(v.profileImage);

              return (
                <Link
                  key={v._id}
                  href={`/vendors/${v._id}`}
                  className="vendor-card"
                  title={`Visit ${name}`}
                >
                  <div className="vendor-card-avatar-wrap">
                    {hasImg ? (
                      <img
                        src={v.profileImage}
                        alt={`${name} store`}
                        className="vendor-card-avatar"
                        loading="lazy"
                      />
                    ) : (
                      <div className="vendor-card-avatar vendor-card-initial">
                        {name.charAt(0).toUpperCase()}
                      </div>
                    )}

                    {v.isVerified && (
                      <span
                        className="vendor-verified"
                        title="Verified seller"
                        aria-label="Verified seller"
                      >
                        ✓
                      </span>
                    )}
                  </div>

                  <div className="vendor-card-details">
                    <span className="vendor-card-name">{name}</span>

                    <span className="vendor-card-type">
                      {v.isVerified ? 'Verified seller' : 'CediMart seller'}
                    </span>
                  </div>

                  <span className="vendor-card-action">
                    Visit store <span>→</span>
                  </span>
                </Link>
              );
            })}
      </div>
    </section>
  );
}
