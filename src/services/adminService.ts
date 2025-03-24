import { collection, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

const COLLECTION_NAME = 'admins';

export const adminService = {
  // Vérifier si un utilisateur est admin
  async isAdmin(userId: string): Promise<boolean> {
    try {
      const docRef = doc(db, COLLECTION_NAME, userId);
      const docSnap = await getDoc(docRef);
      return docSnap.exists();
    } catch (error) {
      console.error('Erreur lors de la vérification des droits admin:', error);
      return false;
    }
  },

  // Ajouter un utilisateur comme admin
  async addAdmin(userId: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, userId);
      await setDoc(docRef, {
        createdAt: new Date(),
        role: 'admin'
      });
      console.log('Utilisateur ajouté comme admin avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'admin:', error);
      throw error;
    }
  }
}; 