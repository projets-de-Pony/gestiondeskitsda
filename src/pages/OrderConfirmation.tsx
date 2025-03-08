import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, ChevronLeft } from 'lucide-react';

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderNumber, email } = location.state || {};

  // Rediriger si pas de numéro de commande
  if (!orderNumber) {
    navigate('/shop');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/shop')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8"
        >
          <ChevronLeft className="w-5 h-5" />
          Retour à la boutique
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="flex justify-center mb-6">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
            
            <h1 className="text-2xl font-bold mb-4">
              Merci pour votre commande !
            </h1>
            
            <p className="text-gray-600 mb-6">
              Votre commande a été enregistrée avec succès. Vous recevrez bientôt un email de confirmation à l'adresse {email}.
            </p>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 mb-2">Numéro de commande</p>
              <p className="text-lg font-medium">{orderNumber}</p>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => navigate('/shop')}
                className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-colors"
              >
                Continuer mes achats
              </button>
              
              <button
                onClick={() => {/* TODO: Implémenter le suivi de commande */}}
                className="w-full bg-white text-blue-600 py-3 rounded-xl border-2 border-blue-600 hover:bg-blue-50 transition-colors"
              >
                Suivre ma commande
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderConfirmation; 