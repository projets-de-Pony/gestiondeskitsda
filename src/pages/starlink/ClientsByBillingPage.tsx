import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Loader2, ArrowLeft, Calendar, AlertCircle, CheckCircle, XCircle, Clock,
  FileText, Loader, Search, Filter, Download, BarChart2, CheckSquare
} from 'lucide-react';
import { StarlinkClient } from '../../types/starlink';
import { starlinkService } from '../../services/starlinkService';
import { AdminRights } from '../../components/admin/AdminRights';
import { adminService } from '../../services/adminService';
import { invoiceService } from '../../services/invoiceService';

const ClientsByBillingPage: React.FC<{ userId: string }> = ({ userId }) => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<(StarlinkClient & { daysUntilBilling: number })[]>([]);
  const [filteredClients, setFilteredClients] = useState<(StarlinkClient & { daysUntilBilling: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [generatingInvoice, setGeneratingInvoice] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDays, setFilterDays] = useState<number | null>(null);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [generatingMultiple, setGeneratingMultiple] = useState(false);
  const [invoiceHistory, setInvoiceHistory] = useState<Record<string, any[]>>({});
  const [showInvoiceHistory, setShowInvoiceHistory] = useState<string | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [stats, setStats] = useState({
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
    totalAmount: 0
  });

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const isAdminUser = await adminService.isAdmin(userId);
        setIsAdmin(isAdminUser);
      } catch (error) {
        console.error('Erreur lors de la vérification des droits admin:', error);
        setIsAdmin(false);
      }
    };

    const loadClientsData = async () => {
      try {
        // Récupérer tous les clients
        const allClients = await starlinkService.getClients();
        
        // Calculer les jours restants jusqu'à la prochaine facturation
        const today = new Date();
        const clientsWithBillingDays = allClients.map(client => {
          const billingDate = new Date(client.billingDate);
          
          // Calculer la prochaine date de facturation
          let nextBillingDate = new Date(billingDate);
          while (nextBillingDate < today) {
            nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
          }
          
          // Calculer le nombre de jours restants
          const daysUntilBilling = Math.ceil(
            (nextBillingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
          );
          
          return {
            ...client,
            daysUntilBilling
          };
        });
        
        // Trier les clients par jours restants (croissant)
        const sortedClients = clientsWithBillingDays.sort(
          (a, b) => a.daysUntilBilling - b.daysUntilBilling
        );
        
        setClients(sortedClients);
        setFilteredClients(sortedClients);
        
        // Calculer les statistiques
        const todayClients = sortedClients.filter(client => client.daysUntilBilling <= 0).length;
        const weekClients = sortedClients.filter(client => client.daysUntilBilling <= 7).length;
        const monthClients = sortedClients.filter(client => client.daysUntilBilling <= 30).length;
        const totalAmount = sortedClients.reduce((sum, client) => sum + client.billingAmount.amount, 0);
        
        setStats({
          today: todayClients,
          thisWeek: weekClients,
          thisMonth: monthClients,
          totalAmount: totalAmount
        });
        
        setError(null);
      } catch (error) {
        console.error('Erreur lors du chargement des clients:', error);
        setError('Erreur lors du chargement des clients');
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
    loadClientsData();
  }, [userId]);

  // Effet pour filtrer les clients en fonction des critères de recherche et de filtre
  useEffect(() => {
    let result = [...clients];
    
    // Appliquer le filtre de recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(client => 
        client.clientName.toLowerCase().includes(term) || 
        client.kitNumber.toLowerCase().includes(term) ||
        client.accountName.toLowerCase().includes(term)
      );
    }
    
    // Appliquer le filtre de jours
    if (filterDays !== null) {
      result = result.filter(client => client.daysUntilBilling <= filterDays);
    }
    
    setFilteredClients(result);
  }, [clients, searchTerm, filterDays]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'inactive':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'suspended':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'restricted':
        return <Clock className="w-5 h-5 text-orange-500" />;
      default:
        return null;
    }
  };

  const getBillingStatusColor = (days: number) => {
    if (days <= 0) return 'bg-red-100 text-red-800'; // Déjà dû
    if (days <= 3) return 'bg-orange-100 text-orange-800'; // Très proche
    if (days <= 7) return 'bg-yellow-100 text-yellow-800'; // Proche
    return 'bg-green-100 text-green-800'; // Loin
  };

  // Fonction pour générer une facture
  const handleGenerateInvoice = async (client: StarlinkClient) => {
    setGeneratingInvoice(client.id);
    try {
      const invoiceData = {
        clientId: client.id,
        clientName: client.clientName,
        clientEmail: client.contacts.emails[0],
        clientPhone: client.contacts.phones[0],
        kitNumber: client.kitNumber,
        originalAmount: client.originalAmount,
        amount: client.billingAmount.amount,
        currency: client.billingAmount.currency,
        status: 'pending',
        dueDate: new Date(new Date().setDate(new Date().getDate() + 3)), // Due dans 3 jours
        items: [
          {
            description: 'Abonnement Starlink',
            amount: client.billingAmount.amount,
            quantity: 1
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: userId,
        updatedBy: userId
      };

      const invoice = await invoiceService.createInvoice(invoiceData, userId);
      await invoiceService.generateInvoicePDF(invoice);
      
      // Notification de succès
      alert(`Facture générée avec succès pour ${client.clientName}`);
      
      // Mettre à jour l'historique des factures
      loadInvoiceHistory(client.id);
    } catch (error) {
      console.error('Erreur lors de la génération de la facture:', error);
      alert('Erreur lors de la génération de la facture');
    } finally {
      setGeneratingInvoice(null);
    }
  };

  // Fonction pour générer des factures en lot
  const handleGenerateMultipleInvoices = async () => {
    if (selectedClients.length === 0) {
      alert('Veuillez sélectionner au moins un client');
      return;
    }
    
    setGeneratingMultiple(true);
    const results = { success: 0, failed: 0 };
    
    try {
      for (const clientId of selectedClients) {
        const client = clients.find(c => c.id === clientId);
        if (!client) continue;
        
        try {
          const invoiceData = {
            clientId: client.id,
            clientName: client.clientName,
            clientEmail: client.contacts.emails[0],
            clientPhone: client.contacts.phones[0],
            kitNumber: client.kitNumber,
            originalAmount: client.originalAmount,
            amount: client.billingAmount.amount,
            currency: client.billingAmount.currency,
            status: 'pending',
            dueDate: new Date(new Date().setDate(new Date().getDate() + 3)),
            items: [
              {
                description: 'Abonnement Starlink',
                amount: client.billingAmount.amount,
                quantity: 1
              }
            ],
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: userId,
            updatedBy: userId
          };

          const invoice = await invoiceService.createInvoice(invoiceData, userId);
          await invoiceService.generateInvoicePDF(invoice);
          results.success++;
        } catch (error) {
          console.error(`Erreur pour le client ${client.clientName}:`, error);
          results.failed++;
        }
      }
      
      alert(`Génération terminée: ${results.success} factures générées avec succès, ${results.failed} échecs`);
      setSelectedClients([]);
    } catch (error) {
      console.error('Erreur lors de la génération des factures en lot:', error);
      alert('Erreur lors de la génération des factures en lot');
    } finally {
      setGeneratingMultiple(false);
    }
  };

  // Fonction pour charger l'historique des factures d'un client
  const loadInvoiceHistory = async (clientId: string) => {
    setLoadingHistory(true);
    try {
      const history = await invoiceService.getClientInvoices(clientId);
      setInvoiceHistory(prev => ({
        ...prev,
        [clientId]: history
      }));
      setShowInvoiceHistory(clientId);
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique des factures:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Gestion de la sélection des clients
  const toggleClientSelection = (clientId: string) => {
    setSelectedClients(prev => 
      prev.includes(clientId)
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    );
  };

  const toggleAllClients = () => {
    if (selectedClients.length === filteredClients.length) {
      setSelectedClients([]);
    } else {
      setSelectedClients(filteredClients.map(client => client.id));
    }
  };

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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/starlink')}
            className="flex items-center text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </button>
          <h1 className="text-2xl font-bold">Clients par échéance de facturation</h1>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-blue-800">À facturer aujourd'hui</h3>
            <Calendar className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-blue-900 mt-2">{stats.today}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-green-800">À facturer cette semaine</h3>
            <Calendar className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-900 mt-2">{stats.thisWeek}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-purple-800">À facturer ce mois</h3>
            <Calendar className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-purple-900 mt-2">{stats.thisMonth}</p>
        </div>
        <div className="bg-amber-50 p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-amber-800">Montant total</h3>
            <BarChart2 className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-900 mt-2">{stats.totalAmount.toLocaleString('fr-FR')} FCFA</p>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Rechercher un client..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex-none">
          <select
            className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            value={filterDays === null ? '' : filterDays.toString()}
            onChange={(e) => setFilterDays(e.target.value === '' ? null : parseInt(e.target.value))}
          >
            <option value="">Tous les clients</option>
            <option value="0">À facturer aujourd'hui</option>
            <option value="3">À facturer dans 3 jours</option>
            <option value="7">À facturer cette semaine</option>
            <option value="30">À facturer ce mois</option>
          </select>
        </div>
        
        {selectedClients.length > 0 && (
          <div className="flex-none">
            <button
              onClick={handleGenerateMultipleInvoices}
              disabled={generatingMultiple}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {generatingMultiple ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Génération en cours...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Générer {selectedClients.length} facture{selectedClients.length > 1 ? 's' : ''}
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
          {error}
        </div>
      ) : null}

      {/* Tableau des clients */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-2 py-3 text-left">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={selectedClients.length === filteredClients.length && filteredClients.length > 0}
                    onChange={toggleAllClients}
                  />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Client
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kit N°
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prochaine facturation
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Montant
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredClients.map((client) => {
              const today = new Date();
              const billingDate = new Date(client.billingDate);
              let nextBillingDate = new Date(billingDate);
              
              while (nextBillingDate < today) {
                nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
              }
              
              return (
                <React.Fragment key={client.id}>
                  <tr className="hover:bg-gray-50">
                    <td className="px-2 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          checked={selectedClients.includes(client.id)}
                          onChange={() => toggleClientSelection(client.id)}
                        />
                      </div>
                    </td>
                    <td 
                      className="px-6 py-4 whitespace-nowrap cursor-pointer"
                      onClick={() => navigate(`/admin/starlink/${client.id}`)}
                    >
                      <div className="flex items-center">
                        {getStatusIcon(client.kitStatus)}
                        <div className="ml-2">
                          <div className="text-sm font-medium text-gray-900">{client.clientName}</div>
                          <div className="text-sm text-gray-500">{client.accountName}</div>
                        </div>
                      </div>
                    </td>
                    <td 
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 cursor-pointer"
                      onClick={() => navigate(`/admin/starlink/${client.id}`)}
                    >
                      {client.kitNumber}
                    </td>
                    <td 
                      className="px-6 py-4 whitespace-nowrap cursor-pointer"
                      onClick={() => navigate(`/admin/starlink/${client.id}`)}
                    >
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {client.kitStatus}
                      </span>
                    </td>
                    <td 
                      className="px-6 py-4 whitespace-nowrap cursor-pointer"
                      onClick={() => navigate(`/admin/starlink/${client.id}`)}
                    >
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getBillingStatusColor(client.daysUntilBilling)}`}>
                        {client.daysUntilBilling <= 0 
                          ? 'Maintenant' 
                          : `Dans ${client.daysUntilBilling} jour${client.daysUntilBilling > 1 ? 's' : ''}`}
                      </span>
                      <div className="text-xs text-gray-500 mt-1">
                        {nextBillingDate.toLocaleDateString('fr-FR')}
                      </div>
                    </td>
                    <td 
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 cursor-pointer"
                      onClick={() => navigate(`/admin/starlink/${client.id}`)}
                    >
                      {client.billingAmount.amount.toLocaleString('fr-FR')} {client.billingAmount.currency}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGenerateInvoice(client);
                          }}
                          disabled={generatingInvoice === client.id}
                          className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                          title="Générer une facture"
                        >
                          {generatingInvoice === client.id ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <FileText className="w-5 h-5" />
                          )}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            loadInvoiceHistory(client.id);
                          }}
                          className="text-gray-600 hover:text-gray-900"
                          title="Voir l'historique des factures"
                        >
                          <Calendar className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  
                  {/* Historique des factures */}
                  {showInvoiceHistory === client.id && (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 bg-gray-50">
                        <div className="border-t border-gray-200 pt-4">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Historique des factures</h4>
                          {loadingHistory ? (
                            <div className="flex justify-center py-4">
                              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                            </div>
                          ) : invoiceHistory[client.id]?.length > 0 ? (
                            <div className="overflow-x-auto">
                              <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-100">
                                  <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {invoiceHistory[client.id].map((invoice: any) => (
                                    <tr key={invoice.id} className="hover:bg-gray-50">
                                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                        {new Date(invoice.createdAt).toLocaleDateString('fr-FR')}
                                      </td>
                                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                        {invoice.amount.toLocaleString('fr-FR')} {invoice.currency}
                                      </td>
                                      <td className="px-4 py-2 whitespace-nowrap">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                          invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                                          invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                          'bg-red-100 text-red-800'
                                        }`}>
                                          {invoice.status === 'paid' ? 'Payée' :
                                           invoice.status === 'pending' ? 'En attente' :
                                           'Annulée'}
                                        </span>
                                      </td>
                                      <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                          onClick={() => window.open(invoice.pdfUrl, '_blank')}
                                          className="text-blue-600 hover:text-blue-900"
                                          title="Télécharger la facture"
                                        >
                                          <Download className="w-4 h-4" />
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500 py-2">Aucune facture trouvée pour ce client.</p>
                          )}
                          <div className="flex justify-end mt-2">
                            <button
                              onClick={() => setShowInvoiceHistory(null)}
                              className="text-sm text-gray-600 hover:text-gray-900"
                            >
                              Fermer
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {filteredClients.length === 0 && !loading && (
        <div className="bg-white rounded-lg shadow-lg p-6 text-center">
          <p className="text-gray-500">Aucun client ne correspond à vos critères de recherche.</p>
        </div>
      )}
    </div>
  );
};

export default ClientsByBillingPage;