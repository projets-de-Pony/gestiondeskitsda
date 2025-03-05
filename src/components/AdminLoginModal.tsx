import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ADMIN_CODE = 'SITEDA2025';

const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ isOpen, onClose }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simuler un délai pour l'effet de chargement
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (code === ADMIN_CODE) {
      localStorage.setItem('isAdmin', 'true');
      onClose();
      navigate('/admin/dashboard');
    } else {
      setError('Code incorrect');
    }
    setIsLoading(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative h-32 bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center justify-center">
              <div className="absolute top-4 right-4">
                <button
                  onClick={onClose}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <Lock className="w-16 h-16 text-white" />
            </div>

            {/* Form */}
            <div className="p-8">
              <h2 className="text-2xl font-bold text-center mb-2">Accès Admin</h2>
              <p className="text-gray-600 text-center mb-8">
                Entrez le code d'accès administrateur
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <input
                    type="password"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-center text-2xl tracking-wider font-mono"
                    placeholder="••••••••••"
                    maxLength={10}
                    autoFocus
                  />
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
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-all focus:ring-2 focus:ring-blue-100 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                >
                  <span className={`transition-all ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
                    Connexion
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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AdminLoginModal; 