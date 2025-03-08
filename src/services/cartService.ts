import { CartItem, Product } from '../types/ecommerce';

interface LocalCartItem extends CartItem {
  product: Product;
}

const SHIPPING_FEE = 1000; // Frais de livraison fixe

export const cartService = {
  getCartId(): string {
    let cartId = localStorage.getItem('cartId');
    if (!cartId) {
      cartId = 'cart_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('cartId', cartId);
    }
    return cartId;
  },

  getCartItems(): LocalCartItem[] {
    const items = localStorage.getItem('cartItems');
    return items ? JSON.parse(items) : [];
  },

  addToCart(item: LocalCartItem) {
    const items = this.getCartItems();
    const existingItemIndex = items.findIndex(i => i.productId === item.productId);

    if (existingItemIndex > -1) {
      items[existingItemIndex].quantity += item.quantity;
    } else {
      items.push(item);
    }

    localStorage.setItem('cartItems', JSON.stringify(items));
  },

  updateQuantity(productId: string, quantity: number) {
    const items = this.getCartItems();
    const itemIndex = items.findIndex(i => i.productId === productId);

    if (itemIndex > -1) {
      if (quantity <= 0) {
        items.splice(itemIndex, 1);
      } else {
        items[itemIndex].quantity = quantity;
      }
      localStorage.setItem('cartItems', JSON.stringify(items));
    }
  },

  removeFromCart(productId: string) {
    const items = this.getCartItems().filter(i => i.productId !== productId);
    localStorage.setItem('cartItems', JSON.stringify(items));
  },

  clearCart() {
    localStorage.removeItem('cartItems');
    localStorage.removeItem('cartId');
  },

  getCartTotal(): number {
    const subtotal = this.getCartItems().reduce((total, item) => total + (item.price * item.quantity), 0);
    return subtotal > 0 ? subtotal + SHIPPING_FEE : 0;
  },

  getSubtotal(): number {
    return this.getCartItems().reduce((total, item) => total + (item.price * item.quantity), 0);
  },

  getShippingFee(): number {
    return this.getCartItems().length > 0 ? SHIPPING_FEE : 0;
  },

  getItemCount(): number {
    return this.getCartItems().reduce((count, item) => count + item.quantity, 0);
  }
}; 