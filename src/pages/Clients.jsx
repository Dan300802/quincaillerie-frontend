import { useState, useEffect } from 'react'
import { Search, Plus, Pencil, Trash2, X, Save, Phone, Mail, MapPin } from 'lucide-react'
import api from '../api/axios'

const avatarColors = [
  'bg-blue-500', 'bg-emerald-500', 'bg-violet-500',
  'bg-rose-500', 'bg-amber-500', 'bg-cyan-500',
]

function getInitiales(nom) {
  return nom.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

function getCategorie(total) {
  if (total >= 1000000) return { label: 'VIP', style: 'bg-amber-500/15 text-amber-500' }
  if (total >= 300000) return { label: 'Régulier', style: 'bg-blue-500/15 text-blue-400' }
  return { label: 'Nouveau', style: 'bg-slate-500/15 text-slate-400' }
}

const vide = { nom: '', telephone: '', email: '', adresse: '' }

// ─── Modal
function Modal({ client, onSave, onClose }) {
  const [form, setForm] = useState(client)

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  const inputClass = "w-full bg-slate-50 dark:bg-[#1e2d42] border border-slate-200 dark:border-white/5 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-white placeholder-slate-400 outline-none focus:border-blue-400 transition-colors"
  const labelClass = "block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1"

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#162032] rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-white/10">
          <h2 className="text-base font-bold text-slate-800 dark:text-white">
            {client.id ? 'Modifier le client' : 'Nouveau client'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5 grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className={labelClass}>Nom complet / Société</label>
            <input name="nom" value={form.nom} onChange={handleChange} placeholder="Ex: Kofi Mensah" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Téléphone</label>
            <input name="telephone" value={form.telephone || ''} onChange={handleChange} placeholder="+228 90 00 00 00" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input name="email" value={form.email || ''} onChange={handleChange} placeholder="email@example.com" className={inputClass} />
          </div>
          <div className="col-span-2">
            <label className={labelClass}>Adresse</label>
            <input name="adresse" value={form.adresse || ''} onChange={handleChange} placeholder="Quartier, Ville" className={inputClass} />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-slate-200 dark:border-white/10 flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-[#1e2d42] transition-all">
            Annuler
          </button>
          <button
            onClick={() => onSave(form)}
            className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all"
          >
            <Save size={14} /> Enregistrer
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Page Clients
export default function Clients() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [erreur, setErreur] = useState(null)
  const [recherche, setRecherche] = useState('')
  const [modal, setModal] = useState(null)
  const [detail, setDetail] = useState(null)

  // ─── Charger
  const chargerClients = async () => {
    try {
      setLoading(true)
      setErreur(null)
      const res = await api.get('/clients')
      setClients(res.data)
    } catch (err) {
      setErreur('Erreur lors du chargement des clients')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { chargerClients() }, [])

  // ─── Filtrer
  const clientsFiltres = clients.filter(c =>
    c.nom.toLowerCase().includes(recherche.toLowerCase()) ||
    (c.telephone || '').includes(recherche) ||
    (c.email || '').toLowerCase().includes(recherche.toLowerCase())
  )

  // ─── Stats
  const totalClients = clients.length
  const clientsVip = clients.filter(c => (c.totalAchats || 0) >= 1000000).length
  const chiffreTotal = clients.reduce((s, c) => s + (c.totalAchats || 0), 0)
  const totalCommandes = clients.reduce((s, c) => s + (c.nbCommandes || 0), 0)

  // ─── Sauvegarder
  const handleSave = async (form) => {
    try {
      if (form.id) {
        await api.put(`/clients/${form.id}`, form)
      } else {
        await api.post('/clients', form)
      }
      setModal(null)
      chargerClients()
    } catch (err) {
      alert('Erreur lors de la sauvegarde')
    }
  }

  // ─── Supprimer
  const handleDelete = async (id) => {
    if (confirm('Supprimer ce client ?')) {
      try {
        await api.delete(`/clients/${id}`)
        if (detail?.id === id) setDetail(null)
        chargerClients()
      } catch (err) {
        alert('Erreur lors de la suppression')
      }
    }
  }

  // ─── Loading
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-10 h-10 bg-blue-600 rounded-xl mx-auto mb-3 animate-pulse"></div>
          <p className="text-sm text-slate-400">Chargement...</p>
        </div>
      </div>
    )
  }

  // ─── Erreur
  if (erreur) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-4xl mb-3">⚠️</p>
          <p className="text-sm text-red-400 mb-4">{erreur}</p>
          <button onClick={chargerClients} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-xl hover:bg-blue-700">
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total clients', value: totalClients, color: 'text-blue-500' },
          { label: 'Clients VIP', value: clientsVip, color: 'text-amber-400' },
          { label: 'Total commandes', value: totalCommandes, color: 'text-emerald-400' },
          { label: "Chiffre d'affaires", value: chiffreTotal.toLocaleString() + ' F', color: 'text-violet-400' },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-[#162032] border border-slate-200 dark:border-white/5 rounded-xl p-4">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-2">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── Barre outils ── */}
      <div className="flex gap-3">
        <div className="flex-1 flex items-center gap-2 bg-white dark:bg-[#162032] border border-slate-200 dark:border-white/5 rounded-xl px-4 py-2.5">
          <Search size={15} className="text-slate-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Rechercher par nom, téléphone, email..."
            value={recherche}
            onChange={e => setRecherche(e.target.value)}
            className="flex-1 bg-transparent text-sm text-slate-800 dark:text-white placeholder-slate-400 outline-none"
          />
        </div>
        <button
          onClick={() => setModal({ ...vide })}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all"
        >
          <Plus size={15} /> Nouveau client
        </button>
      </div>

      {/* ── Grille clients ── */}
      {clients.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-[#162032] border border-slate-200 dark:border-white/5 rounded-2xl">
          <p className="text-4xl mb-3">👥</p>
          <p className="text-sm text-slate-400 mb-4">Aucun client enregistré</p>
          <button
            onClick={() => setModal({ ...vide })}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-xl hover:bg-blue-700"
          >
            Ajouter un client
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {clientsFiltres.map((c, i) => {
            const cat = getCategorie(c.totalAchats || 0)
            const color = avatarColors[i % avatarColors.length]
            return (
              <div
                key={c.id}
                onClick={() => setDetail(c)}
                className="bg-white dark:bg-[#162032] border border-slate-200 dark:border-white/5 rounded-xl p-5 cursor-pointer hover:border-blue-300 dark:hover:border-blue-500/50 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                      {getInitiales(c.nom)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-white leading-tight">{c.nom}</p>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cat.style}`}>{cat.label}</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={e => { e.stopPropagation(); setModal(c) }}
                      className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-[#1e2d42] flex items-center justify-center text-slate-400 hover:text-blue-500 transition-all"
                    >
                      <Pencil size={12} />
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); handleDelete(c.id) }}
                      className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-[#1e2d42] flex items-center justify-center text-slate-400 hover:text-red-400 transition-all"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  {c.telephone && (
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Phone size={11} className="flex-shrink-0" />
                      <span>{c.telephone}</span>
                    </div>
                  )}
                  {c.email && (
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Mail size={11} className="flex-shrink-0" />
                      <span className="truncate">{c.email}</span>
                    </div>
                  )}
                  {c.adresse && (
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <MapPin size={11} className="flex-shrink-0" />
                      <span>{c.adresse}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex justify-between">
                  <div>
                    <p className="text-[10px] text-slate-400 mb-0.5">Total achats</p>
                    <p className="text-sm font-bold text-emerald-500">
                      {(c.totalAchats || 0).toLocaleString()} F
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 mb-0.5">Commandes</p>
                    <p className="text-sm font-bold text-blue-500">{c.nbCommandes || 0}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Modal détail ── */}
      {detail && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#162032] rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-white/10">
              <h2 className="text-base font-bold text-slate-800 dark:text-white">Fiche client</h2>
              <button onClick={() => setDetail(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X size={18} />
              </button>
            </div>
            <div className="px-6 py-5">
              <div className="flex items-center gap-4 mb-5">
                <div className={`w-14 h-14 ${avatarColors[clients.indexOf(detail) % avatarColors.length]} rounded-2xl flex items-center justify-center text-white text-lg font-bold`}>
                  {getInitiales(detail.nom)}
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-800 dark:text-white">{detail.nom}</p>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${getCategorie(detail.totalAchats || 0).style}`}>
                    {getCategorie(detail.totalAchats || 0).label}
                  </span>
                </div>
              </div>
              <div className="space-y-3 mb-5">
                {[
                  { icon: Phone, label: 'Téléphone', value: detail.telephone || '—' },
                  { icon: Mail, label: 'Email', value: detail.email || '—' },
                  { icon: MapPin, label: 'Adresse', value: detail.adresse || '—' },
                ].map(row => (
                  <div key={row.label} className="flex items-center gap-3 bg-slate-50 dark:bg-[#1e2d42] rounded-lg px-4 py-2.5">
                    <row.icon size={14} className="text-slate-400 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-400">{row.label}</p>
                      <p className="text-sm text-slate-800 dark:text-white">{row.value}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-emerald-50 dark:bg-emerald-500/10 rounded-xl p-3 text-center">
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mb-1">Total achats</p>
                  <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    {(detail.totalAchats || 0).toLocaleString()} F
                  </p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-500/10 rounded-xl p-3 text-center">
                  <p className="text-[11px] text-blue-600 dark:text-blue-400 mb-1">Commandes</p>
                  <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {detail.nbCommandes || 0}
                  </p>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 dark:border-white/10 flex gap-3">
              <button
                onClick={() => { setModal(detail); setDetail(null) }}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-all"
              >
                <Pencil size={14} /> Modifier
              </button>
              <button
                onClick={() => setDetail(null)}
                className="flex-1 bg-slate-100 dark:bg-[#1e2d42] text-slate-600 dark:text-slate-300 text-sm font-semibold py-2.5 rounded-xl hover:bg-slate-200 dark:hover:bg-[#253550] transition-all"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal ajout/édition ── */}
      {modal && (
        <Modal client={modal} onSave={handleSave} onClose={() => setModal(null)} />
      )}

    </div>
  )
}