// Хранилище для callback'ов (в production лучше использовать Redis)
const linkCallbacks = new Map();

export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Получаем callback от бота
    const callbackData = req.body;
    
    // Сохраняем результат связывания
    if (callbackData.userId) {
      linkCallbacks.set(callbackData.userId, {
        ...callbackData,
        timestamp: Date.now()
      });
    }
    
    return res.json({ success: true });
  }
  
  if (req.method === 'GET') {
    // Проверяем статус связывания для пользователя
    const userId = parseInt(req.url.split('userId=')[1]);
    
    if (linkCallbacks.has(userId)) {
      const data = linkCallbacks.get(userId);
      // Удаляем после получения
      linkCallbacks.delete(userId);
      return res.json(data);
    }
    
    return res.json({ pending: true });
  }
  
  res.status(404).json({ error: 'Not found' });
}