// src/app/ai-assistant/page.js
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { aiSearch } from '@/apis/aiApi';

// ─── Teal + Coral Design Tokens ────────────────────────────────────────────
const C = {
  void:       '#F8FAFC',
  surf:       '#FFFFFF',
  elev:       '#F1F5F9',
  border:     '#E2E8F0',
  brand:      '#0D9488',
  brandL:     '#14B8A6',
  brandD:     '#0F766E',
  brandBg:    '#F0FDFA',
  brandBorder:'#99F6E4',
  accent:     '#F97316',
  accentBg:   '#FFF7ED',
  accentBorder:'#FED7AA',
  success:    '#059669',
  successBg:  '#ECFDF5',
  danger:     '#DC2626',
  dangerBg:   '#FEF2F2',
  dangerBorder:'#FECACA',
  info:       '#0284C7',
  infoBg:     '#F0F9FF',
  white:      '#0F172A',
  off:        '#475569',
  muted:      '#94A3B8',
};

const SUGGESTED_QUESTIONS = [
  { id: '1', text: 'Laptop under GHS 4,000', icon: '💻' },
  { id: '2', text: 'Headphones under GHS 300', icon: '🎧' },
  { id: '3', text: 'Dresses for Hall Week', icon: '👗' },
  { id: '4', text: 'Ingredients for Jollof', icon: '🍚' },
  { id: '5', text: 'Recommend an iPhone', icon: '📱' },
  { id: '6', text: 'Find me a mattress', icon: '🛏️' },
];

function TypingDots() {
  return (
    <div className="typing-dots">
      <span className="dot" style={{ animationDelay: '0s' }} />
      <span className="dot" style={{ animationDelay: '0.2s' }} />
      <span className="dot" style={{ animationDelay: '0.4s' }} />
    </div>
  );
}

