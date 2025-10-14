import { AvitoAnalytics, ResourceFunnel } from '../types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Моковые данные аналитики
const mockAnalytics: AvitoAnalytics[] = [
  {
    item_id: '2847563921',
    views: 1250,
    contacts: 89,
    favorites: 156,
    messages: 45,
    conversion_rate: 3.6,
    period: '7d'
  },
  {
    item_id: '2847563922',
    views: 890,
    contacts: 67,
    favorites: 98,
    messages: 32,
    conversion_rate: 3.6,
    period: '7d'
  }
];

const mockFunnels: ResourceFunnel[] = [
  {
    resource_id: 1,
    resource_name: 'BMW X5 2020',
    avito_item_id: '2847563921',
    views: 1250,
    messages: 45,
    bookings: 8,
    conversion_views_to_messages: 3.6,
    conversion_messages_to_bookings: 17.8,
    total_conversion: 0.64
  },
  {
    resource_id: 2,
    resource_name: 'Mercedes E-Class',
    avito_item_id: '2847563922',
    views: 890,
    messages: 32,
    bookings: 5,
    conversion_views_to_messages: 3.6,
    conversion_messages_to_bookings: 15.6,
    total_conversion: 0.56
  }
];

export const avitoAnalyticsApi = {
  // Получение аналитики по объявлению
  getItemAnalytics: async (itemId: string): Promise<AvitoAnalytics> => {
    await delay(500);
    const analytics = mockAnalytics.find(a => a.item_id === itemId);
    if (!analytics) throw new Error('Analytics not found');
    return analytics;
  },

  // Получение воронки по всем ресурсам
  getResourcesFunnel: async (): Promise<ResourceFunnel[]> => {
    await delay(600);
    return mockFunnels;
  },

  // Получение воронки по конкретному ресурсу
  getResourceFunnel: async (resourceId: number): Promise<ResourceFunnel> => {
    await delay(400);
    const funnel = mockFunnels.find(f => f.resource_id === resourceId);
    if (!funnel) throw new Error('Funnel not found');
    return funnel;
  },

  // Синхронизация аналитики с Авито API
  syncAnalytics: async (userCredentials: { client_id: string; access_token: string }): Promise<void> => {
    await delay(1000);
    // Здесь будет реальный вызов к Avito API
    // const response = await fetch('https://api.avito.ru/core/v1/items/stats', {
    //   headers: {
    //     'Authorization': `Bearer ${userCredentials.access_token}`,
    //     'Client-Id': userCredentials.client_id
    //   }
    // });
    console.log('Синхронизация аналитики с Авито...');
  }
};