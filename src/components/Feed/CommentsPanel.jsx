// src/components/Feed/CommentsPanel.jsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Send, MessageCircle, Loader2, CornerUpLeft, Pencil } from 'lucide-react';
import {
  getComments, addComment, toggleCommentLike, updateComment,
  deleteComment, reportComment, getReplies,
} from '@/apis/feedApi';
import { getTimeAgo, fullName } from './feedUtils';

const REPORT_REASONS = [
  ['spam', 'Spam'],
  ['harassment', 'Harassment'],
  ['inappropriate', 'Inappropriate'],
];

const authorOf = (user) => ({
  _id: user?._id,
  firstName: user?.firstName,
  lastName: user?.lastName,
  profileImage: user?.profileImage,
});

function Avatar({ author, small }) {
  return (
    <div className={`fd-cm-avatar${small ? ' is-small' : ''}`}>
      {author?.profileImage ? (
        <img src={author.profileImage} alt="" />
      ) : (
        <span>{(author?.firstName || '?').charAt(0).toUpperCase()}</span>
      )}
    </div>
  );
}

export default function CommentsPanel({ open, onClose, postId, user, onCountChange }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [editing, setEditing] = useState(null);
  const [likingId, setLikingId] = useState(null);
  const [reportTarget, setReportTarget] = useState(null);
  const [notice, setNotice] = useState('');
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const noticeTimer = useRef(null);

  const isMine = (c) => (c.author?._id || c.author) === user?._id;

  const flash = (msg) => {
    clearTimeout(noticeTimer.current);
    setNotice(msg);
    noticeTimer.current = setTimeout(() => setNotice(''), 3000);
  };
  useEffect(() => () => clearTimeout(noticeTimer.current), []);

  // Load on open
  useEffect(() => {
    if (!open || !postId) return;
    let alive = true;
    setLoading(true);
    setLoadError(false);
    setComments([]);
    setText('');
    setReplyingTo(null);
    setEditing(null);
    setReportTarget(null);
    getComments(postId, { page: 1, limit: 20, sort: 'newest' })
      .then((res) => { if (alive) setComments(res.data?.data?.comments || []); })
      .catch(() => { if (alive) setLoadError(true); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [open, postId]);

  // Escape closes
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // ── Helpers that work on both comments and replies ───────────────────────
  const patchComment = (id, fn) =>
    setComments((prev) =>
      prev.map((c) => {
        if (c._id === id) return fn(c);
        if (c.replies?.some((r) => r._id === id)) {
          return { ...c, replies: c.replies.map((r) => (r._id === id ? fn(r) : r)) };
        }
        return c;
      })
    );

  const removeComment = (id) =>
    setComments((prev) =>
      prev
        .filter((c) => c._id !== id)
        .map((c) =>
          c.replies?.some((r) => r._id === id)
            ? { ...c, replies: c.replies.filter((r) => r._id !== id), replyCount: Math.max(0, (c.replyCount || 1) - 1) }
            : c
        )
    );

  // ── Actions ──────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    const value = text.trim();
    if (!value || submitting) return;
    setSubmitting(true);
    try {
      if (editing) {
        const res = await updateComment(editing._id, value);
        const updated = res.data?.data;
        patchComment(editing._id, (c) => ({ ...c, ...(updated || { text: value }), author: c.author }));
        setEditing(null);
      } else if (replyingTo) {
        const res = await addComment(postId, value, replyingTo._id);
        const reply = res.data?.data;
        if (reply) {
          setComments((prev) =>
            prev.map((c) =>
              c._id === replyingTo._id
                ? { ...c, replyCount: (c.replyCount || 0) + 1, replies: [...(c.replies || []), { ...reply, author: authorOf(user) }] }
                : c
            )
          );
          onCountChange?.(1);
        }
        setReplyingTo(null);
      } else {
        const res = await addComment(postId, value);
        const created = res.data?.data;
        if (created) {
          setComments((prev) => [{ ...created, author: authorOf(user) }, ...prev]);
          onCountChange?.(1);
          listRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
      setText('');
    } catch {
      flash('Failed to submit comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const startReply = (c) => { setReplyingTo(c); setEditing(null); setText(''); inputRef.current?.focus(); };
  const startEdit = (c) => { setEditing(c); setReplyingTo(null); setText(c.text); inputRef.current?.focus(); };
  const cancelCompose = () => { setReplyingTo(null); setEditing(null); setText(''); };

  const handleDelete = async (c) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await deleteComment(c._id);
      removeComment(c._id);
      onCountChange?.(-1);
    } catch {
      flash('Failed to delete comment.');
    }
  };

  const handleLike = async (c) => {
    if (likingId === c._id) return;
    setLikingId(c._id);
    try {
      const res = await toggleCommentLike(c._id);
      const { isLiked, likeCount } = res.data?.data || {};
      patchComment(c._id, (x) => ({ ...x, isLiked, likeCount }));
    } catch {
      flash('Couldn’t update like.');
    } finally {
      setLikingId(null);
    }
  };

  const handleLoadReplies = async (c) => {
    try {
      const res = await getReplies(c._id, { page: 1, limit: 10 });
      patchComment(c._id, (x) => ({ ...x, replies: res.data?.data?.replies || [] }));
    } catch {
      flash('Couldn’t load replies.');
    }
  };

  const submitReport = async (reason) => {
    const target = reportTarget;
    setReportTarget(null);
    try {
      await reportComment(target._id, reason);
      flash('Thanks — we’ll review this comment.');
    } catch {
      flash('Failed to report comment.');
    }
  };

  // ── Rendering ────────────────────────────────────────────────────────────
  const renderMeta = (c, isReply) => (
    <div className="fd-cm-meta">
      <span>{getTimeAgo(c.createdAt)}</span>
      {!isReply && (
        <>
          <button type="button" className={c.isLiked ? 'is-on' : ''} onClick={() => handleLike(c)} disabled={likingId === c._id}>
            {c.isLiked ? 'Liked' : 'Like'}
          </button>
          <button type="button" onClick={() => startReply(c)}>Reply</button>
          {c.likeCount > 0 && <span>{c.likeCount} {c.likeCount === 1 ? 'like' : 'likes'}</span>}
        </>
      )}
      {isMine(c) ? (
        <>
          <button type="button" onClick={() => startEdit(c)}>Edit</button>
          <button type="button" className="is-danger" onClick={() => handleDelete(c)}>Delete</button>
        </>
      ) : (
        <button type="button" onClick={() => setReportTarget(c)}>Report</button>
      )}
    </div>
  );

  const renderBubble = (c, isReply) => (
    <div className={`fd-cm-item${isReply ? ' is-reply' : ''}`} key={c._id}>
      <Avatar author={c.author} small={isReply} />
      <div className="fd-cm-body">
        <div className={`fd-cm-bubble${isReply ? ' is-reply' : ''}`}>
          <span className="fd-cm-name">{fullName(c.author) || 'Unknown'}</span>
          <p className="fd-cm-text">{c.text}</p>
          {c.isEdited && <span className="fd-cm-edited">edited</span>}
        </div>
        {renderMeta(c, isReply)}
      </div>
    </div>
  );

  if (!open) return null;

  return (
    <>
      <div className="fd-cm-backdrop" onClick={onClose} />
      <aside className="fd-cm" role="dialog" aria-modal="true" aria-label="Comments">
        <div className="fd-cm-head">
          <div className="fd-cm-handle" />
          <div className="fd-cm-title-row">
            <h2>Comments ({comments.length})</h2>
            <button type="button" className="fd-cm-close" onClick={onClose} aria-label="Close comments">
              <X size={20} />
            </button>
          </div>
        </div>

        {notice && <div className="fd-cm-notice" role="status">{notice}</div>}

        <div className="fd-cm-list" ref={listRef}>
          {loading ? (
            <div className="fd-cm-state"><Loader2 size={22} className="fd-spin" /></div>
          ) : loadError ? (
            <div className="fd-cm-state"><p>Couldn’t load comments.</p></div>
          ) : comments.length === 0 ? (
            <div className="fd-cm-state">
              <MessageCircle size={40} strokeWidth={1.5} />
              <strong>No comments yet</strong>
              <p>Be the first to comment</p>
            </div>
          ) : (
            comments.map((c) => {
              const replies = c.replies || [];
              const remaining = (c.replyCount || 0) - replies.length;
              return (
                <div key={c._id}>
                  {renderBubble(c, false)}
                  {replies.length > 0 && (
                    <div className="fd-cm-replies">{replies.map((r) => renderBubble(r, true))}</div>
                  )}
                  {remaining > 0 && (
                    <button type="button" className="fd-cm-more" onClick={() => handleLoadReplies(c)}>
                      View {remaining} more {remaining === 1 ? 'reply' : 'replies'}
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {(replyingTo || editing) && (
          <div className="fd-cm-compose-hint">
            {editing ? <Pencil size={14} /> : <CornerUpLeft size={14} />}
            <span>{editing ? 'Editing comment…' : `Replying to ${replyingTo.author?.firstName || 'User'}`}</span>
            <button type="button" onClick={cancelCompose} aria-label="Cancel"><X size={15} /></button>
          </div>
        )}

        <div className="fd-cm-compose">
          <textarea
            ref={inputRef}
            className="fd-cm-input"
            rows={1}
            maxLength={1000}
            placeholder={editing ? 'Edit your comment…' : replyingTo ? `Reply to ${replyingTo.author?.firstName || 'User'}…` : 'Add a comment…'}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
            }}
          />
          <button type="button" className="fd-cm-send" onClick={handleSubmit} disabled={!text.trim() || submitting} aria-label="Send">
            {submitting ? <Loader2 size={18} className="fd-spin" /> : <Send size={18} />}
          </button>
        </div>

        {reportTarget && (
          <div className="fd-cm-report">
            <p>Why are you reporting this comment?</p>
            {REPORT_REASONS.map(([key, label]) => (
              <button key={key} type="button" onClick={() => submitReport(key)}>{label}</button>
            ))}
            <button type="button" className="is-cancel" onClick={() => setReportTarget(null)}>Cancel</button>
          </div>
        )}
      </aside>
    </>
  );
}