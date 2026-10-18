import React from 'react'

function _showToast(message, type = 'info') {
  if (typeof document === 'undefined') return
  const colors = { success: '#16a34a', error: '#dc2626', warning: '#d97706', info: '#374151' }
  const el = document.createElement('div')
  el.textContent = message
  el.style.cssText = `position:fixed;bottom:24px;right:24px;z-index:9999;padding:12px 20px;border-radius:10px;color:#fff;font-size:14px;font-weight:500;background:${colors[type]||colors.info};box-shadow:0 4px 16px rgba(0,0,0,.18);transition:opacity .3s;`
  document.body.appendChild(el)
  setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 300) }, 3000)
}
export const toast = Object.assign(
  (message, type) => _showToast(message, type),
  { success: (m) => _showToast(m, 'success'), error: (m) => _showToast(m, 'error'), warning: (m) => _showToast(m, 'warning'), info: (m) => _showToast(m, 'info') }
)

export function Button({ children, onClick, type = 'button', variant = 'primary', disabled = false, className = '', ...props }) {
  const cls = variant === 'secondary' ? 'btn-secondary' : variant === 'ghost' ? 'btn-ghost' : 'btn-primary'
  return <button type={type} onClick={onClick} disabled={disabled} className={`${cls} ${className}`} style={{ opacity: disabled ? 0.6 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }} {...props}>{children}</button>
}

export function Card({ children, className = '', style = {}, ...props }) {
  return <div className={`card ${className}`} style={{ background: 'var(--surface,#fff)', border: '1px solid var(--border,rgba(0,0,0,.08))', borderRadius: '12px', padding: '24px', ...style }} {...props}>{children}</div>
}

export function Spinner({ className = '', ...props }) {
  return (
    <div className={`spinner-container ${className}`} style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', padding:'1rem', width:'100%' }} {...props}>
      <div style={{ width:'2.5rem', height:'2.5rem', border:'3px solid rgba(var(--primary-rgb,99,102,241),.15)', borderTopColor:'var(--primary,#6366f1)', borderRadius:'50%', animation:'spin .8s linear infinite' }} />
      <style dangerouslySetInnerHTML={{__html:'@keyframes spin{to{transform:rotate(360deg)}}'}} />
    </div>
  )
}

