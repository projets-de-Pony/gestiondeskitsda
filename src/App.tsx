import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import AdminNavbar from './components/AdminNavbar';
import Navbar from './components/Navbar';
import AdminDashboard from './pages/AdminDashboard';
import ProductManager from './pages/admin/ProductManager';
import CategoryManager from './pages/admin/CategoryManager';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Formations from './pages/Formations';
import Services from './pages/Services';
import About from './pages/About';
import Contact from './pages/Contact';
import Blog from './pages/Blog';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import ConferenceRegistration from './components/ConferenceRegistration';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import Footer from './components/Footer';
import ClientListPage from './pages/starlink/ClientListPage';
import ClientDetailsPage from './pages/starlink/ClientDetailsPage';
import ClientsByBillingPage from './pages/starlink/ClientsByBillingPage';

function App() {
  console.log('App component - Début du rendu');
  const { loading, user } = useAuth();

  useEffect(() => {
    console.log('App - useEffect - État de l\'authentification:', { loading, isAuthenticated: !!user });
  }, [loading, user]);

  if (loading) {
    console.log('App - Affichage du loader');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  console.log('App - Après le loader, préparation du rendu principal');

  return (
    <Router>
      <div className="min-h-screen bg-white text-gray-900">
        <Routes>
          {/* Routes d'administration protégées */} 
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute>
                <div className="min-h-screen">
                  <AdminNavbar />
                  <div className="pt-16 bg-gray-50">
                    <Routes>
                      <Route path="dashboard" element={<AdminDashboard />} />
                      <Route path="products" element={<ProductManager />} />
                      <Route path="categories" element={<CategoryManager />} />
                      <Route path="starlink" element={<ClientListPage userId={user?.uid || ''} />} />
                      <Route path="starlink/by-billing" element={<ClientsByBillingPage userId={user?.uid || ''} />} />
                      <Route path="starlink/:clientId" element={<ClientDetailsPage userId={user?.uid || ''} />} />
                      <Route index element={<Navigate to="dashboard" replace />} />
                    </Routes>
                  </div>
                </div>
              </ProtectedRoute>
            }
          />

          {/* Routes publiques */}
          <Route
            path="/*"
            element={
              <>
                {console.log('App - Rendu des routes publiques')}
                <Navbar />
                <main className="min-h-screen">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/formations" element={<Formations />} />
                    <Route path="/services" element={<Services />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/blog" element={<Blog />} />
                    <Route path="/shop" element={<Shop />} />
                    <Route path="/shop/products/:id" element={<ProductDetail />} />
                    <Route path="/conference-registration" element={<ConferenceRegistration />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/order-confirmation" element={<OrderConfirmation />} />
                  </Routes>
                </main>
                <Footer />
              </>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 