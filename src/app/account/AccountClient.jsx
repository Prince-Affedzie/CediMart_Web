// src/app/account/AccountClient.jsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  User,
  School,
  Pencil,
  LogOut,
  ShoppingCart,
  Package,
  Heart,
  Gift,
  HelpCircle,
  Info,
  ShieldCheck,
  Trash2,
  ChevronRight,
  Loader2,
  AlertCircle,
  X,
  Check,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import './account.css';

export default function AccountClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, logoutUser, updateUser, deleteAccount, isAuthenticated, loading: authLoading } = useAuth();
  const { cartItems = [] } = useCart();

  const [loading, setLoading] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editField, setEditField] = useState('');
  const [editValue, setEditValue] = useState('');
  const [topError, setTopError] = useState('');
  const [successToast, setSuccessToast] = useState('');

  const followerCount = user?.followersCount || user?.followers?.length || 0;
  const followingCount = user?.followingCount || user?.following?.length || 0;
  const orderCount = user?.orders?.length || 0;
  const savedCount = user?.savedPostsCount || 0;
  const cartCount = cartItems.length;

  const getInitials = () => {
    if (!user) return '?';
    const f = (user.firstName || '').charAt(0);
    const l = (user.lastName || '').charAt(0);
    return `${f}${l}`.toUpperCase() || user.name?.charAt(0)?.toUpperCase() || '?';
  };

  const getFullName = () => {
    if (!user) return '';
    if (user.name) return user.name;
    return `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Guest';
  };

  const getHandle = () => {
    if (user?.username) return user.username;
    return getFullName().replace(/\s+/g, '').toLowerCase();
  };

  // Show success toast briefly
  const showSuccessToast = (msg) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(''), 2600);
  };

  const handleEditField = (field) => {
    setEditField(field);
    setEditValue(user?.[field] || '');
    setEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editValue.trim()) {
      setTopError('Please enter a value');
      return;
    }
    try {
      setLoading(true);
      await updateUser({ ...user, [editField]: editValue.trim() });
      setEditModalOpen(false);
      showSuccessToast('Profile updated');
    } catch {
      setTopError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (!confirm('Are you sure you want to log out?')) return;
    try {
      setLoading(true);
      await logoutUser();
      router.replace('/');
    } catch {
      setTopError('Failed to log out');
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteAccount = async () => {
    try {
      setLoading(true);
      await deleteAccount();
      router.replace('/');
    } catch {
      setTopError('Something went wrong');
    } finally {
      setLoading(false);
      setDeleteModalOpen(false);
    }
  };

  // ── Not logged in ──────────────────────────────────────────────────────
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="ac-page">
        <div className="ac-guest">
          <div className="ac-guest-avatar">
            <User size={48} strokeWidth={1.6} />
          </div>
          <h1 className="ac-guest-title">Welcome!</h1>
          <p className="ac-guest-text">
            Login to connect with your campus community, share moments, and
            discover great deals.
          </p>
          <Link href="/login?redirect=/account" className="ac-btn ac-btn-primary">
           <LogOut size={16} strokeWidth={2.4} style={{ transform: 'scaleX(-1)' }} />
            Login
          </Link>
          <Link href="/signup?redirect=/account" className="ac-btn ac-btn-outline">
            Create Account
          </Link>
        </div>
      </div>
    );
  }

  if (authLoading) {
    return (
      <div className="ac-page">
        <div className="ac-guest">
          <Loader2 size={32} strokeWidth={2.4} className="ac-spin" />
        </div>
      </div>
    );
  }

  // ── Menu item helper ───────────────────────────────────────────────────
  const MenuItem = ({ icon: Icon, label, href, onClick, color = 'brand', destructive = false }) => {
    const colorVar = `var(--ac-${color})`;
    const bgVar = `var(--ac-${color}-bg)`;

    const content = (
      <>
        <span className="ac-menu-left">
          <span
            className="ac-menu-icon"
            style={{ background: bgVar, color: colorVar }}
          >
            <Icon size={18} strokeWidth={2.2} />
          </span>
          <span
            className="ac-menu-label"
            style={destructive ? { color: 'var(--ac-danger)' } : undefined}
          >
            {label}
          </span>
        </span>
        <ChevronRight size={16} strokeWidth={2.4} className="ac-menu-chevron" />
      </>
    );

    if (href) {
      return (
        <Link href={href} className="ac-menu-item">
          {content}
        </Link>
      );
    }
    return (
      <button type="button" className="ac-menu-item" onClick={onClick}>
        {content}
      </button>
    );
  };

  return (
    <div className="ac-page">
      {/* Success toast */}
      {successToast && (
        <div className="ac-toast">
          <Check size={14} strokeWidth={3} />
          {successToast}
        </div>
      )}

      {/* Error banner */}
      {topError && (
        <div className="ac-error-banner" role="alert">
          <AlertCircle size={16} strokeWidth={2.4} />
          <span>{topError}</span>
          <button
            className="ac-error-close"
            onClick={() => setTopError('')}
            aria-label="Dismiss error"
          >
            <X size={14} strokeWidth={2.6} />
          </button>
        </div>
      )}

      <div className="ac-shell">
        {/* ── Hero header ── */}
        <section className="ac-hero">
          <div className="ac-hero-top">
            <span className="ac-hero-label">My Profile</span>
          </div>

          <div className="ac-hero-identity">
            <div className="ac-hero-avatar">
              {user?.profileImage ? (
                <Image
                  src={user.profileImage}
                  alt={getFullName()}
                  width={64}
                  height={64}
                  className="ac-hero-avatar-img"
                />
              ) : (
                <span className="ac-hero-avatar-text">{getInitials()}</span>
              )}
            </div>
            <div className="ac-hero-info">
              <h1 className="ac-hero-name">{getFullName()}</h1>
              <p className="ac-hero-handle">@{getHandle()}</p>
              <span className="ac-hero-role">
                <School size={11} strokeWidth={2.4} />
                {user?.campus || 'Campus Student'}
              </span>
            </div>
          </div>

          {/* Community stats row */}
          {(followerCount > 0 || followingCount > 0) && (
            <div className="ac-hero-stats">
              <div className="ac-hero-stat">
                <strong>{followingCount}</strong>
                <span>Following</span>
              </div>
              <span className="ac-hero-stat-divider" />
              <div className="ac-hero-stat">
                <strong>{followerCount}</strong>
                <span>Followers</span>
              </div>
            </div>
          )}

          <div className="ac-hero-actions">
            <button
              type="button"
              className="ac-hero-pill"
              onClick={() => handleEditField('firstName')}
            >
              <Pencil size={13} strokeWidth={2.4} />
              Edit Profile
            </button>
            <button
              type="button"
              className="ac-hero-pill ac-hero-pill-muted"
              onClick={handleLogout}
            >
              <LogOut size={13} strokeWidth={2.4} />
              Logout
            </button>
          </div>
        </section>

        {/* ── My Activity ── */}
        <section className="ac-section">
          <h2 className="ac-section-title">My Activity</h2>
          <div className="ac-stats-grid">
            <Link href="/cart" className="ac-stat-card">
              <span className="ac-stat-icon" style={{ background: 'var(--ac-accent-bg)', color: 'var(--ac-accent)' }}>
                <ShoppingCart size={20} strokeWidth={2.2} />
              </span>
              <span className="ac-stat-value">{cartCount}</span>
              <span className="ac-stat-label">Cart</span>
            </Link>

            <Link href="/orders" className="ac-stat-card">
              <span className="ac-stat-icon" style={{ background: 'var(--ac-info-bg)', color: 'var(--ac-info)' }}>
                <Package size={20} strokeWidth={2.2} />
              </span>
              <span className="ac-stat-value">{orderCount}</span>
              <span className="ac-stat-label">Orders</span>
            </Link>

            <Link href="/saved" className="ac-stat-card">
              <span className="ac-stat-icon" style={{ background: 'var(--ac-gold-bg)', color: 'var(--ac-gold)' }}>
                <Heart size={20} strokeWidth={2.2} />
              </span>
              <span className="ac-stat-value">{savedCount}</span>
              <span className="ac-stat-label">Saved</span>
            </Link>

            <Link href="/listings" className="ac-stat-card">
              <span className="ac-stat-icon" style={{ background: 'var(--ac-brand-bg)', color: 'var(--ac-brand)' }}>
                <Package size={20} strokeWidth={2.2} />
              </span>
              <span className="ac-stat-value">Shop</span>
              <span className="ac-stat-label">Browse</span>
            </Link>
          </div>
        </section>

        {/* ── Shopping ── */}
        <section className="ac-section">
          <h2 className="ac-section-title">Shopping</h2>
          <div className="ac-menu-card">
            <MenuItem icon={ShoppingCart} label="My Cart" href="/cart" color="accent" />
            <MenuItem icon={Package} label="Order History" href="/orders" color="info" />
            <MenuItem icon={Gift} label="Earnings & Rewards" href="/earnings" color="success" />
            <MenuItem icon={Heart} label="Favorites" href="/favorites" color="danger" />
          </div>
        </section>

        {/* ── Settings & Support ── */}
        <section className="ac-section">
          <h2 className="ac-section-title">Settings & Support</h2>
          <div className="ac-menu-card">
            <MenuItem icon={HelpCircle} label="Help & Support" href="/support" color="accent" />
            <MenuItem icon={Info} label="About CediMart" href="/about" color="info" />
            <MenuItem
              icon={ShieldCheck}
              label="Privacy & Terms"
              href="/privacy-policy"
              color="success"
            />
          </div>
        </section>

        {/* ── Account ── */}
        <section className="ac-section">
          <h2 className="ac-section-title">Account</h2>
          <div className="ac-menu-card ac-menu-card-danger">
            <MenuItem icon={LogOut} label="Logout" onClick={handleLogout} color="accent" />
            <MenuItem
              icon={Trash2}
              label="Delete Account"
              onClick={() => setDeleteModalOpen(true)}
              color="danger"
              destructive
            />
          </div>
        </section>

        <div style={{ height: 40 }} />
        
      </div>

      {/* ── Edit modal ── */}
      {editModalOpen && (
        <div className="ac-modal-backdrop" onClick={() => setEditModalOpen(false)}>
          <div className="ac-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ac-modal-handle" />
            <h3 className="ac-modal-title">
              Edit {editField.charAt(0).toUpperCase() + editField.slice(1)}
            </h3>
            <input
              type="text"
              className="ac-modal-input"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              placeholder={`Enter your ${editField}`}
              autoFocus
            />
            <div className="ac-modal-buttons">
              <button
                type="button"
                className="ac-modal-btn ac-modal-btn-cancel"
                onClick={() => setEditModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="ac-modal-btn ac-modal-btn-save"
                onClick={handleSaveEdit}
                disabled={loading}
              >
                {loading ? <Loader2 size={16} strokeWidth={2.6} className="ac-spin" /> : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete confirmation modal ── */}
      {deleteModalOpen && (
        <div className="ac-modal-backdrop" onClick={() => setDeleteModalOpen(false)}>
          <div
            className="ac-modal ac-modal-danger"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="ac-delete-icon">
              <Trash2 size={36} strokeWidth={1.8} />
            </div>
            <h3 className="ac-delete-title">Delete Account?</h3>
            <p className="ac-delete-subtitle">
              This action is permanent and cannot be undone. All your data will
              be permanently deleted.
            </p>
            <div className="ac-modal-buttons">
              <button
                type="button"
                className="ac-modal-btn ac-modal-btn-cancel"
                onClick={() => setDeleteModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="ac-modal-btn ac-modal-btn-delete"
                onClick={confirmDeleteAccount}
                disabled={loading}
              >
                {loading ? <Loader2 size={16} strokeWidth={2.6} className="ac-spin" /> : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && <div className="ac-loading-overlay"><Loader2 size={32} strokeWidth={2.4} className="ac-spin" /></div>}
    </div>
  );
}