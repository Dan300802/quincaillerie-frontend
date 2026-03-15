import { useState, useEffect } from 'react'
import { Search, Plus, X, Save, Eye, CheckCircle, Clock, Truck, XCircle } from 'lucide-react'
import api from '../api/axios'

const statuts = {
  en_attente: { label: 'En attente', color: 'bg-amber-500/15 text-amber-500', icon: Clock },
  en_cours: { label: 'En cours', color: 'bg-blue-500/15 text-blue-400', icon: Truck },
  livree: { label: 'Livrée', color: 'bg-emerald-500/15 text-emerald-500', icon: CheckCircle },
  annulee: { label: 'Annulée', color: 'bg-red-500/15 text-red-400', icon: XCircle },
}

function BadgeStatut({ statut }) {
  const s = statuts[statut] || statuts.en_attente
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${s.color}`}>
      <s.icon size={10} />
      {s.label}
    </span>
  )
}

// ─── Modal détail commande
function ModalDetail({ commande, onClose, onUpdateStatut }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#162032] rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-white/10">
          <div>
            <h2 className="text-base font-bold text-slate-800 dark:text-white">{commande.numero}</h2>
            <p className="text-xs text-slate-400">{commande.fournisseur?.nom || '—'}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5">
          <div className="grid grid-cols-2 gap-3 mb-5">
            {[
              { label: 'Date commande', value: new Date(commande.date || commande.createdAt).toLocaleDateString('fr-FR') },
              { label: 'Date livraison', value: commande.dateLivraison ? new Date(commande.dateLivraison).toLocaleDateString('fr-FR') : '—' },
              { label: 'Statut', value: <BadgeStatut statut={commande.statut} /> },
              { label: 'Montant total', value: <span className="font-bold text-emerald-500">{commande.montant.toLocaleString()} FCFA</span> },
            ].map(r => (
              <div key={r.label} className="bg-slate-50 dark:bg-[#1e2d42] rounded-lg px-4 py-2.5">
                <p className="text-[10px] text-slate-400 mb-1">{r.label}</p>
                <div className="text-sm text-slate-800 dark:text-white">{r.value}</div>
              </div>
            ))}
          </div>

          {/* Articles */}
          {commande.lignes && commande.lignes.length > 0 && (
            <>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Articles commandés</p>
              <div className="bg-slate-50 dark:bg-[#1e2d42] rounded-xl overflow-hidden mb-5">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-white/5">
                      <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-slate-400">Article</th>
                      <th className="text-center px-4 py-2.5 text-[11px] font-semibold text-slate-400">Qté</th>
                      <th className="text-right px-4 py-2.5 text-[11px] font-semibold text-slate-400">Prix unit.</th>
                      <th className="text-right px-4 py-2.5 text-[11px] font-semibold text-slate-400">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                    {commande.lignes.map((l, i) => (
                      <tr key={i}>
                        <td className="px-4 py-2.5 text-slate-800 dark:text-white">{l.produit?.nom || '—'}</td>
                        <td className="px-4 py-2.5 text-center text-slate-500">{l.quantite}</td>
                        <td className="px-4 py-2.5 text-right text-slate-500">{l.prix.toLocaleString()} F</td>
                        <td className="px-4 py-2.5 text-right font-semibold text-slate-800 dark:text-white">{l.total.toLocaleString()} F</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Changer statut */}
          {commande.statut !== 'livree' && commande.statut !== 'annulee' && (
            <div className="flex gap-2">
              {commande.statut === 'en_attente' && (
                <button
                  onClick={() => onUpdateStatut(commande.id, 'en_cours')}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-all"
                >
                  <Truck size={14} /> Marquer en cours
                </button>
              )}
              {commande.statut === 'en_cours' && (
                <button
                  onClick={() => onUpdateStatut(commande.id, 'livree')}
                  className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-all"
                >
                  <CheckCircle size={14} /> Marquer comme livrée
                </button>
              )}
              <button
                onClick={() => onUpdateStatut(commande.id, 'annulee')}
                className="flex items-center justify-center gap-2 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-semibold py-2.5 rounded-xl transition-all"
              >
                <XCircle size={14} /> Annuler
              </button>
            </div>
          )}
        </div>
        <div className="px-6 py-4 border-t border-slate-200 dark:border-white/10">
          <button onClick={onClose} className="w-full bg-slate-100 dark:bg-[#1e2d42] text-slate-600 dark:text-slate-300 text-sm font-semibold py-2.5 rounded-xl hover:bg-slate-200 dark:hover:bg-[#253550] transition-all">
            Fermer
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Modal nouvelle commande
function ModalNouvelle({ onSave, onClose }) {
  const [fournisseurs, setFournisseurs] = useState([])
  const [produits, setProduits] = useState([])
  const [form, setForm] = useState({
    fournisseurId: '',
    date: new Date().toISOString().slice(0, 10),
    dateLivraison: '',
  })
  const [lignes, setLignes] = useState([{ produitId: '', quantite: 1, prix: 0 }])

  useEffect(() => {
    api.get('/fournisseurs').then(res => setFournisseurs(res.data)).catch(() => {})
    api.get('/produits').then(res => setProduits(res.data)).catch(() => {})
  }, [])

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleLigne = (i, field, value) => {
    setLignes(prev => prev.map((l, idx) => {
      if (idx !== i) return l
      const updated = { ...l, [field]: field === 'produitId' ? Number(value) : Number(value) }
      if (field === 'produitId') {
        const produit = produits.find(p => p.id === Number(value))
        return { ...updated, prix: produit?.prix || 0 }
      }
      return updated
    }))
  }

  const addLigne = () => setLignes(prev => [...prev, { produitId: '', quantite: 1, prix: 0 }])
  const removeLigne = (i) => setLignes(prev => prev.filter((_, idx) => idx !== i))

  const montantTotal = lignes.reduce((s, l) => s + (l.quantite * l.prix), 0)

  const inputClass = "w-full bg-slate-50 dark:bg-[#1e2d42] border border-slate-200 dark:border-white/5 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-white placeholder-slate-400 outline-none focus:border-blue-400 transition-colors"
  const labelClass = "block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1"

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#162032] rounded-2xl w-full max-w-xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-white/10 sticky top-0 bg-white dark:bg-[#162032] z-10">
          <h2 className="text-base font-bold text-slate-800 dark:text-white">Nouvelle commande</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className={labelClass}>Fournisseur</label>
              <select name="fournisseurId" value={form.fournisseurId} onChange={handleChange} className={inputClass}>
                <option value="">Sélectionner un fournisseur...</option>
                {fournisseurs.map(f => <option key={f.id} value={f.id}>{f.nom}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Date commande</label>
              <input type="date" name="date" value={form.date} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Date livraison prévue</label>
              <input type="date" name="dateLivraison" value={form.dateLivraison} onChange={handleChange} className={inputClass} />
            </div>
          </div>

          {/* Lignes */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={labelClass}>Articles</label>
              <button onClick={addLigne} className="text-xs text-blue-500 hover:text-blue-600 font-medium">
                + Ajouter un article
              </button>
            </div>
            <div className="space-y-2">
              {lignes.map((l, i) => (
                <div key={i} className="grid grid-cols-7 gap-2 items-center">
                  <select
                    value={l.produitId}
                    onChange={e => handleLigne(i, 'produitId', e.target.value)}
                    className={`col-span-3 ${inputClass}`}
                  >
                    <option value="">Produit...</option>
                    {produits.map(p => <option key={p.id} value={p.id}>{p.nom}</option>)}
                  </select>
                  <input
                    type="number" value={l.quantite} min="1"
                    onChange={e => handleLigne(i, 'quantite', e.target.value)}
                    placeholder="Qté" className={`col-span-1 ${inputClass}`}
                  />
                  <input
                    type="number" value={l.prix} min="0"
                    onChange={e => handleLigne(i, 'prix', e.target.value)}
                    placeholder="Prix" className={`col-span-2 ${inputClass}`}
                  />
                  <button onClick={() => removeLigne(i)} className="col-span-1 flex justify-center text-slate-400 hover:text-red-400">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="bg-slate-50 dark:bg-[#1e2d42] rounded-xl px-4 py-3 flex justify-between items-center">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Montant total</span>
            <span className="text-lg font-bold text-emerald-500">{montantTotal.toLocaleString()} FCFA</span>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 dark:border-white/10 flex gap-3 justify-end sticky bottom-0 bg-white dark:bg-[#162032]">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-[#1e2d42] transition-all">
            Annuler
          </button>
          <button
            onClick={() => onSave({ ...form, lignes })}
            className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all"
          >
            <Save size={14} /> Enregistrer
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Page Commandes
export default function Commandes() {
  const [commandes, setCommandes] = useState([])
  const [loading, setLoading] = useState(true)
  const [erreur, setErreur] = useState(null)
  const [recherche, setRecherche] = useState('')
  const [filtreStatut, setFiltreStatut] = useState('tous')
  const [detail, setDetail] = useState(null)
  const [showNouvelle, setShowNouvelle] = useState(false)

  const chargerCommandes = async () => {
    try {
      setLoading(true)
      setErreur(null)
      const res = await api.get('/commandes')
      setCommandes(res.data)
    } catch (err) {
      setErreur('Erreur lors du chargement des commandes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { chargerCommandes() }, [])

  const commandesFiltrees = commandes.filter(c => {
    const matchSearch = c.numero.toLowerCase().includes(recherche.toLowerCase()) ||
      (c.fournisseur?.nom || '').toLowerCase().includes(recherche.toLowerCase())
    const matchStatut = filtreStatut === 'tous' || c.statut === filtreStatut
    return matchSearch && matchStatut
  })

  const stats = {
    total: commandes.length,
    en_attente: commandes.filter(c => c.statut === 'en_attente').length,
    en_cours: commandes.filter(c => c.statut === 'en_cours').length,
    montant: commandes.reduce((s, c) => s + c.montant, 0),
  }

  const handleSave = async (form) => {
    try {
      await api.post('/commandes', {
        fournisseurId: Number(form.fournisseurId),
        dateLivraison: form.dateLivraison || null,
        lignes: form.lignes.filter(l => l.produitId).map(l => ({
          produitId: l.produitId,
          quantite: l.quantite,
          prix: l.prix,
        }))
      })
      setShowNouvelle(false)
      chargerCommandes()
    } catch (err) {
      alert('Erreur lors de la sauvegarde')
    }
  }

  const handleUpdateStatut = async (id, statut) => {
    try {
      await api.put(`/commandes/${id}/statut`, { statut })
      setDetail(prev => prev ? { ...prev, statut } : null)
      chargerCommandes()
    } catch (err) {
      alert('Erreur lors de la mise à jour')
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
          <button onClick={chargerCommandes} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-xl hover:bg-blue-700">
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
          { label: 'Total commandes', value: stats.total, color: 'text-blue-500' },
          { label: 'En attente', value: stats.en_attente, color: 'text-amber-400' },
          { label: 'En cours', value: stats.en_cours, color: 'text-blue-400' },
          { label: 'Montant total', value: stats.montant.toLocaleString() + ' F', color: 'text-emerald-400' },
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
            placeholder="Rechercher une commande..."
            value={recherche}
            onChange={e => setRecherche(e.target.value)}
            className="flex-1 bg-transparent text-sm text-slate-800 dark:text-white placeholder-slate-400 outline-none"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {[
            { key: 'tous', label: 'Toutes' },
            { key: 'en_attente', label: 'En attente' },
            { key: 'en_cours', label: 'En cours' },
            { key: 'livree', label: 'Livrées' },
            { key: 'annulee', label: 'Annulées' },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFiltreStatut(f.key)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                filtreStatut === f.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-[#162032] border border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-400 hover:border-blue-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowNouvelle(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all"
        >
          <Plus size={15} /> Nouvelle commande
        </button>
      </div>

      {/* ── Tableau ── */}
      <div className="bg-white dark:bg-[#162032] border border-slate-200 dark:border-white/5 rounded-2xl overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 dark:border-white/5">
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-widest">N° Commande</th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Fournisseur</th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Date</th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Livraison prévue</th>
              <th className="text-right px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Montant</th>
              <th className="text-center px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Statut</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {commandesFiltrees.map(c => (
              <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                <td className="px-5 py-3 font-mono text-xs text-blue-500 font-semibold">{c.numero}</td>
                <td className="px-5 py-3 text-sm font-medium text-slate-800 dark:text-white">{c.fournisseur?.nom || '—'}</td>
                <td className="px-5 py-3 text-sm text-slate-500">{new Date(c.date || c.createdAt).toLocaleDateString('fr-FR')}</td>
                <td className="px-5 py-3 text-sm text-slate-500">{c.dateLivraison ? new Date(c.dateLivraison).toLocaleDateString('fr-FR') : '—'}</td>
                <td className="px-5 py-3 text-right text-sm font-semibold text-emerald-500">{c.montant.toLocaleString()} F</td>
                <td className="px-5 py-3 text-center"><BadgeStatut statut={c.statut} /></td>
                <td className="px-5 py-3">
                  <button
                    onClick={() => setDetail(c)}
                    className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-[#1e2d42] flex items-center justify-center text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all"
                  >
                    <Eye size={12} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {commandesFiltrees.length === 0 && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-sm text-slate-400">Aucune commande trouvée</p>
          </div>
        )}
      </div>

      {/* Modals */}
      {detail && (
        <ModalDetail
          commande={detail}
          onClose={() => setDetail(null)}
          onUpdateStatut={handleUpdateStatut}
        />
      )}
      {showNouvelle && (
        <ModalNouvelle
          onSave={handleSave}
          onClose={() => setShowNouvelle(false)}
        />
      )}
    </div>
  )
}