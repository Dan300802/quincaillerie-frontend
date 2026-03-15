import { Search, Calendar, Sun, Moon, Menu } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import Notifications from '../Notifications'

const pageTitles = {
  '/': 'Tableau de bord',
  '/inventaire': 'Inventaire & Stock',
  '/caisse': 'Point de vente',
  '/ventes': 'Historique des ventes',
  '/commandes': 'Commandes',
  '/clients': 'Clients',
  '/fournisseurs': 'Fournisseurs',
  '/statistiques': 'Statistiques',
  '/parametres': 'Paramètres',
}

export default function Topbar({ dark, toggle, onMenuClick }) {
  const location = useLocation()
  const title = pageTitles[location.pathname] || 'QuincaPro'

  const today = new Date().toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric'
  })

  return (
    <header className="sticky top-0 z-20 h-14 bg-white/95 dark:bg-[#0f1c2e]/95 backdrop-blur border-b border-slate-200 dark:border-white/5 flex items-center justify-between px-4 md:px-6">

      {/* Gauche */}
      <div className="flex items-center gap-3">

        {/* Bouton menu burger — mobile uniquement */}
        <button
          onClick={onMenuClick}
          className="lg:hidden w-8 h-8 bg-slate-100 dark:bg-[#1e2d42] border border-slate-200 dark:border-white/5 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-400"
        >
          <Menu size={16} />
        </button>

        {/* Titre page */}
        <div className="flex items-center gap-2">
          <span className="hidden sm:block text-xs text-slate-400">QuincaPro</span>
          <span className="hidden sm:block text-slate-300 dark:text-slate-600">/</span>
          <span className="text-sm font-semibold text-slate-800 dark:text-white">{title}</span>
        </div>

      </div>

      {/* Droite */}
      <div className="flex items-center gap-2 md:gap-3">

        {/* Date — cachée sur mobile */}
        <div className="hidden md:flex items-center gap-2 bg-slate-100 dark:bg-[#1e2d42] border border-slate-200 dark:border-white/5 rounded-lg px-3 py-1.5">
          <Calendar size={13} className="text-slate-400" />
          <span className="text-xs text-slate-500 dark:text-slate-400">{today}</span>
        </div>

        {/* Recherche — cachée sur mobile */}
        <div className="hidden sm:flex items-center gap-2 bg-slate-100 dark:bg-[#1e2d42] border border-slate-200 dark:border-white/5 rounded-lg px-3 py-1.5 min-w-44 cursor-pointer">
          <Search size={13} className="text-slate-400" />
          <span className="text-xs text-slate-400">Rechercher...</span>
        </div>

        {/* Toggle dark/light */}
        <button
          onClick={toggle}
          className="w-8 h-8 bg-slate-100 dark:bg-[#1e2d42] border border-slate-200 dark:border-white/5 rounded-lg flex items-center justify-center cursor-pointer hover:border-slate-300 dark:hover:border-white/10 transition-all"
        >
          {dark
            ? <Sun size={14} className="text-amber-400" />
            : <Moon size={14} className="text-slate-500" />
          }
        </button>

        {/* Notifications */}
        <Notifications />

      </div>
    </header>
  )
}