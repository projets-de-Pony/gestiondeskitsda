import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getStorage } from "firebase/storage";

console.log('Starting Firebase initialization...'); // Log début initialisation

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
} as const;

console.log('Firebase config loaded:', { 
  hasApiKey: !!firebaseConfig.apiKey,
  hasAuthDomain: !!firebaseConfig.authDomain,
  hasProjectId: !!firebaseConfig.projectId,
  hasStorageBucket: !!firebaseConfig.storageBucket,
  hasMessagingSenderId: !!firebaseConfig.messagingSenderId,
  hasAppId: !!firebaseConfig.appId,
  hasMeasurementId: !!firebaseConfig.measurementId
}); // Log configuration

// Vérification de la configuration
const validateConfig = (config: typeof firebaseConfig) => {
  console.log('Validating Firebase config...'); // Log validation
  const requiredFields = [
    'apiKey',
    'authDomain',
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId'
  ] as const;

  const missingFields = requiredFields.filter(field => !config[field]);
  if (missingFields.length > 0) {
    console.error('Missing Firebase config fields:', missingFields); // Log champs manquants
    throw new Error(`Configuration Firebase incomplète. Champs manquants: ${missingFields.join(', ')}`);
  }
  console.log('Firebase config validation successful'); // Log validation réussie
};

// Initialize Firebase
console.log('Initializing Firebase app...'); // Log initialisation app
validateConfig(firebaseConfig);
const app = initializeApp(firebaseConfig);
console.log('Firebase app initialized successfully'); // Log app initialisée

console.log('Initializing Firebase services...'); // Log initialisation services
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
console.log('Firebase services initialized successfully'); // Log services initialisés

// Activer la persistance hors ligne
console.log('Enabling offline persistence...'); // Log activation persistance
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('La persistance hors ligne nécessite un seul onglet ouvert à la fois.');
  } else if (err.code === 'unimplemented') {
    console.warn('Le navigateur ne supporte pas la persistance hors ligne.');
  }
});

console.log('Firebase initialization complete'); // Log initialisation terminée

export { app, analytics, auth, db, storage };