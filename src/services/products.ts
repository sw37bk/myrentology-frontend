import type { Product } from '../types';
import { mockProducts } from './mockData';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

let products: Product[] = [...mockProducts];
let nextId = Math.max(...products.map(p => p.id)) + 1;

export const productsApi = {
  getList: async (): Promise<Product[]> => {
    await delay(300);
    return [...products];
  },

  create: async (data: Omit<Product, 'id'>): Promise<Product> => {
    await delay(500);
    const newProduct: Product = {
      ...data,
      id: nextId++,
    };
    products.push(newProduct);
    return newProduct;
  },

  update: async (id: number, data: Partial<Product>): Promise<Product> => {
    await delay(500);
    const index = products.findIndex(product => product.id === id);
    if (index === -1) {
      throw new Error('Product not found');
    }
    products[index] = { ...products[index], ...data };
    return products[index];
  },

  delete: async (id: number): Promise<void> => {
    await delay(500);
    const index = products.findIndex(product => product.id === id);
    if (index === -1) {
      throw new Error('Product not found');
    }
    products.splice(index, 1);
  },
};