import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';
import { Product } from '../pages/Cart/styles';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE
      await AsyncStorage.removeItem('@GoMarketplace:items');

      const carItems = await AsyncStorage.getItem('@GoMarketplace:items');

      // console.log(items);

      if (carItems) {
        setProducts(JSON.parse(carItems));
      }
      // console.log(products);
    }

    loadProducts();
  }, [products]);

  const increment = useCallback(
    async (id: string) => {
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART

      // verificar se o item já existe
      const idIndex = products.findIndex(it => it.id === id);

      if (idIndex >= 0) {
        const oldItem = products[idIndex];
        oldItem.quantity += 1;

        const newProducts = products.filter(item => item.id !== id);

        newProducts.splice(idIndex, 0, oldItem);

        await AsyncStorage.setItem(
          '@GoMarketplace:items',
          JSON.stringify(newProducts),
        );

        setProducts(newProducts);
      }
    },
    [products],
  );

  const decrement = useCallback(
    async (id: string) => {
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
      // verificar se o item já existe
      const idIndex = products.findIndex(it => it.id === id);

      if (idIndex >= 0) {
        const oldItem = products[idIndex];

        if (oldItem.quantity > 0) {
          oldItem.quantity -= 1;
        }

        const newProducts = products.filter(item => item.id !== id);

        newProducts.splice(idIndex, 0, oldItem);

        await AsyncStorage.setItem(
          '@GoMarketplace:items',
          JSON.stringify(newProducts),
        );

        setProducts(newProducts);
      }
    },
    [products],
  );

  const addToCart = useCallback(
    async product => {
      const idIndex = products.findIndex(it => it.id === product.id);

      if (idIndex >= 0) {
        await increment(product.id);
      } else {
        const { id, title, image_url, price } = product;

        const newProduct = { id, title, image_url, price, quantity: 1 };

        // console.log(newProduct);

        setProducts([...products, newProduct]);
        await AsyncStorage.setItem(
          '@GoMarketplace:items',
          JSON.stringify([...products, newProduct]),
        );
      }
    },
    [products, increment],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
