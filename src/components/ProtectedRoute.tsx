import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  useEffect(() => {
    console.log('ProtectedRoute - État de la route:', {
      loading,
      isAuthenticated: !!user,
      isAdmin: user?.isAdmin
    });
  }, [loading, user]);

  if (loading) {
    console.log('ProtectedRoute - Affichage du loader');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user?.isAdmin) {
    console.log('ProtectedRoute - Accès non autorisé, redirection vers l\'accueil');
    return <Navigate to="/" replace />;
  }

  console.log('ProtectedRoute - Accès autorisé, affichage du contenu protégé');
  return <>{children}</>;
};

export default ProtectedRoute; 
// 