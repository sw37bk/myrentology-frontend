import type { Booking, CalendarEvent } from '../types';
import { mockBookings, getMockCalendarEvents, mockProducts } from './mockData';
import { telegramApi } from './telegramService';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

let bookings: Booking[] = [...mockBookings];
let nextId = Math.max(...bookings.map(b => b.id)) + 1;

export const bookingsApi = {
  getList: async (): Promise<Booking[]> => {
    await delay(300);
    return [...bookings];
  },

  getCalendarEvents: async (): Promise<CalendarEvent[]> => {
    await delay(300);
    return bookings.map(booking => ({
      id: booking.id,
      title: `${booking.product.name} - ${booking.customer_name}`,
      start: new Date(booking.start_date),
      end: new Date(booking.end_date),
      resource: booking,
    }));
  },

  create: async (data: Omit<Booking, 'id' | 'product'> & { product_id: number }): Promise<Booking> => {
    await delay(500);
    
    const product = mockProducts.find(p => p.id === data.product_id);
    if (!product) {
      throw new Error('Product not found');
    }

    const newBooking: Booking = {
      id: nextId++,
      product: product,
      customer_name: data.customer_name,
      customer_phone: data.customer_phone,
      start_date: data.start_date,
      end_date: data.end_date,
      status: data.status || 'pending',
    };

    bookings.push(newBooking);
    
    // Отправляем уведомление админу
    try {
      await telegramApi.sendToAdmin(
        `🆕 Новое бронирование!\n\n` +
        `📦 Товар: ${product.name}\n` +
        `👤 Клиент: ${newBooking.customer_name}\n` +
        `📞 Телефон: ${newBooking.customer_phone}\n` +
        `📅 Период: ${new Date(newBooking.start_date).toLocaleDateString('ru-RU')} - ${new Date(newBooking.end_date).toLocaleDateString('ru-RU')}\n` +
        `💰 Цена: ${product.price}₽/день`
      );
    } catch (error) {
      console.log('Telegram notification failed:', error);
    }
    
    return newBooking;
  },

  update: async (id: number, data: Partial<Booking>): Promise<Booking> => {
    await delay(500);
    
    const index = bookings.findIndex(booking => booking.id === id);
    if (index === -1) {
      throw new Error('Booking not found');
    }

    const oldStatus = bookings[index].status;
    bookings[index] = { ...bookings[index], ...data };
    
    // Отправляем уведомление админу об отмене
    if (oldStatus !== 'cancelled' && data.status === 'cancelled') {
      try {
        await telegramApi.sendToAdmin(
          `❌ Бронирование отменено\n\n` +
          `📦 Товар: ${bookings[index].product.name}\n` +
          `👤 Клиент: ${bookings[index].customer_name}\n` +
          `📅 Период: ${new Date(bookings[index].start_date).toLocaleDateString('ru-RU')} - ${new Date(bookings[index].end_date).toLocaleDateString('ru-RU')}`
        );
      } catch (error) {
        console.log('Telegram notification failed:', error);
      }
    }
    
    return bookings[index];
  },

  delete: async (id: number): Promise<void> => {
    await delay(500);
    
    const index = bookings.findIndex(booking => booking.id === id);
    if (index === -1) {
      throw new Error('Booking not found');
    }
    
    bookings.splice(index, 1);
  },
};