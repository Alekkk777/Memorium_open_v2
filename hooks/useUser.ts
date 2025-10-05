// hooks/useUser.ts
// Versione semplificata senza autenticazione
export function useUser() {
  return {
    user: { id: 'local-user', email: 'local@memorium.app', role: 'user', name: 'Local User' },
    isLoading: false,
    isAuthenticated: true, // Sempre autenticato nella versione locale
  };
}