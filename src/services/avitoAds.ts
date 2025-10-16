import { avitoSettingsApi } from './avitoSettings';

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
  // Получение настроек API для пользователя
  getCredentials: async (userId: number) => {
    const settings = await avitoSettingsApi.getSettings(userId);
    if (!settings || !settings.is_connected) {
      throw new Error('Настройки API Авито не настроены');
    }
    return {
      client_id: settings.client_id,
      access_token: settings.access_token || ''
    };
  },

  // Создание объявления на Авито
  createAd: async (adData: AvitoAdData, userId: number): Promise<AvitoAdResponse> => {
    const credentials = await avitoAdsApi.getCredentials(userId);
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
  getAdStats: async (itemId: string, userId: number) => {
    const credentials = await avitoAdsApi.getCredentials(userId);
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
  updateAd: async (itemId: string, adData: Partial<AvitoAdData>, userId: number) => {
    const credentials = await avitoAdsApi.getCredentials(userId);
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
    return [
      { id: 9, name: 'Транспорт' },
      { id: 10, name: 'Легковые автомобили' },
      { id: 11, name: 'Мотоциклы и мототехника' },
      { id: 12, name: 'Грузовики и спецтехника' },
      { id: 13, name: 'Водный транспорт' },
      { id: 14, name: 'Запчасти и аксессуары' },
      { id: 15, name: 'Недвижимость' },
      { id: 16, name: 'Квартиры' },
      { id: 17, name: 'Комнаты' },
      { id: 18, name: 'Дома, дачи, коттеджи' },
      { id: 19, name: 'Земельные участки' },
      { id: 20, name: 'Гаражи и машиноместа' },
      { id: 21, name: 'Коммерческая недвижимость' },
      { id: 22, name: 'Недвижимость за рубежом' },
      { id: 23, name: 'Работа' },
      { id: 24, name: 'Вакансии' },
      { id: 25, name: 'Резюме' },
      { id: 26, name: 'Услуги' },
      { id: 27, name: 'Предложение услуг' },
      { id: 28, name: 'Запрос услуг' },
      { id: 29, name: 'Личные вещи' },
      { id: 30, name: 'Одежда, обувь, аксессуары' },
      { id: 31, name: 'Детская одежда и обувь' },
      { id: 32, name: 'Товары для детей и игрушки' },
      { id: 33, name: 'Часы и украшения' },
      { id: 34, name: 'Красота и здоровье' },
      { id: 35, name: 'Бытовая электроника' },
      { id: 36, name: 'Аудио и видео' },
      { id: 37, name: 'Игры, приставки и программы' },
      { id: 38, name: 'Настольные компьютеры' },
      { id: 39, name: 'Ноутбуки' },
      { id: 40, name: 'Оргтехника и расходники' },
      { id: 41, name: 'Планшеты и электронные книги' },
      { id: 42, name: 'Телефоны' },
      { id: 43, name: 'Товары для компьютера' },
      { id: 44, name: 'Фототехника' },
      { id: 45, name: 'Для дома и дачи' },
      { id: 46, name: 'Бытовая техника' },
      { id: 47, name: 'Мебель и интерьер' },
      { id: 48, name: 'Посуда и товары для кухни' },
      { id: 49, name: 'Продукты питания' },
      { id: 50, name: 'Ремонт и строительство' },
      { id: 51, name: 'Сад и огород' },
      { id: 52, name: 'Хобби и отдых' },
      { id: 53, name: 'Билеты и путешествия' },
      { id: 54, name: 'Велосипеды' },
      { id: 55, name: 'Книги и журналы' },
      { id: 56, name: 'Коллекционирование' },
      { id: 57, name: 'Музыкальные инструменты' },
      { id: 58, name: 'Охота и рыбалка' },
      { id: 59, name: 'Спорт и отдых' },
      { id: 60, name: 'Животные' },
      { id: 61, name: 'Собаки' },
      { id: 62, name: 'Кошки' },
      { id: 63, name: 'Птицы' },
      { id: 64, name: 'Аквариум' },
      { id: 65, name: 'Другие животные' },
      { id: 66, name: 'Товары для животных' },
      { id: 67, name: 'Бизнес и оборудование' },
      { id: 68, name: 'Готовый бизнес' },
      { id: 69, name: 'Оборудование для бизнеса' }
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