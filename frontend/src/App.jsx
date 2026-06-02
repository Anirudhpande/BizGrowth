import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Ecosystem from './pages/Ecosystem'
import Resources from './pages/Resources'
import Login from './pages/Login'
import Register from './pages/Register'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import Profile from './pages/Profile'
import MyOrganizations from './pages/MyOrganizations'
import OrganizationDetail from './pages/OrganizationDetail'
import OrganizationForm from './pages/OrganizationForm'
import AdminDashboard from './pages/AdminDashboard'
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
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/ecosystem" element={<Ecosystem />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes Infrastructure */}
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/organizations" element={<MyOrganizations />} />
            <Route path="/organizations/new" element={<OrganizationForm />} />
            <Route path="/organizations/:id" element={<OrganizationDetail />} />
            <Route path="/organizations/:id/edit" element={<OrganizationForm />} />
          </Route>

          {/* Admin Routes Infrastructure */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>
        </Routes>
      </main>

      {/* Hide footer on Login/Register routes to match the Stitch design specs */}
      {!isAuthRoute && <Footer />}
    </div>
  )
}
