import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, Edit, AlertCircle, Phone, Mail, Calendar } from 'lucide-react';
import { StarlinkClient, KitStatus, PaymentStatus } from '../../types/starlink';
import { starlinkService } from '../../services/starlinkService';
import { DataTable } from '../ui/data-table';
import { Button } from '../ui/button';
import { formatPrice } from '../../utils/formatters';

interface StarlinkClientListProps {
  onEdit: (client: StarlinkClient) => void;
  onView: (client: StarlinkClient) => void;
}

const StarlinkClientList: React.FC<StarlinkClientListProps> = ({
  onEdit,
  onView
}) => {
  const [clients, setClients] = useState<StarlinkClient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      console.log('Début du chargement des clients');
      setIsLoading(true);
      const fetchedClients = await starlinkService.getClients();
      console.log('Clients récupérés:', fetchedClients);
      setClients(fetchedClients);
    } catch (error) {
      console.error('Erreur lors du chargement des clients:', error);
      setError('Erreur lors du chargement des clients');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: KitStatus | PaymentStatus) => {
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

  const columns = [
    {
      key: 'clientName' as keyof StarlinkClient,
      title: 'Client',
      sortable: true,
      filterable: true,
      render: (value: string, client: StarlinkClient) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">{client.accountName}</div>
        </div>
      )
    },
    {
      key: 'contacts' as keyof StarlinkClient,
      title: 'Contact',
      render: (_: any, client: StarlinkClient) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-gray-600">
            <Phone className="w-4 h-4" />
            <a href={`tel:${client.contacts.phones[0]}`} className="hover:text-blue-600">
              {client.contacts.phones[0]}
            </a>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Mail className="w-4 h-4" />
            <a href={`mailto:${client.contacts.emails[0]}`} className="hover:text-blue-600">
              {client.contacts.emails[0]}
            </a>
          </div>
        </div>
      )
    },
    {
      key: 'kitNumber' as keyof StarlinkClient,
      title: 'Kit',
      sortable: true,
      filterable: true,
      render: (value: string) => (
        <div className="font-mono text-sm">{value}</div>
      )
    },
    {
      key: 'kitStatus' as keyof StarlinkClient,
      title: 'Statut Kit',
      sortable: true,
      filterable: true,
      render: (value: KitStatus) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(value)}`}>
          {value}
        </span>
      )
    },
    {
      key: 'paymentStatus' as keyof StarlinkClient,
      title: 'Statut Paiement',
      sortable: true,
      filterable: true,
      render: (value: PaymentStatus) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(value)}`}>
          {value}
        </span>
      )
    },
    {
      key: 'amount' as keyof StarlinkClient,
      title: 'Montant mensuel',
      sortable: true,
      render: (_: any, client: StarlinkClient) => (
        <div className="font-medium">
          {formatPrice(client.amount, client.currency)}
          {client.currency !== 'EUR' && (
            <div className="text-sm text-gray-500">
              ({formatPrice(72, 'EUR')})
            </div>
          )}
        </div>
      )
    },
    {
      key: 'activationDate' as keyof StarlinkClient,
      title: 'Dates',
      sortable: true,
      render: (value: Date, client: StarlinkClient) => (
        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>Activation: {formatDate(value)}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>Facturation: {formatDate(client.billingDate)}</span>
          </div>
        </div>
      )
    }
  ];

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-600 flex items-center gap-2">
        <AlertCircle className="w-5 h-5" />
        {error}
      </div>
    );
  }

  const actions = (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => fetchClients()}
        className="text-blue-600 hover:text-blue-700"
      >
        Actualiser
      </Button>
    </div>
  );

  return (
    <DataTable
      data={clients}
      columns={columns}
      isLoading={isLoading}
      onRowClick={onView}
      actions={actions}
      className="print:shadow-none"
    />
  );
};

export default StarlinkClientList; 