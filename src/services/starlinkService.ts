import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { StarlinkClient, StarlinkClientFormData, Currency } from '../types/starlink';

const COLLECTION_NAME = 'starlink_clients';

export const starlinkService = {
  // Créer un nouveau client
  async createClient(data: StarlinkClientFormData, userId: string): Promise<StarlinkClient> {
    try {
      console.log('Création d\'un nouveau client avec les données:', { ...data, userId });
      
      // Préparer les données avec les champs requis par Firestore
      const clientData = {
        ...data,
        activationDate: Timestamp.fromDate(new Date(data.activationDate)),
        billingDate: Timestamp.fromDate(new Date(data.billingDate)),
        history: [{
          timestamp: Timestamp.now(),
          action: 'CREATE',
          performedBy: userId,
          details: 'Création du client'
        }],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: userId,
        updatedBy: userId
      };

      // Ajouter le document à Firestore
      const docRef = await addDoc(collection(db, COLLECTION_NAME), clientData);
      
      console.log('Client créé avec succès, ID:', docRef.id);
      
      return {
        id: docRef.id,
        ...clientData,
        activationDate: new Date(data.activationDate),
        billingDate: new Date(data.billingDate)
      } as StarlinkClient;
    } catch (error) {
      console.error('Erreur lors de la création du client:', error);
      throw error;
    }
  },

  // Mettre à jour un client
  async updateClient(
    clientId: string, 
    data: Partial<StarlinkClientFormData>, 
    userId: string
  ): Promise<void> {
    try {
      console.log('Mise à jour du client:', { clientId, data, userId });
      
      // Récupérer le document existant
      const clientDoc = await getDoc(doc(db, COLLECTION_NAME, clientId));
      if (!clientDoc.exists()) {
        throw new Error('Client non trouvé');
      }

      const existingData = clientDoc.data();

      // Préparer les données de mise à jour
      const updateData = {
        ...data,
        activationDate: data.activationDate ? Timestamp.fromDate(new Date(data.activationDate)) : existingData.activationDate,
        billingDate: data.billingDate ? Timestamp.fromDate(new Date(data.billingDate)) : existingData.billingDate,
        history: [
          ...existingData.history,
          {
            timestamp: Timestamp.now(),
            action: 'UPDATE',
            performedBy: userId,
            details: 'Mise à jour des informations du client'
          }
        ],
        updatedAt: Timestamp.now(),
        updatedBy: userId
      };

      // Mettre à jour le document
      await updateDoc(doc(db, COLLECTION_NAME, clientId), updateData);
      console.log('Client mis à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du client:', error);
      throw error;
    }
  },

  // Récupérer un client par ID
  async getClient(clientId: string): Promise<StarlinkClient> {
    try {
      const docRef = doc(db, COLLECTION_NAME, clientId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('Client non trouvé');
      }

      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        activationDate: data.activationDate.toDate(),
        billingDate: data.billingDate.toDate(),
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
        history: data.history.map((entry: any) => ({
          ...entry,
          timestamp: entry.timestamp.toDate()
        }))
      } as StarlinkClient;
    } catch (error) {
      console.error('Erreur lors de la récupération du client:', error);
      throw error;
    }
  },

  // Récupérer tous les clients avec filtres optionnels
  async getClients(filters?: {
    kitStatus?: string;
    paymentStatus?: string;
    searchTerm?: string;
  }): Promise<StarlinkClient[]> {
    try {
      console.log('StarlinkService - Début de getClients avec les filtres:', filters);
      
      // Vérifier la connexion à Firestore
      if (!db) {
        console.error('StarlinkService - Erreur: db non initialisée');
        throw new Error('Base de données non initialisée');
      }

      let q = collection(db, COLLECTION_NAME);
      console.log('StarlinkService - Collection référencée:', COLLECTION_NAME);
      
      // Construction de la requête avec les filtres
      if (filters) {
        console.log('StarlinkService - Application des filtres');
        if (filters.kitStatus) {
          q = query(q, where('kitStatus', '==', filters.kitStatus));
          console.log('StarlinkService - Filtre kitStatus appliqué:', filters.kitStatus);
        }
        if (filters.paymentStatus) {
          q = query(q, where('paymentStatus', '==', filters.paymentStatus));
          console.log('StarlinkService - Filtre paymentStatus appliqué:', filters.paymentStatus);
        }
        if (filters.searchTerm) {
          q = query(
            q, 
            where('clientName', '>=', filters.searchTerm),
            where('clientName', '<=', filters.searchTerm + '\uf8ff')
          );
          console.log('StarlinkService - Filtre de recherche appliqué:', filters.searchTerm);
        }
      }

      // Tri par date de création
      q = query(q, orderBy('createdAt', 'desc'));
      console.log('StarlinkService - Tri par date de création appliqué');

      console.log('StarlinkService - Exécution de la requête Firestore...');
      const querySnapshot = await getDocs(q);
      console.log('StarlinkService - Nombre de documents trouvés:', querySnapshot.size);
      
      if (querySnapshot.empty) {
        console.log('StarlinkService - Aucun client trouvé');
        return [];
      }

      const clients = querySnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('StarlinkService - Traitement du document:', doc.id);
        
        try {
          return {
            id: doc.id,
            ...data,
            activationDate: data.activationDate?.toDate() || new Date(),
            billingDate: data.billingDate?.toDate() || new Date(),
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            amount: data.originalAmount?.amount || 72,
            currency: data.originalAmount?.currency || 'EUR',
            history: (data.history || []).map((entry: any) => ({
              ...entry,
              timestamp: entry.timestamp?.toDate() || new Date()
            }))
          };
        } catch (error) {
          console.error('StarlinkService - Erreur lors de la transformation du document:', doc.id, error);
          return null;
        }
      }).filter(client => client !== null) as StarlinkClient[];
      
      console.log('StarlinkService - Clients transformés avec succès:', clients.length);
      return clients;
    } catch (error) {
      console.error('StarlinkService - Erreur lors de la récupération des clients:', error);
      throw new Error('Erreur lors de la récupération des clients: ' + (error instanceof Error ? error.message : 'Erreur inconnue'));
    }
  },

  // Mettre à jour le statut d'un kit
  async updateKitStatus(
    clientId: string, 
    status: StarlinkClient['kitStatus'],
    userId: string,
    reason?: string
  ): Promise<void> {
    try {
      const clientRef = doc(db, COLLECTION_NAME, clientId);
      const clientDoc = await getDoc(clientRef);
      
      if (!clientDoc.exists()) {
        throw new Error('Client non trouvé');
      }

      const currentData = clientDoc.data() as StarlinkClient;
      const newHistoryEntry = {
        timestamp: new Date(),
        action: 'UPDATE_KIT_STATUS',
        performedBy: userId,
        details: `Statut du kit modifié: ${status}${reason ? ` - Raison: ${reason}` : ''}`
      };

      await updateDoc(clientRef, {
        kitStatus: status,
        history: [...currentData.history, newHistoryEntry],
        updatedAt: serverTimestamp(),
        updatedBy: userId
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut du kit:', error);
      throw error;
    }
  },

  // Mettre à jour le statut de paiement
  async updatePaymentStatus(
    clientId: string,
    status: StarlinkClient['paymentStatus'],
    userId: string,
    details?: string
  ): Promise<void> {
    try {
      const clientRef = doc(db, COLLECTION_NAME, clientId);
      const clientDoc = await getDoc(clientRef);
      
      if (!clientDoc.exists()) {
        throw new Error('Client non trouvé');
      }

      const currentData = clientDoc.data() as StarlinkClient;
      const newHistoryEntry = {
        timestamp: new Date(),
        action: 'UPDATE_PAYMENT_STATUS',
        performedBy: userId,
        details: `Statut de paiement modifié: ${status}${details ? ` - ${details}` : ''}`
      };

      await updateDoc(clientRef, {
        paymentStatus: status,
        history: [...currentData.history, newHistoryEntry],
        updatedAt: serverTimestamp(),
        updatedBy: userId
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut de paiement:', error);
      throw error;
    }
  }
};

export function calculateFCFAAmount(amount: number, currency: Currency): number {
  // Règles spécifiques
  if (currency === 'EUR' && amount === 72) {
    return 60000;
  } else if (currency === 'NGN' && amount === 49000) {
    return 30000;
  }

  // Taux de conversion par défaut
  switch (currency) {
    case 'EUR':
      return amount * 655.957;
    case 'NGN':
      return amount * 0.8;
    case 'RWF':
      return amount * 0.6;
    case 'XOF':
      return amount;
    default:
      return amount;
  }
}

// Fonction pour exporter les clients en CSV
export const exportClientsToCSV = async (clients: StarlinkClient[]): Promise<string> => {
  const headers = [
    'ID',
    'Nom du client',
    'Nom du compte',
    'Numéro de kit',
    'Statut du kit',
    'Statut de paiement',
    'Montant original',
    'Devise originale',
    'Montant FCFA',
    'Téléphones',
    'Emails',
    'WhatsApp',
    'Date d\'activation',
    'Date de facturation',
    'Notes'
  ];

  const rows = clients.map(client => [
    client.id,
    client.clientName,
    client.accountName,
    client.kitNumber,
    client.kitStatus,
    client.paymentStatus,
    client.originalAmount.amount,
    client.originalAmount.currency,
    client.billingAmount.amount,
    client.contacts.phones.join('; '),
    client.contacts.emails.join('; '),
    client.contacts.whatsapp || '',
    new Date(client.activationDate).toISOString().split('T')[0],
    new Date(client.billingDate).toISOString().split('T')[0],
    client.notes || ''
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  return csvContent;
};

// Fonction pour importer des clients depuis un CSV
export const importClientsFromCSV = async (csvContent: string, userId: string): Promise<{ success: number; errors: number; }> => {
  const lines = csvContent.split('\n');
  const headers = lines[0].split(',');
  const rows = lines.slice(1);

  let success = 0;
  let errors = 0;

  for (const row of rows) {
    try {
      const values = row.split(',').map(value => value.replace(/^"(.*)"$/, '$1'));
      const clientData = {
        clientName: values[1],
        accountName: values[2],
        kitNumber: values[3],
        kitStatus: values[4] as KitStatus,
        paymentStatus: values[5] as PaymentStatus,
        originalAmount: {
          amount: parseFloat(values[6]),
          currency: values[7] as Currency
        },
        billingAmount: {
          amount: parseFloat(values[8]),
          currency: 'XOF'
        },
        contacts: {
          phones: values[9].split(';').map(phone => phone.trim()),
          emails: values[10].split(';').map(email => email.trim()),
          whatsapp: values[11]
        },
        activationDate: values[12],
        billingDate: values[13],
        notes: values[14]
      };

      await starlinkService.createClient(clientData, userId);
      success++;
    } catch (error) {
      console.error('Erreur lors de l\'import d\'un client:', error);
      errors++;
    }
  }

  return { success, errors };
}; 