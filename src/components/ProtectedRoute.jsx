import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { utilisateur, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-[#0f1c2e] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl mx-auto mb-4 animate-pulse">
            Q
          </div>
          <p className="text-sm text-slate-400">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!utilisateur) {
    return <Navigate to="/login" replace />
  }

  return children
}