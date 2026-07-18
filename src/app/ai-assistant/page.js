// src/app/ai-assistant/page.js
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { aiSearch } from '@/apis/aiApi';

// ─── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  void:    '#09090F',
  surf:    '#13131E',
  elev:    '#1C1C2E',
  indigo:  '#6366F1',
  indigoL: '#818CF8',
  indigoDim:'rgba(99,102,241,0.12)',
  amber:   '#F59E0B',
  amberL:  '#FCD34D',
  amberDim:'rgba(245,158,11,0.12)',
  coral:   '#F43F5E',
  coralDim:'rgba(244,63,94,0.12)',
  emerald: '#10B981',
  emeraldDim:'rgba(16,185,129,0.12)',
  white:   '#F1F0FF',
  off:     '#A8A8B8',
  muted:   '#52525B',
  border:  '#27273A',
};

const SUGGESTED_QUESTIONS = [
  { id: '1', text: 'Laptop under GHS 4,000', icon: '💻' },
  { id: '2', text: 'Headphones under GHS 300', icon: '🎧' },
  { id: '3', text: 'Dresses for Hall Week', icon: '👗' },
  { id: '4', text: 'Ingredients for Jollof', icon: '🍚' },
  { id: '5', text: 'Recommend an iPhone', icon: '📱' },
  { id: '6', text: 'Find me a mattress', icon: '🛏️' },
];

// ─── Typing animation dots ─────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div className="typing-dots">
      <span className="dot" style={{ animationDelay: '0s' }} />
      <span className="dot" style={{ animationDelay: '0.2s' }} />
      <span className="dot" style={{ animationDelay: '0.4s' }} />
    </div>
  );
}

