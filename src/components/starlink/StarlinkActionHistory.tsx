import React from 'react';
import { motion } from 'framer-motion';
import { Clock, User, AlertTriangle, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { StarlinkClient } from '../../types/starlink';

interface StarlinkActionHistoryProps {
  history: StarlinkClient['history'];
  className?: string;
}

const StarlinkActionHistory: React.FC<StarlinkActionHistoryProps> = ({
  history,
  className = ''
}) => {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActionIcon = (action: string) => {
    switch (action.toUpperCase()) {
      case 'CREATE':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'UPDATE':
        return <AlertCircle className="w-5 h-5 text-blue-600" />;
      case 'UPDATE_KIT_STATUS':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'UPDATE_PAYMENT_STATUS':
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case 'DELETE':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
        <Clock className="w-5 h-5" />
        Historique des actions
      </h3>

      {history.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          Aucun historique disponible
        </div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-3"
        >
          {history.map((entry, index) => (
            <motion.div
              key={index}
              variants={item}
              className="flex items-start gap-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm"
            >
              <div className="flex-shrink-0">
                {getActionIcon(entry.action)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">
                    {entry.action.split('_').join(' ')}
                  </p>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-1" />
                    {formatDate(entry.timestamp)}
                  </div>
                </div>

                {entry.details && (
                  <p className="mt-1 text-sm text-gray-600">
                    {entry.details}
                  </p>
                )}

                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <User className="w-4 h-4 mr-1" />
                  <span>Par {entry.performedBy}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default StarlinkActionHistory; 