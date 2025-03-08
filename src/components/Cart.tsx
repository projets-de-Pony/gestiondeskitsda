import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Trash2, Plus, Minus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CartItem, Product } from '../types/ecommerce';
import { formatPrice } from '../utils/formatters';
import CloudinaryImage from './CloudinaryImage';
import { cartService } from '../services/cartService';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
}

interface LocalCartItem extends CartItem {
  product: Product;
}

const Cart: React.FC<CartProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [items, setItems] = useState<LocalCartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadCartItems();
    }
  }, [isOpen]);

  const loadCartItems = () => {
    setIsLoading(true);
    const cartItems = cartService.getCartItems();
    setItems(cartItems);
    setIsLoading(false);
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    const item = items.find(item => item.productId === productId);
    if (!item) return;

    const newQuantity = Math.max(0, item.quantity + delta);
    
    if (newQuantity === 0) {
      handleRemoveItem(productId);
    } else {
      cartService.updateQuantity(productId, newQuantity);
      loadCartItems();
      // Déclencher l'événement de mise à jour du panier
      document.dispatchEvent(new Event('cartUpdated'));
    }
  };

  const handleRemoveItem = (productId: string) => {
    cartService.removeFromCart(productId);
    loadCartItems();
    // Déclencher l'événement de mise à jour du panier
    document.dispatchEvent(new Event('cartUpdated'));
  };

  const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckout = () => {
    onClose(); // Fermer le panier
    navigate('/checkout'); // Rediriger vers la page de checkout
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="absolute top-0 right-0 h-full w-full max-w-md bg-white shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            {/* En-tête */}
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                <h2 className="text-lg font-semibold">Panier</h2>
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {items.length} articles
                </span>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Contenu */}
            <div className="h-[calc(100vh-180px)] overflow-y-auto p-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="w-8 h-8 border-2 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
                </div>
              ) : items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <ShoppingCart className="w-16 h-16 mb-4" />
                  <p>Votre panier est vide</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.productId}
                      className="flex gap-4 p-4 bg-white rounded-xl border border-gray-200"
                    >
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
                        <CloudinaryImage
                          publicId={item.product.imageUrl}
                          alt={item.product.name}
                          type="product"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{item.product.name}</h3>
                        <p className="text-sm text-gray-500 mb-2">{formatPrice(item.price)}</p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleUpdateQuantity(item.productId, -1)}
                              className="p-1 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <button
                              onClick={() => handleUpdateQuantity(item.productId, 1)}
                              className="p-1 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <button
                            onClick={() => handleRemoveItem(item.productId)}
                            className="text-red-600 hover:text-red-700 transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pied de page */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center text-gray-600">
                  <span>Sous-total</span>
                  <span>{formatPrice(cartService.getSubtotal())}</span>
                </div>
                <div className="flex justify-between items-center text-gray-600">
                  <span>Livraison</span>
                  <span>{formatPrice(cartService.getShippingFee())}</span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span>{formatPrice(cartService.getCartTotal())}</span>
                </div>
              </div>
              <button
                onClick={handleCheckout}
                disabled={items.length === 0}
                className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Commander
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Cart; 