import { useState, useEffect } from 'react';
import { onAuthStateChanged, User, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

interface AuthUser extends User {
  isAdmin?: boolean;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('useAuth - Initialisation du listener d\'authentification');
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('useAuth - Changement d\'état d\'authentification:', { user: user?.email });
      
      if (user) {
        try {
          console.log('useAuth - Vérification des droits admin pour:', user.email);
          const adminDoc = await getDoc(doc(db, 'admins', user.uid));
          const authUser: AuthUser = {
            ...user,
            isAdmin: adminDoc.exists()
          };
          console.log('useAuth - Statut admin:', { isAdmin: adminDoc.exists() });
          setUser(authUser);
        } catch (error) {
          console.error('useAuth - Erreur lors de la vérification admin:', error);
          setUser(null);
        }
      } else {
        console.log('useAuth - Aucun utilisateur connecté');
        setUser(null);
      }
      
      setLoading(false);
      console.log('useAuth - Chargement terminé');
    });

    return () => {
      console.log('useAuth - Nettoyage du listener d\'authentification');
      unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('useAuth - Tentative de connexion pour:', email);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('useAuth - Connexion réussie');
      
      const adminDoc = await getDoc(doc(db, 'admins', userCredential.user.uid));
      console.log('useAuth - Vérification admin après connexion:', { isAdmin: adminDoc.exists() });
      
      return { user: userCredential.user, isAdmin: adminDoc.exists() };
    } catch (error) {
      console.error('useAuth - Erreur de connexion:', error);
      throw error;
    }
  };

  return { user, loading, signIn };
} 