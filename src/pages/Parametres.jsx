import { useState, useEffect } from 'react'
import {
  Save, Store, User, Bell, Shield, Palette,
  Globe, Users, Plus, Pencil, Trash2, X
} from 'lucide-react'
import api from '../api/axios'

// ─── Constantes
const inputClass = "w-full bg-slate-50 dark:bg-[#1e2d42] border border-slate-200 dark:border-white/5 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-white placeholder-slate-400 outline-none focus:border-blue-400 transition-colors"
const labelClass = "block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1"

const sections = [
  { id: 'boutique', label: 'Boutique', icon: Store },
  { id: 'utilisateurs', label: 'Utilisateurs', icon: Users },
  { id: 'compte', label: 'Mon compte', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'securite', label: 'Sécurité', icon: Shield },
  { id: 'apparence', label: 'Apparence', icon: Palette },
  { id: 'regional', label: 'Régional', icon: Globe },
]

const tousLesDroits = [
  { key: 'dashboard', label: 'Tableau de bord', desc: 'Voir les statistiques générales' },
  { key: 'inventaire', label: 'Inventaire', desc: 'Consulter et modifier les stocks' },
  { key: 'caisse', label: 'Point de vente', desc: 'Effectuer des ventes et encaissements' },
  { key: 'commandes', label: 'Commandes', desc: 'Gérer les commandes fournisseurs' },
  { key: 'clients', label: 'Clients', desc: 'Accéder à la liste des clients' },
  { key: 'fournisseurs', label: 'Fournisseurs', desc: 'Accéder à la liste des fournisseurs' },
  { key: 'statistiques', label: 'Statistiques', desc: 'Voir et exporter les rapports' },
  { key: 'parametres', label: 'Paramètres', desc: "Modifier les paramètres de l'application" },
]

const rolesPredefinis = {
  administrateur: {
    label: 'Administrateur',
    color: 'bg-blue-500/15 text-blue-500',
    droits: { dashboard: true, inventaire: true, caisse: true, commandes: true, clients: true, fournisseurs: true, statistiques: true, parametres: true },
  },
  caissier: {
    label: 'Caissier',
    color: 'bg-emerald-500/15 text-emerald-500',
    droits: { dashboard: true, inventaire: false, caisse: true, commandes: false, clients: true, fournisseurs: false, statistiques: false, parametres: false },
  },
  gestionnaire: {
    label: 'Gestionnaire stock',
    color: 'bg-amber-500/15 text-amber-500',
    droits: { dashboard: true, inventaire: true, caisse: false, commandes: true, clients: false, fournisseurs: true, statistiques: true, parametres: false },
  },
}

const avatarColors = ['bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-rose-500', 'bg-amber-500']

// ─── Toggle
function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-5 rounded-full transition-colors duration-200 flex-shrink-0 ${checked ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  )
}

