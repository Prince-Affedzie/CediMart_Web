// src/app/visual-search/VisualSearchClient.jsx
'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Camera, Image as ImageIcon, X, Sparkles, Search,
  AlertCircle, Eye, RefreshCw,
} from 'lucide-react';
import { aiVisualSearch } from '@/apis/aiApi';
import { CONDITION_MAP, CATEGORY_ICONS, DEFAULT_CATEGORY_ICON } from '@/components/Home/constants';
import { fmtPrice } from '@/utils/formatPrice';
import './visual-search.css';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;   // 5 MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];

//  Location / campus label — same logic used elsewhere in the app.
function locationLabel(p) {
  if (p?.location?.area && p?.location?.city) return `${p.location.area}, ${p.location.city}`;
  if (p?.location?.city) return p.location.city;
  if (p?.campus) return p.campus;
  return null;
}

export default function VisualSearchClient() {
  const router = useRouter();

  // ── State ──────────────────────────────────────────────────────────────
  const [file, setFile]             = useState(null);   // raw File object
  const [preview, setPreview]       = useState(null);   // object URL
  const [notes, setNotes]           = useState('');
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');

  const [detectedItem, setDetectedItem]     = useState(null);
  const [aiResponse, setAiResponse]         = useState(null);
  const [results, setResults]               = useState(null);
  const [conversationId, setConversationId] = useState(null);

  //  Two separate hidden inputs — one with `capture` for the camera,
  //  one without for the gallery. This is the only reliable way to give
  //  mobile users distinct "take photo" vs "choose from library" flows.
  const cameraInputRef  = useRef(null);
  const galleryInputRef = useRef(null);

  //  Revoke the object URL when it changes or the component unmounts.
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  // ── File handling ──────────────────────────────────────────────────────
  const openCamera  = () => cameraInputRef.current?.click();
  const openGallery = () => galleryInputRef.current?.click();

  const onFileChange = (e) => {
    const f = e.target.files?.[0];
    //  Reset the input's value so picking the same file twice still fires.
    e.target.value = '';
    if (!f) return;

    if (!ACCEPTED_TYPES.includes(f.type)) {
      setError('Please choose a JPEG, PNG, or WebP image.');
      return;
    }
    if (f.size > MAX_IMAGE_BYTES) {
      setError('That image is larger than 5 MB. Please pick a smaller one.');
      return;
    }

    if (preview) URL.revokeObjectURL(preview);
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError('');
  };

  const clearImage = () => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    setError('');
  };

  const resetSearch = () => {
    clearImage();
    setNotes('');
    setDetectedItem(null);
    setAiResponse(null);
    setResults(null);
    setConversationId(null);
    setError('');
  };

  // ── Search ─────────────────────────────────────────────────────────────
  const handleSearch = async () => {
    if (!file || loading) return;
    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('productImage', file, file.name || 'upload.jpg');
      if (notes.trim()) formData.append('userNotes', notes.trim());
      if (conversationId) formData.append('conversationId', conversationId);

      const res = await aiVisualSearch(formData);
      const data = res?.data;
      if (!data?.success) throw new Error(data?.message || 'Visual search failed');

      setDetectedItem(data.detectedItem || null);
      setAiResponse(data.aiResponse || null);
      setResults(data.results || []);
      setConversationId(data.conversationId || null);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Something went wrong analyzing that photo. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const hasSearched = results !== null;

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="vs-page">
      {/* ── Header ── */}
      <header className="vs-header">
        <button
          type="button"
          className="vs-back"
          onClick={() => router.back()}
          aria-label="Go back"
        >
          <ArrowLeft size={20} strokeWidth={2.4} />
        </button>

        <div className="vs-header-center">
          <h1 className="vs-title">Search by photo</h1>
          <p className="vs-subtitle">Snap or upload an item to find matches</p>
        </div>

        {hasSearched ? (
          <button
            type="button"
            className="vs-reset"
            onClick={resetSearch}
            aria-label="Start over"
          >
            <RefreshCw size={17} strokeWidth={2.4} />
          </button>
        ) : (
          <span className="vs-header-spacer" aria-hidden="true" />
        )}
      </header>

      <main className="vs-main">
        {/* ── Image picker ── */}
        {!preview ? (
          <div className="vs-picker">
            <div className="vs-picker-tiles">
              <button
                type="button"
                className="vs-tile"
                onClick={openCamera}
              >
                <span className="vs-tile-icon vs-tile-icon-camera">
                  <Camera size={28} strokeWidth={2} />
                </span>
                <span className="vs-tile-label">Take a photo</span>
                <span className="vs-tile-hint">Opens your camera</span>
              </button>

              <button
                type="button"
                className="vs-tile"
                onClick={openGallery}
              >
                <span className="vs-tile-icon vs-tile-icon-library">
                  <ImageIcon size={28} strokeWidth={2} />
                </span>
                <span className="vs-tile-label">From your device</span>
                <span className="vs-tile-hint">Photo library &amp; files</span>
              </button>
            </div>

            <p className="vs-picker-hint">
              Clear photos with good lighting give the best matches.
            </p>

            {/* ── Camera input — `capture` tells mobile browsers to open
                the camera directly. Desktop browsers ignore it and fall
                back to the file picker. ── */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={onFileChange}
              hidden
            />

            {/* ── Gallery input — no `capture` attribute, so mobile browsers
                show the native file picker (Photo Library / Browse), and
                desktop browsers show the standard file browser. ── */}
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              onChange={onFileChange}
              hidden
            />
          </div>
        ) : (
          <div className="vs-preview">
            <img src={preview} alt="Selected item" className="vs-preview-img" />
            <button
              type="button"
              className="vs-preview-remove"
              onClick={clearImage}
              aria-label="Remove photo"
            >
              <X size={18} strokeWidth={2.6} />
            </button>

            <div className="vs-preview-actions">
              <button type="button" className="vs-preview-action" onClick={openCamera}>
                <Camera size={16} strokeWidth={2.2} />
                <span>Retake</span>
              </button>
              <button type="button" className="vs-preview-action" onClick={openGallery}>
                <ImageIcon size={16} strokeWidth={2.2} />
                <span>Choose different</span>
              </button>
            </div>
          </div>
        )}

        {/* ── Optional notes ── */}
        {preview && (
          <div className="vs-notes">
            <label htmlFor="vs-notes-input" className="vs-notes-label">
              Any details to help us? <span className="vs-notes-optional">(optional)</span>
            </label>
            <div className="vs-notes-wrap">
              <Sparkles size={14} strokeWidth={2.2} className="vs-notes-icon" />
              <textarea
                id="vs-notes-input"
                className="vs-notes-input"
                placeholder="e.g. colour, brand, size…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={200}
                rows={2}
              />
              <span className="vs-notes-count">{notes.length}/200</span>
            </div>
          </div>
        )}

        {/* ── Search button ── */}
        {preview && !hasSearched && (
          <button
            type="button"
            className="vs-search-btn"
            onClick={handleSearch}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="vs-spinner" aria-hidden="true" />
                <span>Analyzing your photo…</span>
              </>
            ) : (
              <>
                <Sparkles size={17} strokeWidth={2.4} />
                <span>Find matches</span>
              </>
            )}
          </button>
        )}

        {/* ── Error ── */}
        {!!error && (
          <div className="vs-error" role="alert">
            <AlertCircle size={16} strokeWidth={2.4} />
            <span>{error}</span>
          </div>
        )}

        {/* ── AI response ── */}
        {hasSearched && (aiResponse || detectedItem) && (
          <div className="vs-ai-card">
            <div className="vs-ai-head">
              <span className="vs-ai-badge">
                <Sparkles size={14} strokeWidth={2.4} />
              </span>
              <span className="vs-ai-name">CediAi</span>
            </div>

            {!!detectedItem && (
              <div className="vs-ai-detected">
                <Eye size={12} strokeWidth={2.4} />
                <span>Detected: <strong>{detectedItem}</strong></span>
              </div>
            )}

            {!!aiResponse && <p className="vs-ai-text">{aiResponse}</p>}
          </div>
        )}

        {/* ── Results ── */}
        {hasSearched && (
          <section className="vs-results">
            <div className="vs-results-head">
              <h2 className="vs-results-title">
                {results.length > 0
                  ? `${results.length} match${results.length !== 1 ? 'es' : ''} found`
                  : 'No matches found'}
              </h2>
              {results.length > 0 && (
                <button
                  type="button"
                  className="vs-results-refine"
                  onClick={() => {
                    setFile(null);
                    setPreview(null);
                    setDetectedItem(null);
                    setAiResponse(null);
                    setResults(null);
                  }}
                >
                  <Camera size={13} strokeWidth={2.4} />
                  <span>Refine with another photo</span>
                </button>
              )}
            </div>

            {results.length > 0 ? (
              <div className="vs-grid">
                {results.map((p) => (
                  <Link
                    key={p._id || p.id}
                    href={`/product/${p._id || p.id}`}
                    className="vs-card"
                  >
                    <div className="vs-card-img">
                      {p.images?.[0] ? (
                        <img src={p.images[0]} alt="" loading="lazy" />
                      ) : (
                        <span className="vs-card-img-ph">
                          {CATEGORY_ICONS[p.category] || DEFAULT_CATEGORY_ICON}
                        </span>
                      )}
                      {p.condition && CONDITION_MAP[p.condition] && (
                        <span
                          className="vs-card-cond"
                          style={{
                            background: CONDITION_MAP[p.condition].bg,
                            color: CONDITION_MAP[p.condition].color,
                          }}
                        >
                          {CONDITION_MAP[p.condition].label}
                        </span>
                      )}
                    </div>
                    <div className="vs-card-body">
                      <h3 className="vs-card-name">{p.name}</h3>
                      {locationLabel(p) && (
                        <span className="vs-card-loc">{locationLabel(p)}</span>
                      )}
                      <span className="vs-card-price">{fmtPrice(p.price)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="vs-empty">
                <span className="vs-empty-icon">
                  <Search size={30} strokeWidth={2} />
                </span>
                <h3 className="vs-empty-title">Nothing matched that photo</h3>
                <p className="vs-empty-sub">
                  Try a clearer angle, or search by text instead.
                </p>
                <button
                  type="button"
                  className="vs-empty-btn"
                  onClick={resetSearch}
                >
                  Try another photo
                </button>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}