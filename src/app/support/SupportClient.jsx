// src/app/support/SupportClient.jsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Home,
  Headset,
  ShoppingCart,
  Store,
  Bike,
  CreditCard,
  User,
  HelpCircle,
  MessageCircle,
  Phone,
  Mail,
  Plus,
  Minus,
  Search,
  Clock,
  AlertCircle,
  ArrowRight,
  Send,
} from 'lucide-react';
import './support.css';

// ─── Constants ────────────────────────────────────────────────────────────────
const SUPPORT_TOPICS = [
  { id: 'buying',   label: 'Buying',   icon: ShoppingCart },
  { id: 'selling',  label: 'Selling',  icon: Store },
  { id: 'delivery', label: 'Delivery', icon: Bike },
  { id: 'payment',  label: 'Payments', icon: CreditCard },
  { id: 'account',  label: 'Account',  icon: User },
  { id: 'general',  label: 'General',  icon: HelpCircle },
];

const FAQS = [
  {
    id: 1,
    question: 'How do I buy an item on CediMart?',
    answer:
      'Browse listings on your campus or search across all campuses. When you find something you like, tap "Add to Cart" and proceed to checkout. Your payment is held securely in escrow until you confirm you\'ve received the item.',
    category: 'buying',
  },
  {
    id: 2,
    question: 'How does the escrow payment system work?',
    answer:
      'When you pay for an item, your money is held securely by CediMart — not sent directly to the seller. The funds are only released to the seller after you confirm that you\'ve received the item and it matches the description. This protects you from fraud and ensures sellers deliver what they promise.',
    category: 'payment',
  },
  {
    id: 3,
    question: 'How do I sell my items?',
    answer:
      'Tap "List Item" from your dashboard, upload clear photos, describe your item accurately, set your price, and choose your campus. Your listing goes live immediately and is visible to students on your campus and beyond.',
    category: 'selling',
  },
  {
    id: 4,
    question: 'How and when do I get paid as a seller?',
    answer:
      'After the buyer confirms delivery, your earnings (minus the platform commission) are released to your registered mobile money or bank account within 24-48 hours. You\'ll receive a notification when the payout is processed.',
    category: 'selling',
  },
  {
    id: 5,
    question: 'How does delivery work?',
    answer:
      'CediMart handles all deliveries. After an order is placed, our delivery team picks up the item from the seller and delivers it to you. Standard delivery takes 24-48 hours. You can track your order status in the app.',
    category: 'delivery',
  },
  {
    id: 6,
    question: 'What if an item is not as described?',
    answer:
      'You have 24 hours from delivery to inspect the item. If it\'s significantly different from the description, damaged, or not what you ordered, report it immediately through the app. Our support team will investigate and facilitate a refund if warranted.',
    category: 'buying',
  },
  {
    id: 7,
    question: 'Is there a fee for selling on CediMart?',
    answer:
      'Yes, CediMart charges a small commission on each successful sale to cover platform operations, payment processing, and delivery logistics. The exact rate is shown before you publish each listing. There are no upfront or listing fees.',
    category: 'selling',
  },
  {
    id: 8,
    question: 'How do I reset my password?',
    answer:
      'On the login screen, tap "Forgot Password" and enter your registered phone number. We\'ll send you a verification code to reset your password securely.',
    category: 'account',
  },
  {
    id: 9,
    question: 'What items are prohibited?',
    answer:
      'We do not allow counterfeit goods, stolen items, weapons, alcohol, drugs, or any items violating university policies or Ghanaian law. Violations may result in permanent account suspension.',
    category: 'general',
  },
  {
    id: 10,
    question: 'How do I contact a seller?',
    answer:
      'You can message sellers directly through our in-app chat feature. For your safety, we recommend keeping all communication within the app rather than sharing personal phone numbers.',
    category: 'buying',
  },
  {
    id: 11,
    question: 'Which campuses are supported?',
    answer:
      'CediMart is available at University of Ghana (UG), KNUST, UCC, UEW, UPSA, Ashesi, GIMPA, and ATU. We\'re expanding to more campuses soon!',
    category: 'general',
  },
  {
    id: 12,
    question: 'Can I buy from sellers on other campuses?',
    answer:
      'Yes! You can browse and purchase items from any of our partner campuses. Our delivery team handles cross-campus deliveries so you can shop from a wider selection.',
    category: 'buying',
  },
];

const SUPPORT_PHONE = '+233505671577';
const SUPPORT_PHONE_DISPLAY = '+233 50 567 1577';
const SUPPORT_EMAIL = 'support@cedimart.com';
const WHATSAPP_NUMBER = '233505671577';

