// Сервис для работы с Avito API через наш бэкенд
export class AvitoApiService {
  private userId: number;

  constructor(userId: number) {
    this.userId = userId;
  }

  // Универсальный метод для запросов к Avito API
  private async makeRequest(endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', data?: any) {
    const response = await fetch('/api/avito-api', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_id: this.userId,
        endpoint,
        method,
        data
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Ошибка API');
    }

    return response.json();
  }

  // Получить список объявлений
  async getItems(params?: { per_page?: number; page?: number }) {
    const queryParams = new URLSearchParams(params as any).toString();
    return this.makeRequest(`/core/v1/items${queryParams ? '?' + queryParams : ''}`);
  }

  // Получить сообщения
  async getMessages(params?: { per_page?: number; page?: number }) {
    const queryParams = new URLSearchParams(params as any).toString();
    return this.makeRequest(`/messenger/v1/chats${queryParams ? '?' + queryParams : ''}`);
  }

  // Отправить сообщение
  async sendMessage(chatId: string, message: string) {
    return this.makeRequest(`/messenger/v1/chats/${chatId}/messages`, 'POST', {
      message: { text: message },
      type: 'text'
    });
  }

  // Получить статистику объявлений
  async getItemStats(itemId: string, dateFrom: string, dateTo: string) {
    return this.makeRequest(`/stats/v1/accounts/items/${itemId}/daily?date_from=${dateFrom}&date_to=${dateTo}`);
  }

  // Получить информацию о пользователе
  async getUserInfo() {
    return this.makeRequest('/core/v1/accounts/self');
  }
}