// ─── Modal Utilisateur
function ModalUtilisateur({ utilisateur, onSave, onClose }) {
  const isNew = !utilisateur.id
  const [form, setForm] = useState({
    prenom: utilisateur.prenom || '',
    nom: utilisateur.nom || '',
    email: utilisateur.email || '',
    telephone: utilisateur.telephone || '',
    role: utilisateur.role || 'caissier',
    actif: utilisateur.actif ?? true,
    droits: utilisateur.droits || { ...rolesPredefinis.caissier.droits },
    motDePasse: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  const handleRoleChange = (role) => {
    setForm(f => ({ ...f, role, droits: { ...rolesPredefinis[role].droits } }))
  }

  const handleDroit = (key) => {
    setForm(f => ({ ...f, droits: { ...f.droits, [key]: !f.droits[key] } }))
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#162032] rounded-2xl w-full max-w-xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-white/10 sticky top-0 bg-white dark:bg-[#162032] z-10">
          <h2 className="text-base font-bold text-slate-800 dark:text-white">
            {isNew ? 'Nouvel utilisateur' : "Modifier l'utilisateur"}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Infos */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Informations personnelles</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Prénom</label>
                <input name="prenom" value={form.prenom} onChange={handleChange} placeholder="Prénom" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Nom</label>
                <input name="nom" value={form.nom} onChange={handleChange} placeholder="Nom" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input name="email" value={form.email} onChange={handleChange} placeholder="email@example.com" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Téléphone</label>
                <input name="telephone" value={form.telephone} onChange={handleChange} placeholder="+228 90 00 00 00" className={inputClass} />
              </div>
              {isNew && (
                <div className="col-span-2">
                  <label className={labelClass}>Mot de passe initial</label>
                  <input type="password" name="motDePasse" value={form.motDePasse} onChange={handleChange} placeholder="••••••••" className={inputClass} />
                </div>
              )}
            </div>
          </div>

          {/* Rôle */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Rôle prédéfini</p>
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(rolesPredefinis).map(([key, role]) => (
                <button
                  key={key}
                  onClick={() => handleRoleChange(key)}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${form.role === key ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10' : 'border-slate-200 dark:border-white/5 hover:border-slate-300'}`}
                >
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${role.color}`}>{role.label}</span>
                  <p className="text-xs text-slate-400 mt-2">
                    {Object.values(role.droits).filter(Boolean).length} droits activés
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Droits */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Droits d'accès personnalisés</p>
            <div className="space-y-2">
              {tousLesDroits.map(d => (
                <div key={d.key} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-[#1e2d42] rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-white">{d.label}</p>
                    <p className="text-xs text-slate-400">{d.desc}</p>
                  </div>
                  <Toggle checked={form.droits[d.key] || false} onChange={() => handleDroit(d.key)} />
                </div>
              ))}
            </div>
          </div>

          {/* Statut */}
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-[#1e2d42] rounded-xl">
            <div>
              <p className="text-sm font-medium text-slate-800 dark:text-white">Compte actif</p>
              <p className="text-xs text-slate-400">L'utilisateur peut se connecter à l'application</p>
            </div>
            <Toggle checked={form.actif} onChange={(v) => setForm(f => ({ ...f, actif: v }))} />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 dark:border-white/10 flex gap-3 justify-end sticky bottom-0 bg-white dark:bg-[#162032]">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-[#1e2d42] transition-all">
            Annuler
          </button>
          <button
            onClick={() => onSave({ ...utilisateur, ...form })}
            className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all"
          >
            <Save size={14} /> Enregistrer
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Section Utilisateurs connectée à l'API
function SectionUtilisateurs() {
  const [utilisateurs, setUtilisateurs] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)

  const chargerUtilisateurs = async () => {
    try {
      setLoading(true)
      const res = await api.get('/utilisateurs')
      setUtilisateurs(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { chargerUtilisateurs() }, [])

  const handleSave = async (form) => {
    try {
      if (form.id) {
        await api.put(`/utilisateurs/${form.id}`, form)
      } else {
        await api.post('/utilisateurs', form)
      }
      setModal(null)
      chargerUtilisateurs()
    } catch (err) {
      alert('Erreur lors de la sauvegarde')
    }
  }

  const handleDelete = async (id) => {
    if (confirm('Supprimer cet utilisateur ?')) {
      try {
        await api.delete(`/utilisateurs/${id}`)
        chargerUtilisateurs()
      } catch (err) {
        alert('Erreur lors de la suppression')
      }
    }
  }

  const toggleActif = async (utilisateur) => {
    try {
      await api.put(`/utilisateurs/${utilisateur.id}`, {
        ...utilisateur,
        actif: !utilisateur.actif
      })
      chargerUtilisateurs()
    } catch (err) {
      alert('Erreur lors de la mise à jour')
    }
  }

  const getInitiales = (prenom, nom) => `${prenom?.[0] || ''}${nom?.[0] || ''}`.toUpperCase()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="w-8 h-8 bg-blue-600 rounded-lg animate-pulse"></div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-white mb-1">Gestion des utilisateurs</h3>
          <p className="text-xs text-slate-400">Ajoutez des caissiers, gestionnaires et définissez leurs droits.</p>
        </div>
        <button
          onClick={() => setModal({ prenom: '', nom: '', email: '', telephone: '', role: 'caissier', actif: true, droits: { ...rolesPredefinis.caissier.droits } })}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all"
        >
          <Plus size={15} /> Nouvel utilisateur
        </button>
      </div>

      {/* Résumé */}
      <div className="grid grid-cols-3 gap-3">
        {Object.entries(rolesPredefinis).map(([key, role]) => (
          <div key={key} className="bg-slate-50 dark:bg-[#1e2d42] rounded-xl p-4">
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${role.color}`}>{role.label}</span>
            <p className="text-2xl font-bold text-slate-800 dark:text-white mt-2">
              {utilisateurs.filter(u => u.role === key).length}
            </p>
            <p className="text-xs text-slate-400">utilisateur(s)</p>
          </div>
        ))}
      </div>

      {/* Liste */}
      <div className="space-y-3">
        {utilisateurs.map((u, i) => {
          const role = rolesPredefinis[u.role] || rolesPredefinis.caissier
          const droitsActifs = Object.values(u.droits || {}).filter(Boolean).length
          return (
            <div key={u.id} className="bg-slate-50 dark:bg-[#1e2d42] rounded-xl p-4">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 ${avatarColors[i % avatarColors.length]} rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                  {getInitiales(u.prenom, u.nom)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <p className="text-sm font-semibold text-slate-800 dark:text-white">{u.prenom} {u.nom}</p>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${role.color}`}>{role.label}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${u.actif ? 'bg-emerald-500/15 text-emerald-500' : 'bg-slate-500/15 text-slate-400'}`}>
                      {u.actif ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 truncate">{u.email} · {u.telephone || '—'}</p>
                </div>
                <div className="text-center flex-shrink-0">
                  <p className="text-lg font-bold text-blue-500">{droitsActifs}</p>
                  <p className="text-[10px] text-slate-400">droits</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Toggle checked={u.actif} onChange={() => toggleActif(u)} />
                  <button
                    onClick={() => setModal(u)}
                    className="w-8 h-8 rounded-lg bg-white dark:bg-[#162032] flex items-center justify-center text-slate-400 hover:text-blue-500 transition-all"
                  >
                    <Pencil size={13} />
                  </button>
                  {u.role !== 'administrateur' && (
                    <button
                      onClick={() => handleDelete(u.id)}
                      className="w-8 h-8 rounded-lg bg-white dark:bg-[#162032] flex items-center justify-center text-slate-400 hover:text-red-400 transition-all"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-200 dark:border-white/5 flex flex-wrap gap-1.5">
                {tousLesDroits.map(d => (
                  <span
                    key={d.key}
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-lg ${
                      (u.droits || {})[d.key]
                        ? 'bg-blue-500/15 text-blue-500 dark:text-blue-400'
                        : 'bg-slate-200 dark:bg-white/5 text-slate-400 line-through'
                    }`}
                  >
                    {d.label}
                  </span>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {modal && (
        <ModalUtilisateur utilisateur={modal} onSave={handleSave} onClose={() => setModal(null)} />
      )}
    </div>
  )
}

// ─── Section Boutique
function SectionBoutique() {
  const [form, setForm] = useState({
    nom: 'QuincaPro', slogan: 'Votre quincaillerie de confiance',
    telephone: '+228 90 00 00 00', email: 'contact@quincapro.tg',
    adresse: 'Lomé, Togo', tva: '18', devise: 'FCFA', siret: 'TG-2024-0001',
  })
  const [saved, setSaved] = useState(false)
  const handleChange = (e) => { setForm(f => ({ ...f, [e.target.name]: e.target.value })); setSaved(false) }
  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2500) }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-slate-800 dark:text-white mb-1">Informations de la boutique</h3>
        <p className="text-xs text-slate-400">Ces informations apparaissent sur vos reçus et documents.</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className={labelClass}>Nom de la boutique</label><input name="nom" value={form.nom} onChange={handleChange} className={inputClass} /></div>
        <div><label className={labelClass}>Slogan</label><input name="slogan" value={form.slogan} onChange={handleChange} className={inputClass} /></div>
        <div><label className={labelClass}>Téléphone</label><input name="telephone" value={form.telephone} onChange={handleChange} className={inputClass} /></div>
        <div><label className={labelClass}>Email</label><input name="email" value={form.email} onChange={handleChange} className={inputClass} /></div>
        <div className="col-span-2"><label className={labelClass}>Adresse</label><input name="adresse" value={form.adresse} onChange={handleChange} className={inputClass} /></div>
        <div><label className={labelClass}>Numéro SIRET / Registre</label><input name="siret" value={form.siret} onChange={handleChange} className={inputClass} /></div>
        <div><label className={labelClass}>Taux TVA (%)</label><input type="number" name="tva" value={form.tva} onChange={handleChange} min="0" max="100" className={inputClass} /></div>
      </div>
      <div className="flex items-center justify-between pt-2">
        {saved && <p className="text-xs text-emerald-500 font-medium">✅ Modifications enregistrées !</p>}
        <div className="ml-auto">
          <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all">
            <Save size={14} /> Enregistrer
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Section Compte
function SectionCompte() {
  const [form, setForm] = useState({
    prenom: 'Kofi', nom: 'Amessan',
    email: 'kofi.amessan@quincapro.tg',
    telephone: '+228 90 00 00 00', role: 'Administrateur',
  })
  const [saved, setSaved] = useState(false)
  const handleChange = (e) => { setForm(f => ({ ...f, [e.target.name]: e.target.value })); setSaved(false) }
  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2500) }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-slate-800 dark:text-white mb-1">Informations personnelles</h3>
        <p className="text-xs text-slate-400">Gérez les informations de votre compte.</p>
      </div>
      <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-[#1e2d42] rounded-xl">
        <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0">KA</div>
        <div>
          <p className="text-sm font-semibold text-slate-800 dark:text-white">{form.prenom} {form.nom}</p>
          <p className="text-xs text-slate-400">{form.role}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className={labelClass}>Prénom</label><input name="prenom" value={form.prenom} onChange={handleChange} className={inputClass} /></div>
        <div><label className={labelClass}>Nom</label><input name="nom" value={form.nom} onChange={handleChange} className={inputClass} /></div>
        <div><label className={labelClass}>Email</label><input name="email" value={form.email} onChange={handleChange} className={inputClass} /></div>
        <div><label className={labelClass}>Téléphone</label><input name="telephone" value={form.telephone} onChange={handleChange} className={inputClass} /></div>
        <div>
          <label className={labelClass}>Rôle</label>
          <select name="role" value={form.role} onChange={handleChange} className={inputClass}>
            <option>Administrateur</option>
            <option>Caissier</option>
            <option>Gestionnaire stock</option>
          </select>
        </div>
      </div>
      <div className="flex items-center justify-between pt-2">
        {saved && <p className="text-xs text-emerald-500 font-medium">✅ Modifications enregistrées !</p>}
        <div className="ml-auto">
          <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all">
            <Save size={14} /> Enregistrer
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Section Notifications
function SectionNotifications() {
  const [notifs, setNotifs] = useState({
    rupture: true, stockFaible: true, nouvelleCommande: true,
    livraisonCommande: true, nouvelleVente: false,
    rapportJournalier: true, rapportHebdo: false,
  })
  const [saved, setSaved] = useState(false)

  const items = [
    { key: 'rupture', label: 'Rupture de stock', desc: 'Alerte quand un produit est en rupture' },
    { key: 'stockFaible', label: 'Stock faible', desc: 'Alerte quand le stock passe sous le seuil' },
    { key: 'nouvelleCommande', label: 'Nouvelle commande', desc: 'Notification à chaque commande fournisseur' },
    { key: 'livraisonCommande', label: 'Livraison reçue', desc: 'Confirmation de réception de commande' },
    { key: 'nouvelleVente', label: 'Nouvelle vente', desc: 'Notification à chaque vente réalisée' },
    { key: 'rapportJournalier', label: 'Rapport journalier', desc: 'Résumé automatique chaque soir' },
    { key: 'rapportHebdo', label: 'Rapport hebdomadaire', desc: 'Bilan chaque lundi matin' },
  ]

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-slate-800 dark:text-white mb-1">Préférences de notifications</h3>
        <p className="text-xs text-slate-400">Choisissez les événements pour lesquels vous souhaitez être notifié.</p>
      </div>
      <div className="space-y-2">
        {items.map(item => (
          <div key={item.key} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-[#1e2d42] rounded-xl">
            <div>
              <p className="text-sm font-medium text-slate-800 dark:text-white">{item.label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
            </div>
            <Toggle
              checked={notifs[item.key]}
              onChange={() => { setNotifs(n => ({ ...n, [item.key]: !n[item.key] })); setSaved(false) }}
            />
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between pt-2">
        {saved && <p className="text-xs text-emerald-500 font-medium">✅ Préférences enregistrées !</p>}
        <div className="ml-auto">
          <button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2500) }} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all">
            <Save size={14} /> Enregistrer
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Section Sécurité
function SectionSecurite() {
  const [form, setForm] = useState({ actuel: '', nouveau: '', confirmer: '' })
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => { setForm(f => ({ ...f, [e.target.name]: e.target.value })); setError(''); setSaved(false) }

  const handleSave = () => {
    if (!form.actuel || !form.nouveau || !form.confirmer) { setError('Veuillez remplir tous les champs.'); return }
    if (form.nouveau !== form.confirmer) { setError('Les nouveaux mots de passe ne correspondent pas.'); return }
    if (form.nouveau.length < 6) { setError('Le mot de passe doit contenir au moins 6 caractères.'); return }
    setSaved(true)
    setForm({ actuel: '', nouveau: '', confirmer: '' })
    setTimeout(() => setSaved(false), 2500)
  }

  const sessions = [
    { device: 'Chrome — Windows 11', lieu: 'Lomé, Togo', date: "Aujourd'hui à 19h14", actif: true },
    { device: 'Firefox — Android', lieu: 'Lomé, Togo', date: 'Hier à 08h32', actif: false },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-slate-800 dark:text-white mb-1">Changer le mot de passe</h3>
        <p className="text-xs text-slate-400">Utilisez un mot de passe fort d'au moins 6 caractères.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 max-w-md">
        <div><label className={labelClass}>Mot de passe actuel</label><input type="password" name="actuel" value={form.actuel} onChange={handleChange} placeholder="••••••••" className={inputClass} /></div>
        <div><label className={labelClass}>Nouveau mot de passe</label><input type="password" name="nouveau" value={form.nouveau} onChange={handleChange} placeholder="••••••••" className={inputClass} /></div>
        <div><label className={labelClass}>Confirmer le mot de passe</label><input type="password" name="confirmer" value={form.confirmer} onChange={handleChange} placeholder="••••••••" className={inputClass} /></div>
      </div>
      {error && <p className="text-xs text-red-400 font-medium">⚠️ {error}</p>}
      {saved && <p className="text-xs text-emerald-500 font-medium">✅ Mot de passe modifié avec succès !</p>}
      <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all">
        <Save size={14} /> Modifier le mot de passe
      </button>
      <div className="border-t border-slate-200 dark:border-white/5 pt-5">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-white mb-3">Sessions actives</h3>
        <div className="space-y-2">
          {sessions.map((s, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-[#1e2d42] rounded-xl">
              <div>
                <p className="text-sm font-medium text-slate-800 dark:text-white">{s.device}</p>
                <p className="text-xs text-slate-400">{s.lieu} — {s.date}</p>
              </div>
              {s.actif
                ? <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500">Session active</span>
                : <button className="text-xs text-red-400 hover:text-red-500 font-medium">Déconnecter</button>
              }
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Section Apparence
function SectionApparence({ dark, toggle }) {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-slate-800 dark:text-white mb-1">Thème de l'interface</h3>
        <p className="text-xs text-slate-400">Choisissez l'apparence qui vous convient.</p>
      </div>
      <div className="grid grid-cols-2 gap-4 max-w-md">
        <div
          onClick={() => dark && toggle()}
          className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${!dark ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10' : 'border-slate-200 dark:border-white/5 hover:border-slate-300'}`}
        >
          <div className="w-full h-16 bg-white rounded-lg border border-slate-200 mb-3 flex flex-col gap-1 p-2">
            <div className="w-1/2 h-1.5 bg-slate-200 rounded"></div>
            <div className="w-3/4 h-1.5 bg-slate-100 rounded"></div>
            <div className="w-2/3 h-1.5 bg-slate-100 rounded"></div>
          </div>
          <p className="text-xs font-semibold text-slate-800 dark:text-white text-center">Mode clair</p>
          {!dark && <p className="text-[10px] text-blue-500 text-center mt-0.5">Actif</p>}
        </div>
        <div
          onClick={() => !dark && toggle()}
          className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${dark ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10' : 'border-slate-200 dark:border-white/5 hover:border-slate-300'}`}
        >
          <div className="w-full h-16 bg-[#162032] rounded-lg border border-white/10 mb-3 flex flex-col gap-1 p-2">
            <div className="w-1/2 h-1.5 bg-white/20 rounded"></div>
            <div className="w-3/4 h-1.5 bg-white/10 rounded"></div>
            <div className="w-2/3 h-1.5 bg-white/10 rounded"></div>
          </div>
          <p className="text-xs font-semibold text-slate-800 dark:text-white text-center">Mode sombre</p>
          {dark && <p className="text-[10px] text-blue-500 text-center mt-0.5">Actif</p>}
        </div>
      </div>
    </div>
  )
}

// ─── Section Régional
function SectionRegional() {
  const [form, setForm] = useState({
    pays: 'Togo', langue: 'Français',
    devise: 'FCFA', fuseau: 'Africa/Lome (UTC+0)', formatDate: 'DD/MM/YYYY',
  })
  const [saved, setSaved] = useState(false)
  const handleChange = (e) => { setForm(f => ({ ...f, [e.target.name]: e.target.value })); setSaved(false) }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-slate-800 dark:text-white mb-1">Paramètres régionaux</h3>
        <p className="text-xs text-slate-400">Configurez la langue, la devise et le fuseau horaire.</p>
      </div>
      <div className="grid grid-cols-2 gap-4 max-w-lg">
        <div>
          <label className={labelClass}>Pays</label>
          <select name="pays" value={form.pays} onChange={handleChange} className={inputClass}>
            <option>Togo</option><option>Bénin</option><option>Ghana</option>
            <option>Côte d'Ivoire</option><option>Sénégal</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Langue</label>
          <select name="langue" value={form.langue} onChange={handleChange} className={inputClass}>
            <option>Français</option><option>Anglais</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Devise</label>
          <select name="devise" value={form.devise} onChange={handleChange} className={inputClass}>
            <option>FCFA</option><option>EUR</option><option>USD</option><option>GHS</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Fuseau horaire</label>
          <select name="fuseau" value={form.fuseau} onChange={handleChange} className={inputClass}>
            <option>Africa/Lome (UTC+0)</option>
            <option>Africa/Abidjan (UTC+0)</option>
            <option>Africa/Accra (UTC+0)</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Format de date</label>
          <select name="formatDate" value={form.formatDate} onChange={handleChange} className={inputClass}>
            <option>DD/MM/YYYY</option><option>MM/DD/YYYY</option><option>YYYY-MM-DD</option>
          </select>
        </div>
      </div>
      <div className="flex items-center justify-between pt-2">
        {saved && <p className="text-xs text-emerald-500 font-medium">✅ Paramètres enregistrés !</p>}
        <div className="ml-auto">
          <button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2500) }} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all">
            <Save size={14} /> Enregistrer
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Page principale
export default function Parametres({ dark, toggle }) {
  const [section, setSection] = useState('boutique')

  const renderSection = () => {
    switch (section) {
      case 'boutique': return <SectionBoutique />
      case 'utilisateurs': return <SectionUtilisateurs />
      case 'compte': return <SectionCompte />
      case 'notifications': return <SectionNotifications />
      case 'securite': return <SectionSecurite />
      case 'apparence': return <SectionApparence dark={dark} toggle={toggle} />
      case 'regional': return <SectionRegional />
      default: return null
    }
  }

  return (
    <div className="flex flex-col lg:flex-row gap-5">
      {/* Menu latéral */}
      <div className="w-full lg:w-52 flex-shrink-0">
        <div className="bg-white dark:bg-[#162032] border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden flex lg:block overflow-x-auto">
          {sections.map(s => (
            <button
              key={s.id}
              onClick={() => setSection(s.id)}
              className={`flex-shrink-0 lg:w-full flex items-center gap-2 lg:gap-3 px-3 lg:px-4 py-3 text-xs lg:text-sm transition-all border-b-2 lg:border-b lg:border-r-0 border-slate-100 dark:border-white/5 last:border-0 ${
                section === s.id
                  ? 'bg-blue-50 dark:bg-blue-600/10 text-blue-600 dark:text-blue-400 font-medium border-b-blue-500 lg:border-b-slate-100'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/[0.02] border-b-transparent lg:border-b-slate-100'
              }`}
            >
              <s.icon size={14} className="flex-shrink-0" />
              <span className="whitespace-nowrap">{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Contenu */}
      <div className="flex-1 bg-white dark:bg-[#162032] border border-slate-200 dark:border-white/5 rounded-2xl p-4 lg:p-6">
        {renderSection()}
      </div>
    </div>
  )
}