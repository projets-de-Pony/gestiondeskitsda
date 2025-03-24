import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { KitReplacement } from '../../types/starlink';
import { Button } from '../ui/button';

interface KitReplacementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<KitReplacement>) => Promise<void>;
  initialData?: KitReplacement;
  userId: string;
  currentKitNumber: string;
}

const KitReplacementModal: React.FC<KitReplacementModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  userId,
  currentKitNumber
}) => {
  const [formData, setFormData] = useState<Partial<KitReplacement>>(
    initialData || {
      oldKitNumber: currentKitNumber,
      newKitNumber: '',
      reason: '',
      replacementDate: new Date().toISOString().split('T')[0],
      status: 'pending',
      notes: '',
      createdBy: userId,
      updatedBy: userId
    }
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting kit replacement:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-medium">
            {initialData ? 'Modifier le remplacement' : 'Nouveau remplacement de kit'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Ancien numéro de kit
            </label>
            <input
              type="text"
              value={formData.oldKitNumber}
              onChange={(e) => setFormData({ ...formData, oldKitNumber: e.target.value })}
              className="mt-1 block w-full h-12 px-4 rounded-lg border-2 border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400"
              required
              readOnly
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nouveau numéro de kit
            </label>
            <input
              type="text"
              value={formData.newKitNumber}
              onChange={(e) => setFormData({ ...formData, newKitNumber: e.target.value })}
              className="mt-1 block w-full h-12 px-4 rounded-lg border-2 border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Raison du remplacement
            </label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="mt-1 block w-full h-32 px-4 py-3 rounded-lg border-2 border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Date de remplacement
            </label>
            <input
              type="date"
              value={formData.replacementDate?.toString().split('T')[0]}
              onChange={(e) => setFormData({ ...formData, replacementDate: e.target.value })}
              className="mt-1 block w-full h-12 px-4 rounded-lg border-2 border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Statut
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as KitReplacement['status'] })}
              className="mt-1 block w-full h-12 px-4 rounded-lg border-2 border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400"
              required
            >
              <option value="pending">En attente</option>
              <option value="completed">Terminé</option>
              <option value="cancelled">Annulé</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Notes additionnelles
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="mt-1 block w-full h-32 px-4 py-3 rounded-lg border-2 border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400"
              rows={2}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? 'Enregistrement...' : initialData ? 'Modifier' : 'Créer'}
            </Button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default KitReplacementModal; 