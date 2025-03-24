import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';

interface AdminLoginFormProps {
  onClose: () => void;
}

const AdminLoginForm: React.FC<AdminLoginFormProps> = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const navigate = useNavigate();

  // Gérer l'état de la connexion
  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isOnline) {
      setError('Pas de connexion Internet. Veuillez vérifier votre connexion et réessayer.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Vérifier la connexion à Firestore
      try {
        const testDoc = await getDoc(doc(db, 'admins', 'test'));
        console.log('Connexion à Firestore établie');
      } catch (error) {
        if (error instanceof Error && error.message.includes('offline')) {
          throw new Error('Impossible de se connecter à la base de données. Veuillez vérifier votre connexion Internet.');
        }
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Vérifier si l'utilisateur a le document admin dans Firestore
      try {
        const adminDoc = await getDoc(doc(db, 'admins', user.uid));
        if (adminDoc.exists()) {
          localStorage.setItem('isAdmin', 'true');
          onClose();
          navigate('/admin/dashboard');
        } else {
          await auth.signOut();
          setError('Vous n\'avez pas les permissions nécessaires.');
        }
      } catch (error) {
        console.error('Erreur lors de la vérification admin:', error);
        await auth.signOut();
        throw new Error('Impossible de vérifier les permissions. Veuillez réessayer.');
      }
    } catch (error: any) {
      console.error('Erreur de connexion:', error);
      setError(
        error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found'
          ? 'Email ou mot de passe incorrect'
          : error.message || 'Une erreur est survenue lors de la connexion'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-center mb-2">Connexion Admin</h2>
      <p className="text-gray-600 text-center mb-8">
        Connectez-vous à votre compte administrateur
      </p>

      {/* Indicateur de connexion */}
      <div className={`flex items-center justify-center gap-2 mb-4 ${
        isOnline ? 'text-green-600' : 'text-red-600'
      }`}>
        {isOnline ? (
          <>
            <Wifi className="w-5 h-5" />
            <span className="text-sm">Connecté</span>
          </>
        ) : (
          <>
            <WifiOff className="w-5 h-5" />
            <span className="text-sm">Hors ligne</span>
          </>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none"
              placeholder="admin@example.com"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mot de passe
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg"
          >
            <AlertCircle className="w-5 h-5" />
            {error}
          </motion.div>
        )}

        <button
          type="submit"
          disabled={isLoading || !isOnline}
          className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-all focus:ring-2 focus:ring-blue-100 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
        >
          <span className={`transition-all ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
            Se connecter
          </span>
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
          )}
          <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-white/25 to-transparent bottom-0 translate-y-full group-hover:translate-y-0 transition-transform" />
        </button>
      </form>
    </div>
  );
};

export default AdminLoginForm; 