export function Badge({ children, variant = 'primary', className = '', ...props }) {
  const styles = {
    primary: { background:'rgba(99,102,241,.15)', color:'#6366f1', border:'1px solid rgba(99,102,241,.3)' },
    success: { background:'rgba(34,197,94,.15)', color:'#22c55e', border:'1px solid rgba(34,197,94,.3)' },
    warning: { background:'rgba(234,179,8,.15)', color:'#eab308', border:'1px solid rgba(234,179,8,.3)' },
    secondary: { background:'rgba(100,116,139,.15)', color:'#94a3b8', border:'1px solid rgba(100,116,139,.3)' },
  }
  return <span className={`badge ${className}`} style={{ display:'inline-block', padding:'.25rem .6rem', fontSize:'.75rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'.05em', borderRadius:'9999px', ...(styles[variant]||styles.primary) }} {...props}>{children}</span>
}

export function Alert({ children, variant = 'error', className = '', ...props }) {
  const cls = variant === 'success' ? 'alert alert-success' : variant === 'info' ? 'alert alert-info' : 'alert alert-error'
  return <div className={`${cls} ${className}`} style={{ margin:'1rem 0', padding:'1rem', borderRadius:'6px', borderLeft:'4px solid currentColor' }} {...props}>{children}</div>
}

export function Input({ className = '', style = {}, ...props }) {
  return <input className={className} style={{ width:'100%', padding:'10px 14px', border:'1px solid var(--border,rgba(0,0,0,.12))', borderRadius:'8px', fontSize:'.9375rem', background:'var(--surface,#fff)', color:'var(--text,#111)', outline:'none', ...style }} {...props} />
}

export function Textarea({ className = '', style = {}, ...props }) {
  return <textarea className={className} style={{ width:'100%', padding:'10px 14px', border:'1px solid var(--border,rgba(0,0,0,.12))', borderRadius:'8px', fontSize:'.9375rem', background:'var(--surface,#fff)', color:'var(--text,#111)', outline:'none', resize:'vertical', minHeight:'100px', ...style }} {...props} />
}

export function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null
  return (
    <div style={{ position:'fixed', inset:0, zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,.5)' }} onClick={onClose}>
      <div className="card" style={{ maxWidth:'500px', width:'90%', maxHeight:'80vh', overflowY:'auto' }} onClick={(e) => e.stopPropagation()}>
        {title && <h3 style={{ marginBottom:'1rem' }}>{title}</h3>}
        {children}
        <button className="btn-ghost" onClick={onClose} style={{ marginTop:'1rem' }}>Close</button>
      </div>
    </div>
  )
}

export function Stat({ value, label, icon, className = '' }) {
  return (
    <div className={`stat ${className}`} style={{ textAlign:'center', padding:'1.5rem', background:'var(--surface,#fff)', borderRadius:'12px', border:'1px solid var(--border,rgba(0,0,0,.08))' }}>
      {icon && <div style={{ fontSize:'2rem', marginBottom:'.5rem' }}>{icon}</div>}
      <div style={{ fontSize:'2.25rem', fontWeight:700, color:'var(--primary,#6366f1)', lineHeight:1 }}>{value}</div>
      <div style={{ fontSize:'.875rem', color:'var(--muted,#64748b)', marginTop:'.35rem' }}>{label}</div>
    </div>
  )
}

export function EmptyState({ title = 'Nothing here yet', description, action, icon = '📭' }) {
  return (
    <div style={{ textAlign:'center', padding:'4rem 2rem', color:'var(--muted,#64748b)' }}>
      <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>{icon}</div>
      <h3 style={{ margin:'0 0 .5rem', color:'var(--text,#111)', fontWeight:600 }}>{title}</h3>
      {description && <p style={{ margin:'0 0 1.5rem', maxWidth:'400px', marginInline:'auto' }}>{description}</p>}
      {action && <div>{action}</div>}
    </div>
  )
}

export function PageHeader({ title, subtitle, actions, className = '' }) {
  return (
    <div className={`page-header ${className}`} style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem', marginBottom:'2rem' }}>
      <div>
        <h1 style={{ margin:0, fontSize:'clamp(1.5rem,3vw,2rem)', fontWeight:700 }}>{title}</h1>
        {subtitle && <p style={{ margin:'.35rem 0 0', color:'var(--muted,#64748b)' }}>{subtitle}</p>}
      </div>
      {actions && <div style={{ display:'flex', gap:'.5rem', flexWrap:'wrap' }}>{actions}</div>}
    </div>
  )
}

export function Table({ columns = [], rows = [], className = '' }) {
  return (
    <div style={{ overflowX:'auto' }}>
      <table className={`table ${className}`} style={{ width:'100%', borderCollapse:'collapse', fontSize:'.9375rem' }}>
        <thead>
          <tr>
            {columns.map((col, i) => (
              <th key={i} style={{ padding:'.75rem 1rem', textAlign:'left', borderBottom:'2px solid var(--border,rgba(0,0,0,.1))', fontWeight:600, color:'var(--muted,#64748b)', whiteSpace:'nowrap' }}>
                {typeof col === 'string' ? col : col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} style={{ borderBottom:'1px solid var(--border,rgba(0,0,0,.06))' }}>
              {columns.map((col, ci) => (
                <td key={ci} style={{ padding:'.75rem 1rem' }}>{typeof col === 'string' ? row[col] : (col.accessor ? row[col.accessor] : row[ci])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function Tabs({ tabs = [], active, onChange, className = '' }) {
  return (
    <div className={`tabs ${className}`} style={{ display:'flex', gap:'.25rem', borderBottom:'2px solid var(--border,rgba(0,0,0,.1))', marginBottom:'1.5rem' }}>
      {tabs.map((tab) => {
        const id = typeof tab === 'string' ? tab : tab.id
        const label = typeof tab === 'string' ? tab : tab.label
        const isActive = active === id
        return (
          <button key={id} onClick={() => onChange?.(id)}
            style={{ padding:'.6rem 1.25rem', background:'none', border:'none', borderBottom:isActive ? '2px solid var(--primary,#6366f1)' : '2px solid transparent', marginBottom:'-2px', fontWeight:isActive ? 600 : 400, color:isActive ? 'var(--primary,#6366f1)' : 'var(--muted,#64748b)', cursor:'pointer', borderRadius:'4px 4px 0 0', transition:'all .15s' }}>
            {label}
          </button>
        )
      })}
    </div>
  )
}

const UI = { toast, Button, Card, Spinner, Badge, Alert, Input, Textarea, Modal, Stat, EmptyState, PageHeader, Table, Tabs }
export default UI
