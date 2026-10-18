import { useState, useEffect } from 'react'
import axios from 'axios'

// ForgeAI admin panel — generic CRUD over every data model.
// Intentionally NOT linked from the public site; reach it directly at /admin.
const MODELS = [
  {
    "name": "Product",
    "endpoint": "/api/products",
    "fields": [
      {
        "name": "name",
        "type": "String",
        "required": true,
        "enumValues": []
      },
      {
        "name": "category",
        "type": "String",
        "required": true,
        "enumValues": [
          "Field Hockey",
          "Padel",
          "Apparel",
          "Accessories",
          "Bags",
          "Protection",
          "Balls & Equipment"
        ]
      },
      {
        "name": "brand",
        "type": "String",
        "required": true,
        "enumValues": []
      },
      {
        "name": "price",
        "type": "Number",
        "required": true,
        "enumValues": []
      },
      {
        "name": "stock",
        "type": "Number",
        "required": true,
        "enumValues": []
      },
      {
        "name": "images",
        "type": "String",
        "required": false,
        "enumValues": []
      },
      {
        "name": "description",
        "type": "String",
        "required": true,
        "enumValues": []
      },
      {
        "name": "skillLevel",
        "type": "String",
        "required": false,
        "enumValues": [
          "Beginner",
          "Intermediate",
          "Advanced",
          "Professional",
          "All Levels"
        ]
      },
      {
        "name": "sizes",
        "type": "String",
        "required": false,
        "enumValues": []
      }
    ]
  },
  {
    "name": "Order",
    "endpoint": "/api/orders",
    "fields": [
      {
        "name": "userId",
        "type": "String",
        "required": true,
        "enumValues": []
      },
      {
        "name": "items",
        "type": "String",
        "required": false,
        "enumValues": []
      },
      {
        "name": "totalAmount",
        "type": "Number",
        "required": true,
        "enumValues": []
      },
      {
        "name": "shippingAddress",
        "type": "String",
        "required": false,
        "enumValues": []
      },
      {
        "name": "status",
        "type": "String",
        "required": false,
        "enumValues": [
          "pending",
          "processing",
          "shipped",
          "delivered",
          "cancelled"
        ]
      },
      {
        "name": "paymentId",
        "type": "String",
        "required": false,
        "enumValues": []
      },
      {
        "name": "createdAt",
        "type": "Date",
        "required": false,
        "enumValues": []
      }
    ]
  },
  {
    "name": "User",
    "endpoint": "/api/users",
    "fields": [
      {
        "name": "name",
        "type": "String",
        "required": true,
        "enumValues": []
      },
      {
        "name": "email",
        "type": "String",
        "required": true,
        "enumValues": []
      },
      {
        "name": "hashedPassword",
        "type": "String",
        "required": true,
        "enumValues": []
      },
      {
        "name": "role",
        "type": "String",
        "required": false,
        "enumValues": [
          "user",
          "admin"
        ]
      },
      {
        "name": "addresses",
        "type": "String",
        "required": false,
        "enumValues": []
      },
      {
        "name": "createdAt",
        "type": "Date",
        "required": false,
        "enumValues": []
      }
    ]
  }
]
const TOKEN_KEY = 'forgeai_admin_token'

function authHeader() {
  const t = localStorage.getItem(TOKEN_KEY)
  return t ? { Authorization: `Bearer ${t}` } : {}
}

// ── Login screen ──────────────────────────────────────────────────────────────
function Login({ onLogin }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data } = await axios.post('/api/admin/login', { password })
      localStorage.setItem(TOKEN_KEY, data.token)
      onLogin()
    } catch {
      setError('Invalid password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <section className="section">
        <form className="card admin-login-card" onSubmit={submit}>
          <h1 className="admin-login-title">Admin Access</h1>
          <label className="admin-field" style={{ display: 'block', marginBottom: 16 }}>
            <span className="admin-label">Password</span>
            <input
              className="admin-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', marginTop: 6 }}
              autoFocus
            />
          </label>
          {error && <p className="admin-error">{error}</p>}
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Logging in…' : 'Log In'}
          </button>
        </form>
      </section>
    </div>
  )
}

