import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion } from 'framer-motion';
import { 
  Users, Calendar, Clock, Phone, Mail, ChevronLeft, ChevronRight, LogOut,
  Trash2, Filter, Printer, Check, X, Search, Download
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Registration {
  id: string;
  name: string;
  email: string;
  phone: string;
  experience: string;
  expectations: string;
  seats: number;
  present?: boolean;
  registrationDate: {
    seconds: number;
  };
}

const ITEMS_PER_PAGE = 10;

const AdminDashboard = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const navigate = useNavigate();

  const totalPages = Math.ceil(filteredRegistrations.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentRegistrations = filteredRegistrations.slice(startIndex, endIndex);

  useEffect(() => {
    const checkAuth = () => {
      const isAdmin = localStorage.getItem('isAdmin') === 'true';
      if (!isAdmin) {
        navigate('/', { replace: true });
        return false;
      }
      return true;
    };

    const fetchData = async () => {
      if (!checkAuth()) return;

      try {
        // Vérifier si db est initialisé correctement
        if (!db) {
          throw new Error("La connexion à Firebase n'est pas initialisée");
        }

        const registrationsRef = collection(db, 'conference_registrations');
        const q = query(registrationsRef, orderBy('registrationDate', 'desc'));

        // Première récupération des données
        try {
          const querySnapshot = await getDocs(q);
          console.log("Nombre de documents récupérés:", querySnapshot.size);
          
          const initialData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Registration[];
          
          setRegistrations(initialData);
          setIsLoading(false);
          setError(null);
        } catch (fetchError: any) {
          console.error("Erreur lors de la récupération des données:", fetchError);
          setError(`Erreur lors de la récupération des données: ${fetchError.message}`);
          setIsLoading(false);
          return;
        }

        // Mise en place de l'écouteur en temps réel
        const unsubscribe = onSnapshot(q, 
          (snapshot) => {
            console.log("Mise à jour en temps réel reçue");
            const registrationsData = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            })) as Registration[];
            setRegistrations(registrationsData);
            setError(null);
          },
          (snapshotError) => {
            console.error("Erreur de l'écouteur Firestore:", snapshotError);
            setError(`Erreur de connexion: ${snapshotError.message}`);
            setIsLoading(false);
          }
        );

        return () => {
          console.log("Nettoyage de l'écouteur");
          unsubscribe();
        };
      } catch (err: any) {
        console.error("Erreur générale:", err);
        setError(`Erreur de connexion: ${err.message}`);
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  useEffect(() => {
    // Filtrage des données
    let filtered = [...registrations];
    
    // Recherche par nom ou email
    if (searchTerm) {
      filtered = filtered.filter(reg => 
        reg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrage par date
    if (dateFilter) {
      const filterDate = new Date(dateFilter).setHours(0, 0, 0, 0);
      filtered = filtered.filter(reg => {
        const regDate = new Date(reg.registrationDate.seconds * 1000).setHours(0, 0, 0, 0);
        return regDate === filterDate;
      });
    }

    setFilteredRegistrations(filtered);
    setCurrentPage(1);
  }, [registrations, searchTerm, dateFilter]);

  // Fonction de suppression
  const handleDelete = async (ids: string[]) => {
    try {
      await Promise.all(ids.map(id => deleteDoc(doc(db, 'conference_registrations', id))));
      setSelectedItems([]);
      setShowDeleteConfirm(false);
    } catch (err) {
      console.error("Erreur lors de la suppression:", err);
      setError("Erreur lors de la suppression des inscriptions");
    }
  };

  // Fonction de mise à jour de la présence
  const handlePresenceUpdate = async (id: string, present: boolean) => {
    try {
      await updateDoc(doc(db, 'conference_registrations', id), { present });
    } catch (err) {
      console.error("Erreur lors de la mise à jour de la présence:", err);
      setError("Erreur lors de la mise à jour de la présence");
    }
  };

  // Fonction d'impression de la fiche de présence
  const handlePrint = () => {
    const printContent = document.createElement('div');
    printContent.innerHTML = `
      <h1 style="text-align: center; margin-bottom: 20px;">Fiche de Présence - Digital Academy</h1>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th style="border: 1px solid #ddd; padding: 8px;">Nom</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Email</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Téléphone</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Places</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Présent</th>
          </tr>
        </thead>
        <tbody>
          ${filteredRegistrations.map(reg => `
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">${reg.name}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${reg.email}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${reg.phone}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${reg.seats}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">□</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    const printWindow = window.open('', '_blank');
    printWindow?.document.write(`
      <html>
        <head>
          <title>Fiche de Présence</title>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    printWindow?.document.close();
    printWindow?.print();
  };

  // Export en CSV
  const handleExport = () => {
    const headers = ['Nom', 'Email', 'Téléphone', 'Places', 'Date d\'inscription', 'Présent'];
    const csvContent = [
      headers.join(','),
      ...filteredRegistrations.map(reg => [
        reg.name,
        reg.email,
        reg.phone,
        reg.seats,
        formatDate(reg.registrationDate.seconds),
        reg.present ? 'Oui' : 'Non'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `inscriptions_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/', { replace: true });
  };

  const handleRetry = () => {
    setIsLoading(true);
    setError(null);
    window.location.reload();
  };

  const formatDate = (seconds: number) => {
    const date = new Date(seconds * 1000);
    return new Intl.DateTimeFormat('fr-FR', {
      dateStyle: 'long',
      timeStyle: 'short'
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img 
                src="/DA_LOGO.png" 
                alt="Digital Academy Logo" 
                className="h-8 w-auto"
              />
              <h1 className="text-xl font-semibold text-gray-900">
                Dashboard Admin
              </h1>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-xl">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-gray-600">Total Inscriptions</p>
                <p className="text-2xl font-bold">{registrations.length}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-xl">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-gray-600">Places Réservées</p>
                <p className="text-2xl font-bold">
                  {registrations.reduce((acc, reg) => acc + reg.seats, 0)}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center gap-4">
              <div className="bg-purple-100 p-3 rounded-xl">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-gray-600">Dernière Inscription</p>
                <p className="text-lg font-semibold">
                  {registrations[0]?.registrationDate
                    ? formatDate(registrations[0].registrationDate.seconds)
                    : 'Aucune'}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Barre d'outils */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-8">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
                />
              </div>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>
            <div className="flex gap-4">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Printer className="w-5 h-5" />
                Imprimer
              </button>
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Download className="w-5 h-5" />
                Exporter
              </button>
              {selectedItems.length > 0 && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                  Supprimer ({selectedItems.length})
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Table des inscriptions */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold">Liste des Inscriptions</h2>
          </div>

          {isLoading ? (
            <div className="p-12 text-center">
              <div className="w-10 h-10 border-2 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Chargement des données...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Réessayer
              </button>
            </div>
          ) : filteredRegistrations.length === 0 ? (
            <div className="p-12 text-center text-gray-600">
              Aucune inscription ne correspond aux critères
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="w-8 px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedItems.length === currentRegistrations.length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedItems(currentRegistrations.map(reg => reg.id));
                            } else {
                              setSelectedItems([]);
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Nom</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Contact</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Places</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Date</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Présence</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {currentRegistrations.map((registration) => (
                      <motion.tr
                        key={registration.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(registration.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedItems([...selectedItems, registration.id]);
                              } else {
                                setSelectedItems(selectedItems.filter(id => id !== registration.id));
                              }
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{registration.name}</div>
                          <div className="text-gray-500 text-sm truncate max-w-xs">
                            {registration.experience}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Mail className="w-4 h-4" />
                            {registration.email}
                          </div>
                          <div className="flex items-center gap-2 text-gray-600 mt-1">
                            <Phone className="w-4 h-4" />
                            {registration.phone}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            {registration.seats} place{registration.seats > 1 ? 's' : ''}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-500">
                          {formatDate(registration.registrationDate.seconds)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handlePresenceUpdate(registration.id, true)}
                              className={`p-1 rounded-full ${registration.present === true ? 'bg-green-100 text-green-600' : 'hover:bg-gray-100'}`}
                            >
                              <Check className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handlePresenceUpdate(registration.id, false)}
                              className={`p-1 rounded-full ${registration.present === false ? 'bg-red-100 text-red-600' : 'hover:bg-gray-100'}`}
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Précédent
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {currentPage} sur {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Suivant
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Modal de confirmation de suppression */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Confirmer la suppression</h3>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer {selectedItems.length} inscription{selectedItems.length > 1 ? 's' : ''} ?
              Cette action est irréversible.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDelete(selectedItems)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard; 