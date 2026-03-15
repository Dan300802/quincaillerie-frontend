import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'

const NotificationsContext = createContext()

export function NotificationsProvider({ children }) {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)

  const chargerNotifications = async () => {
    try {
      setLoading(true)
      const res = await api.get('/statistiques')
      const data = res.data
      const notifs = []

      // ─── Ruptures de stock
      if (data.alertesStock) {
        data.alertesStock.forEach(p => {
          if (p.stock === 0) {
            notifs.push({
              id: `rupture-${p.id}`,
              type: 'danger',
              titre: 'Rupture de stock',
              message: `${p.nom} est en rupture de stock`,
              temps: 'Maintenant',
              lu: false,
            })
          } else if (p.stock <= p.seuil) {
            notifs.push({
              id: `faible-${p.id}`,
              type: 'warning',
              titre: 'Stock faible',
              message: `${p.nom} — ${p.stock} unités restantes`,
              temps: 'Maintenant',
              lu: false,
            })
          }
        })
      }

      // ─── Commandes en attente
      if (data.commandesEnAttente > 0) {
        notifs.push({
          id: 'commandes-attente',
          type: 'info',
          titre: 'Commandes en attente',
          message: `${data.commandesEnAttente} commande(s) à traiter`,
          temps: 'Maintenant',
          lu: false,
        })
      }

      // ─── Ventes du jour
      if (data.ventesJour > 0) {
        notifs.push({
          id: 'ventes-jour',
          type: 'success',
          titre: 'Ventes du jour',
          message: `${data.ventesJour} vente(s) — ${data.chiffreAffaires.toLocaleString()} FCFA`,
          temps: "Aujourd'hui",
          lu: false,
        })
      }

      // ─── Récupérer les IDs déjà lus depuis localStorage
      const lus = JSON.parse(localStorage.getItem('notifs_lus') || '[]')
      setNotifications(notifs.map(n => ({
        ...n,
        lu: lus.includes(n.id)
      })))

    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    chargerNotifications()
    // Rafraîchir toutes les 60 secondes
    const interval = setInterval(chargerNotifications, 60000)
    return () => clearInterval(interval)
  }, [])

  const marquerLu = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, lu: true } : n))
    const lus = JSON.parse(localStorage.getItem('notifs_lus') || '[]')
    localStorage.setItem('notifs_lus', JSON.stringify([...new Set([...lus, id])]))
  }

  const marquerTousLus = () => {
    const ids = notifications.map(n => n.id)
    setNotifications(prev => prev.map(n => ({ ...n, lu: true })))
    localStorage.setItem('notifs_lus', JSON.stringify(ids))
  }

  const nonLus = notifications.filter(n => !n.lu).length

  return (
    <NotificationsContext.Provider value={{
      notifications,
      nonLus,
      loading,
      marquerLu,
      marquerTousLus,
      rafraichir: chargerNotifications,
    }}>
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotifications() {
  return useContext(NotificationsContext)
}