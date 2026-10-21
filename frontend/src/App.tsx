import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthProvider'
import { useAuth } from './auth/AuthContext'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import './App.css'

function BootScreen() {
  return (
    <div className="boot-screen" role="status" aria-label="Loading CallWave">
      <div className="boot-brand">
        <span className="boot-brand__icon">
          <img src="/logo.png" alt="" width="38" height="38" />
        </span>
        <span>CallWave</span>
      </div>
      <span className="boot-spinner" aria-hidden="true" />
      <p>Getting things ready…</p>
    </div>
  )
}

function AppRoutes() {
  const { user, ready } = useAuth()

  if (!ready) {
    return <BootScreen />
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={user ? <Navigate to="/" replace /> : <RegisterPage />}
      />
      <Route
        path="/"
        element={user ? <HomePage /> : <Navigate to="/login" replace />}
      />
      <Route path="*" element={<Navigate to={user ? '/' : '/login'} replace />} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
