import { useState, useEffect } from 'react'
import { Search, Plus, Minus, Trash2, Printer, ShoppingBag } from 'lucide-react'
import api from '../api/axios'

// ─── Composant Reçu
function Recu({ panier, client, total, tva, netAPayer, onClose }) {
  const date = new Date().toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric'
  })
  const heure = new Date().toLocaleTimeString('fr-FR', {
    hour: '2-digit', minute: '2-digit'
  })
  const numero = 'VTE-' + Date.now().toString().slice(-6)

  const handlePrint = () => window.print()

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#162032] rounded-2xl w-full max-w-sm shadow-2xl">

        {/* Header */}
        <div className="text-center p-6 border-b border-slate-200 dark:border-white/10">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl mx-auto mb-3">Q</div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">QuincaPro</h2>
          <p className="text-xs text-slate-400">Lomé, Togo — Tel: +228 90 00 00 00</p>
          <div className="mt-3 bg-slate-50 dark:bg-[#1e2d42] rounded-lg px-4 py-2">
            <p className="text-xs text-slate-500 dark:text-slate-400">Reçu N° <span className="font-bold text-blue-500">{numero}</span></p>
            <p className="text-xs text-slate-400">{date} à {heure}</p>
          </div>
        </div>

        {/* Client */}
        <div className="px-6 py-3 border-b border-slate-200 dark:border-white/10">
          <p className="text-xs text-slate-400">Client : <span className="font-medium text-slate-800 dark:text-white">{client || 'Client comptoir'}</span></p>
        </div>

        {/* Articles */}
        <div className="px-6 py-3 border-b border-slate-200 dark:border-white/10 max-h-48 overflow-y-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-slate-400">
                <th className="text-left pb-2 font-medium">Article</th>
                <th className="text-center pb-2 font-medium">Qté</th>
                <th className="text-right pb-2 font-medium">Prix</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {panier.map((item) => (
                <tr key={item.id}>
                  <td className="py-1.5 text-slate-700 dark:text-slate-300">{item.nom}</td>
                  <td className="py-1.5 text-center text-slate-500">{item.quantite}</td>
                  <td className="py-1.5 text-right font-medium text-slate-800 dark:text-white">
                    {(item.prix * item.quantite).toLocaleString()} F
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totaux */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-white/10 space-y-1.5">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Sous-total HT</span>
            <span>{total.toLocaleString()} FCFA</span>
          </div>
          <div className="flex justify-between text-xs text-slate-400">
            <span>TVA (18%)</span>
            <span>{tva.toLocaleString()} FCFA</span>
          </div>
          <div className="flex justify-between text-sm font-bold text-slate-800 dark:text-white pt-1 border-t border-slate-200 dark:border-white/10">
            <span>Total TTC</span>
            <span className="text-blue-600 dark:text-blue-400">{netAPayer.toLocaleString()} FCFA</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 text-center border-b border-slate-200 dark:border-white/10">
          <p className="text-[11px] text-slate-400">Merci pour votre achat !</p>
          <p className="text-[11px] text-slate-400">Tout article vendu ne sera ni repris ni échangé.</p>
        </div>

        {/* Boutons */}
        <div className="p-4 flex gap-3">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-all"
          >
            <Printer size={15} /> Imprimer
          </button>
          <button
            onClick={onClose}
            className="flex-1 flex items-center justify-center gap-2 bg-slate-100 dark:bg-[#1e2d42] hover:bg-slate-200 dark:hover:bg-[#253550] text-slate-700 dark:text-slate-300 text-sm font-semibold py-2.5 rounded-xl transition-all"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Page Caisse
export default function Caisse() {
  const [produits, setProduits] = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [recherche, setRecherche] = useState('')
  const [categorie, setCategorie] = useState('Tous')
  const [categories, setCategories] = useState(['Tous'])
  const [panier, setPanier] = useState([])
  const [clientId, setClientId] = useState('')
  const [clientNom, setClientNom] = useState('')
  const [showRecu, setShowRecu] = useState(false)
  const [saving, setSaving] = useState(false)

  // ─── Charger produits et clients
  useEffect(() => {
    const charger = async () => {
      try {
        const [resProduits, resClients] = await Promise.all([
          api.get('/produits'),
          api.get('/clients'),
        ])
        setProduits(resProduits.data)
        setClients(resClients.data)

        // Extraire les catégories uniques
        const cats = ['Tous', ...new Set(resProduits.data
          .map(p => p.categorie?.nom)
          .filter(Boolean)
        )]
        setCategories(cats)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    charger()
  }, [])

  // ─── Filtrer produits
  const produitsFiltres = produits.filter(p => {
    const matchCat = categorie === 'Tous' || p.categorie?.nom === categorie
    const matchSearch = p.nom.toLowerCase().includes(recherche.toLowerCase())
    return matchCat && matchSearch
  })

  // ─── Ajouter au panier
  const ajouterAuPanier = (produit) => {
    if (produit.stock <= 0) return
    setPanier(prev => {
      const exist = prev.find(i => i.id === produit.id)
      if (exist) {
        if (exist.quantite >= produit.stock) return prev
        return prev.map(i => i.id === produit.id ? { ...i, quantite: i.quantite + 1 } : i)
      }
      return [...prev, { ...produit, nom: produit.nom, quantite: 1 }]
    })
  }

  // ─── Modifier quantité
  const modifierQuantite = (id, delta) => {
    setPanier(prev =>
      prev.map(i => i.id === id
        ? { ...i, quantite: Math.max(1, i.quantite + delta) }
        : i
      )
    )
  }

  // ─── Supprimer du panier
  const supprimerDuPanier = (id) => {
    setPanier(prev => prev.filter(i => i.id !== id))
  }

  // ─── Vider panier
  const viderPanier = () => {
    setPanier([])
    setClientId('')
    setClientNom('')
  }

  // ─── Calculs
  const sousTotal = panier.reduce((s, i) => s + i.prix * i.quantite, 0)
  const tva = Math.round(sousTotal * 0.18)
  const netAPayer = sousTotal + tva

  // ─── Valider vente
  const validerVente = async () => {
    if (panier.length === 0) return
    setSaving(true)
    try {
      await api.post('/ventes', {
        clientId: clientId ? Number(clientId) : null,
        sousTotal,
        tva,
        total: netAPayer,
        lignes: panier.map(i => ({
          produitId: i.id,
          quantite: i.quantite,
          prix: i.prix,
        }))
      })
      setShowRecu(true)
    } catch (err) {
      alert('Erreur lors de la validation de la vente')
    } finally {
      setSaving(false)
    }
  }

  // ─── Fermer reçu
  const fermerRecu = () => {
    setShowRecu(false)
    viderPanier()
    // Recharger les produits pour mettre à jour le stock
    api.get('/produits').then(res => setProduits(res.data))
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

  return (
    <div className="flex flex-col lg:flex-row gap-5">

      {/* ── Colonne gauche : catalogue ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Recherche */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1 flex items-center gap-2 bg-white dark:bg-[#162032] border border-slate-200 dark:border-white/5 rounded-xl px-4 py-2.5">
            <Search size={15} className="text-slate-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={recherche}
              onChange={e => setRecherche(e.target.value)}
              className="flex-1 bg-transparent text-sm text-slate-800 dark:text-white placeholder-slate-400 outline-none"
            />
          </div>
        </div>

        {/* Catégories */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategorie(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                categorie === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-[#162032] border border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-400 hover:border-blue-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grille produits */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {produitsFiltres.map(produit => (
            <div
              key={produit.id}
              onClick={() => ajouterAuPanier(produit)}
              className={`bg-white dark:bg-[#162032] border rounded-xl p-4 transition-all ${
                produit.stock <= 0
                  ? 'opacity-50 cursor-not-allowed border-slate-200 dark:border-white/5'
                  : 'cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-sm border-slate-200 dark:border-white/5'
              }`}
            >
              <div className="text-2xl mb-2">
                {produit.categorie?.nom === 'Visserie' ? '🔩' :
                 produit.categorie?.nom === 'Outillage' ? '🔧' :
                 produit.categorie?.nom === 'Plomberie' ? '🪠' :
                 produit.categorie?.nom === 'Électricité' ? '⚡' :
                 produit.categorie?.nom === 'Construction' ? '🏗️' : '📦'}
              </div>
              <p className="text-sm font-medium text-slate-800 dark:text-white mb-1 leading-tight">{produit.nom}</p>
              <p className="text-[11px] text-slate-400 mb-2">{produit.categorie?.nom || '—'}</p>
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-blue-600 dark:text-blue-400">{produit.prix.toLocaleString()} F</p>
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                  produit.stock <= 0
                    ? 'bg-red-500/15 text-red-400'
                    : 'bg-emerald-500/15 text-emerald-500'
                }`}>
                  {produit.stock <= 0 ? 'Rupture' : `Stock: ${produit.stock}`}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Colonne droite : panier ── */}
      <div className="w-full lg:w-80 flex flex-col bg-white dark:bg-[#162032] border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden flex-shrink-0">

        {/* Header panier */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag size={16} className="text-blue-500" />
            <span className="text-sm font-semibold text-slate-800 dark:text-white">Panier</span>
            {panier.length > 0 && (
              <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {panier.reduce((s, i) => s + i.quantite, 0)}
              </span>
            )}
          </div>
          {panier.length > 0 && (
            <button onClick={viderPanier} className="text-xs text-red-400 hover:text-red-500 transition-colors">
              Vider
            </button>
          )}
        </div>

        {/* Sélection client */}
        <div className="px-5 py-3 border-b border-slate-200 dark:border-white/5">
          <select
            value={clientId}
            onChange={e => {
              setClientId(e.target.value)
              const client = clients.find(c => c.id === Number(e.target.value))
              setClientNom(client?.nom || '')
            }}
            className="w-full bg-slate-50 dark:bg-[#1e2d42] border border-slate-200 dark:border-white/5 rounded-lg px-3 py-2 text-xs text-slate-800 dark:text-white outline-none focus:border-blue-400 transition-colors"
          >
            <option value="">Client comptoir</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>{c.nom}</option>
            ))}
          </select>
        </div>

        {/* Articles panier */}
        <div className="flex-1 overflow-y-auto px-5 py-3">
          {panier.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-10">
              <div className="text-4xl mb-3">🛒</div>
              <p className="text-sm text-slate-400">Panier vide</p>
              <p className="text-xs text-slate-400 mt-1">Cliquez sur un produit pour l'ajouter</p>
            </div>
          ) : (
            <div className="space-y-2">
              {panier.map(item => (
                <div key={item.id} className="bg-slate-50 dark:bg-[#1e2d42] rounded-xl p-3">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-xs font-medium text-slate-800 dark:text-white leading-tight flex-1 pr-2">{item.nom}</p>
                    <button
                      onClick={() => supprimerDuPanier(item.id)}
                      className="text-slate-300 dark:text-slate-600 hover:text-red-400 transition-colors flex-shrink-0"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => modifierQuantite(item.id, -1)}
                        className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-[#162032] flex items-center justify-center hover:bg-slate-300 dark:hover:bg-[#253550] transition-colors"
                      >
                        <Minus size={11} className="text-slate-600 dark:text-slate-400" />
                      </button>
                      <span className="text-sm font-bold text-slate-800 dark:text-white w-5 text-center">{item.quantite}</span>
                      <button
                        onClick={() => modifierQuantite(item.id, 1)}
                        className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-[#162032] flex items-center justify-center hover:bg-slate-300 dark:hover:bg-[#253550] transition-colors"
                      >
                        <Plus size={11} className="text-slate-600 dark:text-slate-400" />
                      </button>
                    </div>
                    <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
                      {(item.prix * item.quantite).toLocaleString()} F
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Totaux + bouton */}
        <div className="px-5 py-4 border-t border-slate-200 dark:border-white/5">
          <div className="space-y-1.5 mb-4">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Sous-total HT</span>
              <span>{sousTotal.toLocaleString()} FCFA</span>
            </div>
            <div className="flex justify-between text-xs text-slate-400">
              <span>TVA (18%)</span>
              <span>{tva.toLocaleString()} FCFA</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-slate-800 dark:text-white pt-2 border-t border-slate-200 dark:border-white/10">
              <span>Total TTC</span>
              <span className="text-blue-600 dark:text-blue-400">{netAPayer.toLocaleString()} FCFA</span>
            </div>
          </div>

          <button
            onClick={validerVente}
            disabled={panier.length === 0 || saving}
            className={`w-full py-3 rounded-xl text-sm font-bold transition-all ${
              panier.length > 0 && !saving
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20'
                : 'bg-slate-100 dark:bg-[#1e2d42] text-slate-400 cursor-not-allowed'
            }`}
          >
            {saving ? 'Enregistrement...' : 'Valider la vente'}
          </button>
        </div>
      </div>

      {/* ── Reçu ── */}
      {showRecu && (
        <Recu
          panier={panier}
          client={clientNom}
          total={sousTotal}
          tva={tva}
          netAPayer={netAPayer}
          onClose={fermerRecu}
        />
      )}
    </div>
  )
}