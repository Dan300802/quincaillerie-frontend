import { useState, useEffect } from 'react'
import { TrendingUp, Truck, ShoppingCart, FileSpreadsheet, FileText } from 'lucide-react'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import api from '../api/axios'

// ─── Données statiques pour les graphiques
const ventesParMois = [
  { mois: 'Sep', ventes: 1850000, achats: 920000 },
  { mois: 'Oct', ventes: 2100000, achats: 1050000 },
  { mois: 'Nov', ventes: 1750000, achats: 870000 },
  { mois: 'Déc', ventes: 2800000, achats: 1400000 },
  { mois: 'Jan', ventes: 2200000, achats: 1100000 },
  { mois: 'Fév', ventes: 2450000, achats: 1220000 },
  { mois: 'Mar', ventes: 2650000, achats: 1320000 },
]

const ventesParCategorie = [
  { name: 'Construction', value: 3800000, color: '#2563eb' },
  { name: 'Électricité', value: 2100000, color: '#10b981' },
  { name: 'Plomberie', value: 1850000, color: '#f59e0b' },
  { name: 'Outillage', value: 1500000, color: '#8b5cf6' },
  { name: 'Visserie', value: 750000, color: '#ef4444' },
]

const evolutionStock = [
  { mois: 'Sep', entrees: 450, sorties: 380 },
  { mois: 'Oct', entrees: 520, sorties: 430 },
  { mois: 'Nov', entrees: 380, sorties: 350 },
  { mois: 'Déc', entrees: 680, sorties: 590 },
  { mois: 'Jan', entrees: 490, sorties: 420 },
  { mois: 'Fév', entrees: 540, sorties: 480 },
  { mois: 'Mar', entrees: 610, sorties: 520 },
]

