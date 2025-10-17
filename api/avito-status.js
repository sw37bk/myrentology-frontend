export default async function handler(req, res) {
  // Простая проверка статуса без зависимости от базы данных
  res.json({ 
    status: 'ok',
    message: 'API работает',
    timestamp: new Date().toISOString()
  });
}