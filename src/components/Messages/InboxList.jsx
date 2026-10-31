// src/components/Messages/InboxList.jsx
'use client';

import { useMemo, useState, useEffect } from 'react';
import { Search, X, RefreshCw, MessageCircle, Tag, ShieldCheck } from 'lucide-react';
import Avatar from './Avatar';
import { getOtherParty, getDisplayName, getProductName, formatInboxTime } from './messageUtils';

const NOTICE_KEY = 'cedimart:inbox-notice-dismissed';

export default function InboxList({ inbox, loading, userId, activeId, onSelect, onRefresh }) {
  const [query, setQuery] = useState('');
  const [showNotice, setShowNotice] = useState(false);

  useEffect(() => {
    try { setShowNotice(localStorage.getItem(NOTICE_KEY) !== '1'); } catch { setShowNotice(true); }
  }, []);

  const dismissNotice = () => {
    setShowNotice(false);
    try { localStorage.setItem(NOTICE_KEY, '1'); } catch {}
  };

  const totalUnread = useMemo(() => inbox.reduce((s, c) => s + (c.myUnread || 0), 0), [inbox]);

  // Instant, local filter — no round trip needed for this
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return inbox;
    return inbox.filter((conv) => {
      const other = getOtherParty(conv, userId);
      return (
        getDisplayName(other).toLowerCase().includes(q) ||
        getProductName(conv.product).toLowerCase().includes(q) ||
        (conv.lastMessage?.text || '').toLowerCase().includes(q)
      );
    });
  }, [inbox, query, userId]);

  const showSkeleton = loading && inbox.length === 0;

  return (
    <div className="ms-ib">
      <div className="ms-ib-head">
        <div>
          <h1 className="ms-ib-title">Messages</h1>
          <p className="ms-ib-sub">
            {totalUnread > 0 ? `${totalUnread} unread message${totalUnread !== 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        <button type="button" className="ms-icon-btn" onClick={onRefresh} disabled={loading} aria-label="Refresh messages" title="Refresh">
          <RefreshCw size={18} className={loading ? 'ms-spin' : ''} />
        </button>
      </div>

      {inbox.length > 0 && (
        <label className="ms-search">
          <Search size={16} />
          <input
            type="search"
            placeholder="Search conversations, products…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search conversations"
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} aria-label="Clear search"><X size={15} /></button>
          )}
        </label>
      )}

      {showNotice && (
        <div className="ms-notice" role="note">
          <ShieldCheck size={16} />
          <p>
            <strong>Transact safely. </strong>
            Never move payments or deals off CediMart. Off-platform transactions are unprotected and may lead to account suspension.
          </p>
          <button type="button" onClick={dismissNotice} aria-label="Dismiss notice"><X size={15} /></button>
        </div>
      )}

      <div className="ms-ib-scroll">
        {showSkeleton ? (
          [0, 1, 2, 3, 4].map((i) => (
            <div className="ms-row ms-row-skel" key={i} aria-hidden="true">
              <span className="ms-skel" style={{ width: 52, height: 52, borderRadius: '50%' }} />
              <div className="ms-row-body">
                <span className="ms-skel" style={{ width: '45%', height: 13, borderRadius: 6, marginBottom: 8 }} />
                <span className="ms-skel" style={{ width: '70%', height: 12, borderRadius: 6 }} />
              </div>
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="ms-empty">
            <div className="ms-pane-icon">
              {query ? <Search size={30} strokeWidth={1.6} /> : <MessageCircle size={30} strokeWidth={1.6} />}
            </div>
            <h2>{query ? 'No matches' : 'No conversations yet'}</h2>
            <p>
              {query
                ? `Nothing found for “${query}”. Try a different name or product.`
                : 'When you message a seller or negotiate on a product, it will show up here.'}
            </p>
          </div>
        ) : (
          <ul className="ms-ib-list">
            {filtered.map((conv) => {
              const other = getOtherParty(conv, userId);
              const unread = conv.myUnread ?? 0;
              const hasUnread = unread > 0;
              const preview = conv.lastMessage?.text ?? 'No messages yet';
              const time = formatInboxTime(conv.lastMessage?.createdAt || conv.createdAt);
              return (
                <li key={conv._id}>
                  <button
                    type="button"
                    className={`ms-row${conv._id === activeId ? ' is-active' : ''}${hasUnread ? ' is-unread' : ''}`}
                    onClick={() => onSelect(conv)}
                    aria-current={conv._id === activeId ? 'true' : undefined}
                  >
                    <Avatar party={other} size={52} ring={hasUnread} />
                    <span className="ms-row-body">
                      <span className="ms-row-top">
                        <span className="ms-row-name">{getDisplayName(other)}</span>
                        <span className="ms-row-time">{time}</span>
                      </span>
                      <span className="ms-row-tag">
                        <Tag size={9} />
                        <span>{getProductName(conv.product)}</span>
                      </span>
                      <span className="ms-row-bottom">
                        <span className="ms-row-preview">{preview}</span>
                        {hasUnread && <span className="ms-badge">{unread > 99 ? '99+' : unread}</span>}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}