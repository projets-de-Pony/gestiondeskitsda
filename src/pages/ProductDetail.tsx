import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Star, ChevronLeft, Minus, Plus, Check } from 'lucide-react';
import { ecommerceService } from '../services/ecommerceService';
import { Product } from '../types/ecommerce';
import { formatPrice } from '../utils/formatters';
import CloudinaryImage from '../components/CloudinaryImage';
import { Badge } from '../components/ui/badge';
import { cartService } from '../services/cartService';
import FloatingCart from '../components/FloatingCart';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    if (!id) return;
    
    try {
      const data = await ecommerceService.getProductById(id);
      setProduct(data);
    } catch (error) {
      console.error('Erreur lors du chargement du produit:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuantityChange = (delta: number) => {
    setQuantity(prev => Math.max(1, Math.min(prev + delta, 10)));
  };

  const handleAddToCart = async () => {
    if (!product) return;

    cartService.addToCart({
      productId: product.id,
      quantity,
      price: product.price,
      product
    });

    // Déclencher l'événement de mise à jour du panier
    document.dispatchEvent(new Event('cartUpdated'));
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-96 bg-gray-200 rounded-xl mb-8" />
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4" />
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-8" />
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
              </div>
              <div className="space-y-4">
                <div className="h-12 bg-gray-200 rounded w-full" />
                <div className="h-12 bg-gray-200 rounded w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Produit non trouvé</h1>
          <button
            onClick={() => navigate('/shop')}
            className="mt-4 text-blue-600 hover:text-blue-700 flex items-center gap-2 mx-auto"
          >
            <ChevronLeft className="w-5 h-5" />
            Retour à la boutique
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/shop')}
          className="text-gray-600 hover:text-gray-900 flex items-center gap-2 mb-8"
        >
          <ChevronLeft className="w-5 h-5" />
          Retour à la boutique
        </button>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Image du produit */}
          <div className="relative aspect-square rounded-xl overflow-hidden bg-white">
            <CloudinaryImage
              publicId={product.imageUrl}
              alt={product.name}
              type="detail"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Informations du produit */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <div className="flex items-center gap-4">
                <span className="text-2xl font-bold text-gray-900">
                  {formatPrice(product.price)}
                </span>
                <Badge variant={product.inStock ? "default" : "destructive"}>
                  {product.inStock ? "En stock" : "Rupture de stock"}
                </Badge>
              </div>
            </div>

            <p className="text-gray-600">{product.description}</p>

            {/* Caractéristiques */}
            {product.features.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Caractéristiques</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  {product.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Spécifications */}
            {Object.keys(product.specifications).length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Spécifications</h2>
                <dl className="grid grid-cols-2 gap-4">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key}>
                      <dt className="text-sm font-medium text-gray-500">{key}</dt>
                      <dd className="text-gray-900">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {/* Sélecteur de quantité et bouton d'ajout au panier */}
            {product.inStock && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-700">Quantité</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Ajouter au panier
                </button>
              </div>
            )}

            {/* Note et avis */}
            {product.reviews.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Avis clients</h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < product.rating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      ({product.reviews.length} avis)
                    </span>
                  </div>

                  <div className="space-y-4">
                    {product.reviews.map((review) => (
                      <div key={review.id} className="border-b border-gray-200 pb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {review.userName}
                          </span>
                        </div>
                        <p className="text-gray-600">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Message de succès */}
      {showSuccess && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 right-4 bg-green-100 text-green-800 px-4 py-3 rounded-xl flex items-center gap-2 shadow-lg"
        >
          <Check className="w-5 h-5" />
          Produit ajouté au panier avec succès !
        </motion.div>
      )}

      <FloatingCart />
    </div>
  );
};

export default ProductDetail; 