// ─── Component ────────────────────────────────────────────────────────────────
export default function SupportClient() {
  const router = useRouter();
  const [activeFAQ, setActiveFAQ] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFAQs = FAQS.filter((faq) => {
    const topicOk =
      selectedTopic === 'all' || faq.category === selectedTopic;
    const searchOk =
      !searchQuery.trim() ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return topicOk && searchOk;
  });

  const handleCall = () => {
    if (typeof window !== 'undefined') {
      window.location.href = `tel:${SUPPORT_PHONE}`;
    }
  };

  const handleEmail = () => {
    if (typeof window !== 'undefined') {
      window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
        'CediMart Support Request'
      )}`;
    }
  };

  const handleWhatsApp = () => {
    if (typeof window !== 'undefined') {
      window.open(
        `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
          'Hello CediMart Support'
        )}`,
        '_blank',
        'noopener,noreferrer'
      );
    }
  };

  const handleFAQToggle = (id) => {
    setActiveFAQ((prev) => (prev === id ? null : id));
  };

  return (
    <div className="sp-page">
      {/* Hero */}
      <div className="sp-hero">
        <div className="sp-hero-circle sp-circle-1" />
        <div className="sp-hero-circle sp-circle-2" />
        <div className="sp-hero-circle sp-circle-3" />

        <div className="sp-hero-inner">
          <div className="sp-hero-icon-ring">
            <div className="sp-hero-icon-inner">
              <Headset size={34} strokeWidth={2} />
            </div>
          </div>
          <h1 className="sp-hero-title">How can we help?</h1>
          <p className="sp-hero-sub">
            Our team is ready to assist you every step of the way
          </p>
          <div className="sp-avail-pill">
            <span className="sp-avail-dot" />
            <span>Support available · 8AM – 8PM daily</span>
          </div>
        </div>
      </div>

      <div className="sp-shell">
        {/* ── Contact channels ── */}
        <section className="sp-channels-card">
          <p className="sp-card-label">REACH US VIA</p>
          <div className="sp-channels-row">
            <button
              type="button"
              className="sp-channel-btn"
              onClick={handleWhatsApp}
              style={{ background: '#F0FDF4' }}
            >
              <span
                className="sp-channel-icon-wrap"
                style={{ background: '#25D366' }}
              >
                <MessageCircle size={22} strokeWidth={2.4} />
              </span>
              <span
                className="sp-channel-label"
                style={{ color: '#25D366' }}
              >
                WhatsApp
              </span>
              <span className="sp-channel-sub">Fastest response</span>
            </button>

            <button
              type="button"
              className="sp-channel-btn"
              onClick={handleCall}
              style={{ background: '#EFF6FF' }}
            >
              <span
                className="sp-channel-icon-wrap"
                style={{ background: '#1565C0' }}
              >
                <Phone size={22} strokeWidth={2.4} />
              </span>
              <span
                className="sp-channel-label"
                style={{ color: '#1565C0' }}
              >
                Call Us
              </span>
              <span className="sp-channel-sub">{SUPPORT_PHONE_DISPLAY}</span>
            </button>

            <button
              type="button"
              className="sp-channel-btn"
              onClick={handleEmail}
              style={{ background: '#FEF2F2' }}
            >
              <span
                className="sp-channel-icon-wrap"
                style={{ background: '#C62828' }}
              >
                <Mail size={22} strokeWidth={2.4} />
              </span>
              <span
                className="sp-channel-label"
                style={{ color: '#C62828' }}
              >
                Email
              </span>
              <span className="sp-channel-sub">Within 2 hours</span>
            </button>
          </div>
        </section>

        {/* ── Vendor card ── */}
        <section className="sp-card">
          <div className="sp-card-title-row">
            <span className="sp-card-title-icon">
              <Store size={16} strokeWidth={2.4} />
            </span>
            <h2 className="sp-card-title">Are you a vendor?</h2>
          </div>
          <p className="sp-vendor-info">
            If you&apos;re selling on CediMart, visit our dedicated Vendor
            Support Center for information about payouts, commissions, delivery,
            and more.
          </p>
          <Link href="/vendor-support" className="sp-vendor-link-btn">
            <ArrowRight size={14} strokeWidth={2.4} />
            Go to Vendor Support
          </Link>
        </section>

        {/* ── FAQ ── */}
        <section className="sp-card">
          <div className="sp-card-title-row">
            <span className="sp-card-title-icon">
              <MessageCircle size={16} strokeWidth={2.4} />
            </span>
            <h2 className="sp-card-title">Frequently Asked</h2>
          </div>

          {/* Search */}
          <div className="sp-search-wrap">
            <Search
              size={16}
              strokeWidth={2.2}
              className="sp-search-icon"
            />
            <input
              type="text"
              className="sp-search-input"
              placeholder="Search FAQs…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="sp-search-clear"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Topic chips */}
          <div className="sp-topics-scroll">
            <button
              type="button"
              className={`sp-topic-chip${
                selectedTopic === 'all' ? ' is-active' : ''
              }`}
              onClick={() => setSelectedTopic('all')}
            >
              All
            </button>
            {SUPPORT_TOPICS.map((t) => {
              const Icon = t.icon;
              const active = selectedTopic === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  className={`sp-topic-chip${active ? ' is-active' : ''}`}
                  onClick={() => setSelectedTopic(t.id)}
                >
                  <Icon size={12} strokeWidth={2.4} />
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* FAQ list */}
          <div className="sp-faq-list">
            {filteredFAQs.length === 0 ? (
              <div className="sp-empty-faq">
                <Search size={40} strokeWidth={1.5} color="#D1D5DB" />
                <p className="sp-empty-faq-text">
                  No FAQs found
                  {searchQuery ? ` for "${searchQuery}"` : ' for this topic'}
                </p>
                <button
                  type="button"
                  className="sp-empty-faq-link"
                  onClick={() => {
                    setSelectedTopic('all');
                    setSearchQuery('');
                  }}
                >
                  Clear filters →
                </button>
              </div>
            ) : (
              filteredFAQs.map((faq, idx) => {
                const isOpen = activeFAQ === faq.id;
                const isLast = idx === filteredFAQs.length - 1;
                return (
                  <div
                    key={faq.id}
                    className={`sp-faq-item${isLast ? ' is-last' : ''}`}
                  >
                    <button
                      type="button"
                      className="sp-faq-row"
                      onClick={() => handleFAQToggle(faq.id)}
                      aria-expanded={isOpen}
                    >
                      <span className="sp-faq-num-badge">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <span className="sp-faq-q">{faq.question}</span>
                      <span className={`sp-faq-toggle${isOpen ? ' is-open' : ''}`}>
                        {isOpen ? (
                          <Minus size={20} strokeWidth={2.6} />
                        ) : (
                          <Plus size={20} strokeWidth={2.6} />
                        )}
                      </span>
                    </button>
                    {isOpen && (
                      <div className="sp-faq-answer">
                        <p>{faq.answer}</p>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* ── Support hours ── */}
        <section className="sp-card">
          <div className="sp-card-title-row">
            <span className="sp-card-title-icon">
              <Clock size={16} strokeWidth={2.4} />
            </span>
            <h2 className="sp-card-title">Support Hours</h2>
          </div>

          <div className="sp-hours-table">
            {[
              { day: 'Monday – Friday', time: '8:00 AM – 8:00 PM', active: true },
              { day: 'Saturday',        time: '9:00 AM – 6:00 PM', active: true },
              { day: 'Sunday',          time: '10:00 AM – 4:00 PM', active: false },
            ].map((row, i) => (
              <div
                key={i}
                className={`sp-hours-row${i < 2 ? ' has-border' : ''}`}
              >
                <span className="sp-hours-day-row">
                  <span
                    className={`sp-hours-dot${!row.active ? ' is-off' : ''}`}
                  />
                  <span className="sp-hours-day">{row.day}</span>
                </span>
                <span
                  className={`sp-hours-time${!row.active ? ' is-off' : ''}`}
                >
                  {row.time}
                </span>
              </div>
            ))}
          </div>

          <div className="sp-holiday-banner">
            <AlertCircle size={16} strokeWidth={2.4} />
            <span>Limited hours on public holidays</span>
          </div>
        </section>

        {/* ── CTA footer ── */}
        <section className="sp-cta">
          <h2 className="sp-cta-title">Still need help?</h2>
          <p className="sp-cta-sub">
            Our dedicated support team is standing by to resolve any issue
            quickly and professionally.
          </p>
          <div className="sp-cta-buttons">
            <button
              type="button"
              className="sp-cta-primary"
              onClick={handleWhatsApp}
            >
              <MessageCircle size={16} strokeWidth={2.4} />
              Chat on WhatsApp
            </button>
            <button
              type="button"
              className="sp-cta-secondary"
              onClick={handleEmail}
            >
              <Send size={16} strokeWidth={2.4} />
              Send Email
            </button>
          </div>
        </section>

        <div className="sp-bottom-spacer" />
      </div>
    </div>
  );
}