// ─── Tooltip custom
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1e2d42] border border-white/10 rounded-xl px-4 py-3 shadow-xl">
        <p className="text-xs text-slate-400 mb-2">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-xs font-semibold" style={{ color: p.color }}>
            {p.name} : {Number(p.value).toLocaleString()}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function Statistiques() {
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
      setErreur('Erreur lors du chargement des statistiques')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { chargerStats() }, [])

  const totalVentes = ventesParMois.reduce((s, m) => s + m.ventes, 0)
  const totalAchats = ventesParMois.reduce((s, m) => s + m.achats, 0)
  const benefice = totalVentes - totalAchats
  const tauxBenefice = Math.round((benefice / totalVentes) * 100)

  // ─── Top produits depuis l'API
  const topProduits = stats?.topProduits || []
  const maxVentes = topProduits[0]?._sum?.quantite || 1

  // ─── Export Excel
  const exportExcel = () => {
    const wb = XLSX.utils.book_new()

    const ws1 = XLSX.utils.json_to_sheet(
      ventesParMois.map(m => ({
        'Mois': m.mois,
        'Ventes (FCFA)': m.ventes,
        'Achats (FCFA)': m.achats,
        'Bénéfice (FCFA)': m.ventes - m.achats,
      }))
    )
    XLSX.utils.book_append_sheet(wb, ws1, 'Ventes par mois')

    const ws2 = XLSX.utils.json_to_sheet(
      ventesParCategorie.map(c => ({
        'Catégorie': c.name,
        "Chiffre d'affaires (FCFA)": c.value,
      }))
    )
    XLSX.utils.book_append_sheet(wb, ws2, 'Par catégorie')

    const ws3 = XLSX.utils.json_to_sheet(
      topProduits.map((p, i) => ({
        'Rang': i + 1,
        'Produit': p.produit?.nom || '—',
        'Ventes (unités)': p._sum?.quantite || 0,
      }))
    )
    XLSX.utils.book_append_sheet(wb, ws3, 'Top produits')

    const ws4 = XLSX.utils.json_to_sheet(
      evolutionStock.map(m => ({
        'Mois': m.mois,
        'Entrées': m.entrees,
        'Sorties': m.sorties,
        'Solde': m.entrees - m.sorties,
      }))
    )
    XLSX.utils.book_append_sheet(wb, ws4, 'Mouvement stock')

    const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    saveAs(new Blob([buf], { type: 'application/octet-stream' }), 'QuincaPro_Statistiques.xlsx')
  }

  // ─── Export PDF
  const exportPDF = () => {
    const doc = new jsPDF()
    const date = new Date().toLocaleDateString('fr-FR')

    doc.setFillColor(37, 99, 235)
    doc.rect(0, 0, 210, 28, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('QuincaPro — Rapport Statistiques', 14, 18)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text(`Généré le ${date}`, 155, 18)

    doc.setTextColor(30, 41, 59)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Résumé financier (7 mois)', 14, 40)

    autoTable(doc, {
      startY: 45,
      head: [['Indicateur', 'Valeur']],
      body: [
        ["Chiffre d'affaires total", totalVentes.toLocaleString() + ' FCFA'],
        ['Total achats', totalAchats.toLocaleString() + ' FCFA'],
        ['Bénéfice net', benefice.toLocaleString() + ' FCFA'],
        ['Taux de marge', tauxBenefice + '%'],
      ],
      headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [241, 245, 249] },
      styles: { fontSize: 10 },
    })

    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Ventes par mois', 14, doc.lastAutoTable.finalY + 14)

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 18,
      head: [['Mois', 'Ventes (FCFA)', 'Achats (FCFA)', 'Bénéfice (FCFA)']],
      body: ventesParMois.map(m => [
        m.mois,
        m.ventes.toLocaleString(),
        m.achats.toLocaleString(),
        (m.ventes - m.achats).toLocaleString(),
      ]),
      headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [241, 245, 249] },
      styles: { fontSize: 10 },
    })

    if (topProduits.length > 0) {
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('Top produits', 14, doc.lastAutoTable.finalY + 14)

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 18,
        head: [['#', 'Produit', 'Ventes (unités)']],
        body: topProduits.map((p, i) => [
          i + 1,
          p.produit?.nom || '—',
          p._sum?.quantite || 0,
        ]),
        headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [241, 245, 249] },
        styles: { fontSize: 10 },
      })
    }

    const pageCount = doc.internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(148, 163, 184)
      doc.text(`QuincaPro — Page ${i} / ${pageCount}`, 14, 290)
      doc.text('Confidentiel', 170, 290)
    }

    doc.save('QuincaPro_Statistiques.pdf')
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
          <button onClick={chargerStats} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-xl hover:bg-blue-700">
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">Statistiques & Rapports</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Aujourd'hui : <span className="text-blue-400 font-medium">{(stats?.chiffreAffaires || 0).toLocaleString()} FCFA</span> — {stats?.ventesJour || 0} vente(s)
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportExcel}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-all"
          >
            <FileSpreadsheet size={15} /> Excel
          </button>
          <button
            onClick={exportPDF}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-xl transition-all"
          >
            <FileText size={15} /> PDF
          </button>
        </div>
      </div>

      {/* ── KPI ── */}
