import { collection, query, where, getDocs, addDoc, updateDoc, doc, deleteDoc, orderBy, limit, startAfter, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product, Category, Order, CartItem } from '../types/ecommerce';

const PRODUCTS_PER_PAGE = 12;

export const ecommerceService = {
  // Produits
  async getProducts(categoryId?: string, page: number = 1, searchQuery?: string) {
    console.log('getProducts called with:', { categoryId, page, searchQuery });
    try {
      if (!db) {
        console.error('Firebase DB not initialized!');
        throw new Error("La connexion à Firebase n'est pas initialisée");
      }

      let q = collection(db, 'products');
      console.log('Base query created');
      
      if (categoryId) {
        q = query(q, where('category', '==', categoryId));
        console.log('Category filter added');
      }
      
      if (searchQuery) {
        q = query(q, where('name', '>=', searchQuery), where('name', '<=', searchQuery + '\uf8ff'));
        console.log('Search filter added');
      }
      
      q = query(q, orderBy('createdAt', 'desc'), limit(PRODUCTS_PER_PAGE));
      console.log('Final query created with ordering and pagination');
      
      if (page > 1) {
        const lastVisible = await this.getLastVisibleProduct(page);
        if (lastVisible) {
          q = query(q, startAfter(lastVisible));
          console.log('Pagination cursor added');
        }
      }
      
      console.log('Executing Firestore query...');
      const snapshot = await getDocs(q);
      console.log('Query results received:', snapshot.size, 'documents');
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
    } catch (error: any) {
      console.error('Detailed error in getProducts:', error);
      throw new Error(
        error.code === 'permission-denied' 
          ? "Vous n'avez pas les permissions nécessaires pour accéder aux produits."
          : "Une erreur est survenue lors de la récupération des produits."
      );
    }
  },

  async getLastVisibleProduct(page: number) {
    const q = query(
      collection(db, 'products'),
      orderBy('createdAt', 'desc'),
      limit((page - 1) * PRODUCTS_PER_PAGE)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs[snapshot.docs.length - 1];
  },

  async searchProducts(query: string) {
    try {
      const q = query(
        collection(db, 'products'),
        where('name', '>=', query.toLowerCase()),
        where('name', '<=', query.toLowerCase() + '\uf8ff'),
        limit(10)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
    } catch (error) {
      console.error('Erreur lors de la recherche des produits:', error);
      throw error;
    }
  },

  // Catégories
  async getCategories() {
    try {
      if (!db) {
        throw new Error("La connexion à Firebase n'est pas initialisée");
      }

      const snapshot = await getDocs(collection(db, 'categories'));
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Category[];
    } catch (error: any) {
      console.error('Erreur lors de la récupération des catégories:', error);
      throw new Error(
        error.code === 'permission-denied'
          ? "Vous n'avez pas les permissions nécessaires pour accéder aux catégories."
          : "Une erreur est survenue lors de la récupération des catégories."
      );
    }
  },

  // Panier
  async addToCart(userId: string, item: CartItem) {
    try {
      const cartRef = collection(db, 'carts');
      const q = query(cartRef, where('userId', '==', userId));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        await addDoc(cartRef, {
          userId,
          items: [item],
          updatedAt: new Date()
        });
      } else {
        const cartDoc = snapshot.docs[0];
        const cart = cartDoc.data();
        const existingItemIndex = cart.items.findIndex((i: CartItem) => i.productId === item.productId);
        
        if (existingItemIndex > -1) {
          cart.items[existingItemIndex].quantity += item.quantity;
        } else {
          cart.items.push(item);
        }
        
        await updateDoc(doc(db, 'carts', cartDoc.id), {
          items: cart.items,
          updatedAt: new Date()
        });
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout au panier:', error);
      throw error;
    }
  },

  // Commandes
  async createOrder(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const orderData = {
        ...order,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'pending' as const
      };
      
      const docRef = await addDoc(collection(db, 'orders'), orderData);
      return { id: docRef.id, ...orderData };
    } catch (error) {
      console.error('Erreur lors de la création de la commande:', error);
      throw error;
    }
  },

  // Créer un nouveau produit
  async createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const productData = {
        ...product,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const docRef = await addDoc(collection(db, 'products'), productData);
      return { id: docRef.id, ...productData };
    } catch (error) {
      console.error('Erreur lors de la création du produit:', error);
      throw error;
    }
  },

  // Mettre à jour un produit
  async updateProduct(productId: string, product: Partial<Product>) {
    try {
      const productRef = doc(db, 'products', productId);
      await updateDoc(productRef, {
        ...product,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du produit:', error);
      throw error;
    }
  },

  // Supprimer un produit
  async deleteProduct(productId: string) {
    try {
      await deleteDoc(doc(db, 'products', productId));
    } catch (error) {
      console.error('Erreur lors de la suppression du produit:', error);
      throw error;
    }
  },

  // Créer une nouvelle catégorie
  async createCategory(category: Omit<Category, 'id'>) {
    try {
      const docRef = await addDoc(collection(db, 'categories'), category);
      return { id: docRef.id, ...category };
    } catch (error) {
      console.error('Erreur lors de la création de la catégorie:', error);
      throw error;
    }
  },

  // Mettre à jour une catégorie
  async updateCategory(categoryId: string, category: Partial<Category>) {
    try {
      const categoryRef = doc(db, 'categories', categoryId);
      await updateDoc(categoryRef, category);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la catégorie:', error);
      throw error;
    }
  },

  // Supprimer une catégorie
  async deleteCategory(categoryId: string) {
    try {
      await deleteDoc(doc(db, 'categories', categoryId));
    } catch (error) {
      console.error('Erreur lors de la suppression de la catégorie:', error);
      throw error;
    }
  },

  // Récupérer un produit par son ID
  async getProductById(id: string) {
    try {
      const docRef = doc(db, 'products', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Product;
      }
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération du produit:', error);
      throw error;
    }
  },

  // Fonctions de gestion du panier
  async getCartItems(userId: string) {
    try {
      const cartRef = collection(db, 'carts');
      const q = query(cartRef, where('userId', '==', userId));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        return [];
      }

      const cartDoc = snapshot.docs[0];
      const cartItems = cartDoc.data().items || [];

      // Récupérer les détails des produits
      const itemsWithProducts = await Promise.all(
        cartItems.map(async (item: CartItem) => {
          const product = await this.getProductById(item.productId);
          return { ...item, product };
        })
      );

      return itemsWithProducts;
    } catch (error) {
      console.error('Erreur lors de la récupération du panier:', error);
      throw error;
    }
  },

  async updateCartItemQuantity(userId: string, productId: string, quantity: number) {
    try {
      const cartRef = collection(db, 'carts');
      const q = query(cartRef, where('userId', '==', userId));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        throw new Error('Panier non trouvé');
      }

      const cartDoc = snapshot.docs[0];
      const cart = cartDoc.data();
      const items = cart.items || [];
      
      const itemIndex = items.findIndex((item: CartItem) => item.productId === productId);
      if (itemIndex > -1) {
        items[itemIndex].quantity = quantity;
      }

      await updateDoc(doc(db, 'carts', cartDoc.id), {
        items,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la quantité:', error);
      throw error;
    }
  },

  async removeFromCart(userId: string, productId: string) {
    try {
      const cartRef = collection(db, 'carts');
      const q = query(cartRef, where('userId', '==', userId));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        throw new Error('Panier non trouvé');
      }

      const cartDoc = snapshot.docs[0];
      const cart = cartDoc.data();
      const items = cart.items || [];
      
      const updatedItems = items.filter((item: CartItem) => item.productId !== productId);

      await updateDoc(doc(db, 'carts', cartDoc.id), {
        items: updatedItems,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Erreur lors de la suppression du produit:', error);
      throw error;
    }
  }
}; 