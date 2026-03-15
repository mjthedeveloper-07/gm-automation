import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import CreatePost from './pages/CreatePost'
import CarouselBuilder from './pages/CarouselBuilder'
import Analytics from './pages/Analytics'
import Queue from './pages/Queue'
import Trends from './pages/Trends'
import Settings from './pages/Settings'
import Admin from './pages/Admin'

export default function App() {
  return (
    <Routes>
      {/* Public route */}
      <Route path="/login" element={<Login />} />

      {/* All protected routes wrapped in Layout */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/create" element={<CreatePost />} />
                <Route path="/carousel" element={<CarouselBuilder />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/queue" element={<Queue />} />
                <Route path="/trends" element={<Trends />} />
                <Route path="/settings" element={<Settings />} />
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <Admin />
                    </AdminRoute>
                  }
                />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}
