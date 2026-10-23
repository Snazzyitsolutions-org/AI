import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthProvider'
import { useAuth } from './auth/AuthContext'
import { DashboardPage } from './pages/DashboardPage'
import { CampaignsPage } from './pages/CampaignsPage'
import { ContactsPage } from './pages/ContactsPage'
import { CrmPage } from './pages/CrmPage'
import { InboxPage } from './pages/InboxPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { TemplatesPage } from './pages/TemplatesPage'
import { NotificationsPage } from './pages/NotificationsPage'
import { AiStudioPage } from './pages/AiStudioPage'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { SendersPage } from './pages/SendersPage'
import { AutomationsPage } from './pages/AutomationsPage'
import { WhatsAppBulkingLoader } from './components/common/WhatsAppBulkingLoader'

function BootScreen() {
  return <WhatsAppBulkingLoader variant="fullscreen" size="lg" />
}

function AppRoutes() {
  const { user, ready } = useAuth()

  if (!ready) {
    return <BootScreen />
  }

  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/inbox" element={<InboxPage />} />
      <Route path="/campaigns" element={<CampaignsPage />} />
      <Route path="/templates" element={<TemplatesPage />} />
      <Route path="/contacts" element={<ContactsPage />} />
      <Route path="/crm" element={<CrmPage />} />
      <Route path="/notifications" element={<NotificationsPage />} />
      <Route path="/ai-studio" element={<AiStudioPage />} />
      <Route path="/analytics" element={<AnalyticsPage />} />
      <Route path="/numbers" element={<SendersPage />} />
      <Route path="/automations" element={<AutomationsPage />} />
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={user ? <Navigate to="/" replace /> : <RegisterPage />}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
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
