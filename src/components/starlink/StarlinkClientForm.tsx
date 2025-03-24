import React, { useState } from 'react';
import { StarlinkClient, Currency, Contact, Location } from '../../types/starlink';
import { Button } from '../ui/button';
import { Phone, Trash2, Plus } from 'lucide-react';

interface StarlinkClientFormProps {
  onSubmit: (data: Partial<StarlinkClient>) => Promise<void>;
  onClose: () => void;
  initialData?: Partial<StarlinkClient>;
}

const StarlinkClientForm: React.FC<StarlinkClientFormProps> = ({
  onSubmit,
  onClose,
  initialData
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<StarlinkClient>>({
    clientName: '',
    accountName: '',
    kitNumber: '',
    kitStatus: 'active',
    paymentStatus: 'pending',
    originalAmount: {
      amount: 0,
      currency: 'EUR'
    },
    billingAmount: {
      amount: 0,
      currency: 'XOF'
    },
    contacts: {
      phones: [''],
      emails: [''],
      whatsapp: ''
    },
    location: {
      address: '',
      city: '',
      country: '',
      description: ''
    },
    activationDate: new Date(),
    billingDate: new Date(),
    notes: '',
    ...initialData
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOriginalAmount = (amount: number) => {
    setFormData(prev => ({
      ...prev,
      originalAmount: {
        amount,
        currency: prev.originalAmount?.currency || 'EUR'
      }
    }));
  };

  const updateOriginalCurrency = (currency: Currency) => {
    setFormData(prev => ({
      ...prev,
      originalAmount: {
        amount: prev.originalAmount?.amount || 0,
        currency
      }
    }));
  };

  const updateBillingAmount = (amount: number) => {
    setFormData(prev => ({
      ...prev,
      billingAmount: {
        amount,
        currency: 'XOF'
      }
    }));
  };

  const updateContacts = (type: keyof Pick<Contact, 'phones' | 'emails'>, index: number, value: string) => {
    setFormData(prev => {
      const currentContacts = prev.contacts || { phones: [''], emails: [''] };
      const currentArray = currentContacts[type] || [''];
      const newArray = [...currentArray];
      newArray[index] = value;
      
      return {
        ...prev,
        contacts: {
          ...currentContacts,
          [type]: newArray
        }
      };
    });
  };

  const addContact = (type: keyof Pick<Contact, 'phones' | 'emails'>) => {
    setFormData(prev => {
      const currentContacts = prev.contacts || { phones: [''], emails: [''] };
      const currentArray = currentContacts[type] || [''];
      
      return {
        ...prev,
        contacts: {
          ...currentContacts,
          [type]: [...currentArray, '']
        }
      };
    });
  };

  const removeContact = (type: keyof Pick<Contact, 'phones' | 'emails'>, index: number) => {
    setFormData(prev => {
      const currentContacts = prev.contacts || { phones: [''], emails: [''] };
      const currentArray = currentContacts[type] || [''];
      
      return {
        ...prev,
        contacts: {
          ...currentContacts,
          [type]: currentArray.filter((_, i) => i !== index)
        }
      };
    });
  };

  const updateLocation = (field: keyof Location, value: string) => {
    setFormData(prev => ({
      ...prev,
      location: {
        ...(prev.location || {
          address: '',
          city: '',
          country: '',
          description: ''
        }),
        [field]: value
      }
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl mx-auto px-8">
      <div className="space-y-8">
        {/* Informations principales */}
        <div>
          <h3 className="text-lg font-medium mb-6">Informations principales</h3>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom du client
              </label>
              <input
                type="text"
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                className="block w-full h-12 px-4 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom du compte
              </label>
              <input
                type="text"
                value={formData.accountName}
                onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                className="block w-full h-12 px-4 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Numéro de kit
              </label>
              <input
                type="text"
                value={formData.kitNumber}
                onChange={(e) => setFormData({ ...formData, kitNumber: e.target.value })}
                className="block w-full h-12 px-4 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut du kit
              </label>
              <select
                value={formData.kitStatus}
                onChange={(e) => setFormData({ ...formData, kitStatus: e.target.value as StarlinkClient['kitStatus'] })}
                className="block w-full h-12 px-4 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
                <option value="suspended">Suspendu</option>
                <option value="restricted">Restreint</option>
              </select>
            </div>
          </div>
        </div>

        {/* Facturation */}
        <div>
          <h3 className="text-lg font-medium mb-6">Facturation</h3>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Montant original
              </label>
              <div className="flex gap-4">
                <input
                  type="number"
                  value={formData.originalAmount?.amount}
                  onChange={(e) => updateOriginalAmount(Number(e.target.value))}
                  className="block w-full h-12 px-4 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <select
                  value={formData.originalAmount?.currency}
                  onChange={(e) => updateOriginalCurrency(e.target.value as Currency)}
                  className="block w-32 h-12 px-4 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="EUR">EUR</option>
                  <option value="NGN">NGN</option>
                  <option value="RWF">RWF</option>
                  <option value="XOF">XOF</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Montant en FCFA
              </label>
              <input
                type="number"
                value={formData.billingAmount?.amount}
                onChange={(e) => updateBillingAmount(Number(e.target.value))}
                className="block w-full h-12 px-4 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date d'activation
              </label>
              <input
                type="date"
                value={formData.activationDate?.toISOString().split('T')[0]}
                onChange={(e) => setFormData({
                  ...formData,
                  activationDate: new Date(e.target.value)
                })}
                className="block w-full h-12 px-4 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de facturation
              </label>
              <input
                type="date"
                value={formData.billingDate?.toISOString().split('T')[0]}
                onChange={(e) => setFormData({
                  ...formData,
                  billingDate: new Date(e.target.value)
                })}
                className="block w-full h-12 px-4 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Contacts */}
        <section className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Phone className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-medium text-gray-900">Contacts</h3>
          </div>
          
          {/* Téléphones */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Téléphones
            </label>
            {formData.contacts?.phones.map((phone, index) => (
              <div key={index} className="flex gap-4 mb-4">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => updateContacts('phones', index, e.target.value)}
                  className="flex-1 h-12 px-4 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => removeContact('phones', index)}
                  className="px-4 h-12"
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => addContact('phones')}
              className="w-full h-12 mt-2"
            >
              <Plus className="w-5 h-5 mr-2" />
              Ajouter un téléphone
            </Button>
          </div>

          {/* Emails */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Emails
            </label>
            {formData.contacts?.emails.map((email, index) => (
              <div key={index} className="flex gap-4 mb-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => updateContacts('emails', index, e.target.value)}
                  className="flex-1 h-12 px-4 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => removeContact('emails', index)}
                  className="px-4 h-12"
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => addContact('emails')}
              className="w-full h-12 mt-2"
            >
              <Plus className="w-5 h-5 mr-2" />
              Ajouter un email
            </Button>
          </div>

          {/* WhatsApp */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              WhatsApp
            </label>
            <input
              type="tel"
              value={formData.contacts?.whatsapp || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                contacts: {
                  ...prev.contacts,
                  phones: prev.contacts?.phones || [],
                  emails: prev.contacts?.emails || [],
                  whatsapp: e.target.value
                }
              }))}
              className="w-full h-12 px-4 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Numéro WhatsApp (optionnel)"
            />
          </div>
        </section>

        {/* Localisation */}
        <div>
          <h3 className="text-lg font-medium mb-6">Localisation</h3>
          <div className="mt-4 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresse
              </label>
              <input
                type="text"
                value={formData.location?.address || ''}
                onChange={(e) => updateLocation('address', e.target.value)}
                className="block w-full h-12 px-4 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ville
                </label>
                <input
                  type="text"
                  value={formData.location?.city || ''}
                  onChange={(e) => updateLocation('city', e.target.value)}
                  className="block w-full h-12 px-4 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pays
                </label>
                <input
                  type="text"
                  value={formData.location?.country || ''}
                  onChange={(e) => updateLocation('country', e.target.value)}
                  className="block w-full h-12 px-4 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description de l'emplacement
              </label>
              <textarea
                value={formData.location?.description || ''}
                onChange={(e) => updateLocation('description', e.target.value)}
                className="block w-full h-32 px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder="Description détaillée de l'emplacement (repères, points d'accès, etc.)"
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <h3 className="text-lg font-medium mb-6">Notes</h3>
          <div className="mt-4">
            <textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData({
                ...formData,
                notes: e.target.value
              })}
              className="block w-full h-32 px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              placeholder="Notes additionnelles..."
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-4 py-6">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={loading}
          className="h-12 px-6"
        >
          Annuler
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="h-12 px-6"
        >
          {loading ? 'Enregistrement...' : initialData ? 'Modifier' : 'Créer'}
        </Button>
      </div>
    </form>
  );
};

export default StarlinkClientForm; 
//