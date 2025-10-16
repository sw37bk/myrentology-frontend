interface AvitoAdData {
  title: string;
  description: string;
  price: number;
  category_id: number;
  location_id: number;
  images: string[];
  contact_phone: string;
  contact_name: string;
  params: {
    make?: string;
    model?: string;
    year?: number;
    transmission?: string;
    fuel_type?: string;
    body_type?: string;
  };
}

interface AvitoAdResponse {
  id: string;
  status: string;
  url: string;
}

export const avitoAdsApi = {
  // Создание объявления на Авито
  createAd: async (adData: AvitoAdData, credentials: { client_id: string; access_token: string }): Promise<AvitoAdResponse> => {
    const response = await fetch('https://api.avito.ru/core/v1/items', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${credentials.access_token}`,
        'Client-Id': credentials.client_id,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(adData)
    });

    if (!response.ok) {
      throw new Error('Ошибка создания объявления');
    }

    return await response.json();
  },

  // Получение статистики объявления
  getAdStats: async (itemId: string, credentials: { client_id: string; access_token: string }) => {
    const response = await fetch(`https://api.avito.ru/core/v1/items/${itemId}/stats`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${credentials.access_token}`,
        'Client-Id': credentials.client_id
      }
    });

    if (!response.ok) {
      throw new Error('Ошибка получения статистики');
    }

    return await response.json();
  },

  // Обновление объявления
  updateAd: async (itemId: string, adData: Partial<AvitoAdData>, credentials: { client_id: string; access_token: string }) => {
    const response = await fetch(`https://api.avito.ru/core/v1/items/${itemId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${credentials.access_token}`,
        'Client-Id': credentials.client_id,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(adData)
    });

    if (!response.ok) {
      throw new Error('Ошибка обновления объявления');
    }

    return await response.json();
  },

  // Получение категорий Авито
  getCategories: async () => {
    // Моковые категории для автомобилей
    return [
      { id: 9, name: 'Транспорт' },
      { id: 10, name: 'Легковые автомобили' },
      { id: 11, name: 'Мотоциклы и мототехника' },
      { id: 12, name: 'Грузовики и спецтехника' }
    ];
  },

  // Получение регионов
  getLocations: async () => {
    return [
      { id: 637640, name: 'Москва' },
      { id: 641780, name: 'Санкт-Петербург' },
      { id: 637680, name: 'Московская область' },
      { id: 641490, name: 'Ленинградская область' }
    ];
  }
};