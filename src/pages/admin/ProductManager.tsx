import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, Edit, Trash2, Search, ArrowUp, ArrowDown, 
  Save, X, Upload, AlertCircle, Check, Image as ImageIcon,
  Filter, RefreshCcw, Download, Printer
} from 'lucide-react';
import { ecommerceService } from '../../services/ecommerceService';
import { cloudinaryService } from '../../services/cloudinaryService';
import { Product, Category } from '../../types/ecommerce';
import { formatPrice } from '../../utils/formatters';
import CloudinaryImage from '../../components/CloudinaryImage';
import AdminNavbar from '../../components/AdminNavbar';

const ITEMS_PER_PAGE = 10;

const ProductManager = () => {
  // États existants
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Nouveaux états pour la pagination et le filtrage
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<keyof Product>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filters, setFilters] = useState({
    category: '',
    stockStatus: 'all',
    priceRange: { min: 0, max: Infinity }
  });
  const [showFilters, setShowFilters] = useState(false);

  // Ajouter l'état isSubmitting
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [productsData, categoriesData] = await Promise.all([
        ecommerceService.getProducts(),
        ecommerceService.getCategories()
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      setError("Erreur lors du chargement des données");
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction de filtrage des produits
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !filters.category || product.category === filters.category;
    const matchesStock = filters.stockStatus === 'all' ? true :
      filters.stockStatus === 'inStock' ? product.inStock : !product.inStock;
    const matchesPrice = Number(product.price) >= filters.priceRange.min && 
      (filters.priceRange.max === Infinity || Number(product.price) <= filters.priceRange.max);
    
    return matchesSearch && matchesCategory && matchesStock && matchesPrice;
  });

  // Fonction de tri des produits
  const sortedProducts = [...filteredProducts].sort((a: Product, b: Product) => {
    if (!sortField) return 0;
    
    const aValue = a[sortField]?.toString() || '';
    const bValue = b[sortField]?.toString() || '';
    const direction = sortDirection === 'asc' ? 1 : -1;
    
    return aValue < bValue ? -1 * direction : aValue > bValue ? 1 * direction : 0;
  });

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Statistiques
  const totalProducts = products.length;
  const totalInStock = products.filter(p => p.inStock).length;
  const totalOutOfStock = totalProducts - totalInStock;
  const totalValue = products.reduce((sum, p) => sum + p.price, 0);

  // Handlers
  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    const newProduct = {
      name: '',
      description: '',
      price: 0,
      imageUrl: '',
      category: '',
      features: [],
      inStock: true,
      rating: 0,
      reviews: [],
      specifications: {},
      createdAt: new Date(),
      updatedAt: new Date()
    } satisfies Omit<Product, 'id'>;
    
    setEditingProduct(newProduct);
    setIsModalOpen(true);
  };

  const handleDelete = async (productId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return;

    try {
      await ecommerceService.deleteProduct(productId);
      setProducts(products.filter(p => p.id !== productId));
      setSuccess('Produit supprimé avec succès');
    } catch (error) {
      setError('Erreur lors de la suppression du produit');
    }
  };

  const handleSort = (field: keyof Product) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleExport = () => {
    const csv = [
      ['Nom', 'Description', 'Prix', 'Stock', 'Catégorie'].join(','),
      ...filteredProducts.map(p => [
        p.name,
        p.description,
        p.price,
        p.inStock,
        categories.find(c => c.id === p.category)?.name || 'Non catégorisé'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'produits.csv';
    link.click();
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || isSubmitting) return;

    setIsSubmitting(true);
    try {
      if ('id' in editingProduct && editingProduct.id) {
        const productToUpdate = {
          ...editingProduct,
          name: editingProduct.name || '',
          description: editingProduct.description || '',
          imageUrl: editingProduct.imageUrl || '',
          category: editingProduct.category || ''
        };
        await ecommerceService.updateProduct(editingProduct.id, productToUpdate);
        setSuccess('Produit mis à jour avec succès');
      } else {
        const productToCreate: Omit<Product, 'id'> = {
          name: editingProduct.name || '',
          description: editingProduct.description || '',
          price: editingProduct.price || 0,
          imageUrl: editingProduct.imageUrl || '',
          category: editingProduct.category || '',
          features: editingProduct.features || [],
          inStock: editingProduct.inStock ?? true,
          rating: editingProduct.rating || 0,
          reviews: editingProduct.reviews || [],
          specifications: editingProduct.specifications || {},
          createdAt: new Date(),
          updatedAt: new Date()
        };
        await ecommerceService.createProduct(productToCreate);
        setSuccess('Produit créé avec succès');
      }
      
      fetchData();
      setIsModalOpen(false);
    } catch (error) {
      setError('Erreur lors de l\'enregistrement du produit');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* En-tête avec statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-sm font-medium text-gray-500">Total Produits</h3>
              <p className="mt-2 text-3xl font-semibold text-gray-900">{totalProducts}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-sm font-medium text-gray-500">En Stock</h3>
              <p className="mt-2 text-3xl font-semibold text-green-600">{totalInStock}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-sm font-medium text-gray-500">En Rupture</h3>
              <p className="mt-2 text-3xl font-semibold text-red-600">{totalOutOfStock}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-sm font-medium text-gray-500">Valeur Totale</h3>
              <p className="mt-2 text-3xl font-semibold text-blue-600">{formatPrice(totalValue)}</p>
            </div>
          </div>

          {/* Barre d'actions */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <button
                onClick={handleCreate}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Nouveau Produit
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                <Filter className="w-5 h-5" />
                Filtres
              </button>
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <button
                onClick={handleExport}
                className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                <Download className="w-5 h-5" />
                Exporter
              </button>
              <button
                onClick={handlePrint}
                className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                <Printer className="w-5 h-5" />
                Imprimer
              </button>
              <button
                onClick={fetchData}
                className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                <RefreshCcw className="w-5 h-5" />
                Actualiser
              </button>
            </div>
          </div>

          {/* Panneau de filtres */}
          {showFilters && (
            <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Catégorie
                  </label>
                  <select
                    value={filters.category}
                    onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}
                    className="w-full rounded-lg border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Toutes les catégories</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    État du stock
                  </label>
                  <select
                    value={filters.stockStatus}
                    onChange={e => setFilters(f => ({ ...f, stockStatus: e.target.value }))}
                    className="w-full rounded-lg border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="all">Tous</option>
                    <option value="inStock">En stock</option>
                    <option value="outOfStock">Rupture de stock</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fourchette de prix
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={filters.priceRange.min}
                      onChange={e => setFilters(f => ({
                        ...f,
                        priceRange: { ...f.priceRange, min: Number(e.target.value) }
                      }))}
                      className="w-full rounded-lg border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Min"
                    />
                    <span>-</span>
                    <input
                      type="number"
                      value={filters.priceRange.max === Infinity ? '' : filters.priceRange.max}
                      onChange={e => setFilters(f => ({
                        ...f,
                        priceRange: { ...f.priceRange, max: e.target.value ? Number(e.target.value) : Infinity }
                      }))}
                      className="w-full rounded-lg border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Max"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Barre de recherche */}
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher un produit..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>
          </div>

          {/* Tableau des produits */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Image
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center gap-2">
                        Nom
                        {sortField === 'name' && (
                          sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('price')}
                    >
                      <div className="flex items-center gap-2">
                        Prix
                        {sortField === 'price' && (
                          sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('inStock')}
                    >
                      <div className="flex items-center gap-2">
                        Stock
                        {sortField === 'inStock' && (
                          sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Catégorie
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-16 h-16 rounded-lg overflow-hidden">
                          <CloudinaryImage
                            publicId={product.imageUrl}
                            alt={product.name}
                            type="product"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500 line-clamp-1">{product.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatPrice(product.price)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {product.inStock ? 'En stock' : 'Rupture'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {categories.find(c => c.id === product.category)?.name || 'Non catégorisé'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Précédent
                  </button>
                  <button
                    onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Suivant
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Affichage de{' '}
                      <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span>
                      {' '}à{' '}
                      <span className="font-medium">
                        {Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length)}
                      </span>
                      {' '}sur{' '}
                      <span className="font-medium">{filteredProducts.length}</span>
                      {' '}résultats
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        Précédent
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === page
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      <button
                        onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        Suivant
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal d'édition/création */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">
                  {'id' in (editingProduct || {}) ? 'Modifier le produit' : 'Nouveau produit'}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image du produit
                  </label>
                  <div className="flex items-center gap-4">
                    {editingProduct?.imageUrl && editingProduct?.name && (
                      <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100">
                        <CloudinaryImage
                          publicId={editingProduct.imageUrl}
                          alt={editingProduct.name}
                          type="product"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              const publicId = await cloudinaryService.uploadImage(file);
                              setEditingProduct(prev => ({
                                ...prev!,
                                imageUrl: publicId
                              }));
                            } catch (error) {
                              setError('Erreur lors du téléchargement de l\'image');
                            }
                          }
                        }}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom du produit
                  </label>
                  <input
                    type="text"
                    value={editingProduct?.name || ''}
                    onChange={(e) => setEditingProduct(prev => ({
                      ...prev!,
                      name: e.target.value
                    }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={editingProduct?.description || ''}
                    onChange={(e) => setEditingProduct(prev => ({
                      ...prev!,
                      description: e.target.value
                    }))}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prix
                  </label>
                  <input
                    type="number"
                    value={editingProduct?.price || 0}
                    onChange={(e) => setEditingProduct(prev => ({
                      ...prev!,
                      price: Number(e.target.value)
                    }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
                    required
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catégorie
                  </label>
                  <select
                    value={editingProduct?.category || ''}
                    onChange={(e) => setEditingProduct(prev => ({
                      ...prev!,
                      category: e.target.value
                    }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
                    required
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    État du stock
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={editingProduct?.inStock === true}
                        onChange={() => setEditingProduct(prev => ({
                          ...prev!,
                          inStock: true
                        }))}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      En stock
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={editingProduct?.inStock === false}
                        onChange={() => setEditingProduct(prev => ({
                          ...prev!,
                          inStock: false
                        }))}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      Rupture
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-4 mt-8">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        Enregistrement...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Enregistrer
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}

      {/* Messages de notification */}
      {(error || success) && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg ${
          error ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
        }`}>
          <div className="flex items-center gap-2">
            {error ? (
              <AlertCircle className="w-5 h-5" />
            ) : (
              <Check className="w-5 h-5" />
            )}
            <span>{error || success}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManager;
//