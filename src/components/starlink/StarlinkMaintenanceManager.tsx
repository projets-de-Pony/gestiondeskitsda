import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarIcon,
  WrenchIcon,
  AlertTriangleIcon,
  PlusIcon,
  XIcon,
  SaveIcon,
  Trash2Icon,
  RefreshCwIcon,
  CheckCircleIcon,
  ClockIcon,
  AlertCircleIcon
} from 'lucide-react';
import {
  StarlinkClient,
  MaintenanceRecord,
  TechnicalIssue,
  KitReplacement,
  MaintenanceType,
  MaintenanceStatus,
  TechnicalIssueStatus
} from '../../types/starlink';
import { Button } from '../ui/button';
import MaintenanceModal from './MaintenanceModal';
import TechnicalIssueModal from './TechnicalIssueModal';
import KitReplacementModal from './KitReplacementModal';
import { maintenanceService } from '../../services/maintenanceService';

interface StarlinkMaintenanceManagerProps {
  client: StarlinkClient;
  userId: string;
  onUpdate: () => void;
}

type ModalType = 'maintenance' | 'issue' | 'replacement' | null;

const StarlinkMaintenanceManager: React.FC<StarlinkMaintenanceManagerProps> = ({
  client,
  userId,
  onUpdate
}) => {
  const [activeTab, setActiveTab] = useState<'maintenance' | 'issues' | 'replacements'>('maintenance');
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Gestionnaires de soumission pour chaque type de modal
  const handleMaintenanceSubmit = async (data: Partial<MaintenanceRecord>) => {
    setLoading(true);
    setError(null);
    try {
      await maintenanceService.createMaintenance(data, client.id, userId);
      onUpdate();
      setActiveModal(null);
    } catch (error) {
      console.error('Erreur lors de la soumission de la maintenance:', error);
      setError('Erreur lors de la création de la maintenance');
    } finally {
      setLoading(false);
    }
  };

  const handleIssueSubmit = async (data: Partial<TechnicalIssue>) => {
    setLoading(true);
    setError(null);
    try {
      await maintenanceService.createTechnicalIssue(data, client.id, userId);
      onUpdate();
      setActiveModal(null);
    } catch (error) {
      console.error('Erreur lors de la soumission du problème:', error);
      setError('Erreur lors de la création du problème technique');
    } finally {
      setLoading(false);
    }
  };

  const handleReplacementSubmit = async (data: Partial<KitReplacement>) => {
    setLoading(true);
    setError(null);
    try {
      await maintenanceService.createKitReplacement(data, client.id, userId);
      onUpdate();
      setActiveModal(null);
    } catch (error) {
      console.error('Erreur lors de la soumission du remplacement:', error);
      setError('Erreur lors de la création du remplacement de kit');
    } finally {
      setLoading(false);
    }
  };

  // Fonctions utilitaires pour les couleurs de statut
  const getMaintenanceStatusColor = (status: MaintenanceStatus) => {
    switch (status) {
      case 'planned':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getIssueStatusColor = (status: TechnicalIssueStatus) => {
    switch (status) {
      case 'open':
        return 'bg-red-100 text-red-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getIssuePriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      {/* Onglets */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('maintenance')}
          className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'maintenance'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <WrenchIcon className="w-5 h-5" />
          Maintenance
        </button>
        <button
          onClick={() => setActiveTab('issues')}
          className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'issues'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <AlertTriangleIcon className="w-5 h-5" />
          Problèmes
        </button>
        <button
          onClick={() => setActiveTab('replacements')}
          className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'replacements'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <RefreshCwIcon className="w-5 h-5" />
          Remplacements
        </button>
      </div>

      {/* Contenu */}
      <div className="p-6">
        {activeTab === 'maintenance' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Maintenance préventive</h3>
              <Button
                onClick={() => setActiveModal('maintenance')}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <PlusIcon className="w-5 h-5" />
                Planifier
              </Button>
            </div>

            <div className="grid gap-4">
              {client.maintenanceRecords?.map((record) => (
                <div
                  key={record.id}
                  className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">{record.description}</h4>
                      <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                        <CalendarIcon className="w-4 h-4" />
                        <span>Prévu le {new Date(record.scheduledDate).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getMaintenanceStatusColor(record.status)}`}>
                      {record.status === 'planned' && 'Planifié'}
                      {record.status === 'in_progress' && 'En cours'}
                      {record.status === 'completed' && 'Terminé'}
                      {record.status === 'cancelled' && 'Annulé'}
                    </span>
                  </div>
                  {record.technician && (
                    <div className="flex items-center gap-2 mt-3 text-sm text-gray-600">
                      <WrenchIcon className="w-4 h-4" />
                      <span>Technicien: {record.technician}</span>
                    </div>
                  )}
                  {record.notes && (
                    <p className="mt-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{record.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'issues' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Problèmes techniques</h3>
              <Button
                onClick={() => setActiveModal('issue')}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <PlusIcon className="w-5 h-5" />
                Signaler
              </Button>
            </div>

            <div className="grid gap-4">
              {client.technicalIssues?.map((issue) => (
                <div
                  key={issue.id}
                  className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">{issue.title}</h4>
                      <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                        <CalendarIcon className="w-4 h-4" />
                        <span>Signalé le {new Date(issue.reportedAt).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getIssuePriorityColor(issue.priority)}`}>
                        {issue.priority}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getIssueStatusColor(issue.status)}`}>
                        {issue.status}
                      </span>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-gray-600">{issue.description}</p>
                  {issue.resolution && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">{issue.resolution}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'replacements' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Remplacements de kit</h3>
              <Button
                onClick={() => setActiveModal('replacement')}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <PlusIcon className="w-5 h-5" />
                Nouveau remplacement
              </Button>
            </div>

            <div className="grid gap-4">
              {client.kitReplacements?.map((replacement) => (
                <div
                  key={replacement.id}
                  className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">
                        Remplacement de kit
                      </h4>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span className="font-medium">Ancien:</span>
                          {replacement.oldKitNumber}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span className="font-medium">Nouveau:</span>
                          {replacement.newKitNumber}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                        <CalendarIcon className="w-4 h-4" />
                        <span>{new Date(replacement.replacementDate).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      replacement.status === 'completed' ? 'bg-green-100 text-green-800' :
                      replacement.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {replacement.status === 'completed' && 'Terminé'}
                      {replacement.status === 'pending' && 'En attente'}
                      {replacement.status === 'cancelled' && 'Annulé'}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-gray-600">{replacement.reason}</p>
                  {replacement.notes && (
                    <p className="mt-3 text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">{replacement.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modales */}
      <AnimatePresence>
        {activeModal === 'maintenance' && (
          <MaintenanceModal
            isOpen={true}
            onClose={() => setActiveModal(null)}
            onSubmit={handleMaintenanceSubmit}
            userId={userId}
          />
        )}

        {activeModal === 'issue' && (
          <TechnicalIssueModal
            isOpen={true}
            onClose={() => setActiveModal(null)}
            onSubmit={handleIssueSubmit}
            userId={userId}
          />
        )}

        {activeModal === 'replacement' && (
          <KitReplacementModal
            isOpen={true}
            onClose={() => setActiveModal(null)}
            onSubmit={handleReplacementSubmit}
            userId={userId}
            currentKitNumber={client.kitNumber}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default StarlinkMaintenanceManager; 