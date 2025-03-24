import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { StarlinkClient } from '../types/starlink';
import StarlinkClientList from '../components/starlink/StarlinkClientList';
import StarlinkClientForm from '../components/starlink/StarlinkClientForm';
import StarlinkClientDetails from '../components/starlink/StarlinkClientDetails';
import { useAuth } from '../hooks/useAuth';

const StarlinkClientsPage: React.FC = () => {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedClient, setSelectedClient] = useState<StarlinkClient | null>(null);

  const handleAddClient = () => {
    setSelectedClient(null);
    setShowForm(true);
    setShowDetails(false);
  };

  const handleEditClient = (client: StarlinkClient) => {
    setSelectedClient(client);
    setShowForm(true);
    setShowDetails(false);
  };

  const handleViewClient = (client: StarlinkClient) => {
    setSelectedClient(client);
    setShowDetails(true);
    setShowForm(false);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedClient(null);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedClient(null);
  };

  const handleFormSubmit = () => {
    setShowForm(false);
    setSelectedClient(null);
    // Rafraîchir la liste des clients
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Gestion des clients Starlink
        </h1>
        <button
          onClick={handleAddClient}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nouveau client
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                {selectedClient ? 'Modifier le client' : 'Nouveau client'}
              </h2>
              <StarlinkClientForm
                client={selectedClient}
                onSubmit={handleFormSubmit}
                onCancel={handleCloseForm}
                userId={user?.uid || ''}
              />
            </div>
          </div>
        </div>
      )}

      {showDetails && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <StarlinkClientDetails
              client={selectedClient}
              onClose={handleCloseDetails}
              onEdit={() => handleEditClient(selectedClient)}
            />
          </div>
        </div>
      )}

      <StarlinkClientList
        onEdit={handleEditClient}
        onView={handleViewClient}
      />
    </div>
  );
};

export default StarlinkClientsPage; 