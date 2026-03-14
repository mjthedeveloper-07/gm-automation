import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import CreatePost from './pages/CreatePost'
import CarouselBuilder from './pages/CarouselBuilder'
import Analytics from './pages/Analytics'
import Queue from './pages/Queue'
import Trends from './pages/Trends'
import Settings from './pages/Settings'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/create" element={<CreatePost />} />
        <Route path="/carousel" element={<CarouselBuilder />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/queue" element={<Queue />} />
        <Route path="/trends" element={<Trends />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Layout>
  )
}
