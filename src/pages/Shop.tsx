import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, ShoppingCart, Star, ChevronDown, AlertCircle, X } from 'lucide-react';
import { ecommerceService } from '../services/ecommerceService';
import { Product, Category } from '../types/ecommerce';
import { useDebounce } from '../hooks/useDebounce';
import CloudinaryImage from '../components/CloudinaryImage';
import { formatPrice } from '../utils/formatters';
import { useNavigate } from 'react-router-dom';
import { cartService } from '../services/cartService';
import FloatingCart from '../components/FloatingCart';

const Shop = () => {
  console.log('Shop component initialized'); // Log d'initialisation

  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [activeFilters, setActiveFilters] = useState({
    priceRange: [0, 1000],
    rating: 0,
    inStock: false,
    showFilters: false
  });
  const [cartTotal, setCartTotal] = useState(0);
  const [cartItemCount, setCartItemCount] = useState(0);
  
  const debouncedSearch = useDebounce(searchQuery, 500);

  useEffect(() => {
    console.log('Starting initial data fetch'); // Log début du chargement
    const fetchInitialData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        console.log('Fetching products and categories...'); // Log avant l'appel API
        const [productsData, categoriesData] = await Promise.all([
          ecommerceService.getProducts(),
          ecommerceService.getCategories()
        ]);
        console.log('Products received:', productsData); // Log des données reçues
        console.log('Categories received:', categoriesData);
        setProducts(productsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Detailed error during initial load:', error); // Log détaillé de l'erreur
        setError('Une erreur est survenue lors du chargement des produits. Veuillez réessayer.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const productsData = await ecommerceService.getProducts(
          selectedCategory,
          currentPage,
          debouncedSearch
        );
        if (currentPage === 1) {
          setProducts(productsData);
        } else {
          setProducts(prev => [...prev, ...productsData]);
        }
        setHasMore(productsData.length === 12);
      } catch (error) {
        console.error('Erreur lors de la recherche:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory, currentPage, debouncedSearch]);

  useEffect(() => {
    const updateCart = () => {
      setCartTotal(cartService.getCartTotal());
      setCartItemCount(cartService.getItemCount());
    };

    updateCart();
    window.addEventListener('cart-updated', updateCart);

    return () => {
      window.removeEventListener('cart-updated', updateCart);
    };
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
  };

  const handleLoadMore = () => {
    setCurrentPage(prev => prev + 1);
  };

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation(); // Empêche la navigation vers la page détail
    
    cartService.addToCart({
      productId: product.id,
      quantity: 1,
      price: product.price,
      product
    });

    // Déclencher l'événement de mise à jour du panier
    document.dispatchEvent(new Event('cartUpdated'));
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header de la boutique */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            Notre Boutique
          </h1>

          {/* Zone de recherche et filtres */}
          <div className="bg-gray-50 rounded-2xl p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Barre de recherche */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rechercher
                </label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Rechercher un produit..."
                    value={searchQuery}
                    onChange={handleSearch}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none bg-white"
                  />
                </div>
              </div>

              {/* Sélecteur de catégorie */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catégorie
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none bg-white appearance-none"
                >
                  <option value="">Toutes les catégories</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtres avancés */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filtres
                </label>
                <button
                  onClick={() => setActiveFilters(prev => ({
                    ...prev,
                    showFilters: !prev.showFilters
                  }))}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors bg-white"
                >
                  <span className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-gray-400" />
                    Filtres avancés
                  </span>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${
                    activeFilters.showFilters ? 'rotate-180' : ''
                  }`} />
                </button>
              </div>
            </div>

            {/* Panneau de filtres avancés */}
            <AnimatePresence>
              {activeFilters.showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 pt-6 border-t border-gray-200">
                    {/* Filtre de prix */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fourchette de prix (FCFA)
                      </label>
                      <div className="flex items-center gap-4">
                        <div className="relative flex-1">
                          <input
                            type="number"
                            placeholder="Min"
                            value={activeFilters.priceRange[0]}
                            onChange={(e) => setActiveFilters(prev => ({
                              ...prev,
                              priceRange: [parseInt(e.target.value) || 0, prev.priceRange[1]]
                            }))}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none bg-white"
                          />
                        </div>
                        <span className="text-gray-500">à</span>
                        <div className="relative flex-1">
                          <input
                            type="number"
                            placeholder="Max"
                            value={activeFilters.priceRange[1]}
                            onChange={(e) => setActiveFilters(prev => ({
                              ...prev,
                              priceRange: [prev.priceRange[0], parseInt(e.target.value) || 1000000]
                            }))}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none bg-white"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Filtre de note */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Note minimale
                      </label>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <button
                            key={rating}
                            onClick={() => setActiveFilters(prev => ({
                              ...prev,
                              rating: prev.rating === rating ? 0 : rating
                            }))}
                            className={`p-1 rounded transition-colors ${
                              activeFilters.rating >= rating
                                ? 'text-yellow-400'
                                : 'text-gray-300 hover:text-gray-400'
                            }`}
                          >
                            <Star className="w-6 h-6" fill="currentColor" />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Filtre de stock */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Disponibilité
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="inStock"
                          checked={activeFilters.inStock}
                          onChange={(e) => setActiveFilters(prev => ({
                            ...prev,
                            inStock: e.target.checked
                          }))}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="inStock" className="text-sm text-gray-700">
                          En stock uniquement
                        </label>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Résumé des filtres actifs */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            {selectedCategory && (
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm">
                {categories.find(c => c.id === selectedCategory)?.name}
                <button
                  onClick={() => handleCategoryChange('')}
                  className="hover:text-blue-900"
                >
                  <X className="w-4 h-4" />
                </button>
              </span>
            )}
            {activeFilters.rating > 0 && (
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-50 text-yellow-700 text-sm">
                {activeFilters.rating}+ étoiles
                <button
                  onClick={() => setActiveFilters(prev => ({ ...prev, rating: 0 }))}
                  className="hover:text-yellow-900"
                >
                  <X className="w-4 h-4" />
                </button>
              </span>
            )}
            {activeFilters.inStock && (
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 text-green-700 text-sm">
                En stock uniquement
                <button
                  onClick={() => setActiveFilters(prev => ({ ...prev, inStock: false }))}
                  className="hover:text-green-900"
                >
                  <X className="w-4 h-4" />
                </button>
              </span>
            )}
            {(activeFilters.priceRange[0] > 0 || activeFilters.priceRange[1] < 1000000) && (
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-sm">
                {formatPrice(activeFilters.priceRange[0])} - {formatPrice(activeFilters.priceRange[1])}
                <button
                  onClick={() => setActiveFilters(prev => ({
                    ...prev,
                    priceRange: [0, 1000000]
                  }))}
                  className="hover:text-purple-900"
                >
                  <X className="w-4 h-4" />
                </button>
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {error ? (
          <div className="flex flex-col items-center justify-center p-8 bg-red-50 rounded-xl">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <p className="text-red-700 text-center">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Réessayer
            </button>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar des catégories */}
            <div className="lg:w-64 space-y-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="font-semibold text-lg mb-4">Catégories</h2>
                <div className="space-y-2">
                  {categories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryChange(category.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-blue-50 text-blue-600'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="font-semibold text-lg mb-4">Filtres</h2>
                
                {/* Prix */}
                <div className="mb-6">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Prix
                  </label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="1000"
                      value={activeFilters.priceRange[1]}
                      onChange={(e) => setActiveFilters(prev => ({
                        ...prev,
                        priceRange: [prev.priceRange[0], parseInt(e.target.value)]
                      }))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>0 FCFA</span>
                      <span>{activeFilters.priceRange[1]} FCFA</span>
                    </div>
                  </div>
                </div>

                {/* Note minimale */}
                <div className="mb-6">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Note minimale
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => setActiveFilters(prev => ({
                          ...prev,
                          rating
                        }))}
                        className={`p-1 rounded ${
                          activeFilters.rating === rating
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      >
                        <Star className="w-5 h-5" fill="currentColor" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* En stock uniquement */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="inStock"
                    checked={activeFilters.inStock}
                    onChange={(e) => setActiveFilters(prev => ({
                      ...prev,
                      inStock: e.target.checked
                    }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="inStock" className="text-sm text-gray-700">
                    En stock uniquement
                  </label>
                </div>
              </div>
            </div>

            {/* Grille de produits */}
            <div className="flex-1">
              {isLoading && currentPage === 1 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white rounded-xl shadow-sm p-4 animate-pulse">
                      <div className="w-full h-48 bg-gray-200 rounded-lg mb-4" />
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => navigate(`/shop/products/${product.id}`)}
                      >
                        <div className="relative">
                          <CloudinaryImage
                            publicId={product.imageUrl}
                            alt={product.name}
                            type="product"
                            className="w-full h-48"
                          />
                          {!product.inStock && (
                            <div className="absolute top-2 right-2 bg-red-500 text-white text-sm px-2 py-1 rounded">
                              Rupture de stock
                            </div>
                          )}
                        </div>
                        
                        <div className="p-4">
                          <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                            {product.description}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold text-gray-900">
                              {formatPrice(product.price)}
                            </span>
                            <button 
                              className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
                              onClick={(e) => handleAddToCart(product, e)}
                            >
                              <ShoppingCart className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {hasMore && (
                    <div className="mt-8 text-center">
                      <button
                        onClick={handleLoadMore}
                        disabled={isLoading}
                        className="bg-white border border-gray-200 px-6 py-3 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center gap-2 mx-auto"
                      >
                        {isLoading ? (
                          <div className="w-5 h-5 border-2 border-gray-600/20 border-t-gray-600 rounded-full animate-spin" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                        Charger plus
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bouton flottant du panier */}
      <AnimatePresence>
        {cartItemCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 right-8 z-50"
          >
            <button
              onClick={() => navigate('/checkout')}
              className="bg-blue-600 text-white px-6 py-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center gap-3"
            >
              <div className="relative">
                <ShoppingCart className="w-6 h-6" />
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {cartItemCount}
                </span>
              </div>
              <span className="font-medium">{formatPrice(cartTotal)}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <FloatingCart />
    </div>
  );
};

export default Shop; 
//