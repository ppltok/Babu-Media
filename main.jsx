import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './src/contexts/AuthContext'
import { LanguageProvider, getLocaleFromPath, buildLocalizedPath } from './src/contexts/LanguageContext'

// Pages
import BabuMediaLanding from './index.jsx'
import Login from './src/pages/Login'
import Signup from './src/pages/Signup'
import AddChild from './src/pages/AddChild'
import FusionLab from './src/pages/FusionLab'
import Studio from './src/pages/Studio'
import Settings from './src/pages/Settings'

// Protected Route wrapper
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  const locale = getLocaleFromPath(location.pathname)

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0A16] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to={buildLocalizedPath('/login', locale)} />
  }

  return children
}

// Public Route wrapper (redirect to dashboard if logged in)
function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  const locale = getLocaleFromPath(location.pathname)

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0A16] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (user) {
    return <Navigate to={buildLocalizedPath('/dashboard', locale)} />
  }

  return children
}

// Get basename for GitHub Pages deployment
const basename = import.meta.env.BASE_URL

// Define all app routes (used for both default and /he locale)
function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<BabuMediaLanding />} />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <Signup />
          </PublicRoute>
        }
      />

      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Studio />
          </ProtectedRoute>
        }
      />
      <Route
        path="/studio"
        element={
          <ProtectedRoute>
            <Studio />
          </ProtectedRoute>
        }
      />
      <Route
        path="/add-child"
        element={
          <ProtectedRoute>
            <AddChild />
          </ProtectedRoute>
        }
      />
      <Route
        path="/fusion-lab/:childId"
        element={
          <ProtectedRoute>
            <FusionLab />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />

      {/* Hebrew locale routes - same routes under /he prefix */}
      <Route path="/he" element={<BabuMediaLanding />} />
      <Route
        path="/he/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/he/signup"
        element={
          <PublicRoute>
            <Signup />
          </PublicRoute>
        }
      />
      <Route
        path="/he/dashboard"
        element={
          <ProtectedRoute>
            <Studio />
          </ProtectedRoute>
        }
      />
      <Route
        path="/he/studio"
        element={
          <ProtectedRoute>
            <Studio />
          </ProtectedRoute>
        }
      />
      <Route
        path="/he/add-child"
        element={
          <ProtectedRoute>
            <AddChild />
          </ProtectedRoute>
        }
      />
      <Route
        path="/he/fusion-lab/:childId"
        element={
          <ProtectedRoute>
            <FusionLab />
          </ProtectedRoute>
        }
      />
      <Route
        path="/he/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter basename={basename}>
      <AuthProvider>
        <LanguageProvider>
          <AppRoutes />
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
