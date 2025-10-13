import type { Product, Booking, CalendarEvent } from '../types';

export const mockProducts: Product[] = [
  {
    id: 1,
    name: 'Дрель Bosch GSB 120',
    description: 'Мощная дрель для строительных работ',
    price: 800,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    name: 'Шуруповерт Makita DDF453',
    description: 'Беспроводной шуруповерт с аккумулятором',
    price: 1200,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 3,
    name: 'Бензопила Stihl MS 180',
    description: 'Профессиональная бензопила для садовых работ',
    price: 2500,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
  },
];

const today = new Date();
const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
const dayAfter = new Date(today.getTime() + 48 * 60 * 60 * 1000);

export const mockBookings: Booking[] = [
  {
    id: 1,
    product: mockProducts[0],
    customer_name: 'Иван Иванов',
    customer_phone: '+79991234567',
    start_date: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0).toISOString(),
    end_date: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 0).toISOString(),
    status: 'confirmed',
  },
  {
    id: 2,
    product: mockProducts[1],
    customer_name: 'Петр Петров',
    customer_phone: '+79997654321',
    start_date: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 14, 0).toISOString(),
    end_date: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 17, 0).toISOString(),
    status: 'pending',
  },
  {
    id: 3,
    product: mockProducts[2],
    customer_name: 'Сергей Сидоров',
    customer_phone: '+79995554433',
    start_date: new Date(dayAfter.getFullYear(), dayAfter.getMonth(), dayAfter.getDate(), 10, 0).toISOString(),
    end_date: new Date(dayAfter.getFullYear(), dayAfter.getMonth(), dayAfter.getDate(), 15, 0).toISOString(),
    status: 'confirmed',
  },
];

export const getMockCalendarEvents = (): CalendarEvent[] => {
  return mockBookings.map(booking => ({
    id: booking.id,
    title: `${booking.product.name} - ${booking.customer_name}`,
    start: new Date(booking.start_date),
    end: new Date(booking.end_date),
    resource: booking,
  }));
};