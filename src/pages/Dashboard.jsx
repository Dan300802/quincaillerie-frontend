import { useState, useEffect } from 'react'
import { TrendingUp, ShoppingCart, Package, ClipboardList } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts'
import api from '../api/axios'

// ─── Données graphique (statiques pour l'instant)
const salesData = [
  { jour: 'Lun', semaine: 520, precedent: 480 },
  { jour: 'Mar', semaine: 680, precedent: 600 },
  { jour: 'Mer', semaine: 430, precedent: 500 },
  { jour: 'Jeu', semaine: 890, precedent: 720 },
  { jour: 'Ven', semaine: 750, precedent: 680 },
  { jour: 'Sam', semaine: 1100, precedent: 950 },
  { jour: 'Dim', semaine: 847, precedent: 760 },
]

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [erreur, setErreur] = useState(null)

  const chargerStats = async () => {
    try {
      setLoading(true)
      setErreur(null)
      const res = await api.get('/statistiques')
      setStats(res.data)
    } catch (err) {
      setErreur('Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { chargerStats() }, [])

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
          <button
            onClick={chargerStats}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-xl hover:bg-blue-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  const kpis = [
    {
      label: "Chiffre d'affaires",
      value: (stats?.chiffreAffaires || 0).toLocaleString(),
      unit: 'FCFA aujourd\'hui',
      delta: '+12.4%',
      up: true,
      icon: TrendingUp,
      color: 'text-blue-400',
      bg: 'bg-blue-600/10',
      border: 'border-blue-600/20',
    },
    {
      label: 'Ventes du jour',
      value: stats?.ventesJour || 0,
      unit: 'transactions',
      delta: '+5 vs hier',
      up: true,
      icon: ShoppingCart,
      color: 'text-emerald-400',
      bg: 'bg-emerald-600/10',
      border: 'border-emerald-600/20',
    },
    {
      label: 'Articles en stock',
      value: stats?.totalProduits || 0,
      unit: 'références actives',
      delta: `${stats?.produitsRupture || 0} en rupture`,
      up: false,
      icon: Package,
      color: 'text-amber-400',
      bg: 'bg-amber-600/10',
      border: 'border-amber-600/20',
    },
    {
      label: 'Commandes en attente',
      value: stats?.commandesEnAttente || 0,
      unit: 'fournisseurs',
      delta: 'À traiter',
      up: null,
      icon: ClipboardList,
      color: 'text-red-400',
      bg: 'bg-red-600/10',
      border: 'border-red-600/20',
    },
  ]

  return (
    <div className="space-y-5">

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className={`bg-white dark:bg-[#162032] border ${k.border} rounded-xl p-4`}>
            <div className="flex items-start justify-between mb-3">
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{k.label}</p>
              <div className={`w-8 h-8 ${k.bg} rounded-lg flex items-center justify-center`}>
                <k.icon size={15} className={k.color} />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight mb-1">{k.value}</p>
            <p className="text-[11px] text-slate-400 mb-2">{k.unit}</p>
            <p className={`text-xs font-medium ${k.up === true ? 'text-emerald-500' : k.up === false ? 'text-red-400' : 'text-amber-400'}`}>
              {k.up === true ? '▲' : k.up === false ? '▼' : '→'} {k.delta}
            </p>
          </div>
        ))}
      </div>

      {/* ── Graphique + Alertes ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Graphique ventes */}
        <div className="lg:col-span-2 bg-white dark:bg-[#162032] border border-slate-200 dark:border-white/5 rounded-xl p-5">
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm font-semibold text-slate-800 dark:text-white">Ventes des 7 derniers jours</p>
            <p className="text-xs text-blue-500 cursor-pointer">Voir tout →</p>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={salesData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.1)" vertical={false} />
              <XAxis dataKey="jour" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  background: '#1e2d42',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 8,
                  fontSize: 12
                }}
                labelStyle={{ color: '#94a3b8' }}
                itemStyle={{ color: '#e2e8f0' }}
              />
              <Bar dataKey="precedent" name="Sem. précédente" fill="#cbd5e1" radius={[3, 3, 0, 0]} />
              <Bar dataKey="semaine" name="Cette semaine" fill="#2563eb" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-3">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="w-2 h-2 rounded-sm bg-blue-600 inline-block"></span> Cette semaine
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="w-2 h-2 rounded-sm bg-slate-300 dark:bg-[#1e3a5f] inline-block"></span> Semaine précédente
            </div>
          </div>
        </div>

        {/* Alertes stock */}
        <div className="bg-white dark:bg-[#162032] border border-slate-200 dark:border-white/5 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-slate-800 dark:text-white">Alertes stock</p>
            <p className="text-xs text-blue-500 cursor-pointer">Voir tout →</p>
          </div>
          {stats?.alertesStock && stats.alertesStock.length > 0 ? (
            <div className="space-y-2">
              {stats.alertesStock.map((a) => (
                <div
                  key={a.id}
                  className={`flex items-center gap-3 p-2.5 rounded-lg bg-slate-50 dark:bg-[#1e2d42] border-l-2 ${
                    a.stock === 0 ? 'border-red-500' : 'border-amber-500'
                  }`}
                >
                  <div className="flex-1">
                    <p className="text-xs font-medium text-slate-800 dark:text-white">{a.nom}</p>
                    <p className="text-[11px] text-slate-400">Stock : {a.stock} unités</p>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    a.stock === 0
                      ? 'bg-red-500/15 text-red-500 dark:text-red-400'
                      : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                  }`}>
                    {a.stock === 0 ? 'Rupture' : 'Faible'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-2xl mb-2">✅</p>
              <p className="text-xs text-slate-400">Tous les stocks sont OK</p>
            </div>
          )}
        </div>

      </div>

      {/* ── Transactions récentes + Top produits ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Transactions récentes */}
        <div className="bg-white dark:bg-[#162032] border border-slate-200 dark:border-white/5 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-slate-800 dark:text-white">Dernières transactions</p>
            <p className="text-xs text-blue-500 cursor-pointer">Voir tout →</p>
          </div>
          {stats?.ventesRecentes && stats.ventesRecentes.length > 0 ? (
            <div className="divide-y divide-slate-100 dark:divide-white/5">
              {stats.ventesRecentes.map((v) => (
                <div key={v.id} className="flex items-center gap-3 py-2.5">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#1e2d42] flex items-center justify-center text-sm flex-shrink-0">
                    🛒
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-slate-800 dark:text-white">
                      Vente — {v.client?.nom || 'Client comptoir'}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {new Date(v.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-emerald-500">
                    +{v.total.toLocaleString()} F
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-2xl mb-2">🛒</p>
              <p className="text-xs text-slate-400">Aucune vente aujourd'hui</p>
            </div>
          )}
        </div>

        {/* Top produits */}
        <div className="bg-white dark:bg-[#162032] border border-slate-200 dark:border-white/5 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-slate-800 dark:text-white">Top produits du mois</p>
            <p className="text-xs text-blue-500 cursor-pointer">Voir tout →</p>
          </div>
          {stats?.topProduits && stats.topProduits.length > 0 ? (
            <div className="divide-y divide-slate-100 dark:divide-white/5">
              {stats.topProduits.map((p, i) => (
                <div key={p.produitId} className="flex items-center gap-3 py-2.5">
                  <span className="text-xs font-bold text-slate-400 w-5 text-center">0{i + 1}</span>
                  <p className="flex-1 text-xs text-slate-800 dark:text-white">{p.produit?.nom || '—'}</p>
                  <div className="w-20 h-1.5 bg-slate-200 dark:bg-[#1e2d42] rounded-full">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${(p._sum.quantite / stats.topProduits[0]._sum.quantite) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-400 w-12 text-right">{p._sum.quantite} vts</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-2xl mb-2">📦</p>
              <p className="text-xs text-slate-400">Aucune vente ce mois</p>
            </div>
          )}
        </div>

      </div>

    </div>
  )
}