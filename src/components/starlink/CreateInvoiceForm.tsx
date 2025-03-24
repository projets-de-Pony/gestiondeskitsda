import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Save, Plus, Trash2 } from 'lucide-react';
import { StarlinkInvoice, InvoiceItem, Currency } from '../../types/starlink';
import { Button } from '../ui/button';
import { calculateFCFAAmount } from '../../services/starlinkService';
import { invoiceService } from '../../services/invoiceService';

interface CreateInvoiceFormProps {
  clientId: string;
  userId: string;
  onClose: () => void;
  initialData?: Partial<StarlinkInvoice> | null;
}

const CreateInvoiceForm: React.FC<CreateInvoiceFormProps> = ({
  clientId,
  userId,
  onClose,
  initialData
}) => {
  const [formData, setFormData] = useState<Partial<StarlinkInvoice>>({
    clientId,
    status: 'pending',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 jours par défaut
    originalAmount: {
      amount: 0,
      currency: 'EUR' as Currency
    },
    amount: 0,
    currency: 'XOF' as Currency,
    items: [
      {
        description: '',
        amount: 0,
        quantity: 1
      }
    ],
    ...initialData
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('originalAmount.')) {
      const field = name.split('.')[1];
      const newAmount = field === 'amount' ? parseFloat(value) : value;
      setFormData(prev => {
        const updatedOriginalAmount = {
          ...prev.originalAmount,
          [field]: newAmount
        };
        return {
          ...prev,
          originalAmount: updatedOriginalAmount,
          amount: field === 'amount' ? calculateFCFAAmount(parseFloat(value), updatedOriginalAmount.currency as Currency) : prev.amount
        };
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number) => {
    setFormData(prev => {
      const items = [...(prev.items || [])];
      items[index] = {
        ...items[index],
        [field]: field === 'quantity' || field === 'amount' ? Number(value) : value
      };
      return {
        ...prev,
        items
      };
    });
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...(prev.items || []),
        {
          description: '',
          amount: 0,
          quantity: 1
        }
      ]
    }));
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items?.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (initialData?.id) {
        await invoiceService.updateInvoice(initialData.id, formData, userId);
      } else {
        await invoiceService.createInvoice(formData, userId);
      }
      onClose();
    } catch (error) {
      console.error('Erreur lors de la création/mise à jour de la facture:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-medium text-gray-900">
            Nouvelle facture
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Montant original
              </label>
              <input
                type="number"
                value={formData.originalAmount?.amount}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  originalAmount: {
                    ...prev.originalAmount,
                    amount: Number(e.target.value)
                  },
                  amount: calculateFCFAAmount(Number(e.target.value), prev.originalAmount?.currency as Currency)
                }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Devise
              </label>
              <select
                value={formData.originalAmount?.currency}
                onChange={(e) => {
                  const newCurrency = e.target.value as Currency;
                  setFormData(prev => ({
                    ...prev,
                    originalAmount: {
                      ...prev.originalAmount,
                      currency: newCurrency
                    },
                    amount: calculateFCFAAmount(prev.originalAmount?.amount || 0, newCurrency)
                  }));
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="EUR">EUR</option>
                <option value="NGN">NGN</option>
                <option value="RWF">RWF</option>
                <option value="XOF">XOF</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Montant en FCFA
              </label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  amount: Number(e.target.value)
                }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                {formData.originalAmount?.amount} {formData.originalAmount?.currency} = {formData.amount} FCFA
                {(formData.originalAmount?.currency === 'EUR' && formData.originalAmount?.amount === 72) || (formData.originalAmount?.currency === 'NGN' && formData.originalAmount?.amount === 49000) ? (
                  <span className="ml-2 text-blue-600">(Taux spécial appliqué)</span>
                ) : null}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Date d'échéance
            </label>
            <input
              type="date"
              value={formData.dueDate ? new Date(formData.dueDate).toISOString().split('T')[0] : ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                dueDate: e.target.value
              }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Statut
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                status: e.target.value as StarlinkInvoice['status']
              }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="pending">En attente</option>
              <option value="paid">Payée</option>
              <option value="overdue">En retard</option>
              <option value="cancelled">Annulée</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Notes
            </label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                notes: e.target.value
              }))}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-medium text-gray-700">Articles</h4>
              <Button
                type="button"
                onClick={() => setFormData(prev => ({
                  ...prev,
                  items: [...(prev.items || []), { description: '', amount: 0, quantity: 1 }]
                }))}
                variant="outline"
                size="sm"
              >
                Ajouter un article
              </Button>
            </div>

            {formData.items?.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-12 gap-4 items-start"
              >
                <div className="col-span-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Montant
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.amount}
                    onChange={(e) => handleItemChange(index, 'amount', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantité
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div className="col-span-2 pt-7">
                  {formData.items.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        items: prev.items?.filter((_, i) => i !== index)
                      }))}
                      variant="destructive"
                      size="sm"
                      className="w-full"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}

            <div className="flex justify-end border-t pt-4">
              <div className="text-right">
                <span className="text-sm text-gray-500">Total</span>
                <p className="text-2xl font-bold text-gray-900">
                  {formatPrice(formData.amount, formData.currency as Currency)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 flex justify-end gap-4">
          <Button
            type="button"
            onClick={onClose}
            variant="outline"
          >
            Annuler
          </Button>
          <Button
            type="submit"
          >
            Créer la facture
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default CreateInvoiceForm; 