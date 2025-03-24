import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Loader2, ArrowLeft, User, Building2, Phone, Mail, 
  Calendar, DollarSign, Package, AlertCircle, Clock,
  FileText, Download, Printer, History, CheckCircle, XCircle, Plus, Edit, Tool, Trash2
} from 'lucide-react';
import { StarlinkClient, StarlinkInvoice } from '../../types/starlink';
import { starlinkService } from '../../services/starlinkService';
import { invoiceService } from '../../services/invoiceService';
import StarlinkClientForm from '../../components/starlink/StarlinkClientForm';
import { AdminRights } from '../../components/admin/AdminRights';
import { adminService } from '../../services/adminService';
import StarlinkMaintenanceManager from '../../components/starlink/StarlinkMaintenanceManager';
import { AnimatePresence } from 'framer-motion';
import InvoiceModal from '../../components/invoice/InvoiceModal';

const ClientDetailsPage: React.FC<{ userId: string }> = ({ userId }) => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState<StarlinkClient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'invoices' | 'maintenance'>('details');
  const [isEditing, setIsEditing] = useState(clientId === 'new');
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoices, setInvoices] = useState<StarlinkInvoice[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);

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

    const loadClientData = async () => {
      if (clientId === 'new') {
        setLoading(false);
        setIsEditing(true);
        setError(null);
        return;
      }

      try {
        const clientData = await starlinkService.getClient(clientId!);
        setClient(clientData);
        setError(null);
      } catch (error) {
        console.error('Erreur lors du chargement du client:', error);
        setError('Client non trouvé');
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
    if (clientId) {
      loadClientData();
    } else {
      setLoading(false);
    }
  }, [clientId, userId]);

  useEffect(() => {
    const loadInvoices = async () => {
      if (!clientId || clientId === 'new') return;
      
      setLoadingInvoices(true);
      try {
        const clientInvoices = await invoiceService.getClientInvoices(clientId);
        setInvoices(clientInvoices);
      } catch (error) {
        console.error('Erreur lors du chargement des factures:', error);
        setError('Erreur lors du chargement des factures');
      } finally {
        setLoadingInvoices(false);
      }
    };

    if (activeTab === 'invoices' && clientId && clientId !== 'new') {
      loadInvoices();
    }
  }, [clientId, activeTab]);

  const handleSubmit = async (data: Partial<StarlinkClient>) => {
    try {
      if (clientId === 'new') {
        await starlinkService.createClient(data as StarlinkClientFormData, userId);
        navigate('/admin/starlink');
      } else {
        await starlinkService.updateClient(clientId!, data as StarlinkClientFormData, userId);
        setClient(prevClient => ({ ...prevClient!, ...data }));
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setError('Erreur lors de la sauvegarde du client');
    }
  };

  const handleCancel = () => {
    if (clientId === 'new') {
      navigate('/admin/starlink');
    } else {
      setIsEditing(false);
    }
  };

  const handleGenerateInvoice = async () => {
    setIsGeneratingInvoice(true);
    try {
      if (!client) return;

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
    } catch (error) {
      console.error('Erreur lors de la génération de la facture:', error);
      setError(error instanceof Error ? error.message : 'Erreur lors de la génération de la facture');
    } finally {
      setIsGeneratingInvoice(false);
    }
  };

  const handleUpdateInvoiceStatus = async (invoiceId: string, status: StarlinkInvoice['status']) => {
    try {
      await invoiceService.updateInvoiceStatus(invoiceId, status, userId);
      // Recharger les factures
      const updatedInvoices = await invoiceService.getClientInvoices(clientId!);
      setInvoices(updatedInvoices);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      setError('Erreur lors de la mise à jour du statut de la facture');
    }
  };

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'suspended':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'restricted':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getInvoiceStatusColor = (status: StarlinkInvoice['status']) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  if (clientId === 'new' || isEditing) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/admin/starlink')}
            className="flex items-center text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </button>
          <h1 className="text-2xl font-bold">
            {clientId === 'new' ? 'Nouveau client' : 'Modifier le client'}
          </h1>
        </div>
        <StarlinkClientForm
          onSubmit={handleSubmit}
          onClose={handleCancel}
          initialData={clientId === 'new' ? undefined : client || undefined}
        />
      </div>
    );
  }

  if (!client && clientId !== 'new') {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 text-yellow-600 p-4 rounded-lg">
          Client non trouvé
        </div>
        <button
          onClick={() => navigate('/admin/starlink')}
          className="mt-4 flex items-center text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour à la liste des clients
        </button>
      </div>
    );
  }

  if (error && clientId !== 'new') {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {error}
        </div>
        <button
          onClick={() => navigate('/admin/starlink')}
          className="mt-4 flex items-center text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour à la liste des clients
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/starlink')}
            className="flex items-center text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </button>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            {getStatusIcon(client.kitStatus)}
            {client.clientName}
          </h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleGenerateInvoice}
            disabled={isGeneratingInvoice}
            className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            {isGeneratingInvoice ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Générer facture
              </>
            ) : (
              <>
                <FileText className="w-5 h-5 mr-2" />
                Générer facture
              </>
            )}
          </button>
          <button
            onClick={() => {/* TODO: Télécharger */}}
            className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Download className="w-5 h-5 mr-2" />
            Télécharger
          </button>
          <button
            onClick={() => {/* TODO: Imprimer */}}
            className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Printer className="w-5 h-5 mr-2" />
            Imprimer
          </button>
        </div>
      </div>

      {/* Onglets */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex gap-4">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'details'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Détails
          </button>
          <button
            onClick={() => setActiveTab('invoices')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'invoices'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Factures
          </button>
          <button
            onClick={() => setActiveTab('maintenance')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'maintenance'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Maintenance
          </button>
        </nav>
      </div>

      {/* Contenu principal */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        {activeTab === 'details' && (
          <div className="space-y-8">
            {/* En-tête avec statuts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`p-4 rounded-lg border ${getStatusColor(client.kitStatus)}`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Statut du kit</span>
                  {getStatusIcon(client.kitStatus)}
                </div>
                <p className="mt-1 text-lg font-semibold">
                  {client.kitStatus.charAt(0).toUpperCase() + client.kitStatus.slice(1)}
                </p>
                <p className="text-sm mt-1">Kit N° {client.kitNumber}</p>
              </div>

              <div className={`p-4 rounded-lg border ${getStatusColor(client.paymentStatus)}`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Statut de paiement</span>
                  <DollarSign className="w-5 h-5" />
                </div>
                <p className="mt-1 text-lg font-semibold">
                  {client.paymentStatus.charAt(0).toUpperCase() + client.paymentStatus.slice(1)}
                </p>
                <p className="text-sm mt-1">
                  {client.billingAmount.amount.toLocaleString('fr-FR')} {client.billingAmount.currency}
                </p>
              </div>

              <div className="p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Dates importantes</span>
                  <Calendar className="w-5 h-5 text-gray-500" />
                </div>
                <div className="mt-1">
                  <p className="text-sm">
                    <span className="font-medium">Activation:</span>{' '}
                    {new Date(client.activationDate).toLocaleDateString('fr-FR')}
                  </p>
                  <p className="text-sm mt-1">
                    <span className="font-medium">Facturation:</span>{' '}
                    {new Date(client.billingDate).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
            </div>

            {/* Informations détaillées */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Informations client</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-gray-500 mt-1" />
                    <div>
                      <p className="font-medium">{client.clientName}</p>
                      <p className="text-sm text-gray-600">Nom du client</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Building2 className="w-5 h-5 text-gray-500 mt-1" />
                    <div>
                      <p className="font-medium">{client.accountName}</p>
                      <p className="text-sm text-gray-600">Nom du compte</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Contacts</h3>
                <div className="space-y-4">
                  {client.contacts.phones.map((phone, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-gray-500 mt-1" />
                      <div>
                        <p className="font-medium">{phone}</p>
                        <p className="text-sm text-gray-600">Téléphone {index + 1}</p>
                      </div>
                    </div>
                  ))}
                  {client.contacts.emails.map((email, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <Mail className="w-5 h-5 text-gray-500 mt-1" />
                      <div>
                        <p className="font-medium">{email}</p>
                        <p className="text-sm text-gray-600">Email {index + 1}</p>
                      </div>
                    </div>
                  ))}
                  {client.contacts.whatsapp && (
                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-gray-500 mt-1" />
                      <div>
                        <p className="font-medium">{client.contacts.whatsapp}</p>
                        <p className="text-sm text-gray-600">WhatsApp</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Notes */}
            {client.notes && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Notes</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-wrap">{client.notes}</p>
                </div>
              </div>
            )}

            {/* Bouton d'édition */}
            <div className="flex justify-end">
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Modifier les informations
              </button>
            </div>
          </div>
        )}

        {activeTab === 'invoices' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Factures</h3>
              <button
                onClick={handleGenerateInvoice}
                disabled={isGeneratingInvoice}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isGeneratingInvoice ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Génération...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    Nouvelle facture
                  </>
                )}
              </button>
            </div>

            {loadingInvoices ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : invoices.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Aucune facture disponible
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        N° Facture
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Échéance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Montant
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {invoices.map((invoice) => (
                      <tr key={invoice.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {invoice.invoiceNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(invoice.createdAt).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(invoice.dueDate).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {invoice.originalAmount ? (
                            <div>
                              <div>{invoice.originalAmount.amount.toLocaleString('fr-FR')} {invoice.originalAmount.currency}</div>
                              <div className="text-xs text-gray-500">
                                {invoice.amount.toLocaleString('fr-FR')} FCFA
                              </div>
                            </div>
                          ) : (
                            <div>{invoice.amount.toLocaleString('fr-FR')} {invoice.currency}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${getInvoiceStatusColor(invoice.status)}`}>
                            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => invoiceService.generateInvoicePDF(invoice)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <FileText className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleUpdateInvoiceStatus(invoice.id, 'paid')}
                              disabled={invoice.status === 'paid'}
                              className="text-green-600 hover:text-green-900 disabled:opacity-50"
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleUpdateInvoiceStatus(invoice.id, 'cancelled')}
                              disabled={invoice.status === 'cancelled'}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'maintenance' && (
          <StarlinkMaintenanceManager
            client={client}
            userId={userId}
            onUpdate={() => {/* TODO: Implement update handler */}}
          />
        )}
      </div>
    </div>
  );
};

export default ClientDetailsPage;
// 