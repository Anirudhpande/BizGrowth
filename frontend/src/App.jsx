import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Ecosystem from './pages/Ecosystem'
import Resources from './pages/Resources'
import Login from './pages/Login'
import Register from './pages/Register'
import './App.css'

export default function App() {
  const location = useLocation()
  const isAuthRoute = location.pathname === '/login' || location.pathname === '/register'

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-background font-body-md antialiased overflow-x-hidden">
      {/* Hide navbar on Login/Register routes to match the Stitch design specs */}
      {!isAuthRoute && <Navbar />}
      
      <main className={`${!isAuthRoute ? 'pt-20' : ''} flex-grow`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/ecosystem" element={<Ecosystem />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>

      {/* Hide footer on Login/Register routes to match the Stitch design specs */}
      {!isAuthRoute && <Footer />}
    </div>
  )
}
