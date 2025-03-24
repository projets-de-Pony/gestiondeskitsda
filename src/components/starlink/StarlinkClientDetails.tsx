import React from 'react';
import { Phone, Mail, Calendar, DollarSign } from 'lucide-react';
import { StarlinkClient } from '../../types/starlink';
import { Button } from '../ui/button';
import StarlinkActionHistory from './StarlinkActionHistory';
import StarlinkInvoiceManager from './StarlinkInvoiceManager';
import { formatPrice } from '../../utils/formatters';
import { useAuth } from '../../hooks/useAuth';

interface StarlinkClientDetailsProps {
  client: StarlinkClient;
  onEdit: () => void;
}

const StarlinkClientDetails: React.FC<StarlinkClientDetailsProps> = ({
  client,
  onEdit
}) => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'inactive':
      case 'unavailable':
        return 'bg-gray-100 text-gray-800';
      case 'suspended':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'restricted':
      case 'late':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Button onClick={onEdit} variant="outline" className="mb-4">
            Modifier le client
          </Button>
        </div>

        <StarlinkInvoiceManager 
          client={client}
          userId={user.uid}
        />
      </div>
    </div>
  );
};

export default StarlinkClientDetails; 
// 
