import { Injectable } from '@angular/core';
import { Order } from '../models/order.model';
import { MOCK_ORDERS } from '../data/mock-orders';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly STORAGE_KEY = 'dx_orders';

  constructor() {}

  /**
   * Get all orders (localStorage + mock data)
   */
  getOrders(): Order[] {
    const savedOrders = this.loadFromStorage();
    // Merge saved orders with mock orders, saved orders first
    return [...savedOrders, ...MOCK_ORDERS];
  }

  /**
   * Save a new order to localStorage
   */
  saveOrder(order: Order): void {
    const orders = this.loadFromStorage();
    orders.unshift(order); // Add to beginning
    this.saveToStorage(orders);
  }

  /**
   * Generate a unique order ID
   */
  generateOrderId(): number {
    const allOrders = this.getOrders();
    if (allOrders.length === 0) return 600000;
    const maxId = Math.max(...allOrders.map(o => o.id));
    return maxId + 1;
  }

  /**
   * Load orders from localStorage
   */
  private loadFromStorage(): Order[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) return [];
      return JSON.parse(data) as Order[];
    } catch (error) {
      console.error('Error loading orders from localStorage:', error);
      return [];
    }
  }

  /**
   * Save orders to localStorage
   */
  private saveToStorage(orders: Order[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(orders));
    } catch (error) {
      console.error('Error saving orders to localStorage:', error);
    }
  }

  /**
   * Clear all saved orders (for testing)
   */
  clearSavedOrders(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}
