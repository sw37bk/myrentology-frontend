const { dbApi } = require('./db');

export default async function handler(req, res) {
  const { method } = req;
  
  if (method === 'GET') {
    const userId = parseInt(req.query.userId);
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    
    try {
      const settings = await dbApi.getAvitoSettings(userId);
      if (!settings) {
        return res.status(404).json({ error: 'Settings not found' });
      }
      
      return res.json(settings);
    } catch (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Database error' });
    }
  }
  
  if (method === 'POST') {
    const { userId, clientId, clientSecret, webhookUrl, isActive } = req.body;
    
    if (!userId || !clientId || !clientSecret) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    try {
      const settings = await dbApi.saveAvitoSettings(userId, {
        client_id: clientId,
        client_secret: clientSecret,
        is_connected: isActive !== false
      });
      
      return res.json(settings);
    } catch (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Database error' });
    }
  }
  
  res.status(405).json({ error: 'Method not allowed' });
}