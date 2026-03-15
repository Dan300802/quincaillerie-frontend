import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { NotificationsProvider } from './context/NotificationsContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/layout/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Caisse from './pages/Caisse'
import Inventaire from './pages/Inventaire'
import Clients from './pages/Clients'
import Fournisseurs from './pages/Fournisseurs'
import Commandes from './pages/Commandes'
import Statistiques from './pages/Statistiques'
import Parametres from './pages/Parametres'
import Ventes from './pages/Ventes'
import useTheme from './hooks/useTheme'

function App() {
  const { dark, toggle } = useTheme()

  return (
    <AuthProvider>
      <NotificationsProvider>
        <BrowserRouter>
          <Routes>

            {/* Page login — publique */}
            <Route path="/login" element={<Login />} />

            {/* Pages protégées */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout dark={dark} toggle={toggle} />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="inventaire" element={<Inventaire />} />
              <Route path="caisse" element={<Caisse />} />
              <Route path="ventes" element={<Ventes />} />
              <Route path="commandes" element={<Commandes />} />
              <Route path="clients" element={<Clients />} />
              <Route path="fournisseurs" element={<Fournisseurs />} />
              <Route path="statistiques" element={<Statistiques />} />
              <Route path="parametres" element={<Parametres dark={dark} toggle={toggle} />} />
            </Route>

          </Routes>
        </BrowserRouter>
      </NotificationsProvider>
    </AuthProvider>
  )
}

export default App