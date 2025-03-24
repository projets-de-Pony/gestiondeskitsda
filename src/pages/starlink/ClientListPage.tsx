import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Loader2, Search, Plus, Phone, Mail, Calendar, 
  Grid, List, Filter, Download, Upload, MoreVertical,
  CheckCircle, XCircle, AlertCircle, Clock
} from 'lucide-react';
import { StarlinkClient, KitStatus, PaymentStatus, StarlinkClientFormData } from '../../types/starlink';
import { starlinkService } from '../../services/starlinkService';
import { AdminRights } from '../../components/admin/AdminRights';
import { adminService } from '../../services/adminService';
import StarlinkClientForm from '../../components/starlink/StarlinkClientForm';
import { motion, AnimatePresence } from 'framer-motion';

const ClientListPage: React.FC<{ userId: string }> = ({ userId }) => {
  console.log('ClientListPage - Initialisation avec userId:', userId);
  const navigate = useNavigate();
  const [clients, setClients] = useState<StarlinkClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('ClientListPage - Début du chargement des données');
        setLoading(true);

        // Vérification des droits admin
        console.log('ClientListPage - Vérification des droits admin');
        const isAdminUser = await adminService.isAdmin(userId);
        console.log('ClientListPage - Résultat isAdmin:', isAdminUser);
        setIsAdmin(isAdminUser);

        if (isAdminUser) {
          // Chargement des clients
          console.log('ClientListPage - Chargement des clients');
          const clientsData = await starlinkService.getClients();
          console.log('ClientListPage - Clients chargés:', clientsData.length);
          setClients(clientsData);
        }
      } catch (error) {
        console.error('ClientListPage - Erreur lors du chargement:', error);
        setError(error instanceof Error ? error.message : 'Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      loadData();
    } else {
      console.error('ClientListPage - userId non défini');
      setError('Identifiant utilisateur non défini');
      setLoading(false);
    }

    // Gestionnaire de clic en dehors du menu
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userId]);

  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      client.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.contacts.phones.some(phone => phone.includes(searchTerm)) ||
      client.contacts.emails.some(email => email.includes(searchTerm));

    if (filterStatus === 'all') return matchesSearch;
    return matchesSearch && client.kitStatus === filterStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'inactive':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'suspended':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'restricted':
        return <Clock className="w-4 h-4 text-orange-500" />;
      default:
        return null;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'late':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleExport = async () => {
    try {
      const csvContent = await exportClientsToCSV(clients);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `clients_starlink_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      setError('Erreur lors de l\'export des clients');
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target?.result as string;
        const result = await importClientsFromCSV(text, userId);
        alert(`Import terminé : ${result.success} clients importés, ${result.errors} erreurs`);
        // Recharger la liste des clients
        loadData();
      };
      reader.readAsText(file);
    } catch (error) {
      console.error('Erreur lors de l\'import:', error);
      setError('Erreur lors de l\'import des clients');
    }
  };

  const handleStatusChange = async (clientId: string, type: 'kit' | 'payment', status: string) => {
    try {
      if (type === 'kit') {
        await starlinkService.updateKitStatus(clientId, status as KitStatus, userId);
      } else {
        await starlinkService.updatePaymentStatus(clientId, status as PaymentStatus, userId);
      }
      // Recharger la liste des clients
      loadData();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      setError('Erreur lors de la mise à jour du statut');
    }
    setActiveMenu(null);
  };

  const handleCreateClient = async (data: Partial<StarlinkClient>) => {
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const newClient = await starlinkService.createClient(data as StarlinkClientFormData, userId);
      console.log('Client créé avec succès:', newClient);
      setShowCreateModal(false);
      setSuccess('Client créé avec succès !');
      
      // Attendre un court instant avant de recharger la liste
      setTimeout(async () => {
        try {
          await loadData();
        } catch (error) {
          console.error('Erreur lors du rechargement de la liste:', error);
          // Ne pas afficher cette erreur à l'utilisateur car le client a bien été créé
        }
      }, 1000);
    } catch (error) {
      console.error('Erreur lors de la création du client:', error);
      setError('Erreur lors de la création du client. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const ActionMenu = ({ client }: { client: StarlinkClient }) => (
    <div
      ref={menuRef}
      className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10"
    >
      <div className="py-1">
        <div className="px-4 py-2 text-sm text-gray-700 font-medium border-b">
          Statut du kit
        </div>
        {KIT_STATUSES.map((status) => (
          <button
            key={status}
            onClick={() => handleStatusChange(client.id, 'kit', status)}
            className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
        <div className="px-4 py-2 text-sm text-gray-700 font-medium border-b border-t">
          Statut de paiement
        </div>
        {PAYMENT_STATUSES.map((status) => (
          <button
            key={status}
            onClick={() => handleStatusChange(client.id, 'payment', status)}
            className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );

  if (loading || isAdmin === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!isAdmin) {
    return <AdminRights userId={userId} />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Gestion des clients Starlink</h1>
          <p className="text-gray-600 mt-1">
            {filteredClients.length} client{filteredClients.length > 1 ? 's' : ''} au total
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nouveau client
          </button>
          <button onClick={() => navigate('/admin/starlink/by-billing')}
            className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Calendar className="w-5 h-5 mr-2" />
            Clients par échéance
          </button>
          <button
            onClick={handleExport}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-5 h-5 mr-2" />
            Exporter
          </button>
          <div className="relative">
            <input
              type="file"
              accept=".csv"
              onChange={handleImport}
              className="hidden"
              id="import-file"
            />
            <label
              htmlFor="import-file"
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors cursor-pointer"
            >
              <Upload className="w-5 h-5 mr-2" />
              Importer
            </label>
          </div>
        </div>
      </div>

      {/* Barre d'outils */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 w-full md:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher un client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 px-3 py-2"
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
                <option value="suspended">Suspendu</option>
                <option value="restricted">Restreint</option>
              </select>
            </div>

            <div className="flex gap-2 border-l pl-4">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg ${viewMode === 'table' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 text-green-600 p-4 rounded-lg mb-6">
          {success}
        </div>
      )}

      {viewMode === 'grid' ? (
        // Vue en grille
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredClients.map(client => (
            <div key={client.id} className="relative">
              <div
                onClick={() => navigate(`/admin/starlink/${client.id}`)}
                className="bg-white rounded-lg shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow border border-gray-200"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      {getStatusIcon(client.kitStatus)}
                      {client.clientName}
                    </h3>
                    <p className="text-gray-600">{client.accountName}</p>
                  </div>
                  <div className="absolute top-4 right-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenu(activeMenu === client.id ? null : client.id);
                      }}
                      className="p-1 hover:bg-gray-100 rounded-full"
                    >
                      <MoreVertical className="w-5 h-5 text-gray-500" />
                    </button>
                    {activeMenu === client.id && <ActionMenu client={client} />}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center text-gray-600">
                    <Phone className="w-4 h-4 mr-2" />
                    <span>{client.contacts.phones[0]}</span>
                  </div>
                  {client.contacts.emails[0] && (
                    <div className="flex items-center text-gray-600">
                      <Mail className="w-4 h-4 mr-2" />
                      <span className="truncate">{client.contacts.emails[0]}</span>
                    </div>
                  )}
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>Activé le {new Date(client.activationDate).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Montant mensuel</span>
                    <span className="font-semibold">
                      {client.billingAmount.amount.toLocaleString('fr-FR')} {client.billingAmount.currency}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-gray-600">Statut paiement</span>
                    <span className={`px-2 py-1 rounded-full text-sm ${getPaymentStatusColor(client.paymentStatus)}`}>
                      {client.paymentStatus.charAt(0).toUpperCase() + client.paymentStatus.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Vue en tableau
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Paiement
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dates
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredClients.map(client => (
                  <tr
                    key={client.id}
                    onClick={() => navigate(`/admin/starlink/${client.id}`)}
                    className="hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(client.kitStatus)}
                        <div className="ml-2">
                          <div className="text-sm font-medium text-gray-900">{client.clientName}</div>
                          <div className="text-sm text-gray-500">{client.accountName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{client.contacts.phones[0]}</div>
                      <div className="text-sm text-gray-500">{client.contacts.emails[0]}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{client.kitNumber}</div>
                      <div className="text-sm text-gray-500">{client.kitStatus}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {client.billingAmount.amount.toLocaleString('fr-FR')} {client.billingAmount.currency}
                      </div>
                      <span className={`inline-flex text-xs px-2 py-1 rounded-full ${getPaymentStatusColor(client.paymentStatus)}`}>
                        {client.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>Activation: {new Date(client.activationDate).toLocaleDateString('fr-FR')}</div>
                      <div>Facturation: {new Date(client.billingDate).toLocaleDateString('fr-FR')}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenu(activeMenu === client.id ? null : client.id);
                          }}
                          className="text-gray-400 hover:text-gray-500"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>
                        {activeMenu === client.id && <ActionMenu client={client} />}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modale de création de client */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            >
              <StarlinkClientForm
                onSubmit={handleCreateClient}
                onClose={() => setShowCreateModal(false)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ClientListPage; 