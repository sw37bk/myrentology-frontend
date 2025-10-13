import type { FinancialStats, BookingWithRevenue, RevenueByResource, PeriodFilter, RevenueChartData } from '../types';
import { mockBookings } from './mockData';
import { productsApi } from './products';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getDaysCount = (start: string, end: string): number => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const calculateRevenue = (price: number, start: string, end: string): number => {
  const days = getDaysCount(start, end);
  return price * days;
};

export const financeApi = {
  getStats: async (filter?: PeriodFilter): Promise<FinancialStats> => {
    await delay(400);
    
    let filteredBookings = [...mockBookings];
    
    if (filter?.start_date && filter?.end_date) {
      filteredBookings = filteredBookings.filter(booking => {
        const bookingDate = new Date(booking.start_date);
        const startDate = new Date(filter.start_date);
        const endDate = new Date(filter.end_date);
        return bookingDate >= startDate && bookingDate <= endDate;
      });
    }
    
    if (filter?.resource_id) {
      filteredBookings = filteredBookings.filter(booking => 
        booking.product.id === filter.resource_id
      );
    }

    const revenueBookings = filteredBookings.filter(booking => 
      booking.status === 'confirmed' || booking.status === 'completed'
    );

    const totalRevenue = revenueBookings.reduce((sum, booking) => {
      return sum + calculateRevenue(booking.product.price, booking.start_date, booking.end_date);
    }, 0);

    const totalBookings = revenueBookings.length;
    const averageCheck = totalBookings > 0 ? totalRevenue / totalBookings : 0;

    const resources = await productsApi.getList();
    const activeResources = resources.filter(r => r.is_active).length;

    return {
      total_revenue: totalRevenue,
      total_bookings: totalBookings,
      average_check: averageCheck,
      active_resources: activeResources,
      revenue_trend: 12.5,
      bookings_trend: 8.3,
    };
  },

  getBookingsWithRevenue: async (filter?: PeriodFilter): Promise<BookingWithRevenue[]> => {
    await delay(300);

    let filteredBookings = [...mockBookings];
    
    if (filter?.start_date && filter?.end_date) {
      filteredBookings = filteredBookings.filter(booking => {
        const bookingDate = new Date(booking.start_date);
        const startDate = new Date(filter.start_date);
        const endDate = new Date(filter.end_date);
        return bookingDate >= startDate && bookingDate <= endDate;
      });
    }
    
    if (filter?.resource_id) {
      filteredBookings = filteredBookings.filter(booking => 
        booking.product.id === filter.resource_id
      );
    }

    return filteredBookings.map(booking => ({
      ...booking,
      revenue: calculateRevenue(booking.product.price, booking.start_date, booking.end_date),
      days_count: getDaysCount(booking.start_date, booking.end_date),
    }));
  },

  getRevenueByResource: async (filter?: PeriodFilter): Promise<RevenueByResource[]> => {
    await delay(400);

    const bookingsWithRevenue = await financeApi.getBookingsWithRevenue(filter);
    
    const resourceMap = new Map<number, RevenueByResource>();
    
    bookingsWithRevenue.forEach(booking => {
      if (booking.status === 'confirmed' || booking.status === 'completed') {
        const existing = resourceMap.get(booking.product.id);
        
        if (existing) {
          existing.revenue += booking.revenue;
          existing.booking_count += 1;
        } else {
          resourceMap.set(booking.product.id, {
            resource_id: booking.product.id,
            resource_name: booking.product.name,
            revenue: booking.revenue,
            booking_count: 1,
          });
        }
      }
    });

    return Array.from(resourceMap.values()).sort((a, b) => b.revenue - a.revenue);
  },

  getRevenueChartData: async (filter?: PeriodFilter): Promise<RevenueChartData[]> => {
    await delay(500);

    const bookingsWithRevenue = await financeApi.getBookingsWithRevenue(filter);
    
    const dayMap = new Map<string, RevenueChartData>();
    
    bookingsWithRevenue.forEach(booking => {
      if (booking.status === 'confirmed' || booking.status === 'completed') {
        const date = new Date(booking.start_date).toISOString().split('T')[0];
        
        const existing = dayMap.get(date);
        if (existing) {
          existing.revenue += booking.revenue;
          existing.bookings += 1;
        } else {
          dayMap.set(date, {
            date,
            revenue: booking.revenue,
            bookings: 1,
          });
        }
      }
    });

    return Array.from(dayMap.values())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-30);
  },
};