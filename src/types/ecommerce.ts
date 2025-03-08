export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  subcategory?: string;
  features: string[];
  inStock: boolean;
  rating: number;
  reviews: Review[];
  specifications: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  subcategories: Subcategory[];
}

export interface Subcategory {
  id: string;
  name: string;
  description: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface CartItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: Address;
  paymentMethod: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  fullName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
}

export interface GuestOrder extends Omit<Order, 'userId'> {
  email: string;
  orderNumber: string;
}

export interface ShippingAddress {
  fullName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
}

export interface GuestOrderInput {
  email: string;
  items: CartItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: 'card' | 'cash';
}

export interface OrderConfirmation {
  orderNumber: string;
  email: string;
  total: number;
  items: CartItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: 'card' | 'cash';
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered';
  createdAt: string;
} 
// 