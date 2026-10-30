// src/components/Feed/ReportModal.jsx
'use client';

import { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';
import { reportApi } from '@/apis/reportApi';

const REASONS = [
  { key: 'spam', label: 'Spam', desc: 'Repetitive, misleading, or unwanted content' },
  { key: 'harassment', label: 'Harassment or bullying', desc: 'Targeting or abusing someone' },
  { key: 'hate_speech', label: 'Hate speech', desc: 'Attacks based on identity or group' },
  { key: 'violence', label: 'Violence', desc: 'Threats or graphic violent content' },
  { key: 'sexual_content', label: 'Sexual content', desc: 'Nudity or sexually explicit material' },
  { key: 'scam_fraud', label: 'Scam or fraud', desc: 'Attempting to deceive for money or info' },
  { key: 'misinformation', label: 'Misinformation', desc: 'False or misleading claims' },
  { key: 'self_harm', label: 'Self-harm', desc: 'Content promoting self-harm or suicide' },
  { key: 'other', label: 'Something else', desc: 'Doesn’t fit the categories above' },
];

export default function ReportModal({ open, onClose, contentType, contentId }) {
  const [reason, setReason] = useState(null);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null); // { ok, message }

  useEffect(() => {
    if (open) { setReason(null); setDescription(''); setResult(null); setSubmitting(false); }
  }, [open, contentId]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape' && !submitting) onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, submitting, onClose]);

  if (!open) return null;

  const submit = async () => {
    if (!reason) return;
    setSubmitting(true);
    try {
      const res = await reportApi.submitReport({
        contentType,
        contentId,
        reason,
        description: description.trim() || undefined,
      });
      if (res.data?.success) {
        setResult({ ok: true, message: res.data?.message || 'Thanks — our team will review it.' });
      } else {
        setResult({ ok: false, message: res.data?.message || 'Failed to submit report' });
      }
    } catch (err) {
      setResult({
        ok: false,
        message: err?.response?.status === 409
          ? err?.response?.data?.message || 'You’ve already reported this.'
          : err?.response?.data?.message || err.message || 'Something went wrong',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fd-rp-backdrop" onClick={() => !submitting && onClose()}>
      <div className="fd-rp" role="dialog" aria-modal="true" aria-label="Report" onClick={(e) => e.stopPropagation()}>
        <div className="fd-rp-handle" />
        <div className="fd-rp-head">
          <h2>{result ? (result.ok ? 'Report submitted' : 'Couldn’t submit') : reason ? 'Add details' : 'Report this'}</h2>
          <button type="button" onClick={onClose} disabled={submitting} aria-label="Close"><X size={18} /></button>
        </div>

        {result ? (
          <div className="fd-rp-result">
            <p>{result.message}</p>
            <button type="button" className="fd-rp-submit" onClick={onClose}>Done</button>
          </div>
        ) : !reason ? (
          <div className="fd-rp-list">
            {REASONS.map((r) => (
              <button key={r.key} type="button" className="fd-rp-row" onClick={() => setReason(r.key)}>
                <span>
                  <strong>{r.label}</strong>
                  <small>{r.desc}</small>
                </span>
                <ChevronRight size={16} />
              </button>
            ))}
          </div>
        ) : (
          <div className="fd-rp-detail">
            <button type="button" className="fd-rp-reason-chip" onClick={() => setReason(null)}>
              <ChevronLeft size={14} /> {REASONS.find((r) => r.key === reason)?.label}
            </button>
            <label htmlFor="fd-rp-desc">Anything else we should know? (optional)</label>
            <textarea
              id="fd-rp-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              placeholder="Add more context…"
            />
            <span className="fd-rp-count">{description.length}/500</span>
            <button type="button" className="fd-rp-submit" onClick={submit} disabled={submitting}>
              {submitting ? <Loader2 size={16} className="fd-spin" /> : 'Submit report'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}