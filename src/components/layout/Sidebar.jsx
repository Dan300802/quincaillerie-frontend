import { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'
import {
  LayoutDashboard, Package, ShoppingCart, ClipboardList,
  Users, Truck, BarChart2, Settings, X, LogOut, Receipt
} from 'lucide-react'

export default function Sidebar({ open, onClose }) {
  const { utilisateur, logout } = useAuth()
  const navigate = useNavigate()
  const [badges, setBadges] = useState({ ruptures: 0, commandes: 0 })

  // ─── Charger les badges dynamiques
  useEffect(() => {
    const charger = async () => {
      try {
        const res = await api.get('/statistiques')
        setBadges({
          ruptures: res.data.produitsRupture || 0,
          commandes: res.data.commandesEnAttente || 0,
        })
      } catch (err) {
        console.error(err)
      }
    }
    charger()
    const interval = setInterval(charger, 60000)
    return () => clearInterval(interval)
  }, [])

  const navItems = [
    {
      label: 'Principal',
      links: [
        { to: '/', icon: LayoutDashboard, label: 'Tableau de bord' },
        { to: '/inventaire', icon: Package, label: 'Inventaire', badge: badges.ruptures },
        { to: '/caisse', icon: ShoppingCart, label: 'Point de vente' },
        { to: '/ventes', icon: Receipt, label: 'Ventes' },
      ]
    },
    {
      label: 'Gestion',
      links: [
        { to: '/commandes', icon: ClipboardList, label: 'Commandes', badge: badges.commandes },
        { to: '/clients', icon: Users, label: 'Clients' },
        { to: '/fournisseurs', icon: Truck, label: 'Fournisseurs' },
      ]
    },
    {
      label: 'Rapports',
      links: [
        { to: '/statistiques', icon: BarChart2, label: 'Statistiques' },
        { to: '/parametres', icon: Settings, label: 'Paramètres' },
      ]
    },
  ]

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const getInitiales = () => {
    if (!utilisateur) return 'KA'
    return `${utilisateur.prenom?.[0] || ''}${utilisateur.nom?.[0] || ''}`.toUpperCase()
  }

  const getNomComplet = () => {
    if (!utilisateur) return 'Utilisateur'
    return `${utilisateur.prenom} ${utilisateur.nom}`
  }

  const getRole = () => {
    if (!utilisateur) return 'caissier'
    const roles = {
      administrateur: 'Administrateur',
      caissier: 'Caissier',
      gestionnaire: 'Gestionnaire stock'
    }
    return roles[utilisateur.role] || utilisateur.role
  }

  return (
    <>
      {/* Overlay mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-screen z-40 w-56
        bg-white dark:bg-[#162032]
        border-r border-slate-200 dark:border-white/5
        flex flex-col transition-transform duration-300
        lg:sticky lg:translate-x-0
        ${open ? 'translate-x-0' : '-translate-x-full'}
      `}>

        {/* Logo */}
        <div className="px-5 py-5 border-b border-slate-200 dark:border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-base">
              Q
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-white leading-tight">QuincaPro</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Gestion quincaillerie</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-3">
          {navItems.map((section) => (
            <div key={section.label} className="mb-4">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-2 mb-1">
                {section.label}
              </p>
              {section.links.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm mb-0.5 transition-all duration-150 ${
                      isActive
                        ? 'bg-blue-600/15 text-blue-400 font-medium'
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#1e2d42] hover:text-slate-800 dark:hover:text-white'
                    }`
                  }
                >
                  <item.icon size={15} className="flex-shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge > 0 && (
                    <span className="bg-red-500/20 text-red-400 text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* User */}
        <div className="px-4 py-3 border-t border-slate-200 dark:border-white/5">
          <div className="flex items-center gap-2.5">

            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {getInitiales()}
            </div>

            {/* Infos */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 dark:text-white leading-tight truncate">
                {getNomComplet()}
              </p>
              <p className="text-[11px] text-slate-400 truncate">
                {getRole()}
              </p>
            </div>

            {/* Bouton déconnexion */}
            <button
              onClick={handleLogout}
              title="Se déconnecter"
              className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-[#1e2d42] flex items-center justify-center text-slate-400 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all flex-shrink-0"
            >
              <LogOut size={13} />
            </button>

          </div>
        </div>

      </aside>
    </>
  )
}