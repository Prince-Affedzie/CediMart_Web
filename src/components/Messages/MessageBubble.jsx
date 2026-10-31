// src/components/Messages/MessageBubble.jsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Reply, Copy, Flag, Check, CheckCheck, Loader2, Banknote, Info, RotateCw, Trash2 } from 'lucide-react';
import Avatar from './Avatar';
import { idOf, getFirstName, formatClock } from './messageUtils';

// Real messages carry `replyPreview`; the optimistic copy only has `replyTo`.
const getReplyData = (message) => {
  const p = message.replyPreview;
  if (p && (p.text || p.message)) return p;
  if (message._optimistic && message.replyTo?.text && message.replyTo.text !== '…') {
    return { text: message.replyTo.text, senderId: idOf(message.replyTo.sender) };
  }
  return null;
};

export default function MessageBubble({
  message, isMe, showAvatar, otherParty, currentUserId,
  isFirst, isLast, isReported,
  onReply, onCopy, onReport, onRetry, onDiscard,
}) {
  const [open, setOpen] = useState(false); // tap-to-reveal actions on touch devices
  const replyData = getReplyData(message);
  const isRead = !!message.readAt;
  const failed = !!message._failed;
  const canAct = !message._optimistic && !failed;

  const replyName = !replyData
    ? ''
    : replyData.senderId === currentUserId
      ? 'You'
      : replyData.senderId === idOf(otherParty)
        ? getFirstName(otherParty)
        : 'User';

  return (
    <div
      className={
        `ms-msg ${isMe ? 'is-me' : 'is-them'}` +
        `${isFirst ? ' is-first' : ''}${isLast ? ' is-last' : ''}` +
        `${open ? ' is-open' : ''}${failed ? ' is-failed' : ''}`
      }
    >
      {!isMe && (
        <div className="ms-msg-avatar">{showAvatar && <Avatar party={otherParty} size={28} />}</div>
      )}

      <div className="ms-msg-main">
        <div className="ms-bubble-wrap">
          <div className="ms-bubble" onClick={() => setOpen((o) => !o)}>
            {replyData && (
              <div className="ms-quote">
                <span className="ms-quote-bar" />
                <span className="ms-quote-body">
                  <span className="ms-quote-name">{replyName}</span>
                  <span className="ms-quote-text">{replyData.text || replyData.message || 'Message'}</span>
                </span>
                {replyData.image && <img src={replyData.image} alt="" className="ms-quote-img" />}
              </div>
            )}

            <p className="ms-text">{message.text}</p>

            <span className="ms-meta">
              <time dateTime={message.createdAt}>{formatClock(message.createdAt)}</time>
              {isMe && (
                message._optimistic && !failed ? (
                  <Loader2 size={12} className="ms-spin" aria-label="Sending" />
                ) : isRead ? (
                  <CheckCheck size={14} className="is-read" aria-label="Read" />
                ) : (
                  <Check size={14} aria-label="Sent" />
                )
              )}
              {isReported && (
                <span className="ms-reported"><Flag size={8} /> Reported</span>
              )}
            </span>
          </div>

          {canAct && (
            <div className="ms-actions" role="toolbar" aria-label="Message actions">
              <button type="button" onClick={() => onReply(message)} aria-label="Reply" title="Reply"><Reply size={16} /></button>
              <button type="button" onClick={() => onCopy(message)} aria-label="Copy" title="Copy"><Copy size={15} /></button>
              {!isMe && (
                <button type="button" className="is-danger" onClick={() => onReport(message)} aria-label="Report" title="Report">
                  <Flag size={15} />
                </button>
              )}
            </div>
          )}
        </div>

        {failed && (
          <div className="ms-failed" role="alert">
            <span>Not sent</span>
            <button type="button" onClick={() => onRetry(message)}><RotateCw size={12} /> Retry</button>
            <button type="button" onClick={() => onDiscard(message)}><Trash2 size={12} /> Delete</button>
          </div>
        )}
      </div>
    </div>
  );
}

export function OfferCard({ message, isMe, href }) {
  const meta = message.offerMeta || {};
  const status = meta.offerStatus;
  const body = (
    <>
      <span className="ms-offer-head"><Banknote size={16} /> Offer</span>
      <strong className="ms-offer-price">GH₵ {meta.offerPrice?.toLocaleString()}</strong>
      {status && <span className={`ms-offer-status is-${status}`}>{status.toUpperCase()}</span>}
      {href && <span className="ms-offer-tap">View details →</span>}
    </>
  );
  return (
    <div className={`ms-msg is-first is-last ${isMe ? 'is-me' : 'is-them'}`}>
      {href ? (
        <Link href={href} className={`ms-offer${isMe ? ' is-me' : ''}`}>{body}</Link>
      ) : (
        <div className={`ms-offer${isMe ? ' is-me' : ''}`}>{body}</div>
      )}
    </div>
  );
}

export function SystemMessage({ text }) {
  return (
    <div className="ms-system">
      <span><Info size={14} /> {text}</span>
    </div>
  );
}