<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
  {[
    {
      label: "Chiffre d'affaires aujourd'hui",
      value: (stats?.chiffreAffaires || 0).toLocaleString() + ' F',
      delta: `${stats?.ventesJour || 0} vente(s)`,
      up: true,
      icon: TrendingUp,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Total produits',
      value: stats?.totalProduits || 0,
      delta: `${stats?.produitsRupture || 0} en rupture`,
      up: (stats?.produitsRupture || 0) === 0,
      icon: Truck,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
    },
    {
      label: 'Commandes en attente',
      value: stats?.commandesEnAttente || 0,
      delta: 'À traiter',
      up: (stats?.commandesEnAttente || 0) === 0,
      icon: TrendingUp,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
    {
      label: 'Ventes du jour',
      value: stats?.ventesJour || 0,
      delta: (stats?.chiffreAffaires || 0).toLocaleString() + ' FCFA',
      up: true,
      icon: ShoppingCart,
      color: 'text-violet-400',
      bg: 'bg-violet-500/10',
    },
  ].map(k => (
    <div key={k.label} className="bg-white dark:bg-[#162032] border border-slate-200 dark:border-white/5 rounded-xl p-4">
      <div className="flex items-start justify-between mb-3">
        <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-tight">{k.label}</p>
        <div className={`w-8 h-8 ${k.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
          <k.icon size={15} className={k.color} />
        </div>
      </div>
      <p className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight mb-1">{k.value}</p>
      <p className={`text-xs font-medium ${k.up ? 'text-emerald-500' : 'text-red-400'}`}>
        {k.up ? '▲' : '▼'} {k.delta}
      </p>
    </div>
  ))}
</div>

      {/* ── Ventes vs Achats ── */}
      <div className="bg-white dark:bg-[#162032] border border-slate-200 dark:border-white/5 rounded-xl p-5">
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm font-semibold text-slate-800 dark:text-white">Ventes vs Achats (7 derniers mois)</p>
          <div className="flex gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="w-2 h-2 rounded-sm bg-blue-600 inline-block"></span> Ventes
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="w-2 h-2 rounded-sm bg-emerald-500 inline-block"></span> Achats
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={ventesParMois} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.1)" vertical={false} />
            <XAxis dataKey="mois" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => (v / 1000000).toFixed(1) + 'M'} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="ventes" name="Ventes" fill="#2563eb" radius={[3, 3, 0, 0]} />
            <Bar dataKey="achats" name="Achats" fill="#10b981" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── Répartition + Evolution stock ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        <div className="bg-white dark:bg-[#162032] border border-slate-200 dark:border-white/5 rounded-xl p-5">
          <p className="text-sm font-semibold text-slate-800 dark:text-white mb-5">Ventes par catégorie</p>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={ventesParCategorie} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value">
                  {ventesParCategorie.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#1e2d42', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 12 }}
                  formatter={v => v.toLocaleString() + ' F'}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {ventesParCategorie.map(c => (
                <div key={c.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: c.color }}></span>
                    <span className="text-xs text-slate-600 dark:text-slate-300">{c.name}</span>
                  </div>
                  <span className="text-xs font-semibold text-slate-800 dark:text-white">
                    {(c.value / 1000000).toFixed(1)}M
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#162032] border border-slate-200 dark:border-white/5 rounded-xl p-5">
          <p className="text-sm font-semibold text-slate-800 dark:text-white mb-5">Mouvement de stock</p>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={evolutionStock}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.1)" vertical={false} />
              <XAxis dataKey="mois" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="entrees" name="Entrées" stroke="#2563eb" strokeWidth={2} dot={{ fill: '#2563eb', r: 3 }} />
              <Line type="monotone" dataKey="sorties" name="Sorties" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full bg-blue-600 inline-block"></span> Entrées
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block"></span> Sorties
            </div>
          </div>
        </div>

      </div>

      {/* ── Top produits ── */}
      <div className="bg-white dark:bg-[#162032] border border-slate-200 dark:border-white/5 rounded-xl p-5">
        <p className="text-sm font-semibold text-slate-800 dark:text-white mb-4">Top produits du mois</p>
        {topProduits.length > 0 ? (
          <div className="overflow-hidden rounded-xl border border-slate-100 dark:border-white/5">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 dark:bg-[#1e2d42] border-b border-slate-200 dark:border-white/5">
                  <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-widest">#</th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Produit</th>
                  <th className="text-right px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Ventes (unités)</th>
                  <th className="px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Performance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {topProduits.map((p, i) => (
                  <tr key={p.produitId} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3">
                      <span className={`text-xs font-bold w-6 h-6 rounded-lg flex items-center justify-center ${
                        i === 0 ? 'bg-amber-500/15 text-amber-500' :
                        i === 1 ? 'bg-slate-400/15 text-slate-400' :
                        i === 2 ? 'bg-orange-500/15 text-orange-400' :
                        'bg-slate-100 dark:bg-white/5 text-slate-400'
                      }`}>
                        {i + 1}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm font-medium text-slate-800 dark:text-white">
                      {p.produit?.nom || '—'}
                    </td>
                    <td className="px-5 py-3 text-right text-sm font-semibold text-blue-500">
                      {p._sum?.quantite || 0}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-slate-200 dark:bg-[#1e2d42] rounded-full">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${((p._sum?.quantite || 0) / maxVentes) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-400 w-8 text-right">
                          {Math.round(((p._sum?.quantite || 0) / maxVentes) * 100)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-3xl mb-3">📊</p>
            <p className="text-sm text-slate-400">Aucune vente ce mois — les données apparaîtront ici après les premières ventes</p>
          </div>
        )}
      </div>

    </div>
  )
}