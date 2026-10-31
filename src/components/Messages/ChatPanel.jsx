// src/components/Messages/ChatPanel.jsx
'use client';

import { useState, useEffect, useRef, useLayoutEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Send, Loader2, MessageCircle, ChevronDown, X } from 'lucide-react';
import { useChat } from '@/context/ChatContext';
import ReportModal from '@/components/Feed/ReportModal';
import '@/app/feed/feed.css'; // the report modal's styles live here
import Avatar from './Avatar';
import MessageBubble, { OfferCard, SystemMessage } from './MessageBubble';
import {
  idOf, getOtherParty, getFirstName, getProductName, dayKey, dayLabel,
} from './messageUtils';

const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;
const MAX_LEN = 500;
const EMPTY = [];

export default function ChatPanel({ conversation, userId, onBack }) {
  const {
    activeConversation, messages, messagesLoading, hasMoreMessages, loadMessages,
    sendMessage, discardMessage, typingUsers, emitTyping, emitStopTyping,
  } = useChat();

  const convId = conversation._id;
  const otherParty = getOtherParty(conversation, userId);
  const product = conversation.product;
  const hasProduct = !!(product && (product.name || product.title));

  // The context may still hold the previous chat's messages for a frame
  // while it switches; only show them once it's on THIS conversation.
  const ready = activeConversation?._id === convId;
  const list = ready ? messages : EMPTY;
  const isTyping = Object.keys(typingUsers).length > 0;

  const [text, setText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [reportMsg, setReportMsg] = useState(null);
  const [reported, setReported] = useState(() => new Set());
  const [showJump, setShowJump] = useState(false);
  const [toast, setToast] = useState('');

  const listRef = useRef(null);
  const inputRef = useRef(null);
  const stickRef = useRef(true);       // is the view pinned to the newest message?
  const prependRef = useRef(null);     // scrollHeight before older messages were loaded
  const firstIdRef = useRef(null);
  const typingAtRef = useRef(0);
  const typingTimerRef = useRef(null);
  const toastTimerRef = useRef(null);

  const notify = useCallback((msg) => {
    clearTimeout(toastTimerRef.current);
    setToast(msg);
    toastTimerRef.current = setTimeout(() => setToast(''), 2600);
  }, []);

  useEffect(() => () => {
    clearTimeout(typingTimerRef.current);
    clearTimeout(toastTimerRef.current);
  }, []);

  // Focus the box on desktop only (focusing on phones pops the keyboard open)
  useEffect(() => {
    if (window.matchMedia?.('(hover: hover)').matches) inputRef.current?.focus();
  }, []);

  // ── Scrolling ───────────────────────────────────────────────────────────
  useIsoLayoutEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const first = list[0]?._id;
    const last = list[list.length - 1];

    if (prependRef.current != null && first !== firstIdRef.current) {
      // Older messages were added above: keep the viewport anchored
      el.scrollTop = el.scrollHeight - prependRef.current;
      prependRef.current = null;
    } else if (stickRef.current || (last?._optimistic && idOf(last.sender) === userId)) {
      el.scrollTop = el.scrollHeight;
    }
    firstIdRef.current = first;
  }, [list, userId]);

  // Typing row / reply bar change the list's height — stay pinned if we were
  useEffect(() => {
    const el = listRef.current;
    if (el && stickRef.current) el.scrollTop = el.scrollHeight;
  }, [isTyping, replyingTo]);

  // If the first page doesn't fill the screen, there's nothing to scroll — load more
  useEffect(() => {
    const el = listRef.current;
    if (!el || !ready || !hasMoreMessages || messagesLoading || list.length === 0) return;
    if (el.scrollHeight <= el.clientHeight + 4) {
      prependRef.current = el.scrollHeight;
      loadMessages(convId);
    }
  }, [ready, hasMoreMessages, messagesLoading, list.length, convId, loadMessages]);

  const handleScroll = () => {
    const el = listRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    stickRef.current = nearBottom;
    setShowJump(!nearBottom);
    if (el.scrollTop < 80 && ready && hasMoreMessages && !messagesLoading && list.length > 0) {
      prependRef.current = el.scrollHeight;
      loadMessages(convId);
    }
  };

  const jumpToBottom = () => {
    const el = listRef.current;
    if (!el) return;
    stickRef.current = true;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  };

  // ── Composer ────────────────────────────────────────────────────────────
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [text]);

  const handleChange = (e) => {
    const value = e.target.value;
    setText(value);
    const now = Date.now();
    if (value.trim() && now - typingAtRef.current > 1500) {
      emitTyping(convId);
      typingAtRef.current = now;
    }
    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      emitStopTyping(convId);
      typingAtRef.current = 0;
    }, 1500);
  };

  const handleSend = async () => {
    const value = text.trim();
    if (!value || !ready) return;
    const replyId = replyingTo?._id;
    setText('');
    setReplyingTo(null);
    clearTimeout(typingTimerRef.current);
    typingAtRef.current = 0;
    emitStopTyping(convId);
    stickRef.current = true;
    try {
      await sendMessage(convId, value, replyId);
    } catch {
      setText(value);
      notify('Couldn’t send your message. Please try again.');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape' && replyingTo) { setReplyingTo(null); return; }
    const coarse = window.matchMedia?.('(pointer: coarse)').matches; // phones: Enter = new line
    if (e.key === 'Enter' && !e.shiftKey && !coarse && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Message actions ─────────────────────────────────────────────────────
  const handleReply = (m) => { setReplyingTo(m); inputRef.current?.focus(); };

  const handleCopy = async (m) => {
    try { await navigator.clipboard.writeText(m.text); notify('Message copied'); }
    catch { notify('Couldn’t copy the message'); }
  };

  const handleRetry = async (m) => {
    discardMessage(m._id);
    try { await sendMessage(convId, m.text, m.replyTo?._id); }
    catch { notify('Still couldn’t send. Check your connection.'); }
  };

  // ── Rows (day separators + grouping) ────────────────────────────────────
  const rows = useMemo(() => {
    const out = [];
    list.forEach((m, i) => {
      const prev = list[i - 1];
      const next = list[i + 1];
      const newDay = !prev || dayKey(prev.createdAt) !== dayKey(m.createdAt);
      if (newDay) out.push({ kind: 'day', key: `day-${m._id}`, label: dayLabel(m.createdAt) });
      const joinsPrev = !!prev && !newDay && idOf(prev.sender) === idOf(m.sender) && prev.type === m.type;
      const joinsNext =
        !!next && dayKey(next.createdAt) === dayKey(m.createdAt) &&
        idOf(next.sender) === idOf(m.sender) && next.type === m.type;
      out.push({ kind: 'msg', key: m._id, m, first: !joinsPrev, last: !joinsNext });
    });
    return out;
  }, [list]);

  const initialLoad = !ready || (messagesLoading && list.length === 0);
  const productHref = product?._id ? `/product/${product._id}` : null;

  return (
    <div className="ms-chat">
      {/* Header */}
      <header className="ms-chat-head">
        <button type="button" className="ms-back" onClick={onBack} aria-label="Back to messages">
          <ArrowLeft size={20} />
        </button>

        {hasProduct && product.images?.[0] ? (
          productHref ? (
            <Link href={productHref}><img className="ms-chat-thumb" src={product.images[0]} alt="" /></Link>
          ) : (
            <img className="ms-chat-thumb" src={product.images[0]} alt="" />
          )
        ) : (
          <Avatar party={otherParty} size={44} />
        )}

        <div className="ms-chat-info">
          <h2 className="ms-chat-name">{getFirstName(otherParty)}</h2>
          {productHref ? (
            <Link href={productHref} className="ms-chat-sub">{getProductName(product)}</Link>
          ) : (
            <span className="ms-chat-sub">{hasProduct ? getProductName(product) : 'Direct Message'}</span>
          )}
        </div>

        {hasProduct && product.price != null && (
          <span className="ms-tag">GH₵ {Number(product.price).toLocaleString()}</span>
        )}
        {hasProduct && product.negotiable && <span className="ms-tag ms-tag-nego">Nego</span>}
      </header>

      {/* Messages */}
      <div className="ms-scroll-wrap">
        <div className="ms-scroll" ref={listRef} onScroll={handleScroll}>
          {initialLoad ? (
            <div className="ms-chat-skel" aria-hidden="true">
              {[[false, 200], [false, 140], [true, 160], [false, 220], [true, 100], [true, 180]].map(([me, w], i) => (
                <div key={i} className={`ms-skel-row${me ? ' is-me' : ''}`}>
                  <span className="ms-skel" style={{ width: w, height: 40, borderRadius: 18 }} />
                </div>
              ))}
            </div>
          ) : (
            <>
              {messagesLoading && list.length > 0 && (
                <div className="ms-older"><Loader2 size={18} className="ms-spin" /></div>
              )}

              {list.length === 0 && (
                <div className="ms-chat-empty">
                  <div className="ms-pane-icon"><MessageCircle size={34} strokeWidth={1.6} /></div>
                  <h3>Start the conversation</h3>
                  <p>Say hi! Ask about the product or make an offer.</p>
                </div>
              )}

              {rows.map((r) => {
                if (r.kind === 'day') {
                  return <div key={r.key} className="ms-day"><span>{r.label}</span></div>;
                }
                const m = r.m;
                const isMe = idOf(m.sender) === userId;
                if (m.type === 'system') return <SystemMessage key={r.key} text={m.text} />;
                if (m.type === 'offer_link') {
                  const offerId = m.offerMeta?.offerId;
                  return (
                    <OfferCard
                      key={r.key}
                      message={m}
                      isMe={isMe}
                      href={offerId ? `/offers/${offerId}` : null}
                    />
                  );
                }
                return (
                  <MessageBubble
                    key={r.key}
                    message={m}
                    isMe={isMe}
                    showAvatar={!isMe && r.first}
                    otherParty={otherParty}
                    currentUserId={userId}
                    isFirst={r.first}
                    isLast={r.last}
                    isReported={reported.has(m._id)}
                    onReply={handleReply}
                    onCopy={handleCopy}
                    onReport={setReportMsg}
                    onRetry={handleRetry}
                    onDiscard={(msg) => discardMessage(msg._id)}
                  />
                );
              })}
            </>
          )}
        </div>

        {showJump && (
          <button type="button" className="ms-jump" onClick={jumpToBottom} aria-label="Jump to latest message">
            <ChevronDown size={20} />
          </button>
        )}
      </div>

      {isTyping && (
        <div className="ms-typing" aria-live="polite">
          <span className="ms-dots"><i /><i /><i /></span>
          {getFirstName(otherParty)} is typing
        </div>
      )}

      {replyingTo && (
        <div className="ms-reply">
          <span className="ms-reply-bar" />
          <div className="ms-reply-body">
            <span className="ms-reply-name">
              Replying to {idOf(replyingTo.sender) === userId ? 'yourself' : replyingTo.sender?.firstName || getFirstName(otherParty)}
            </span>
            <span className="ms-reply-text">{replyingTo.text}</span>
          </div>
          <button type="button" onClick={() => setReplyingTo(null)} aria-label="Cancel reply"><X size={16} /></button>
        </div>
      )}

      {/* Composer */}
      <div className="ms-composer">
        <div className="ms-input-wrap">
          <textarea
            ref={inputRef}
            className="ms-input"
            rows={1}
            maxLength={MAX_LEN}
            placeholder={replyingTo ? 'Type a reply…' : 'Type a message…'}
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            aria-label="Message"
          />
          {text.length > MAX_LEN - 100 && <span className="ms-count">{text.length}/{MAX_LEN}</span>}
        </div>
        <button type="button" className="ms-send" onClick={handleSend} disabled={!text.trim() || !ready} aria-label="Send message">
          <Send size={18} />
        </button>
      </div>

      {toast && <div className="ms-toast" role="status">{toast}</div>}

      <ReportModal
        open={!!reportMsg}
        contentType="ChatMessage"
        contentId={reportMsg?._id}
        onSubmitted={() => reportMsg && setReported((prev) => new Set(prev).add(reportMsg._id))}
        onClose={() => setReportMsg(null)}
      />
    </div>
  );
}