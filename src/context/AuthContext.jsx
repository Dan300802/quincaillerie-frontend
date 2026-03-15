import { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../api/services.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [utilisateur, setUtilisateur] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userStored = localStorage.getItem('utilisateur')
    if (token && userStored) {
      setUtilisateur(JSON.parse(userStored))
    }
    setLoading(false)
  }, [])

  const login = async (email, motDePasse) => {
    const res = await authService.login(email, motDePasse)
    localStorage.setItem('token', res.data.token)
    localStorage.setItem('utilisateur', JSON.stringify(res.data.utilisateur))
    setUtilisateur(res.data.utilisateur)
    return res.data
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('utilisateur')
    setUtilisateur(null)
  }

  return (
    <AuthContext.Provider value={{ utilisateur, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}