// ─── Product Card ──────────────────────────────────────────────────────────────
function ProductCard({ product }) {
  const img = product.images?.[0] || product.image || null;
  const conditionColors = {
    'new': { bg: '#10B98118', text: '#10B981' },
    'like-new': { bg: '#6366F118', text: '#818CF8' },
    'excellent': { bg: '#6366F118', text: '#818CF8' },
    'good': { bg: '#F59E0B18', text: '#F59E0B' },
    'fair': { bg: '#F43F5E18', text: '#F87171' },
    'slightly-used': { bg: '#F43F5E18', text: '#F87171' },
    'for-parts': { bg: '#71717A18', text: '#71717A' },
  };
  const condition = conditionColors[product.condition] || conditionColors['good'];

  return (
    <Link href={`/product/${product._id}`} className="ai-product-card">
      <div className="ai-product-img-wrap">
        {img ? (
          <img src={img} alt={product.name} className="ai-product-img" onError={e => { e.target.src = 'https://placehold.co/400x300/13131E/52525B?text=No+Image'; }} />
        ) : (
          <div className="ai-product-img-placeholder">📦</div>
        )}
      </div>
      <div className="ai-product-info">
        <div className="ai-product-header">
          <p className="ai-product-name">{product.name}</p>
          {product.condition && (
            <span className="ai-condition-badge" style={{ background: condition.bg, color: condition.text }}>
              {product.condition.replace(/-/g, ' ')}
            </span>
          )}
        </div>
        <div className="ai-product-footer">
          <span className="ai-product-price">GH₵ {Number(product.price).toLocaleString()}</span>
          {product.campus && <span className="ai-product-campus">{typeof product.campus === 'object' ? product.campus.name : product.campus}</span>}
        </div>
        <div className="ai-product-action">
          <span className="ai-view-btn">View Product →</span>
        </div>
      </div>
    </Link>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function AiAssistantPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);
  const isNearBottomRef = useRef(true);

  const scrollToBottom = useCallback((smooth = true) => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'instant',
      });
      isNearBottomRef.current = true;
      setShowScrollBtn(false);
    }
  }, []);

  const handleScroll = useCallback(() => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      const nearBottom = distanceFromBottom < 120;
      isNearBottomRef.current = nearBottom;
      if (nearBottom) setShowScrollBtn(false);
    }
  }, []);

  const handleSend = useCallback(async (text) => {
    const searchQuery = text || query.trim();
    if (!searchQuery || loading) return;

    setQuery('');
    setShowSuggestions(false);
    setLoading(true);

    const userMessage = {
      id: Date.now().toString(),
      type: 'user',
      text: searchQuery,
    };

    setConversation(prev => [...prev, userMessage]);
    setTimeout(() => scrollToBottom(), 50);

    try {
      const response = await aiSearch(searchQuery, conversationId);
      if (response?.data?.conversationId) setConversationId(response.data.conversationId);

      if (response?.data?.success) {
        const { aiResponse, results } = response.data;
        const aiMessage = { id: (Date.now() + 1).toString(), type: 'ai', text: aiResponse, products: results || [] };
        setConversation(prev => [...prev, aiMessage]);
      } else {
        const errorMessage = { id: (Date.now() + 1).toString(), type: 'ai', text: "I'm sorry, I couldn't find any products matching your search. Try different keywords or browse categories.", products: [] };
        setConversation(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('AI Search error:', error);
      const errorMessage = { id: (Date.now() + 1).toString(), type: 'ai', text: "Oops! Something went wrong. Please check your connection and try again.", products: [] };
      setConversation(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      setTimeout(() => {
        if (isNearBottomRef.current) { scrollToBottom(true); } else { setShowScrollBtn(true); }
      }, 150);
    }
  }, [query, loading, conversationId, scrollToBottom]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    const textarea = inputRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  }, [query]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        
        .ai-page {
          position: fixed; inset: 0; height: 100dvh;
          display: flex; flex-direction: column;
          background: ${C.void}; color: ${C.white};
          font-family: 'Plus Jakarta Sans', sans-serif; z-index: 100;
        }
        .ai-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 12px 24px; background: ${C.surf};
          border-bottom: 1px solid ${C.border}; flex-shrink: 0; z-index: 10;
        }
        .ai-header-left { display: flex; align-items: center; gap: 12px; }
        .ai-back-btn {
          width: 38px; height: 38px; border-radius: 50%; background: ${C.elev};
          border: 1px solid ${C.border}; display: flex; align-items: center; justify-content: center;
          color: ${C.off}; text-decoration: none; font-size: 18px; transition: all .2s;
        }
        .ai-back-btn:hover { border-color: ${C.indigoL}; color: ${C.white}; background: ${C.indigoDim}; }
        .ai-header-title { font-size: 16px; font-weight: 700; color: ${C.white}; }
        .ai-header-subtitle { font-size: 11px; color: ${C.emerald}; font-weight: 600; letter-spacing: 0.5px; }
        .ai-new-chat-btn {
          width: 38px; height: 38px; border-radius: 50%; background: ${C.emeraldDim};
          border: 1px solid rgba(16,185,129,.25); display: flex; align-items: center; justify-content: center;
          color: ${C.emerald}; cursor: pointer; font-size: 20px; transition: all .2s;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .ai-new-chat-btn:hover { background: rgba(16,185,129,.2); transform: scale(1.05); }

        .ai-chat-area {
          flex: 1; overflow-y: auto; padding: 24px;
          display: flex; flex-direction: column; gap: 20px;
        }
        .ai-chat-area::-webkit-scrollbar { width: 6px; }
        .ai-chat-area::-webkit-scrollbar-track { background: transparent; }
        .ai-chat-area::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 3px; }

        .ai-welcome {
          display: flex; flex-direction: column; align-items: center;
          justify-content: center; flex: 1; padding: 60px 20px;
          text-align: center; max-width: 700px; margin: 0 auto; width: 100%;
        }
        .ai-welcome-icon {
          width: 80px; height: 80px; border-radius: 28px;
          background: linear-gradient(135deg, ${C.emerald}, #34D399);
          display: flex; align-items: center; justify-content: center;
          font-size: 34px; margin-bottom: 24px; box-shadow: 0 8px 32px rgba(16,185,129,.25);
        }
        .ai-welcome-title { font-size: 32px; font-weight: 800; margin-bottom: 10px; letter-spacing: -0.5px; }
        .ai-welcome-subtitle { font-size: 15px; color: ${C.off}; line-height: 1.6; max-width: 400px; }
        .ai-suggestions-title {
          font-size: 11px; font-weight: 700; color: ${C.muted};
          text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px; margin-top: 40px;
        }
        .ai-suggestions-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; max-width: 600px; width: 100%; }
        .ai-suggestion-chip {
          display: flex; align-items: center; gap: 10px; background: ${C.surf};
          border: 1px solid ${C.border}; border-radius: 14px; padding: 14px 16px;
          cursor: pointer; transition: all .2s; text-align: left; font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .ai-suggestion-chip:hover { border-color: ${C.emerald}; background: ${C.elev}; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,.2); }
        .ai-suggestion-icon { font-size: 22px; flex-shrink: 0; }
        .ai-suggestion-text { font-size: 13px; font-weight: 600; color: ${C.white}; line-height: 1.3; }

        .ai-chat-messages { max-width: 900px; margin: 0 auto; width: 100%; display: flex; flex-direction: column; gap: 20px; }
        .ai-user-msg-wrap { display: flex; justify-content: flex-end; }
        .ai-user-msg {
          background: linear-gradient(135deg, ${C.indigo}, ${C.indigoL});
          color: #fff; border-radius: 18px 18px 4px 18px; padding: 14px 20px;
          max-width: 70%; font-size: 15px; line-height: 1.5; box-shadow: 0 4px 16px ${C.indigoDim};
        }
        .ai-ai-msg-wrap { display: flex; gap: 12px; }
        .ai-ai-avatar {
          width: 36px; height: 36px; border-radius: 50%;
          background: linear-gradient(135deg, ${C.emerald}, #34D399);
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; flex-shrink: 0; margin-top: 2px; box-shadow: 0 4px 12px rgba(16,185,129,.3);
        }
        .ai-ai-content { flex: 1; min-width: 0; }
        .ai-ai-msg {
          background: ${C.surf}; border: 1px solid ${C.border};
          border-radius: 18px 18px 18px 4px; padding: 14px 20px;
          font-size: 15px; line-height: 1.6; color: ${C.white};
        }
        .ai-products-label {
          font-size: 11px; font-weight: 700; color: ${C.muted};
          text-transform: uppercase; letter-spacing: 0.5px; margin: 18px 0 12px 4px;
        }
        .ai-products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px; }
        @media (max-width: 768px) { .ai-products-grid { grid-template-columns: 1fr; } }

        .ai-product-card {
          display: flex; flex-direction: column; background: ${C.surf};
          border: 1px solid ${C.border}; border-radius: 14px; overflow: hidden;
          text-decoration: none; transition: all .2s;
        }
        .ai-product-card:hover { border-color: ${C.indigoL}; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,.3); }
        .ai-product-img-wrap { width: 100%; height: 180px; background: ${C.elev}; display: flex; align-items: center; justify-content: center; overflow: hidden; }
        .ai-product-img { width: 100%; height: 100%; object-fit: contain; padding: 12px; }
        .ai-product-img-placeholder { font-size: 48px; }
        .ai-product-info { padding: 14px 16px 16px; display: flex; flex-direction: column; gap: 10px; flex: 1; }
        .ai-product-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; }
        .ai-product-name { font-size: 14px; font-weight: 700; color: ${C.white}; line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; flex: 1; }
        .ai-condition-badge { font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 6px; white-space: nowrap; text-transform: capitalize; flex-shrink: 0; }
        .ai-product-footer { display: flex; justify-content: space-between; align-items: center; }
        .ai-product-price { font-size: 18px; font-weight: 800; color: ${C.emerald}; font-family: 'JetBrains Mono', monospace; }
        .ai-product-campus { font-size: 11px; font-weight: 600; color: ${C.indigoL}; background: ${C.indigoDim}; padding: 3px 8px; border-radius: 8px; font-family: 'JetBrains Mono', monospace; }
        .ai-product-action { display: flex; align-items: center; justify-content: center; gap: 6px; color: ${C.emerald}; font-size: 13px; font-weight: 700; background: ${C.emeraldDim}; border: 1px solid rgba(16,185,129,.2); border-radius: 10px; padding: 8px 0; margin-top: 4px; transition: all .2s; }
        .ai-product-card:hover .ai-product-action { background: rgba(16,185,129,.15); }

        .typing-dots {
          display: flex; gap: 5px; padding: 16px 20px; background: ${C.surf};
          border: 1px solid ${C.border}; border-radius: 18px 18px 18px 4px;
        }
        .typing-dots .dot { width: 8px; height: 8px; border-radius: 50%; background: ${C.emerald}; animation: dotPulse 1.4s ease-in-out infinite; }
        @keyframes dotPulse { 0%,80%,100%{transform:scale(.7);opacity:.5} 40%{transform:scale(1);opacity:1} }

        .ai-scroll-btn {
          position: fixed; bottom: 130px; left: 50%; transform: translateX(-50%);
          background: ${C.emerald}; color: #000; font-weight: 700; font-size: 13px;
          padding: 10px 20px; border-radius: 24px; cursor: pointer; border: none;
          box-shadow: 0 4px 20px rgba(16,185,129,.35); z-index: 10; transition: all .2s;
          display: flex; align-items: center; gap: 6px; font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .ai-scroll-btn:hover { transform: translateX(-50%) translateY(-2px); box-shadow: 0 8px 28px rgba(16,185,129,.45); }

        /* ══════════════════════ NEW SEXY INPUT AREA ══════════════════════ */
        .ai-input-section {
          flex-shrink: 0; padding: 0 24px 20px;
          background: linear-gradient(to top, ${C.void} 60%, transparent);
        }
        .ai-input-container {
          max-width: 900px; margin: 0 auto;
          background: ${inputFocused ? C.elev : C.surf};
          border: 1.5px solid ${inputFocused ? C.emerald + '60' : C.border};
          border-radius: 20px;
          padding: 6px 8px;
          display: flex; align-items: flex-end; gap: 8px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: ${inputFocused ? '0 0 0 4px rgba(16,185,129,0.08), 0 8px 32px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.15)'};
        }
        .ai-input-container:hover {
          border-color: ${inputFocused ? C.emerald + '60' : C.muted + '50'};
        }
        .ai-input-left {
          display: flex; align-items: flex-end; gap: 4px; flex: 1; min-width: 0;
          padding: 4px 4px 4px 8px;
        }
        .ai-input-icon {
          color: ${inputFocused ? C.emerald : C.muted}; font-size: 18px;
          margin-bottom: 8px; flex-shrink: 0; transition: color 0.3s;
        }
        .ai-input {
          flex: 1; background: transparent; border: none;
          padding: 8px 4px; color: ${C.white}; font-size: 15px;
          font-family: 'Plus Jakarta Sans', sans-serif; resize: none;
          outline: none; max-height: 120px; min-height: 24px;
          line-height: 1.5; overflow-y: auto;
        }
        .ai-input::placeholder { color: ${C.muted}; font-weight: 400; }
        .ai-input-actions {
          display: flex; align-items: center; gap: 2px; flex-shrink: 0;
          padding-right: 4px;
        }
        .ai-mic-btn {
          width: 36px; height: 36px; border-radius: 50%; background: transparent;
          border: none; color: ${C.muted}; cursor: pointer; display: flex;
          align-items: center; justify-content: center; font-size: 16px;
          transition: all .2s; flex-shrink: 0;
        }
        .ai-mic-btn:hover { color: ${C.white}; background: ${C.elev}; }
        .ai-send-btn {
          width: 38px; height: 38px; border-radius: 50%; border: none;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          font-size: 18px; transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); flex-shrink: 0;
        }
        .ai-send-btn.active {
          background: linear-gradient(135deg, ${C.emerald}, #34D399);
          color: #000; box-shadow: 0 4px 16px rgba(16,185,129,.35);
          transform: scale(1);
        }
        .ai-send-btn.active:hover { transform: scale(1.08); box-shadow: 0 6px 20px rgba(16,185,129,.45); }
        .ai-send-btn.active:active { transform: scale(0.95); }
        .ai-send-btn.disabled {
          background: transparent; color: ${C.muted}; cursor: not-allowed;
          opacity: 0.5;
        }
        .ai-input-footer {
          max-width: 900px; margin: 8px auto 0; text-align: center;
          font-size: 11px; color: ${C.muted};
        }

        @media (max-width: 768px) {
          .ai-header { padding: 10px 16px; }
          .ai-chat-area { padding: 16px; gap: 16px; }
          .ai-chat-messages { gap: 16px; }
          .ai-welcome { padding: 40px 16px; }
          .ai-welcome-icon { width: 64px; height: 64px; border-radius: 22px; font-size: 26px; margin-bottom: 18px; }
          .ai-welcome-title { font-size: 24px; }
          .ai-welcome-subtitle { font-size: 14px; }
          .ai-suggestions-grid { grid-template-columns: repeat(2, 1fr); gap: 8px; max-width: 100%; }
          .ai-suggestion-chip { padding: 12px 14px; }
          .ai-input-section { padding: 0 12px 16px; }
          .ai-user-msg { max-width: 85%; font-size: 14px; }
          .ai-product-img-wrap { height: 150px; }
        }
        @media (max-width: 400px) {
          .ai-suggestions-grid { grid-template-columns: 1fr; }
          .ai-product-img-wrap { height: 130px; }
        }
      `}</style>

      <div className="ai-page">
        {/* Header */}
        <div className="ai-header">
          <div className="ai-header-left">
            <Link href="/" className="ai-back-btn">←</Link>
            <div>
              <div className="ai-header-title">AI Shopping Assistant</div>
              <div className="ai-header-subtitle">Powered by CediAI</div>
            </div>
          </div>
          <button className="ai-new-chat-btn" onClick={() => { setConversation([]); setConversationId(null); setShowSuggestions(true); setQuery(''); }} title="New chat">+</button>
        </div>

        {/* Chat area */}
        <div className="ai-chat-area" ref={chatContainerRef} onScroll={handleScroll}>
          {conversation.length === 0 ? (
            <div className="ai-welcome">
              <div className="ai-welcome-icon">✦</div>
              <h1 className="ai-welcome-title">Ask CediAI</h1>
              <p className="ai-welcome-subtitle">Your AI shopping assistant — find the best deals on campus instantly.</p>
              {showSuggestions && (
                <>
                  <p className="ai-suggestions-title">Try asking</p>
                  <div className="ai-suggestions-grid">
                    {SUGGESTED_QUESTIONS.map((item) => (
                      <button key={item.id} className="ai-suggestion-chip" onClick={() => handleSend(item.text)}>
                        <span className="ai-suggestion-icon">{item.icon}</span>
                        <span className="ai-suggestion-text">{item.text}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="ai-chat-messages">
              {conversation.map((msg) => (
                <div key={msg.id}>
                  {msg.type === 'user' ? (
                    <div className="ai-user-msg-wrap"><div className="ai-user-msg">{msg.text}</div></div>
                  ) : (
                    <div className="ai-ai-msg-wrap">
                      <div className="ai-ai-avatar">✦</div>
                      <div className="ai-ai-content">
                        <div className="ai-ai-msg">{msg.text}</div>
                        {msg.products?.length > 0 && (
                          <div>
                            <p className="ai-products-label">Found {msg.products.length} product{msg.products.length !== 1 ? 's' : ''}</p>
                            <div className="ai-products-grid">
                              {msg.products.map((product) => <ProductCard key={product._id} product={product} />)}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          {loading && (
            <div className="ai-chat-messages">
              <div className="ai-ai-msg-wrap">
                <div className="ai-ai-avatar">✦</div>
                <TypingDots />
              </div>
            </div>
          )}
        </div>

        {/* Scroll to bottom button */}
        {showScrollBtn && (
          <button className="ai-scroll-btn" onClick={() => scrollToBottom(true)}>↓ New results</button>
        )}

        {/* ── Sexy Input Section ── */}
        <div className="ai-input-section">
          <div className="ai-input-container">
            <div className="ai-input-left">
              <span className="ai-input-icon">✦</span>
              <textarea
                ref={inputRef}
                className="ai-input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                placeholder="Ask CediAI anything..."
                rows={1}
                maxLength={500}
              />
            </div>
            <div className="ai-input-actions">
             
              <button
                className={`ai-send-btn ${query.trim() && !loading ? 'active' : 'disabled'}`}
                onClick={() => handleSend()}
                disabled={!query.trim() || loading}
                title="Send message"
              >
                {loading ? (
                  <span style={{ fontSize: '14px', animation: 'dotPulse 1.4s ease-in-out infinite' }}>⏳</span>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="19" x2="12" y2="5" />
                    <polyline points="5 12 12 5 19 12" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          <p className="ai-input-footer">CediAI can make mistakes. Verify product details with the seller.</p>
        </div>
      </div>
    </>
  );
}