function ProductCard({ product }) {
  const img = product.images?.[0] || product.image || null;
  const conditionColors = {
    'new': { bg: '#05966915', text: C.success },
    'like-new': { bg: '#05966915', text: C.success },
    'excellent': { bg: '#0D948815', text: C.brand },
    'good': { bg: '#F9731615', text: C.accent },
    'fair': { bg: '#DC262615', text: C.danger },
    'slightly-used': { bg: '#DC262615', text: C.danger },
    'for-parts': { bg: '#64748B15', text: '#64748B' },
  };
  const condition = conditionColors[product.condition] || conditionColors['good'];

  return (
    <Link href={`/product/${product._id}`} className="ai-product-card">
      <div className="ai-product-img-wrap">
        {img ? (
          <img src={img} alt={product.name} className="ai-product-img" onError={e => { e.target.src = 'https://placehold.co/400x300/F1F5F9/94A3B8?text=No+Image'; }} />
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
      chatContainerRef.current.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: smooth ? 'smooth' : 'instant' });
      isNearBottomRef.current = true; setShowScrollBtn(false);
    }
  }, []);

  const handleScroll = useCallback(() => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      isNearBottomRef.current = distanceFromBottom < 120;
      if (distanceFromBottom < 120) setShowScrollBtn(false);
    }
  }, []);

  const handleSend = useCallback(async (text) => {
    const searchQuery = text || query.trim();
    if (!searchQuery || loading) return;
    setQuery(''); setShowSuggestions(false); setLoading(true);
    const userMessage = { id: Date.now().toString(), type: 'user', text: searchQuery };
    setConversation(prev => [...prev, userMessage]);
    setTimeout(() => scrollToBottom(), 50);
    try {
      const response = await aiSearch(searchQuery, conversationId);
      if (response?.data?.conversationId) setConversationId(response.data.conversationId);
      if (response?.data?.success) {
        const { aiResponse, results } = response.data;
        setConversation(prev => [...prev, { id: (Date.now() + 1).toString(), type: 'ai', text: aiResponse, products: results || [] }]);
      } else {
        setConversation(prev => [...prev, { id: (Date.now() + 1).toString(), type: 'ai', text: "I'm sorry, I couldn't find any products matching your search.", products: [] }]);
      }
    } catch {
      setConversation(prev => [...prev, { id: (Date.now() + 1).toString(), type: 'ai', text: "Oops! Something went wrong. Please try again.", products: [] }]);
    } finally {
      setLoading(false);
      setTimeout(() => { if (isNearBottomRef.current) scrollToBottom(true); else setShowScrollBtn(true); }, 150);
    }
  }, [query, loading, conversationId, scrollToBottom]);

  const handleKeyDown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } };

  useEffect(() => { const textarea = inputRef.current; if (textarea) { textarea.style.height = 'auto'; textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'; } }, [query]);
  useEffect(() => { inputRef.current?.focus(); }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        
        .ai-page { position: fixed; inset: 0; height: 100dvh; display: flex; flex-direction: column; background: ${C.void}; color: ${C.white}; font-family: 'Plus Jakarta Sans', sans-serif; z-index: 100; }
        .ai-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 24px; background: ${C.surf}; border-bottom: 1px solid ${C.border}; flex-shrink: 0; z-index: 10; box-shadow: 0 1px 3px rgba(0,0,0,.04); }
        .ai-header-left { display: flex; align-items: center; gap: 12px; }
        .ai-back-btn { width: 38px; height: 38px; border-radius: 50%; background: ${C.elev}; border: 1px solid ${C.border}; display: flex; align-items: center; justify-content: center; color: ${C.off}; text-decoration: none; font-size: 18px; transition: all .2s; }
        .ai-back-btn:hover { border-color: ${C.brand}; color: ${C.brand}; background: ${C.brandBg}; }
        .ai-header-title { font-size: 16px; font-weight: 700; color: ${C.white}; }
        .ai-header-subtitle { font-size: 11px; color: ${C.brand}; font-weight: 600; letter-spacing: 0.5px; }
        .ai-new-chat-btn { width: 38px; height: 38px; border-radius: 50%; background: ${C.brandBg}; border: 1px solid ${C.brandBorder}; display: flex; align-items: center; justify-content: center; color: ${C.brand}; cursor: pointer; font-size: 20px; transition: all .2s; font-family: 'Plus Jakarta Sans', sans-serif; }
        .ai-new-chat-btn:hover { background: ${C.brandBorder}; transform: scale(1.05); }

        .ai-chat-area { flex: 1; overflow-y: auto; padding: 24px; display: flex; flex-direction: column; gap: 20px; }
        .ai-chat-area::-webkit-scrollbar { width: 6px; }
        .ai-chat-area::-webkit-scrollbar-track { background: transparent; }
        .ai-chat-area::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 3px; }

        .ai-welcome { display: flex; flex-direction: column; align-items: center; justify-content: center; flex: 1; padding: 60px 20px; text-align: center; max-width: 700px; margin: 0 auto; width: 100%; }
        .ai-welcome-icon { width: 80px; height: 80px; border-radius: 28px; background: linear-gradient(135deg, ${C.brand}, ${C.brandL}); display: flex; align-items: center; justify-content: center; font-size: 34px; margin-bottom: 24px; box-shadow: 0 8px 32px rgba(13,148,136,.2); }
        .ai-welcome-title { font-size: 32px; font-weight: 800; margin-bottom: 10px; letter-spacing: -0.5px; }
        .ai-welcome-subtitle { font-size: 15px; color: ${C.off}; line-height: 1.6; max-width: 400px; }
        .ai-suggestions-title { font-size: 11px; font-weight: 700; color: ${C.muted}; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px; margin-top: 40px; }
        .ai-suggestions-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; max-width: 600px; width: 100%; }
        .ai-suggestion-chip { display: flex; align-items: center; gap: 10px; background: ${C.surf}; border: 1px solid ${C.border}; border-radius: 14px; padding: 14px 16px; cursor: pointer; transition: all .2s; text-align: left; font-family: 'Plus Jakarta Sans', sans-serif; box-shadow: 0 2px 8px rgba(0,0,0,.04); }
        .ai-suggestion-chip:hover { border-color: ${C.brand}; background: ${C.brandBg}; transform: translateY(-2px); }

        .ai-chat-messages { max-width: 900px; margin: 0 auto; width: 100%; display: flex; flex-direction: column; gap: 20px; }
        .ai-user-msg-wrap { display: flex; justify-content: flex-end; }
        .ai-user-msg { background: linear-gradient(135deg, ${C.brand}, ${C.brandL}); color: #fff; border-radius: 18px 18px 4px 18px; padding: 14px 20px; max-width: 70%; font-size: 15px; line-height: 1.5; box-shadow: 0 4px 16px rgba(13,148,136,.15); }
        .ai-ai-msg-wrap { display: flex; gap: 12px; }
        .ai-ai-avatar { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, ${C.brand}, ${C.brandL}); display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; margin-top: 2px; box-shadow: 0 4px 12px rgba(13,148,136,.2); }
        .ai-ai-content { flex: 1; min-width: 0; }
        .ai-ai-msg { background: ${C.surf}; border: 1px solid ${C.border}; border-radius: 18px 18px 18px 4px; padding: 14px 20px; font-size: 15px; line-height: 1.6; color: ${C.white}; box-shadow: 0 2px 8px rgba(0,0,0,.04); }
        .ai-products-label { font-size: 11px; font-weight: 700; color: ${C.muted}; text-transform: uppercase; letter-spacing: 0.5px; margin: 18px 0 12px 4px; }
        .ai-products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px; }
        @media (max-width: 768px) { .ai-products-grid { grid-template-columns: 1fr; } }

        .ai-product-card { display: flex; flex-direction: column; background: ${C.surf}; border: 1px solid ${C.border}; border-radius: 14px; overflow: hidden; text-decoration: none; transition: all .2s; box-shadow: 0 2px 8px rgba(0,0,0,.04); }
        .ai-product-card:hover { border-color: ${C.brand}; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,.08); }
        .ai-product-img-wrap { width: 100%; height: 180px; background: ${C.elev}; display: flex; align-items: center; justify-content: center; overflow: hidden; }
        .ai-product-img { width: 100%; height: 100%; object-fit: contain; padding: 12px; }
        .ai-product-img-placeholder { font-size: 48px; }
        .ai-product-info { padding: 14px 16px 16px; display: flex; flex-direction: column; gap: 10px; flex: 1; }
        .ai-product-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; }
        .ai-product-name { font-size: 14px; font-weight: 700; color: ${C.white}; line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; flex: 1; }
        .ai-condition-badge { font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 6px; white-space: nowrap; text-transform: capitalize; flex-shrink: 0; }
        .ai-product-footer { display: flex; justify-content: space-between; align-items: center; }
        .ai-product-price { font-size: 18px; font-weight: 800; color: ${C.accent}; font-family: 'JetBrains Mono', monospace; }
        .ai-product-campus { font-size: 11px; font-weight: 600; color: ${C.brand}; background: ${C.brandBg}; padding: 3px 8px; border-radius: 8px; font-family: 'JetBrains Mono', monospace; }
        .ai-product-action { display: flex; align-items: center; justify-content: center; gap: 6px; color: ${C.brand}; font-size: 13px; font-weight: 700; background: ${C.brandBg}; border: 1px solid ${C.brandBorder}; border-radius: 10px; padding: 8px 0; margin-top: 4px; transition: all .2s; }
        .ai-product-card:hover .ai-product-action { background: ${C.brand}; color: #fff; border-color: ${C.brand}; }

        .typing-dots { display: flex; gap: 5px; padding: 16px 20px; background: ${C.surf}; border: 1px solid ${C.border}; border-radius: 18px 18px 18px 4px; box-shadow: 0 2px 8px rgba(0,0,0,.04); }
        .typing-dots .dot { width: 8px; height: 8px; border-radius: 50%; background: ${C.brand}; animation: dotPulse 1.4s ease-in-out infinite; }
        @keyframes dotPulse { 0%,80%,100%{transform:scale(.7);opacity:.5} 40%{transform:scale(1);opacity:1} }

        .ai-scroll-btn { position: fixed; bottom: 130px; left: 50%; transform: translateX(-50%); background: ${C.brand}; color: #fff; font-weight: 700; font-size: 13px; padding: 10px 20px; border-radius: 24px; cursor: pointer; border: none; box-shadow: 0 4px 20px rgba(13,148,136,.3); z-index: 10; transition: all .2s; display: flex; align-items: center; gap: 6px; font-family: 'Plus Jakarta Sans', sans-serif; }
        .ai-scroll-btn:hover { transform: translateX(-50%) translateY(-2px); }

        .ai-input-section { flex-shrink: 0; padding: 0 24px 20px; background: linear-gradient(to top, ${C.void} 60%, transparent); }
        .ai-input-container { max-width: 900px; margin: 0 auto; background: ${C.surf}; border: 1.5px solid ${C.border}; border-radius: 20px; padding: 6px 8px; display: flex; align-items: flex-end; gap: 8px; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 2px 8px rgba(0,0,0,.04); }
        .ai-input-container:focus-within { border-color: ${C.brand}; box-shadow: 0 0 0 4px rgba(13,148,136,.08); background: ${C.surf}; }
        .ai-input-container:hover { border-color: ${inputFocused ? C.brand : C.muted + '80'}; }
        .ai-input-left { display: flex; align-items: flex-end; gap: 4px; flex: 1; min-width: 0; padding: 4px 4px 4px 8px; }
        .ai-input-icon { color: ${inputFocused ? C.brand : C.muted}; font-size: 18px; margin-bottom: 8px; flex-shrink: 0; transition: color 0.3s; }
        .ai-input { flex: 1; background: transparent; border: none; padding: 8px 4px; color: ${C.white}; font-size: 15px; font-family: 'Plus Jakarta Sans', sans-serif; resize: none; outline: none; max-height: 120px; min-height: 24px; line-height: 1.5; overflow-y: auto; }
        .ai-input::placeholder { color: ${C.muted}; font-weight: 400; }
        .ai-input-actions { display: flex; align-items: center; gap: 2px; flex-shrink: 0; padding-right: 4px; }
        .ai-mic-btn { width: 36px; height: 36px; border-radius: 50%; background: transparent; border: none; color: ${C.muted}; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 16px; transition: all .2s; flex-shrink: 0; }
        .ai-mic-btn:hover { color: ${C.white}; background: ${C.elev}; }
        .ai-send-btn { width: 38px; height: 38px; border-radius: 50%; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 18px; transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); flex-shrink: 0; }
        .ai-send-btn.active { background: linear-gradient(135deg, ${C.brand}, ${C.brandL}); color: #fff; box-shadow: 0 4px 16px rgba(13,148,136,.25); }
        .ai-send-btn.active:hover { transform: scale(1.08); }
        .ai-send-btn.active:active { transform: scale(0.95); }
        .ai-send-btn.disabled { background: transparent; color: ${C.muted}; cursor: not-allowed; opacity: 0.5; }
        .ai-input-footer { max-width: 900px; margin: 8px auto 0; text-align: center; font-size: 11px; color: ${C.muted}; }

        @media (max-width: 768px) { .ai-header { padding: 10px 16px; } .ai-chat-area { padding: 16px; gap: 16px; } .ai-welcome { padding: 40px 16px; } .ai-welcome-icon { width: 64px; height: 64px; border-radius: 22px; font-size: 26px; margin-bottom: 18px; } .ai-welcome-title { font-size: 24px; } .ai-suggestions-grid { grid-template-columns: repeat(2, 1fr); gap: 8px; max-width: 100%; } .ai-input-section { padding: 0 12px 16px; } .ai-user-msg { max-width: 85%; font-size: 14px; } .ai-product-img-wrap { height: 150px; } }
        @media (max-width: 400px) { .ai-suggestions-grid { grid-template-columns: 1fr; } }
      `}</style>

      <div className="ai-page">
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

        {showScrollBtn && (
          <button className="ai-scroll-btn" onClick={() => scrollToBottom(true)}>↓ New results</button>
        )}

        <div className="ai-input-section">
          <div className="ai-input-container">
            <div className="ai-input-left">
              <span className="ai-input-icon">✦</span>
              <textarea ref={inputRef} className="ai-input" value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={handleKeyDown} onFocus={() => setInputFocused(true)} onBlur={() => setInputFocused(false)} placeholder="Ask CediAI anything..." rows={1} maxLength={500} />
            </div>
            <div className="ai-input-actions">
              <button className={`ai-send-btn ${query.trim() && !loading ? 'active' : 'disabled'}`} onClick={() => handleSend()} disabled={!query.trim() || loading} title="Send message">
                {loading ? <span style={{ fontSize: '14px', animation: 'dotPulse 1.4s ease-in-out infinite' }}>⏳</span> : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" />
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