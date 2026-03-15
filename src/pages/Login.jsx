import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Login() {
  const [email, setEmail] = useState('')
  const [motDePasse, setMotDePasse] = useState('')
  const [erreur, setErreur] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErreur('')
    setLoading(true)
    try {
      await login(email, motDePasse)
      navigate('/')
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#0f1c2e] flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
            Q
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">QuincaPro</h1>
          <p className="text-sm text-slate-400 mt-1">Connectez-vous à votre espace</p>
        </div>

        {/* Formulaire */}
        <div className="bg-white dark:bg-[#162032] border border-slate-200 dark:border-white/5 rounded-2xl p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                Adresse email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@quincapro.tg"
                required
                className="w-full bg-slate-50 dark:bg-[#1e2d42] border border-slate-200 dark:border-white/5 rounded-lg px-3 py-2.5 text-sm text-slate-800 dark:text-white placeholder-slate-400 outline-none focus:border-blue-400 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                Mot de passe
              </label>
              <input
                type="password"
                value={motDePasse}
                onChange={e => setMotDePasse(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-slate-50 dark:bg-[#1e2d42] border border-slate-200 dark:border-white/5 rounded-lg px-3 py-2.5 text-sm text-slate-800 dark:text-white placeholder-slate-400 outline-none focus:border-blue-400 transition-colors"
              />
            </div>

            {erreur && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                <p className="text-xs text-red-400 font-medium">⚠️ {erreur}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl text-sm font-bold transition-all ${
                loading
                  ? 'bg-blue-400 cursor-not-allowed text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20'
              }`}
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>

          </form>

          {/* Info compte par défaut */}
          <div className="mt-5 p-3 bg-slate-50 dark:bg-[#1e2d42] rounded-xl">
            <p className="text-[11px] text-slate-400 text-center">
              Compte admin par défaut
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-300 text-center mt-1">
              <span className="font-medium">Email :</span> admin@quincapro.tg
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-300 text-center">
              <span className="font-medium">Mot de passe :</span> password
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}