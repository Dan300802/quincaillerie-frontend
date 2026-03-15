import { useState, useEffect } from 'react'
import { Search, Plus, Pencil, Trash2, X, Save, Phone, Mail, MapPin, Package } from 'lucide-react'
import api from '../api/axios'

const categories = ['Tous', 'Construction', 'Outillage', 'Électricité', 'Plomberie', 'Visserie']
const avatarColors = ['bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-rose-500', 'bg-amber-500', 'bg-cyan-500']

const vide = {
  nom: '', contact: '', telephone: '', email: '',
  adresse: '', categorie: 'Construction',
  delaiLivraison: 1, statut: 'actif'
}

function getInitiales(nom) {
  return nom.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

// ─── Modal
function Modal({ fournisseur, onSave, onClose }) {
  const [form, setForm] = useState(fournisseur)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(f => ({
      ...f,
      [name]: name === 'delaiLivraison' ? Number(value) : value
    }))
  }

  const inputClass = "w-full bg-slate-50 dark:bg-[#1e2d42] border border-slate-200 dark:border-white/5 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-white placeholder-slate-400 outline-none focus:border-blue-400 transition-colors"
  const labelClass = "block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1"

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#162032] rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-white/10">
          <h2 className="text-base font-bold text-slate-800 dark:text-white">
            {fournisseur.id ? 'Modifier le fournisseur' : 'Nouveau fournisseur'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className={labelClass}>Nom de la société</label>
            <input name="nom" value={form.nom} onChange={handleChange} placeholder="Ex: CFAO Materials" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Personne de contact</label>
            <input name="contact" value={form.contact || ''} onChange={handleChange} placeholder="Nom du contact" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Catégorie</label>
            <select name="categorie" value={form.categorie} onChange={handleChange} className={inputClass}>
              {categories.filter(c => c !== 'Tous').map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Téléphone</label>
            <input name="telephone" value={form.telephone || ''} onChange={handleChange} placeholder="+228 22 00 00 00" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input name="email" value={form.email || ''} onChange={handleChange} placeholder="email@example.com" className={inputClass} />
          </div>
          <div className="col-span-2">
            <label className={labelClass}>Adresse</label>
            <input name="adresse" value={form.adresse || ''} onChange={handleChange} placeholder="Quartier, Ville" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Délai de livraison (jours)</label>
            <input type="number" name="delaiLivraison" value={form.delaiLivraison} onChange={handleChange} min="1" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Statut</label>
            <select name="statut" value={form.statut} onChange={handleChange} className={inputClass}>
              <option value="actif">Actif</option>
              <option value="inactif">Inactif</option>
            </select>
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

// ─── Page Fournisseurs
export default function Fournisseurs() {
  const [fournisseurs, setFournisseurs] = useState([])
  const [loading, setLoading] = useState(true)
  const [erreur, setErreur] = useState(null)
  const [recherche, setRecherche] = useState('')
  const [categorie, setCategorie] = useState('Tous')
  const [modal, setModal] = useState(null)
  const [detail, setDetail] = useState(null)

  const chargerFournisseurs = async () => {
    try {
      setLoading(true)
      setErreur(null)
      const res = await api.get('/fournisseurs')
      setFournisseurs(res.data)
    } catch (err) {
      setErreur('Erreur lors du chargement des fournisseurs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { chargerFournisseurs() }, [])

  const fournisseursFiltres = fournisseurs.filter(f => {
    const matchCat = categorie === 'Tous' || f.categorie === categorie
    const matchSearch = f.nom.toLowerCase().includes(recherche.toLowerCase()) ||
      (f.contact || '').toLowerCase().includes(recherche.toLowerCase())
    return matchCat && matchSearch
  })

  const totalFournisseurs = fournisseurs.length
  const actifs = fournisseurs.filter(f => f.statut === 'actif').length
  const montantTotal = fournisseurs.reduce((s, f) => s + (f.montantTotal || 0), 0)
  const totalCommandes = fournisseurs.reduce((s, f) => s + (f.totalCommandes || 0), 0)

  const handleSave = async (form) => {
    try {
      if (form.id) {
        await api.put(`/fournisseurs/${form.id}`, form)
      } else {
        await api.post('/fournisseurs', form)
      }
      setModal(null)
      chargerFournisseurs()
    } catch (err) {
      alert('Erreur lors de la sauvegarde')
    }
  }

  const handleDelete = async (id) => {
    if (confirm('Supprimer ce fournisseur ?')) {
      try {
        await api.delete(`/fournisseurs/${id}`)
        if (detail?.id === id) setDetail(null)
        chargerFournisseurs()
      } catch (err) {
        alert('Erreur lors de la suppression')
      }
    }
  }

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

  if (erreur) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-4xl mb-3">⚠️</p>
          <p className="text-sm text-red-400 mb-4">{erreur}</p>
          <button onClick={chargerFournisseurs} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-xl hover:bg-blue-700">
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
          { label: 'Total fournisseurs', value: totalFournisseurs, color: 'text-blue-500' },
          { label: 'Fournisseurs actifs', value: actifs, color: 'text-emerald-400' },
          { label: 'Total commandes', value: totalCommandes, color: 'text-amber-400' },
          { label: 'Montant total achats', value: montantTotal.toLocaleString() + ' F', color: 'text-violet-400' },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-[#162032] border border-slate-200 dark:border-white/5 rounded-xl p-4">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-2">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── Barre outils ── */}
      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <div className="flex-1 flex items-center gap-2 bg-white dark:bg-[#162032] border border-slate-200 dark:border-white/5 rounded-xl px-4 py-2.5 min-w-48">
          <Search size={15} className="text-slate-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Rechercher un fournisseur..."
            value={recherche}
            onChange={e => setRecherche(e.target.value)}
            className="flex-1 bg-transparent text-sm text-slate-800 dark:text-white placeholder-slate-400 outline-none"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategorie(cat)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                categorie === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-[#162032] border border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-400 hover:border-blue-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <button
          onClick={() => setModal({ ...vide })}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all"
        >
          <Plus size={15} /> Nouveau fournisseur
        </button>
      </div>

      {/* ── Grille fournisseurs ── */}
      {fournisseursFiltres.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🏭</p>
          <p className="text-sm text-slate-400 mb-4">Aucun fournisseur trouvé</p>
          <button
            onClick={() => setModal({ ...vide })}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-xl hover:bg-blue-700"
          >
            Ajouter un fournisseur
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {fournisseursFiltres.map((f, i) => (
            <div
              key={f.id}
              onClick={() => setDetail(f)}
              className="bg-white dark:bg-[#162032] border border-slate-200 dark:border-white/5 rounded-xl p-5 cursor-pointer hover:border-blue-300 dark:hover:border-blue-500/50 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${avatarColors[i % avatarColors.length]} rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                    {getInitiales(f.nom)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-white leading-tight">{f.nom}</p>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      f.statut === 'actif'
                        ? 'bg-emerald-500/15 text-emerald-500'
                        : 'bg-slate-500/15 text-slate-400'
                    }`}>
                      {f.statut === 'actif' ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={e => { e.stopPropagation(); setModal(f) }}
                    className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-[#1e2d42] flex items-center justify-center text-slate-400 hover:text-blue-500 transition-all"
                  >
                    <Pencil size={12} />
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); handleDelete(f.id) }}
                    className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-[#1e2d42] flex items-center justify-center text-slate-400 hover:text-red-400 transition-all"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 mb-4">
                {f.telephone && (
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Phone size={11} className="flex-shrink-0" />
                    <span>{f.telephone}</span>
                  </div>
                )}
                {f.email && (
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Mail size={11} className="flex-shrink-0" />
                    <span className="truncate">{f.email}</span>
                  </div>
                )}
                {f.adresse && (
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <MapPin size={11} className="flex-shrink-0" />
                    <span>{f.adresse}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Package size={11} className="flex-shrink-0" />
                  <span>Délai : <span className="text-blue-400 font-medium">{f.delaiLivraison} jour(s)</span></span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex justify-between">
                <div>
                  <p className="text-[10px] text-slate-400 mb-0.5">Catégorie</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-white">{f.categorie || '—'}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 mb-0.5">Statut</p>
                  <p className={`text-sm font-semibold ${f.statut === 'actif' ? 'text-emerald-500' : 'text-slate-400'}`}>
                    {f.statut === 'actif' ? 'Actif' : 'Inactif'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Modal détail ── */}
      {detail && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#162032] rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-white/10">
              <h2 className="text-base font-bold text-slate-800 dark:text-white">Fiche fournisseur</h2>
              <button onClick={() => setDetail(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X size={18} />
              </button>
            </div>
            <div className="px-6 py-5">
              <div className="flex items-center gap-4 mb-5">
                <div className={`w-14 h-14 ${avatarColors[fournisseurs.indexOf(detail) % avatarColors.length]} rounded-2xl flex items-center justify-center text-white text-lg font-bold`}>
                  {getInitiales(detail.nom)}
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-800 dark:text-white">{detail.nom}</p>
                  <p className="text-sm text-slate-400">Contact : {detail.contact || '—'}</p>
                </div>
              </div>
              <div className="space-y-3 mb-5">
                {[
                  { icon: Phone, label: 'Téléphone', value: detail.telephone || '—' },
                  { icon: Mail, label: 'Email', value: detail.email || '—' },
                  { icon: MapPin, label: 'Adresse', value: detail.adresse || '—' },
                  { icon: Package, label: 'Délai livraison', value: `${detail.delaiLivraison} jour(s)` },
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
                <div className="bg-slate-50 dark:bg-[#1e2d42] rounded-xl p-3 text-center">
                  <p className="text-[11px] text-slate-400 mb-1">Catégorie</p>
                  <p className="text-sm font-bold text-slate-800 dark:text-white">{detail.categorie || '—'}</p>
                </div>
                <div className="bg-slate-50 dark:bg-[#1e2d42] rounded-xl p-3 text-center">
                  <p className="text-[11px] text-slate-400 mb-1">Statut</p>
                  <p className={`text-sm font-bold ${detail.statut === 'actif' ? 'text-emerald-500' : 'text-slate-400'}`}>
                    {detail.statut === 'actif' ? 'Actif' : 'Inactif'}
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
        <Modal fournisseur={modal} onSave={handleSave} onClose={() => setModal(null)} />
      )}

    </div>
  )
}