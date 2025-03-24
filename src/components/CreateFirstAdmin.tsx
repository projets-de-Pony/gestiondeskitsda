import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, collection, getDocs, query, limit } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';

interface CreateFirstAdminProps {
  onClose: () => void;
}

const SUPER_ADMIN_CODE = 'SITEDA2025SUPER';

const CreateFirstAdmin: React.FC<CreateFirstAdminProps> = ({ onClose }) => {
  const [superAdminCode, setSuperAdminCode] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'code' | 'form'>('code');
  const navigate = useNavigate();

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (superAdminCode !== SUPER_ADMIN_CODE) {
      setError('Code super admin incorrect');
      return;
    }
    setStep('form');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password || !confirmPassword) {
      setError('Tous les champs sont requis');
      return;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    try {
      setIsLoading(true);

      // Vérifier s'il existe déjà un admin
      const adminSnapshot = await getDocs(query(collection(db, 'admins'), limit(1)));
      if (!adminSnapshot.empty) {
        setError('Un administrateur existe déjà');
        return;
      }

      // Créer l'utilisateur
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Mettre à jour le profil
      await updateProfile(user, {
        displayName: name
      });

      // Créer le document admin dans Firestore
      await setDoc(doc(db, 'admins', user.uid), {
        email: email,
        name: name,
        createdAt: new Date(),
        isSuperAdmin: true,
      });

      // Logger la création
      await setDoc(doc(collection(db, 'admin_logs')), {
        action: 'CREATE_FIRST_ADMIN',
        adminId: user.uid,
        timestamp: new Date(),
        details: {
          email: email,
          name: name,
        },
      });

      // Stocker localement le statut admin
      localStorage.setItem('isAdmin', 'true');
      
      onClose();
      navigate('/admin/dashboard');
    } catch (error: any) {
      console.error('Erreur:', error);
      setError(
        error.code === 'auth/email-already-in-use'
          ? 'Cette adresse email est déjà utilisée'
          : 'Une erreur est survenue lors de la création du compte'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-center mb-2">
        {step === 'code' ? 'Code Super Admin' : 'Créer le Premier Admin'}
      </h2>
      <p className="text-gray-600 text-center mb-8">
        {step === 'code'
          ? 'Entrez le code super administrateur'
          : 'Remplissez les informations pour créer le compte'}
      </p>

      {step === 'code' ? (
        <form onSubmit={handleCodeSubmit} className="space-y-6">
          <div>
            <input
              type="password"
              value={superAdminCode}
              onChange={(e) => setSuperAdminCode(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              placeholder="Code super admin"
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
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-all focus:ring-2 focus:ring-blue-100"
          >
            Continuer
          </button>
        </form>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              placeholder="Nom complet"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              placeholder="Adresse email"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              placeholder="Mot de passe"
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              placeholder="Confirmer le mot de passe"
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

          <div className="space-y-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-all focus:ring-2 focus:ring-blue-100 disabled:opacity-50 disabled:cursor-not-allowed relative"
            >
              <span className={`transition-all ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
                Créer le compte
              </span>
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                </div>
              )}
            </button>

            <button
              type="button"
              onClick={() => setStep('code')}
              className="w-full text-blue-600 hover:text-blue-700"
            >
              Retour
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default CreateFirstAdmin; 
//
