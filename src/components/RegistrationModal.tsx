import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { trainings } from '../data/trainings';
import { Link } from 'react-router-dom';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RegistrationModal: React.FC<RegistrationModalProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Choisir une Formation</h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid gap-4">
              {trainings.map((training) => (
                <motion.div
                  key={training.id}
                  whileHover={{ scale: 1.02 }}
                  className="bg-gray-50 rounded-xl p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <Link
                    to={`/training/${training.id}`}
                    className="flex items-start gap-4"
                    onClick={onClose}
                  >
                    <img
                      src={training.image}
                      alt={training.title}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{training.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{training.description}</p>
                      <div className="flex items-center gap-4">
                        <span className="text-blue-600 font-semibold">
                          {new Intl.NumberFormat('fr-FR').format(training.price)} FCFA
                        </span>
                        <span className="text-gray-500 text-sm">
                          {training.duration}
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RegistrationModal;