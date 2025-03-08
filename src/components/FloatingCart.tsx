import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { cartService } from '../services/cartService';
import Cart from './Cart';
import { formatPrice } from '../utils/formatters';

const FloatingCart = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [itemCount, setItemCount] = useState(0);
  const [cartSubtotal, setCartSubtotal] = useState(0);
  const [shippingFee, setShippingFee] = useState(0);
  
  useEffect(() => {
    // Mettre à jour le compteur et le total initial
    updateCartInfo();

    // Écouter les changements du localStorage
    const handleStorageChange = () => {
      updateCartInfo();
    };

    window.addEventListener('storage', handleStorageChange);
    document.addEventListener('cartUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('cartUpdated', handleStorageChange);
    };
  }, []);

  const updateCartInfo = () => {
    setItemCount(cartService.getItemCount());
    setCartSubtotal(cartService.getSubtotal());
    setShippingFee(cartService.getShippingFee());
  };

  return (
    <>
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="fixed bottom-8 right-8 z-50"
      >
        <button
          onClick={() => setIsCartOpen(true)}
          className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors relative group"
        >
          <ShoppingBag className="w-6 h-6" />
          {itemCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
              {itemCount}
            </span>
          )}
          
          {/* Info bulle avec le total */}
          {itemCount > 0 && (
            <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="space-y-1">
                <div className="flex justify-between gap-4">
                  <span>Sous-total:</span>
                  <span>{formatPrice(cartSubtotal)}</span>
                </div>
                <div className="flex justify-between gap-4 text-gray-300 text-xs">
                  <span>Livraison:</span>
                  <span>{formatPrice(shippingFee)}</span>
                </div>
                <div className="flex justify-between gap-4 border-t border-gray-700 pt-1 font-medium">
                  <span>Total:</span>
                  <span>{formatPrice(cartSubtotal + shippingFee)}</span>
                </div>
              </div>
            </div>
          )}
        </button>
      </motion.div>

      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />
    </>
  );
};

export default FloatingCart; 