import React, { useState } from 'react';
import { adminService } from '../../services/adminService';
import { Button } from '../ui/button';
import { Loader2 } from 'lucide-react';

interface AdminRightsProps {
  userId: string;
}

export const AdminRights: React.FC<AdminRightsProps> = ({ userId }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleAddAdmin = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await adminService.addAdmin(userId);
      setSuccess(true);
      // Recharger la page pour appliquer les nouveaux droits
      window.location.reload();
    } catch (error) {
      console.error('Erreur lors de l\'ajout des droits admin:', error);
      setError('Une erreur est survenue lors de l\'ajout des droits administrateur.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
      <h3 className="text-lg font-semibold text-red-800 mb-2">
        Droits insuffisants
      </h3>
      <p className="text-red-600 mb-4">
        Vous n'avez pas les droits administrateur nécessaires pour effectuer cette action.
      </p>
      
      <Button
        onClick={handleAddAdmin}
        disabled={isLoading || success}
        className="bg-red-600 hover:bg-red-700 text-white"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Attribution des droits...
          </>
        ) : success ? (
          'Droits attribués avec succès'
        ) : (
          'Obtenir les droits administrateur'
        )}
      </Button>

      {error && (
        <p className="mt-2 text-red-600 text-sm">
          {error}
        </p>
      )}

      {success && (
        <p className="mt-2 text-green-600 text-sm">
          Les droits administrateur ont été attribués avec succès. La page va se recharger.
        </p>
      )}
    </div>
  );
}; 