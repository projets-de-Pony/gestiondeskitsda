import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Initialisation de Firebase
import './lib/firebase';

// Configuration de pdfMake
import { configurePdfMake } from './config/pdfmake';

// Initialiser pdfMake
console.log('main.tsx - Configuration de pdfMake');
const pdfMakeConfigured = configurePdfMake();
if (!pdfMakeConfigured) {
  console.error('main.tsx - Erreur lors de la configuration de pdfMake');
} else {
  console.log('main.tsx - pdfMake configuré avec succès');
}

// Gestionnaire d'erreurs global
const errorHandler = (error: Error) => {
  console.error('Erreur globale:', error);
};

window.addEventListener('error', (event) => {
  console.error('Erreur non gérée:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Promesse rejetée non gérée:', event.reason);
});

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Une erreur est survenue</h1>
            <p className="text-gray-600 mb-4">
              Nous nous excusons pour ce désagrément. Veuillez rafraîchir la page ou contacter le support si le problème persiste.
            </p>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {this.state.error?.message}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Rafraîchir la page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Rendu de l'application
try {
  console.log('main.tsx - Début du rendu de l\'application');
  
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
  
  console.log('main.tsx - Application montée avec succès');
} catch (error) {
  console.error('main.tsx - Erreur lors du montage de l\'application:', error);
  errorHandler(error as Error);
}
