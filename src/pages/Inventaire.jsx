import { useState, useEffect } from 'react'
import { Search, Plus, Pencil, Trash2, X, Save } from 'lucide-react'
import api from '../api/axios'

const categories = ['Tous', 'Visserie', 'Outillage', 'Plomberie', 'Électricité', 'Construction']

const vide = {
  ref: '', nom: '', categorieId: '', fournisseurId: '',
  stock: 0, seuil: 10, prix: 0
}

function getStatut(stock, seuil) {
  if (stock === 0) return 'rupture'
  if (stock < seuil) return 'faible'
  return 'normal'
}

function BadgeStatut({ stock, seuil }) {
  const s = getStatut(stock, seuil)
  const styles = {
    rupture: 'bg-red-500/15 text-red-500 dark:text-red-400',
    faible: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    normal: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  }
  const labels = { rupture: 'Rupture', faible: 'Faible', normal: 'Normal' }
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${styles[s]}`}>
      {labels[s]}
    </span>
  )
}

function Modal({ produit, onSave, onClose }) {
  const [form, setForm] = useState(produit)
  const [fournisseurs, setFournisseurs] = useState([])

  useEffect(() => {
    api.get('/fournisseurs').then(res => setFournisseurs(res.data)).catch(() => {})
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(f => ({
      ...f,
      [name]: ['stock', 'seuil', 'prix', 'categorieId', 'fournisseurId'].includes(name)
        ? Number(value) : value
    }))
  }

  const inputClass = "w-full bg-slate-50 dark:bg-[#1e2d42] border border-slate-200 dark:border-white/5 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-white placeholder-slate-400 outline-none focus:border-blue-400 transition-colors"
  const labelClass = "block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1"

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#162032] rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-white/10">
          <h2 className="text-base font-bold text-slate-800 dark:text-white">
            {produit.id ? 'Modifier le produit' : 'Nouveau produit'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5 grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Référence</label>
            <input name="ref" value={form.ref} onChange={handleChange} placeholder="QP-0013" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Catégorie</label>
            <select name="categorieId" value={form.categorieId} onChange={handleChange} className={inputClass}>
              <option value="">Sélectionner...</option>
              {categories.filter(c => c !== 'Tous').map((c, i) => (
                <option key={i} value={i + 1}>{c}</option>
              ))}
            </select>
          </div>
          <div className="col-span-2">
            <label className={labelClass}>Désignation</label>
            <input name="nom" value={form.nom} onChange={handleChange} placeholder="Nom du produit" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Stock actuel</label>
            <input type="number" name="stock" value={form.stock} onChange={handleChange} min="0" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Seuil d'alerte</label>
            <input type="number" name="seuil" value={form.seuil} onChange={handleChange} min="0" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Prix de vente (FCFA)</label>
            <input type="number" name="prix" value={form.prix} onChange={handleChange} min="0" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Fournisseur</label>
            <select name="fournisseurId" value={form.fournisseurId} onChange={handleChange} className={inputClass}>
              <option value="">Sélectionner...</option>
              {fournisseurs.map(f => (
                <option key={f.id} value={f.id}>{f.nom}</option>
              ))}
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

export default function Inventaire() {
  const [produits, setProduits] = useState([])
  const [loading, setLoading] = useState(true)
  const [erreur, setErreur] = useState(null)
  const [recherche, setRecherche] = useState('')
  const [categorie, setCategorie] = useState('Tous')
  const [modal, setModal] = useState(null)

  // ─── Charger les produits
  const chargerProduits = async () => {
    try {
      setLoading(true)
      setErreur(null)
      const res = await api.get('/produits')
      setProduits(res.data)
    } catch (err) {
      setErreur('Erreur lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { chargerProduits() }, [])

  // ─── Filtrer
  const produitsFiltres = produits.filter(p => {
    const matchCat = categorie === 'Tous' || p.categorie?.nom === categorie
    const matchSearch = p.nom.toLowerCase().includes(recherche.toLowerCase()) ||
      p.ref.toLowerCase().includes(recherche.toLowerCase())
    return matchCat && matchSearch
  })

  // ─── Stats
  const totalProduits = produits.length
  const enRupture = produits.filter(p => getStatut(p.stock, p.seuil) === 'rupture').length
  const stockFaible = produits.filter(p => getStatut(p.stock, p.seuil) === 'faible').length
  const valeurStock = produits.reduce((s, p) => s + p.stock * p.prix, 0)

  // ─── Sauvegarder
  const handleSave = async (form) => {
    try {
      if (form.id) {
        await api.put(`/produits/${form.id}`, form)
      } else {
        await api.post('/produits', form)
      }
      setModal(null)
      chargerProduits()
    } catch (err) {
      alert('Erreur lors de la sauvegarde')
    }
  }

  // ─── Supprimer
  const handleDelete = async (id) => {
    if (confirm('Supprimer ce produit ?')) {
      try {
        await api.delete(`/produits/${id}`)
        chargerProduits()
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
          <button
            onClick={chargerProduits}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-xl hover:bg-blue-700"
          >
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
          { label: 'Total produits', value: totalProduits, color: 'text-blue-500' },
          { label: 'En rupture', value: enRupture, color: 'text-red-400' },
          { label: 'Stock faible', value: stockFaible, color: 'text-amber-400' },
          { label: 'Valeur du stock', value: valeurStock.toLocaleString() + ' F', color: 'text-emerald-400' },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-[#162032] border border-slate-200 dark:border-white/5 rounded-xl p-4">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-2">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── Barre outils ── */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="flex-1 flex items-center gap-2 bg-white dark:bg-[#162032] border border-slate-200 dark:border-white/5 rounded-xl px-4 py-2.5 w-full">
          <Search size={15} className="text-slate-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Rechercher par nom ou référence..."
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
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all flex-shrink-0"
        >
          <Plus size={15} /> Nouveau produit
        </button>
      </div>

      {/* ── Tableau ── */}
      <div className="bg-white dark:bg-[#162032] border border-slate-200 dark:border-white/5 rounded-2xl overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 dark:border-white/5">
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Référence</th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Désignation</th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Catégorie</th>
              <th className="text-right px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Stock</th>
              <th className="text-right px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Prix vente</th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Fournisseur</th>
              <th className="text-center px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Statut</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {produitsFiltres.map(p => (
              <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                <td className="px-5 py-3 font-mono text-xs text-slate-400">{p.ref}</td>
                <td className="px-5 py-3 text-sm font-medium text-slate-800 dark:text-white">{p.nom}</td>
                <td className="px-5 py-3">
                  <span className="text-xs bg-slate-100 dark:bg-[#1e2d42] text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-lg">
                    {p.categorie?.nom || '—'}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  <span className={`text-sm font-bold ${
                    getStatut(p.stock, p.seuil) === 'rupture' ? 'text-red-400' :
                    getStatut(p.stock, p.seuil) === 'faible' ? 'text-amber-400' : 'text-emerald-400'
                  }`}>{p.stock}</span>
                </td>
                <td className="px-5 py-3 text-right text-sm text-slate-600 dark:text-slate-300">
                  {p.prix.toLocaleString()} F
                </td>
                <td className="px-5 py-3 text-sm text-slate-500 dark:text-slate-400">
                  {p.fournisseur?.nom || '—'}
                </td>
                <td className="px-5 py-3 text-center">
                  <BadgeStatut stock={p.stock} seuil={p.seuil} />
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setModal(p)}
                      className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-[#1e2d42] flex items-center justify-center text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all"
                    >
                      <Pencil size={12} />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-[#1e2d42] flex items-center justify-center text-slate-400 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {produitsFiltres.length === 0 && !loading && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">📦</p>
            <p className="text-sm text-slate-400">Aucun produit trouvé</p>
            <button
              onClick={() => setModal({ ...vide })}
              className="mt-3 px-4 py-2 bg-blue-600 text-white text-sm rounded-xl hover:bg-blue-700"
            >
              Ajouter un produit
            </button>
          </div>
        )}
      </div>

      {/* ── Modal ── */}
      {modal && (
        <Modal produit={modal} onSave={handleSave} onClose={() => setModal(null)} />
      )}

    </div>
  )
}