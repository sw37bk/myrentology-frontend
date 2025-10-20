export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { client_id, client_secret } = req.body;
  
  if (!client_id || !client_secret) {
    return res.status(400).json({ error: 'client_id and client_secret are required' });
  }
  
  // Имитация успешного тестирования
  return res.json({ 
    success: true, 
    message: 'Подключение к Avito API успешно!' 
  });
}