// ── Model manager ─────────────────────────────────────────────────────────────
function ModelManager({ model, onAuthFail }) {
  const [rows, setRows] = useState([])
  const [form, setForm] = useState({})
  const [editing, setEditing] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await axios.get(model.endpoint)
      setRows(Array.isArray(data) ? data : (data.items || data.data || []))
      setError('')
    } catch (e) {
      setError('Failed to load ' + model.name + 's')
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, [])

  const set = (name, isBool) => (e) =>
    setForm((f) => ({ ...f, [name]: isBool ? e.target.checked : e.target.value }))

  const reset = () => { setForm({}); setEditing(null) }

  const submit = async (e) => {
    e.preventDefault()
    const payload = {}
    model.fields.forEach((f) => {
      let v = form[f.name]
      if (f.type === 'Boolean') { payload[f.name] = !!v; return }
      if (v === '' || v == null) return
      if (f.type === 'Number') { const n = Number(v); if (!Number.isNaN(n)) payload[f.name] = n; return }
      payload[f.name] = v
    })
    try {
      if (editing) await axios.put(model.endpoint + '/' + editing, payload, { headers: authHeader() })
      else await axios.post(model.endpoint, payload, { headers: authHeader() })
      reset()
      await load()
    } catch (err) {
      if (err.response?.status === 401) { onAuthFail(); return }
      const d = err.response && err.response.data
      setError((d && (d.message || d.error)) || err.message || 'Save failed — check the required fields')
    }
  }

  const edit = (row) => { setEditing(row._id); setForm(row) }

  const remove = async (id) => {
    if (!window.confirm('Delete this record?')) return
    try { await axios.delete(model.endpoint + '/' + id, { headers: authHeader() }); await load() }
    catch (err) {
      if (err.response?.status === 401) { onAuthFail(); return }
      setError('Delete failed')
    }
  }

  return (
    <section className="admin-model card">
      <h2 className="admin-model-title">{model.name}</h2>
      {error && <p className="admin-error">{error}</p>}
      <form className="admin-form" onSubmit={submit}>
        {model.fields.map((f) => (
          <label key={f.name} className="admin-field">
            <span className="admin-label">{f.name}{f.required ? ' *' : ''}</span>
            {f.enumValues && f.enumValues.length ? (
              <select className="admin-input" value={form[f.name] == null ? '' : form[f.name]} onChange={set(f.name)}>
                <option value="">— select —</option>
                {f.enumValues.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            ) : f.type === 'Boolean' ? (
              <input type="checkbox" checked={!!form[f.name]} onChange={set(f.name, true)} />
            ) : (
              <input
                className="admin-input"
                type={f.type === 'Number' ? 'number' : f.type === 'Date' ? 'date' : 'text'}
                value={form[f.name] == null ? '' : form[f.name]}
                onChange={set(f.name)}
              />
            )}
          </label>
        ))}
        <div className="admin-actions">
          <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Create'}</button>
          {editing && (
            <button type="button" className="btn btn-secondary" onClick={reset}>Cancel</button>
          )}
        </div>
      </form>
      {loading ? (
        <p className="admin-loading">Loading…</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                {model.fields.map((f) => <th key={f.name}>{f.name}</th>)}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr><td className="admin-empty" colSpan={model.fields.length + 1}>No records yet.</td></tr>
              )}
              {rows.map((row) => (
                <tr key={row._id}>
                  {model.fields.map((f) => (
                    <td key={f.name}>
                      {typeof row[f.name] === 'boolean'
                        ? (row[f.name] ? 'Yes' : 'No')
                        : String(row[f.name] == null ? '' : row[f.name])}
                    </td>
                  ))}
                  <td className="admin-row-actions">
                    <button className="btn btn-secondary" onClick={() => edit(row)}>Edit</button>
                    <button className="btn btn-secondary" onClick={() => remove(row._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

// ── Root component ────────────────────────────────────────────────────────────
function tokenValid() {
  try {
    const t = localStorage.getItem(TOKEN_KEY)
    if (!t) return false
    const payload = JSON.parse(atob(t.split('.')[1]))
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      localStorage.removeItem(TOKEN_KEY)
      return false
    }
    return true
  } catch { return false }
}

export default function Admin() {
  const [loggedIn, setLoggedIn] = useState(tokenValid)

  const logout = () => {
    try { localStorage.removeItem(TOKEN_KEY) } catch {}
    setLoggedIn(false)
  }

  if (!loggedIn) return <Login onLogin={() => setLoggedIn(true)} />

  return (
    <main className="admin container">
      <header className="admin-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Admin Panel</h1>
          <p className="admin-sub">Manage your application's data. This page is not linked from the public site.</p>
        </div>
        <button className="btn btn-secondary" onClick={logout}>Log Out</button>
      </header>
      {MODELS.map((m) => <ModelManager key={m.name} model={m} onAuthFail={logout} />)}
    </main>
  )
}
