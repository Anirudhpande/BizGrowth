import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Ecosystem from './pages/Ecosystem'
import Resources from './pages/Resources'
import ResourceDetail from './pages/ResourceDetail'
import ResourceForm from './pages/ResourceForm'
import Login from './pages/Login'
import Register from './pages/Register'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import Profile from './pages/Profile'
import MyOrganizations from './pages/MyOrganizations'
import OrganizationDetail from './pages/OrganizationDetail'
import OrganizationForm from './pages/OrganizationForm'
import AdminDashboard from './pages/AdminDashboard'
import Dashboard from './pages/Dashboard'
import Marketplace from './pages/Marketplace'
import ListingDetail from './pages/ListingDetail'
import ListingForm from './pages/ListingForm'
import Events from './pages/Events'
import EventDetail from './pages/EventDetail'
import EventForm from './pages/EventForm'
import ConsultantDiscovery from './pages/ConsultantDiscovery'
import ConsultantProfileDetail from './pages/ConsultantProfileDetail'
import ConsultantSetup from './pages/ConsultantSetup'
import Messages from './pages/Messages'
import GlobalToIndia from './pages/GlobalToIndia'
import GlobalToIndiaDetail from './pages/GlobalToIndiaDetail'
import GlobalTradeForm from './pages/GlobalTradeForm'
import IndiaToGlobal from './pages/IndiaToGlobal'
import IndiaToGlobalDetail from './pages/IndiaToGlobalDetail'
import IndiaTradeForm from './pages/IndiaTradeForm'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import ProductForm from './pages/ProductForm'
import NotFound from './pages/NotFound'
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
          <Route path="/resources/:id" element={<ResourceDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/marketplace/:id" element={<ListingDetail />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/consultants" element={<ConsultantDiscovery />} />
          <Route path="/consultants/:id" element={<ConsultantProfileDetail />} />
          
          <Route path="/global-to-india" element={<GlobalToIndia />} />
          <Route path="/global-to-india/:id" element={<GlobalToIndiaDetail />} />
          <Route path="/india-to-global" element={<IndiaToGlobal />} />
          <Route path="/india-to-global/:id" element={<IndiaToGlobalDetail />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />

          {/* Protected Routes Infrastructure */}
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/organizations" element={<MyOrganizations />} />
            <Route path="/organizations/new" element={<OrganizationForm />} />
            <Route path="/organizations/:id" element={<OrganizationDetail />} />
            <Route path="/organizations/:id/edit" element={<OrganizationForm />} />
            
            <Route path="/marketplace/new" element={<ListingForm />} />
            <Route path="/marketplace/:id/edit" element={<ListingForm />} />
            <Route path="/events/new" element={<EventForm />} />
            <Route path="/events/:id/edit" element={<EventForm />} />
            <Route path="/resources/new" element={<ResourceForm />} />
            <Route path="/resources/:id/edit" element={<ResourceForm />} />
            <Route path="/consultants/setup" element={<ConsultantSetup />} />
            <Route path="/messages" element={<Messages />} />
            
            <Route path="/global-to-india/new" element={<GlobalTradeForm />} />
            <Route path="/global-to-india/:id/edit" element={<GlobalTradeForm />} />
            <Route path="/india-to-global/new" element={<IndiaTradeForm />} />
            <Route path="/india-to-global/:id/edit" element={<IndiaTradeForm />} />
            <Route path="/products/new" element={<ProductForm />} />
            <Route path="/products/:id/edit" element={<ProductForm />} />
          </Route>

          {/* Admin Routes Infrastructure */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          {/* Catch-all Wildcard Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {/* Hide footer on Login/Register routes to match the Stitch design specs */}
      {!isAuthRoute && <Footer />}
    </div>
  )
}
