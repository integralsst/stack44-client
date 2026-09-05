import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from '../features/auth/context/AuthContext.tsx'
import GlobalSelectDropdown from '../components/ui/GlobalSelectDropdown.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
      <GlobalSelectDropdown />
    </AuthProvider>
  </React.StrictMode>,
)
