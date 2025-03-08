import { collection, addDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { GuestOrder, GuestOrderInput, OrderConfirmation } from '../types/ecommerce';
import { cartService } from './cartService';
import emailjs from '@emailjs/browser';
import { formatPrice } from '../utils/formatters';

class OrderService {
  private generateOrderNumber(): string {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 5);
    return `DA-${timestamp}-${randomStr}`.toUpperCase();
  }

  async createGuestOrder(input: GuestOrderInput): Promise<OrderConfirmation> {
    try {
      // Créer la commande dans Firebase
      const orderData = {
        orderNumber: this.generateOrderNumber(),
        email: input.email.toLowerCase(),
        items: input.items,
        total: cartService.getCartTotal(),
        shippingAddress: input.shippingAddress,
        paymentMethod: input.paymentMethod,
        status: 'pending',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      // Sauvegarder dans Firebase
      const docRef = await addDoc(collection(db, 'orders'), orderData);

      // Préparer les données pour l'email
      const emailData = {
        to_email: 'digitalacademy2368@gmail.com', // Email admin
        client_email: orderData.email,
        order_number: orderData.orderNumber,
        client_name: orderData.shippingAddress.fullName,
        client_phone: orderData.shippingAddress.phone,
        delivery_address: `${orderData.shippingAddress.street}, ${orderData.shippingAddress.city}, ${orderData.shippingAddress.state}`,
        total_amount: formatPrice(orderData.total),
        items_list: orderData.items.map(item => 
          `${item.product.name} (${item.quantity}x) - ${formatPrice(item.price * item.quantity)}`
        ).join('\\n')
      };

      // Envoyer l'email de notification à l'admin
      await emailjs.send(
        'service_ghtlizb',
        'template_du2k4wr', // Template spécifique pour les commandes
        emailData,
        'crYUSQa5L2mSWQPIX'
      );

      // Vider le panier
      cartService.clearCart();

      return {
        ...orderData,
        createdAt: orderData.createdAt.toDate().toISOString()
      };
    } catch (error) {
      console.error('Erreur lors de la création de la commande:', error);
      throw error;
    }
  }

  async getGuestOrder(orderNumber: string, email: string): Promise<GuestOrder | null> {
    try {
      const q = query(
        collection(db, 'orders'),
        where('orderNumber', '==', orderNumber),
        where('email', '==', email.toLowerCase())
      );

      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        return null;
      }

      const orderData = snapshot.docs[0].data() as GuestOrder;
      return orderData;
    } catch (error) {
      console.error('Erreur lors de la récupération de la commande:', error);
      throw error;
    }
  }
}

export const orderService = new OrderService(); 