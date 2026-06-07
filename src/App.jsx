import { useState, useEffect } from 'react'
import { getApplications, createApplication, updateApplication, deleteApplication } from './api'
import './index.css'

const STATUSES = ['Applied', 'Screening', 'Interview', 'Offer', 'Rejected']

const STATUS_COLORS = {
  Applied:   { bg: '#1e3a5f', text: '#60a5fa' },
  Screening: { bg: '#3b2f00', text: '#fbbf24' },
  Interview: { bg: '#1a3a2a', text: '#4ade80' },
  Offer:     { bg: '#1a2e1a', text: '#86efac' },
  Rejected:  { bg: '#3a1a1a', text: '#f87171' },
}

const EMPTY_FORM = {
  company: '', role: '', status: 'Applied',
  appliedDate: new Date().toISOString().split('T')[0],
  nextFollowUp: '', notes: '', jobUrl: ''
}

export default function App() {
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editId, setEditId] = useState(null)
  const [filterStatus, setFilterStatus] = useState('All')
  const [search, setSearch] = useState('')

  useEffect(() => { fetchApps() }, [])

  const fetchApps = async () => {
    try {
      const { data } = await getApplications()
      setApps(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!form.company || !form.role) return
    try {
      if (editId) {
        const { data } = await updateApplication(editId, form)
        setApps(apps.map(a => a._id === editId ? data : a))
      } else {
        const { data } = await createApplication(form)
        setApps([data, ...apps])
      }
      setShowForm(false)
      setForm(EMPTY_FORM)
      setEditId(null)
    } catch (e) {
      console.error(e)
    }
  }

  const handleEdit = (app) => {
    setForm({
      company: app.company,
      role: app.role,
      status: app.status,
      appliedDate: app.appliedDate?.split('T')[0] || '',
      nextFollowUp: app.nextFollowUp?.split('T')[0] || '',
      notes: app.notes || '',
      jobUrl: app.jobUrl || ''
    })
    setEditId(app._id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this application?')) return
    await deleteApplication(id)
    setApps(apps.filter(a => a._id !== id))
  }

  const handleStatusChange = async (id, status) => {
    const { data } = await updateApplication(id, { status })
    setApps(apps.map(a => a._id === id ? data : a))
  }

  const filtered = apps.filter(a => {
    const matchStatus = filterStatus === 'All' || a.status === filterStatus
    const matchSearch = a.company.toLowerCase().includes(search.toLowerCase()) ||
                        a.role.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  const stats = STATUSES.reduce((acc, s) => {
    acc[s] = apps.filter(a => a.status === s).length
    return acc
  }, {})

  function getFollowUpStatus(dateStr) {
  if (!dateStr) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const followUp = new Date(dateStr)
  followUp.setHours(0, 0, 0, 0)
  const diff = Math.floor((followUp - today) / (1000 * 60 * 60 * 24))
  if (diff < 0) return 'overdue'
  if (diff === 0) return 'today'
  if (diff <= 3) return 'soon'
  return 'ok'
 }

  return (
    <div className="app">
      <header>
        <div className="header-inner">
          <div className="logo">
            <span className="logo-icon">◎</span>
            <span>Interview Tracker</span>
          </div>
          <button className="btn-primary" onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY_FORM) }}>
            + Add Application
          </button>
        </div>
      </header>

      <main>
        {/* Stats */}
        <div className="stats-row">
          <div className="stat-card">
            <span className="stat-num">{apps.length}</span>
            <span className="stat-label">Total</span>
          </div>
          {STATUSES.map(s => (
            <div className="stat-card" key={s} onClick={() => setFilterStatus(s)} style={{ cursor: 'pointer' }}>
              <span className="stat-num" style={{ color: STATUS_COLORS[s].text }}>{stats[s]}</span>
              <span className="stat-label">{s}</span>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="filters">
          <input
            className="search-input"
            placeholder="Search company or role..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className="filter-chips">
            {['All', ...STATUSES].map(s => (
              <button
                key={s}
                className={`chip ${filterStatus === s ? 'active' : ''}`}
                onClick={() => setFilterStatus(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Applications List */}
        {loading ? (
          <p className="empty">Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="empty">No applications found. Add your first one!</p>
        ) : (
          <div className="cards">
            {filtered.map(app => (
              <div className="card" key={app._id}>
                <div className="card-top">
                  <div>
                    <div className="card-company">{app.company}</div>
                    <div className="card-role">{app.role}</div>
                  </div>
                  <select
                    className="status-select"
                    value={app.status}
                    onChange={e => handleStatusChange(app._id, e.target.value)}
                    style={{ background: STATUS_COLORS[app.status].bg, color: STATUS_COLORS[app.status].text }}
                  >
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="card-meta">
                  {app.appliedDate && <span>Applied: {new Date(app.appliedDate).toLocaleDateString('en-IN')}</span>}
                  {/* {app.nextFollowUp && <span>Follow-up: {new Date(app.nextFollowUp).toLocaleDateString('en-IN')}</span>} */}
                  {app.nextFollowUp && (() => {
                    const status = getFollowUpStatus(app.nextFollowUp)
                    const labels = { overdue: '⚠ Overdue', today: '🔔 Today', soon: '⏰ Soon', ok: '' }
                    const colors = { overdue: '#f87171', today: '#fbbf24', soon: '#60a5fa', ok: '#6b7280' }
                    return (
                      <span style={{ color: colors[status] }}>
                        Follow-up: {new Date(app.nextFollowUp).toLocaleDateString('en-IN')}
                        {labels[status] && ` · ${labels[status]}`}
                      </span>
                    )
                  })()}
                  {app.jobUrl && <a href={app.jobUrl} target="_blank" rel="noreferrer" className="job-link">View JD ↗</a>}
                </div>

                {app.notes && <div className="card-notes">{app.notes}</div>}

                <div className="card-actions">
                  <button className="btn-ghost" onClick={() => handleEdit(app)}>Edit</button>
                  <button className="btn-ghost danger" onClick={() => handleDelete(app._id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal Form */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editId ? 'Edit Application' : 'New Application'}</h2>
              <button className="btn-ghost" onClick={() => setShowForm(false)}>✕</button>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Company *</label>
                <input value={form.company} onChange={e => setForm({...form, company: e.target.value})} placeholder="Google, Amazon..." />
              </div>
              <div className="form-group">
                <label>Role *</label>
                <input value={form.role} onChange={e => setForm({...form, role: e.target.value})} placeholder="SDE-1, Frontend Dev..." />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Applied Date</label>
                <input type="date" value={form.appliedDate} onChange={e => setForm({...form, appliedDate: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Follow-up Date</label>
                <input type="date" value={form.nextFollowUp} onChange={e => setForm({...form, nextFollowUp: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Job URL</label>
                <input value={form.jobUrl} onChange={e => setForm({...form, jobUrl: e.target.value})} placeholder="https://..." />
              </div>
              <div className="form-group full-width">
                <label>Notes</label>
                <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Interview rounds, contacts, feedback..." rows={3} />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleSubmit}>{editId ? 'Update' : 'Add'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}