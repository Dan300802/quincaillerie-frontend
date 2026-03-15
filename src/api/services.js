import api from './axios.js'

// ─── Auth
export const authService = {
  login: (email, motDePasse) =>
    api.post('/auth/login', { email, motDePasse }),
  me: () =>
    api.get('/auth/me'),
}

// ─── Produits
export const produitService = {
  getAll: () => api.get('/produits'),
  getOne: (id) => api.get(`/produits/${id}`),
  create: (data) => api.post('/produits', data),
  update: (id, data) => api.put(`/produits/${id}`, data),
  delete: (id) => api.delete(`/produits/${id}`),
}

// ─── Clients
export const clientService = {
  getAll: () => api.get('/clients'),
  getOne: (id) => api.get(`/clients/${id}`),
  create: (data) => api.post('/clients', data),
  update: (id, data) => api.put(`/clients/${id}`, data),
  delete: (id) => api.delete(`/clients/${id}`),
}

// ─── Fournisseurs
export const fournisseurService = {
  getAll: () => api.get('/fournisseurs'),
  create: (data) => api.post('/fournisseurs', data),
  update: (id, data) => api.put(`/fournisseurs/${id}`, data),
  delete: (id) => api.delete(`/fournisseurs/${id}`),
}

// ─── Ventes
export const venteService = {
  getAll: () => api.get('/ventes'),
  create: (data) => api.post('/ventes', data),
}

// ─── Commandes
export const commandeService = {
  getAll: () => api.get('/commandes'),
  create: (data) => api.post('/commandes', data),
  updateStatut: (id, statut) => api.put(`/commandes/${id}/statut`, { statut }),
}

// ─── Statistiques
export const statistiqueService = {
  get: () => api.get('/statistiques'),
}

// ─── Utilisateurs
export const utilisateurService = {
  getAll: () => api.get('/utilisateurs'),
  create: (data) => api.post('/utilisateurs', data),
  update: (id, data) => api.put(`/utilisateurs/${id}`, data),
  delete: (id) => api.delete(`/utilisateurs/${id}`),
}