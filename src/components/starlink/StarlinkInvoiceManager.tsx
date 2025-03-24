import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  PieChart, 
  BarChart, 
  Users, 
  DollarSign, 
  Calendar, 
  Phone, 
  Mail,
  FileText,
  AlertTriangle,
  Printer,
  Edit,
  X,
  Plus,
  Trash2
} from 'lucide-react';
import { StarlinkClient, StarlinkInvoice, Currency } from '../../types/starlink';
import { invoiceService } from '../../services/invoiceService';
import { formatPrice } from '../../utils/formatters';
import { Button } from '../ui/button';
import CreateInvoiceForm from './CreateInvoiceForm';
import { calculateFCFAAmount } from '../../services/starlinkService';

interface StarlinkInvoiceManagerProps {
  client: StarlinkClient;
  userId: string;
}

interface InvoiceStats {
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  overdueAmount: number;
  invoiceCount: number;
  paidCount: number;
  pendingCount: number;
  overdueCount: number;
}

const StarlinkInvoiceManager: React.FC<StarlinkInvoiceManagerProps> = ({
  client,
  userId
}) => {
  const [invoices, setInvoices] = useState<StarlinkInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedInvoiceForPreview, setSelectedInvoiceForPreview] = useState<StarlinkInvoice | null>(null);
  const [stats, setStats] = useState<InvoiceStats>({
    totalAmount: 0,
    paidAmount: 0,
    pendingAmount: 0,
    overdueAmount: 0,
    invoiceCount: 0,
    paidCount: 0,
    pendingCount: 0,
    overdueCount: 0
  });
  const [selectedInvoice, setSelectedInvoice] = useState<StarlinkInvoice | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<StarlinkInvoice | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, [client.id]);

  const fetchInvoices = async () => {
    try {
      const fetchedInvoices = await invoiceService.getClientInvoices(client.id);
      setInvoices(fetchedInvoices);
      calculateStats(fetchedInvoices);
    } catch (error) {
      console.error('Erreur lors de la récupération des factures:', error);
      setError('Erreur lors du chargement des factures');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (invoiceList: StarlinkInvoice[]) => {
    const newStats = invoiceList.reduce((acc, invoice) => {
      // Calculer le montant en FCFA en fonction de originalAmount s'il existe
      const amount = invoice.originalAmount 
        ? calculateFCFAAmount(invoice.originalAmount.amount, invoice.originalAmount.currency)
        : invoice.amount;

      acc.totalAmount += amount;
      acc.invoiceCount++;

      switch (invoice.status) {
        case 'paid':
          acc.paidAmount += amount;
          acc.paidCount++;
          break;
        case 'pending':
          acc.pendingAmount += amount;
          acc.pendingCount++;
          break;
        case 'overdue':
          acc.overdueAmount += amount;
          acc.overdueCount++;
          break;
      }

      return acc;
    }, {
      totalAmount: 0,
      paidAmount: 0,
      pendingAmount: 0,
      overdueAmount: 0,
      invoiceCount: 0,
      paidCount: 0,
      pendingCount: 0,
      overdueCount: 0
    });

    setStats(newStats);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: StarlinkInvoice['status']) => {
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

  const handleEditInvoice = (invoice: StarlinkInvoice) => {
    setSelectedInvoice(invoice);
    setShowEditForm(true);
  };

  const handleDeleteInvoice = async (invoice: StarlinkInvoice) => {
    setInvoiceToDelete(invoice);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!invoiceToDelete) return;
    
    try {
      setIsDeleting(true);
      await invoiceService.deleteInvoice(invoiceToDelete.id);
      setShowDeleteConfirm(false);
      setInvoiceToDelete(null);
      await fetchInvoices();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      setError('Erreur lors de la suppression de la facture');
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePrintInvoice = async (invoice: StarlinkInvoice) => {
    if (isGenerating) return;
    
    setSelectedInvoice(invoice);
    setShowPreview(true);
  };

  const handleConfirmPrint = async () => {
    if (!selectedInvoice || isGenerating) return;
    
    try {
      setIsGenerating(true);
      await invoiceService.generateInvoicePDF(selectedInvoice);
      setShowPreview(false);
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      setError('Erreur lors de la génération du PDF. Veuillez réessayer.');
    } finally {
      setIsGenerating(false);
    }
  };

  const renderInvoicePreview = () => {
    if (!selectedInvoice) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="p-8">
            {/* En-tête de la facture */}
            <div className="flex justify-between items-start mb-8">
              <div className="flex items-center gap-4">
                <img src="/DA_LOGO-cc.png" alt="Digital Academy Logo" className="h-16 w-auto" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">DIGITAL ACADEMY</h2>
                  <p className="text-gray-600">DOUALA, Cameroun</p>
                  <p className="text-gray-600">TOTAL BEPANDA 2 RUE EN PAVEE 07 ème DODANNES </p> 
                  <p className="text-gray-600">digitalacademy@gmail.com</p>
                  <p className="text-gray-600">+237 6 55 85 33 48 - +237 6 50 43 95 03</p>
                </div>
              </div>
              <div className="text-right">
                <h3 className="text-xl font-semibold text-blue-600">FACTURE</h3>
                <p className="text-gray-600">N° {selectedInvoice.invoiceNumber}</p>
                <p className="text-gray-600">Date: {formatDate(selectedInvoice.createdAt)}</p>
                <p className="text-gray-600">Échéance: {formatDate(selectedInvoice.dueDate)}</p>
              </div>
            </div>

            {/* Informations du client */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Informations Client</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-medium text-gray-900">{client.clientName}</p>
                  <p className="text-gray-600">{client.contacts.emails[0]}</p>
                  <p className="text-gray-600">{client.contacts.phones[0]}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-600">N° Kit: {client.kitNumber}</p>
                  <p className="text-gray-600">Compte: {client.accountName}</p>
                  <p className="font-medium text-gray-900">N° Contribuable: PO79916420235K</p>
                </div>
              </div>
            </div>

            {/* Tableau des articles */}
            <div className="mb-8">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="py-3 px-4 font-semibold text-gray-900 rounded-tl-lg">Description</th>
                    <th className="py-3 px-4 font-semibold text-gray-900 text-center">Quantité</th>
                    <th className="py-3 px-4 font-semibold text-gray-900 text-right">Prix unitaire</th>
                    <th className="py-3 px-4 font-semibold text-gray-900 text-right rounded-tr-lg">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {selectedInvoice.items.map((item, index) => (
                    <tr key={index} className="text-gray-700">
                      <td className="py-3 px-4">{item.description}</td>
                      <td className="py-3 px-4 text-center">{item.quantity}</td>
                      <td className="py-3 px-4 text-right">
                        {selectedInvoice.originalAmount 
                          ? formatPrice(item.amount, selectedInvoice.originalAmount.currency)
                          : formatPrice(item.amount, selectedInvoice.currency)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {selectedInvoice.originalAmount 
                          ? formatPrice(item.amount * item.quantity, selectedInvoice.originalAmount.currency)
                          : formatPrice(item.amount * item.quantity, selectedInvoice.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50 font-medium text-gray-900">
                    <td colSpan={3} className="py-3 px-4 text-right">Total</td>
                    <td className="py-3 px-4 text-right">
                      {selectedInvoice.originalAmount 
                        ? formatPrice(selectedInvoice.originalAmount.amount, selectedInvoice.originalAmount.currency)
                        : formatPrice(selectedInvoice.amount, selectedInvoice.currency)}
                    </td>
                  </tr>
                  {selectedInvoice.originalAmount && (
                    <tr className="text-sm text-gray-600">
                      <td colSpan={3} className="py-2 px-4 text-right">Équivalent en FCFA</td>
                      <td className="py-2 px-4 text-right">
                        {formatPrice(calculateFCFAAmount(selectedInvoice.originalAmount.amount, selectedInvoice.originalAmount.currency), 'XOF')}
                      </td>
                    </tr>
                  )}
                </tfoot>
              </table>
            </div>

            {/* Conditions et notes */}
            <div className="mb-8">
              <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-600">
                <p className="font-medium mb-2">Conditions de paiement :</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Paiement dû dans les 03 jours suivant la réception de la facture</li>
                  <li>Tout retard de paiement entraînera une suspension du service</li>
                  <li>Pour toute question, contactez notre service client</li>
                </ul>
              </div>
            </div>

            {/* Section des signatures */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div className="border-t-2 border-gray-200 pt-4">
                <p className="text-gray-600 mb-12">Digital Academy</p>
                <div className="flex items-end gap-2">
                  <span className="text-gray-900 font-medium">Signature :</span>
                  <img src="/sig-da.png" alt="Signature Digital Academy" className="h-12 w-auto" />
                </div>
              </div>
              <div className="border-t-2 border-gray-200 pt-4">
                <p className="text-gray-600 mb-12">Client</p>
                <div className="flex items-end gap-2">
                  <span className="text-gray-900 font-medium">Signature :</span>
                  <div className="border-b-2 border-gray-300 flex-1 mb-1"></div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Fermer
              </button>
              <button
                onClick={handleConfirmPrint}
                className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Printer className="w-5 h-5" />
                Imprimer
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* En-tête avec les statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total facturé</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatPrice(stats.totalAmount, 'XOF')}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <div className="flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <PieChart className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Montant payé</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatPrice(stats.paidAmount, 'XOF')}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <div className="flex items-center gap-4">
            <div className="bg-yellow-100 p-3 rounded-lg">
              <BarChart className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">En attente</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatPrice(stats.pendingAmount, 'XOF')}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <div className="flex items-center gap-4">
            <div className="bg-red-100 p-3 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">En retard</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatPrice(stats.overdueAmount, 'XOF')}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Liste des factures */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="bg-white rounded-xl shadow-sm overflow-hidden"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Factures</h2>
            <Button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nouvelle facture
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
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
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {invoice.invoiceNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(invoice.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(invoice.dueDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {invoice.originalAmount ? (
                      <div>
                        <div>{formatPrice(invoice.originalAmount.amount, invoice.originalAmount.currency)}</div>
                        <div className="text-xs text-gray-500">
                          {formatPrice(invoice.amount, 'XOF')}
                        </div>
                      </div>
                    ) : (
                      <div>{formatPrice(invoice.amount, invoice.currency)}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end items-center gap-2">
                      <button
                        onClick={() => handlePrintInvoice(invoice)}
                        className="text-gray-600 hover:text-gray-900 disabled:opacity-50"
                        disabled={isGenerating}
                      >
                        <Printer className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleEditInvoice(invoice)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteInvoice(invoice)}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                        disabled={isDeleting}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Formulaire de création/édition */}
      {(showCreateForm || showEditForm) && (
        <CreateInvoiceForm
          clientId={client.id}
          userId={userId}
          onClose={() => {
            setShowCreateForm(false);
            setShowEditForm(false);
            setSelectedInvoice(null);
            fetchInvoices();
          }}
          initialData={selectedInvoice}
        />
      )}

      {/* Modal de confirmation de suppression */}
      {showDeleteConfirm && invoiceToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full"
          >
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Confirmer la suppression
            </h3>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer la facture {invoiceToDelete.invoiceNumber} ?
              Cette action est irréversible.
            </p>
            <div className="flex justify-end gap-4">
              <Button
                onClick={() => setShowDeleteConfirm(false)}
                variant="outline"
                className="flex items-center gap-2"
                disabled={isDeleting}
              >
                <X className="w-4 h-4" />
                Annuler
              </Button>
              <Button
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
                disabled={isDeleting}
              >
                <Trash2 className="w-4 h-4" />
                {isDeleting ? 'Suppression...' : 'Supprimer'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal de prévisualisation avec état de chargement */}
      {showPreview && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          >
            {renderInvoicePreview()}
            <div className="p-6 border-t border-gray-200 flex justify-end gap-4">
              <Button
                onClick={() => setShowPreview(false)}
                variant="outline"
                className="flex items-center gap-2"
                disabled={isGenerating}
              >
                <X className="w-4 h-4" />
                Fermer
              </Button>
              <Button
                onClick={handleConfirmPrint}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                disabled={isGenerating}
              >
                <Printer className="w-4 h-4" />
                {isGenerating ? 'Génération...' : 'Imprimer'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default StarlinkInvoiceManager; 
