import React, { useState, useEffect } from 'react';

// Lightweight Toast state bus
const toastListeners = new Set();
export const toast = {
  success: (msg) => toastListeners.forEach(fn => fn({ type: 'success', message: msg })),
  error: (msg) => toastListeners.forEach(fn => fn({ type: 'error', message: msg })),
  info: (msg) => toastListeners.forEach(fn => fn({ type: 'info', message: msg }))
};

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleToast = (newToast) => {
      const id = Date.now() + Math.random();
      setToasts(prev => [...prev, { ...newToast, id }]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 3500);
    };

    toastListeners.add(handleToast);
    return () => toastListeners.delete(handleToast);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '2rem',
      right: '2rem',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      pointerEvents: 'none'
    }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          padding: '0.85rem 1.25rem',
          borderRadius: '8px',
          background: t.type === 'error' ? '#ef4444' : t.type === 'success' ? '#10b981' : '#3b82f6',
          color: '#ffffff',
          fontWeight: '600',
          fontSize: '0.9rem',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          pointerEvents: 'auto',
          minWidth: '240px',
          justifyContent: 'space-between'
        }}>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}

export function Button({ children, variant = 'primary', size = 'md', className = '', ...props }) {
  const baseClass = variant === 'primary' ? 'btn-primary' : variant === 'secondary' ? 'btn-secondary' : 'btn-ghost';
  return (
    <button className={`${baseClass} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function Card({ children, className = '', elevated = false, ...props }) {
  return (
    <div className={`card ${elevated ? 'card-elevated' : ''} ${className}`} {...props}>
      {children}
    </div>
  );
}

export function Spinner({ size = 'md', className = '' }) {
  const dimension = size === 'sm' ? '20px' : size === 'lg' ? '48px' : '32px';
  return (
    <div className={`spinner-container ${className}`} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{
        width: dimension,
        height: dimension,
        border: '3px solid rgba(255, 255, 255, 0.2)',
        borderTopColor: 'var(--primary, #00f2fe)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export function Badge({ children, variant = 'default', className = '', ...props }) {
  return (
    <span className={`badge badge-${variant} ${className}`} {...props}>
      {children}
    </span>
  );
}

export function Alert({ children, variant = 'info', className = '', ...props }) {
  const typeClass = variant === 'error' ? 'alert-error' : variant === 'success' ? 'alert-success' : 'alert-info';
  return (
    <div className={`alert ${typeClass} ${className}`} role="alert" {...props}>
      {children}
    </div>
  );
}

export function Input({ label, error, className = '', ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', width: '100%' }}>
      {label && <label style={{ fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>}
      <input className={`form-input ${className}`} style={{ width: '100%' }} {...props} />
      {error && <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.1rem' }}>{error}</span>}
    </div>
  );
}

export function Textarea({ label, error, className = '', ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', width: '100%' }}>
      {label && <label style={{ fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>}
      <textarea className={`form-textarea ${className}`} style={{ width: '100%', minHeight: '100px' }} {...props} />
      {error && <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.1rem' }}>{error}</span>}
    </div>
  );
}

export function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,0.75)',
      backdropFilter: 'blur(6px)',
      padding: '1rem'
    }}>
      <div className="card" style={{
        width: '100%',
        maxWidth: '550px',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative',
        zIndex: 1000
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem' }}>
          {title && <h3 style={{ margin: 0 }}>{title}</h3>}
          <button onClick={onClose} className="btn-ghost" style={{ padding: '0.25rem 0.5rem', fontSize: '1.25rem' }}>&times;</button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}

export function Stat({ value, label, className = '' }) {
  return (
    <div className={`stat ${className}`}>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

export function EmptyState({ title = 'No items found', description, action }) {
  return (
    <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem', margin: '2rem 0' }}>
      <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{title}</h3>
      {description && <p style={{ opacity: 0.7, maxWidth: '400px', margin: '0 auto 1.5rem auto' }}>{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
}

export function PageHeader({ eyebrow, title, subtitle }) {
  return (
    <div className="section-head" style={{ marginBottom: '2.5rem' }}>
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      {title && <h1>{title}</h1>}
      {subtitle && <p className="hero-subtitle">{subtitle}</p>}
    </div>
  );
}

export function Table({ headers = [], children, className = '' }) {
  return (
    <div style={{ overflowX: 'auto', width: '100%' }}>
      <table className={`data-table ${className}`} style={{ width: '100%', borderCollapse: 'collapse' }}>
        {headers.length > 0 && (
          <thead>
            <tr>
              {headers.map((h, i) => (
                <th key={i} style={{ textAlign: 'left', padding: '0.75rem 1rem', borderBottom: '2px solid rgba(255,255,255,0.1)' }}>{h}</th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function Tabs({ tabs = [], activeTab, onChange }) {
  return (
    <div className="filter-bar" style={{ marginBottom: '1.5rem' }}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={activeTab === tab.id ? 'active' : ''}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export default {
  toast,
  ToastContainer,
  Button,
  Card,
  Spinner,
  Badge,
  Alert,
  Input,
  Textarea,
  Modal,
  Stat,
  EmptyState,
  PageHeader,
  Table,
  Tabs
};