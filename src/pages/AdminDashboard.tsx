import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion } from 'framer-motion';
import { 
  Users, Calendar, Clock, Phone, Mail, ChevronLeft, ChevronRight, LogOut,
  Trash2, Filter, Printer, Check, X, Search, Download, Package, Home, ShoppingBag,
  LayoutGrid, Tags, Eye, Edit2, CreditCard, User
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

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

interface Order {
  id: string;
  orderNumber: string;
  email: string;
  items: Array<{
    product: {
      name: string;
    };
    quantity: number;
    price: number;
  }>;
  total: number;
  shippingAddress: {
    fullName: string;
    street: string;
    city: string;
    state: string;
    phone: string;
  };
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: {
    seconds: number;
  };
}

interface OrderDetails {
  id: string;
  orderNumber: string;
  email: string;
  items: Array<{
    product: {
      name: string;
      imageUrl?: string;
    };
    quantity: number;
    price: number;
  }>;
  total: number;
  shippingAddress: {
    fullName: string;
    street: string;
    city: string;
    state: string;
    phone: string;
  };
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: {
    seconds: number;
  };
}

const ITEMS_PER_PAGE = 10;

const AdminDashboard = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'registrations' | 'orders'>('registrations');
  const [orderSearchTerm, setOrderSearchTerm] = useState('');
  const [orderDateFilter, setOrderDateFilter] = useState('');
  const [filteredRegistrations, setFilteredRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showOrderEdit, setShowOrderEdit] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<OrderDetails | null>(null);
  const [editingOrder, setEditingOrder] = useState<OrderDetails | null>(null);
  const navigate = useNavigate();

  const totalPages = Math.ceil(filteredRegistrations.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentRegistrations = filteredRegistrations.slice(startIndex, endIndex);

  // Statistiques des commandes
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const pendingOrders = orders.filter(order => order.status === 'pending').length;

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

  useEffect(() => {
    const fetchOrders = async () => {
      if (!db) return;

      const ordersRef = collection(db, 'orders');
      const q = query(ordersRef, orderBy('createdAt', 'desc'));

      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          const ordersData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Order[];
          setOrders(ordersData);
        },
        (error) => {
          console.error("Erreur lors de la récupération des commandes:", error);
          setError(`Erreur: ${error.message}`);
        }
      );

      return () => unsubscribe();
    };

    fetchOrders();
  }, []);

  useEffect(() => {
    // Filtrage des commandes
    let filtered = [...orders];
    
    if (orderSearchTerm) {
      filtered = filtered.filter(order => 
        order.orderNumber.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
        order.email.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
        order.shippingAddress.fullName.toLowerCase().includes(orderSearchTerm.toLowerCase())
      );
    }

    if (orderDateFilter) {
      const filterDate = new Date(orderDateFilter).setHours(0, 0, 0, 0);
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.createdAt.seconds * 1000).setHours(0, 0, 0, 0);
        return orderDate === filterDate;
      });
    }

    setFilteredOrders(filtered);
  }, [orders, orderSearchTerm, orderDateFilter]);

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

  const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { 
        status: newStatus,
        updatedAt: new Date()
      });
    } catch (err) {
      console.error("Erreur lors de la mise à jour du statut:", err);
      setError("Erreur lors de la mise à jour du statut de la commande");
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

  // Ajouter la fonction d'export des commandes
  const handleExportOrders = () => {
    const headers = ['Numéro', 'Client', 'Email', 'Téléphone', 'Adresse', 'Total', 'Statut', 'Date'];
    const csvContent = [
      headers.join(','),
      ...filteredOrders.map(order => [
        order.orderNumber,
        order.shippingAddress.fullName,
        order.email,
        order.shippingAddress.phone,
        `${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state}`,
        order.total,
        order.status,
        formatDate(order.createdAt.seconds)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `commandes_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Ajouter la fonction d'impression des commandes
  const handlePrintOrders = () => {
    const printContent = document.createElement('div');
    printContent.innerHTML = `
      <h1 style="text-align: center; margin-bottom: 20px;">Liste des Commandes - Digital Academy</h1>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th style="border: 1px solid #ddd; padding: 8px;">Numéro</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Client</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Total</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Statut</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Date</th>
          </tr>
        </thead>
        <tbody>
          ${filteredOrders.map(order => `
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">${order.orderNumber}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${order.shippingAddress.fullName}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF' }).format(order.total)}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${order.status}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${formatDate(order.createdAt.seconds)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    const printWindow = window.open('', '_blank');
    printWindow?.document.write(`
      <html>
        <head>
          <title>Liste des Commandes</title>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    printWindow?.document.close();
    printWindow?.print();
  };

  // Ajouter ces nouvelles fonctions après handlePrintOrders
  const handleViewDetails = (order: Order) => {
    setCurrentOrder(order);
    setShowOrderDetails(true);
  };

  const handleEdit = (order: Order) => {
    setEditingOrder(order);
    setShowOrderEdit(true);
  };

  const handleUpdateOrder = async () => {
    if (!editingOrder) return;

    try {
      await updateDoc(doc(db, 'orders', editingOrder.id), {
        shippingAddress: editingOrder.shippingAddress,
        status: editingOrder.status,
        updatedAt: new Date()
      });
      setShowOrderEdit(false);
      setEditingOrder(null);
    } catch (err) {
      console.error("Erreur lors de la mise à jour de la commande:", err);
      setError("Erreur lors de la mise à jour de la commande");
    }
  };

  const handleDeleteOrders = async () => {
    try {
      await Promise.all(selectedOrders.map(id => deleteDoc(doc(db, 'orders', id))));
      setSelectedOrders([]);
      setShowDeleteConfirm(false);
    } catch (err) {
      console.error("Erreur lors de la suppression:", err);
      setError("Erreur lors de la suppression des commandes");
    }
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
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('registrations')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                activeTab === 'registrations' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Users size={20} />
              <span>Inscriptions</span>
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                activeTab === 'orders' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <ShoppingBag size={20} />
              <span>Commandes</span>
            </button>
            <Link
              to="/admin/products"
              className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              <Package size={20} />
              <span>Produits</span>
            </Link>
            <Link
              to="/admin/categories"
              className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              <Tags size={20} />
              <span>Catégories</span>
            </Link>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
          >
            <LogOut size={20} />
            <span>Déconnexion</span>
          </button>
        </div>
      </nav>

      <main className="container mx-auto py-8">
        {activeTab === 'registrations' ? (
          <>
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
          </>
        ) : (
          <>
            {/* Stats des commandes */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl shadow-sm p-6"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 p-3 rounded-xl">
                    <ShoppingBag className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-gray-600">Total Commandes</p>
                    <p className="text-2xl font-bold">{totalOrders}</p>
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
                    <CreditCard className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-gray-600">Chiffre d'affaires</p>
                    <p className="text-2xl font-bold">
                      {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF' }).format(totalRevenue)}
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
                  <div className="bg-yellow-100 p-3 rounded-xl">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-gray-600">En attente</p>
                    <p className="text-2xl font-bold">{pendingOrders}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-xl shadow-sm p-6"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-purple-100 p-3 rounded-xl">
                    <Package className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-gray-600">Expédiées</p>
                    <p className="text-2xl font-bold">
                      {orders.filter(order => order.status === 'shipped').length}
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
                      value={orderSearchTerm}
                      onChange={(e) => setOrderSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
                    />
                  </div>
                  <input
                    type="date"
                    value={orderDateFilter}
                    onChange={(e) => setOrderDateFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-200 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={handlePrintOrders}
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <Printer className="w-5 h-5" />
                    Imprimer
                  </button>
                  <button
                    onClick={handleExportOrders}
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <Download className="w-5 h-5" />
                    Exporter
                  </button>
                </div>
              </div>
            </div>

            {/* Table des commandes */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold">Liste des Commandes</h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="w-8 px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedOrders.length === filteredOrders.length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedOrders(filteredOrders.map(order => order.id));
                            } else {
                              setSelectedOrders([]);
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Numéro</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Client</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Total</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Date</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Statut</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredOrders.map((order) => (
                      <motion.tr
                        key={order.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedOrders.includes(order.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedOrders([...selectedOrders, order.id]);
                              } else {
                                setSelectedOrders(selectedOrders.filter(id => id !== order.id));
                              }
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-medium text-gray-900">{order.orderNumber}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{order.shippingAddress.fullName}</div>
                          <div className="text-gray-500 text-sm">{order.email}</div>
                          <div className="text-gray-500 text-sm">{order.shippingAddress.phone}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-medium text-gray-900">
                            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF' }).format(order.total)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-500">
                          {formatDate(order.createdAt.seconds)}
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusUpdate(order.id, e.target.value as Order['status'])}
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              {
                                pending: 'bg-yellow-100 text-yellow-800',
                                processing: 'bg-blue-100 text-blue-800',
                                shipped: 'bg-purple-100 text-purple-800',
                                delivered: 'bg-green-100 text-green-800',
                                cancelled: 'bg-red-100 text-red-800',
                              }[order.status]
                            }`}
                          >
                            <option value="pending">En attente</option>
                            <option value="processing">En traitement</option>
                            <option value="shipped">Expédiée</option>
                            <option value="delivered">Livrée</option>
                            <option value="cancelled">Annulée</option>
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewDetails(order)}
                              className="p-1 rounded-lg hover:bg-gray-100 text-blue-600"
                              title="Voir les détails"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleEdit(order)}
                              className="p-1 rounded-lg hover:bg-gray-100 text-green-600"
                              title="Modifier"
                            >
                              <Edit2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Modal de confirmation de suppression */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Confirmer la suppression</h3>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer {selectedOrders.length} commande{selectedOrders.length > 1 ? 's' : ''} ?
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
                onClick={handleDeleteOrders}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal des détails de la commande */}
      {showOrderDetails && currentOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Détails de la commande</h3>
              <button
                onClick={() => setShowOrderDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Informations générales */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Numéro de commande</p>
                  <p className="font-medium">{currentOrder.orderNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium">{formatDate(currentOrder.createdAt.seconds)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Statut</p>
                  <p className={`inline-flex px-2 py-1 rounded-full text-sm font-medium ${
                    {
                      pending: 'bg-yellow-100 text-yellow-800',
                      processing: 'bg-blue-100 text-blue-800',
                      shipped: 'bg-purple-100 text-purple-800',
                      delivered: 'bg-green-100 text-green-800',
                      cancelled: 'bg-red-100 text-red-800',
                    }[currentOrder.status]
                  }`}>
                    {
                      {
                        pending: 'En attente',
                        processing: 'En traitement',
                        shipped: 'Expédiée',
                        delivered: 'Livrée',
                        cancelled: 'Annulée',
                      }[currentOrder.status]
                    }
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="font-medium">
                    {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF' }).format(currentOrder.total)}
                  </p>
                </div>
              </div>

              {/* Informations client */}
              <div>
                <h4 className="font-medium mb-2">Informations client</h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <p className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    {currentOrder.shippingAddress.fullName}
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    {currentOrder.email}
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    {currentOrder.shippingAddress.phone}
                  </p>
                  <p className="flex items-center gap-2">
                    <Home className="w-4 h-4 text-gray-400" />
                    {currentOrder.shippingAddress.street}, {currentOrder.shippingAddress.city}, {currentOrder.shippingAddress.state}
                  </p>
                </div>
              </div>

              {/* Articles */}
              <div>
                <h4 className="font-medium mb-2">Articles commandés</h4>
                <div className="border rounded-lg divide-y">
                  {currentOrder.items.map((item, index) => (
                    <div key={index} className="p-4 flex justify-between items-center">
                      <div>
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-sm text-gray-500">Quantité: {item.quantity}</p>
                      </div>
                      <p className="font-medium">
                        {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF' }).format(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de modification de la commande */}
      {showOrderEdit && editingOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Modifier la commande</h3>
              <button
                onClick={() => setShowOrderEdit(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Informations de livraison */}
              <div>
                <h4 className="font-medium mb-4">Informations de livraison</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom complet
                    </label>
                    <input
                      type="text"
                      value={editingOrder.shippingAddress.fullName}
                      onChange={(e) => setEditingOrder({
                        ...editingOrder,
                        shippingAddress: {
                          ...editingOrder.shippingAddress,
                          fullName: e.target.value
                        }
                      })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Téléphone
                    </label>
                    <input
                      type="text"
                      value={editingOrder.shippingAddress.phone}
                      onChange={(e) => setEditingOrder({
                        ...editingOrder,
                        shippingAddress: {
                          ...editingOrder.shippingAddress,
                          phone: e.target.value
                        }
                      })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Adresse
                    </label>
                    <input
                      type="text"
                      value={editingOrder.shippingAddress.street}
                      onChange={(e) => setEditingOrder({
                        ...editingOrder,
                        shippingAddress: {
                          ...editingOrder.shippingAddress,
                          street: e.target.value
                        }
                      })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ville
                    </label>
                    <input
                      type="text"
                      value={editingOrder.shippingAddress.city}
                      onChange={(e) => setEditingOrder({
                        ...editingOrder,
                        shippingAddress: {
                          ...editingOrder.shippingAddress,
                          city: e.target.value
                        }
                      })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Région
                    </label>
                    <input
                      type="text"
                      value={editingOrder.shippingAddress.state}
                      onChange={(e) => setEditingOrder({
                        ...editingOrder,
                        shippingAddress: {
                          ...editingOrder.shippingAddress,
                          state: e.target.value
                        }
                      })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowOrderEdit(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleUpdateOrder}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Enregistrer les modifications
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard; 