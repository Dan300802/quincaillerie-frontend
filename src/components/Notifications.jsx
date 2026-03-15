import { useState, useRef, useEffect } from 'react'
import { Bell, X, CheckCheck, AlertTriangle, Info, CheckCircle, AlertCircle } from 'lucide-react'
import { useNotifications } from '../context/NotificationsContext'

const icones = {
  danger: { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
  warning: { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  info: { icon: Info, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  success: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
}

export default function Notifications() {
  const [open, setOpen] = useState(false)
  const { notifications, nonLus, marquerLu, marquerTousLus } = useNotifications()
  const ref = useRef(null)

  // Fermer en cliquant dehors
  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div className="relative" ref={ref}>

      {/* Bouton cloche */}
      <button
        onClick={() => setOpen(!open)}
        className="relative w-8 h-8 bg-slate-100 dark:bg-[#1e2d42] border border-slate-200 dark:border-white/5 rounded-lg flex items-center justify-center cursor-pointer hover:border-slate-300 dark:hover:border-white/10 transition-all"
      >
        <Bell size={14} className="text-slate-400" />
        {nonLus > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-white dark:border-[#0f1c2e]">
            {nonLus > 9 ? '9+' : nonLus}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-10 w-80 bg-white dark:bg-[#162032] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-white/5">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-800 dark:text-white">Notifications</span>
              {nonLus > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {nonLus}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {nonLus > 0 && (
                <button
                  onClick={marquerTousLus}
                  className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600 font-medium"
                >
                  <CheckCheck size={12} /> Tout lire
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Liste */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center py-10">
                <Bell size={24} className="text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-400">Aucune notification</p>
              </div>
            ) : (
              notifications.map(n => {
                const style = icones[n.type] || icones.info
                const Icon = style.icon
                return (
                  <div
                    key={n.id}
                    onClick={() => marquerLu(n.id)}
                    className={`flex items-start gap-3 px-4 py-3 border-b border-slate-100 dark:border-white/5 last:border-0 cursor-pointer transition-colors ${
                      n.lu
                        ? 'opacity-60 hover:bg-slate-50 dark:hover:bg-white/[0.02]'
                        : 'bg-blue-50/50 dark:bg-blue-500/5 hover:bg-blue-50 dark:hover:bg-blue-500/10'
                    }`}
                  >
                    <div className={`w-8 h-8 ${style.bg} rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      <Icon size={14} className={style.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-slate-800 dark:text-white">{n.titre}</p>
                        {!n.lu && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{n.message}</p>
                      <p className="text-[10px] text-slate-400 mt-1">{n.temps}</p>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-[#1e2d42]">
            <p className="text-xs text-slate-400 text-center">
              Mis à jour automatiquement toutes les 60s
            </p>
          </div>

        </div>
      )}
    </div>
  )
}