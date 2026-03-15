import { useState, useEffect } from 'react'
import { Search, Eye, Printer, X, TrendingUp, ShoppingCart, Users, CreditCard } from 'lucide-react'
import api from '../api/axios'

// ─── Modal détail vente + reçu
function ModalVente({ vente, onClose }) {
  const date = new Date(vente.createdAt).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric'
  })
  const heure = new Date(vente.createdAt).toLocaleTimeString('fr-FR', {
    hour: '2-digit', minute: '2-digit'
  })

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#162032] rounded-2xl w-full max-w-md shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-white/10">
          <div>
            <h2 className="text-base font-bold text-slate-800 dark:text-white">{vente.numero}</h2>
            <p className="text-xs text-slate-400">{date} à {heure}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5">

          {/* Infos */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-slate-50 dark:bg-[#1e2d42] rounded-lg px-4 py-2.5">
              <p className="text-[10px] text-slate-400 mb-1">Client</p>
              <p className="text-sm font-medium text-slate-800 dark:text-white">
                {vente.client?.nom || 'Client comptoir'}
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-[#1e2d42] rounded-lg px-4 py-2.5">
              <p className="text-[10px] text-slate-400 mb-1">Caissier</p>
              <p className="text-sm font-medium text-slate-800 dark:text-white">
                {vente.utilisateur ? `${vente.utilisateur.prenom} ${vente.utilisateur.nom}` : '—'}
              </p>
            </div>
          </div>

          {/* Articles */}
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Articles</p>
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
                {vente.lignes?.map((l, i) => (
                  <tr key={i}>
                    <td className="px-4 py-2.5 text-slate-800 dark:text-white text-xs">{l.produit?.nom || '—'}</td>
                    <td className="px-4 py-2.5 text-center text-slate-500 text-xs">{l.quantite}</td>
                    <td className="px-4 py-2.5 text-right text-slate-500 text-xs">{l.prix.toLocaleString()} F</td>
                    <td className="px-4 py-2.5 text-right font-semibold text-slate-800 dark:text-white text-xs">{l.total.toLocaleString()} F</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totaux */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Sous-total HT</span>
              <span>{vente.sousTotal.toLocaleString()} FCFA</span>
            </div>
            <div className="flex justify-between text-xs text-slate-400">
              <span>TVA (18%)</span>
              <span>{vente.tva.toLocaleString()} FCFA</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-slate-800 dark:text-white pt-2 border-t border-slate-200 dark:border-white/10">
              <span>Total TTC</span>
              <span className="text-blue-600 dark:text-blue-400">{vente.total.toLocaleString()} FCFA</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-white/10 flex gap-3">
          <button
            onClick={() => window.print()}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-all"
          >
            <Printer size={14} /> Imprimer
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-slate-100 dark:bg-[#1e2d42] text-slate-600 dark:text-slate-300 text-sm font-semibold py-2.5 rounded-xl hover:bg-slate-200 dark:hover:bg-[#253550] transition-all"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Page Ventes
export default function Ventes() {
  const [ventes, setVentes] = useState([])
  const [loading, setLoading] = useState(true)
  const [erreur, setErreur] = useState(null)
  const [recherche, setRecherche] = useState('')
  const [dateFiltre, setDateFiltre] = useState(new Date().toISOString().slice(0, 10))
  const [detail, setDetail] = useState(null)

  const chargerVentes = async () => {
    try {
      setLoading(true)
      setErreur(null)
      const res = await api.get(`/ventes${dateFiltre ? `?date=${dateFiltre}` : ''}`)
      setVentes(res.data)
    } catch (err) {
      setErreur('Erreur lors du chargement des ventes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { chargerVentes() }, [dateFiltre])

  const ventesFiltrees = ventes.filter(v =>
    v.numero.toLowerCase().includes(recherche.toLowerCase()) ||
    (v.client?.nom || '').toLowerCase().includes(recherche.toLowerCase())
  )

  // ─── Stats du jour
  const totalJour = ventesFiltrees.reduce((s, v) => s + v.total, 0)
  const nbVentes = ventesFiltrees.length
  const panierMoyen = nbVentes > 0 ? Math.round(totalJour / nbVentes) : 0
  const nbClients = new Set(ventesFiltrees.map(v => v.clientId).filter(Boolean)).size

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
          <button onClick={chargerVentes} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-xl hover:bg-blue-700">
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">

      {/* ── Stats du jour ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Chiffre du jour', value: totalJour.toLocaleString() + ' F', color: 'text-blue-500', icon: TrendingUp },
          { label: 'Nombre de ventes', value: nbVentes, color: 'text-emerald-400', icon: ShoppingCart },
          { label: 'Panier moyen', value: panierMoyen.toLocaleString() + ' F', color: 'text-amber-400', icon: CreditCard },
          { label: 'Clients servis', value: nbClients, color: 'text-violet-400', icon: Users },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-[#162032] border border-slate-200 dark:border-white/5 rounded-xl p-4">
            <div className="flex items-start justify-between mb-2">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">{s.label}</p>
              <s.icon size={14} className={s.color} />
            </div>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── Filtres ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex items-center gap-2 bg-white dark:bg-[#162032] border border-slate-200 dark:border-white/5 rounded-xl px-4 py-2.5">
          <Search size={15} className="text-slate-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Rechercher par N° ou client..."
            value={recherche}
            onChange={e => setRecherche(e.target.value)}
            className="flex-1 bg-transparent text-sm text-slate-800 dark:text-white placeholder-slate-400 outline-none"
          />
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-[#162032] border border-slate-200 dark:border-white/5 rounded-xl px-4 py-2.5">
          <input
            type="date"
            value={dateFiltre}
            onChange={e => setDateFiltre(e.target.value)}
            className="bg-transparent text-sm text-slate-800 dark:text-white outline-none"
          />
        </div>
        <button
          onClick={() => setDateFiltre('')}
          className="px-4 py-2.5 bg-slate-100 dark:bg-[#162032] border border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-400 text-sm rounded-xl hover:border-blue-300 transition-all"
        >
          Toutes les ventes
        </button>
      </div>

      {/* ── Tableau ── */}
      <div className="bg-white dark:bg-[#162032] border border-slate-200 dark:border-white/5 rounded-2xl overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 dark:border-white/5">
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-widest">N° Vente</th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Client</th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Caissier</th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Date & Heure</th>
              <th className="text-center px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Articles</th>
              <th className="text-right px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Total TTC</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {ventesFiltrees.map(v => (
              <tr key={v.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                <td className="px-5 py-3 font-mono text-xs text-blue-500 font-semibold">{v.numero}</td>
                <td className="px-5 py-3 text-sm text-slate-800 dark:text-white">
                  {v.client?.nom || 'Client comptoir'}
                </td>
                <td className="px-5 py-3 text-sm text-slate-500 dark:text-slate-400">
                  {v.utilisateur ? `${v.utilisateur.prenom} ${v.utilisateur.nom}` : '—'}
                </td>
                <td className="px-5 py-3 text-sm text-slate-500">
                  {new Date(v.createdAt).toLocaleDateString('fr-FR')} à {new Date(v.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </td>
                <td className="px-5 py-3 text-center">
                  <span className="bg-slate-100 dark:bg-[#1e2d42] text-slate-500 dark:text-slate-400 text-xs font-semibold px-2 py-0.5 rounded-full">
                    {v.lignes?.length || 0} article(s)
                  </span>
                </td>
                <td className="px-5 py-3 text-right text-sm font-bold text-emerald-500">
                  {v.total.toLocaleString()} F
                </td>
                <td className="px-5 py-3">
                  <button
                    onClick={() => setDetail(v)}
                    className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-[#1e2d42] flex items-center justify-center text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all"
                  >
                    <Eye size={12} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {ventesFiltrees.length === 0 && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🛒</p>
            <p className="text-sm text-slate-400">
              {dateFiltre
                ? `Aucune vente le ${new Date(dateFiltre).toLocaleDateString('fr-FR')}`
                : 'Aucune vente trouvée'
              }
            </p>
          </div>
        )}
      </div>

      {/* ── Résumé bas de page ── */}
      {ventesFiltrees.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl px-5 py-3 flex items-center justify-between">
          <p className="text-sm text-blue-600 dark:text-blue-400">
            {nbVentes} vente(s) — {dateFiltre ? new Date(dateFiltre).toLocaleDateString('fr-FR') : 'Toutes dates'}
          </p>
          <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
            Total : {totalJour.toLocaleString()} FCFA
          </p>
        </div>
      )}

      {/* ── Modal détail ── */}
      {detail && <ModalVente vente={detail} onClose={() => setDetail(null)} />}

    </div>
  )
}