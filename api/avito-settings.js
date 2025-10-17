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
      
      // Маппинг для совместимости с фронтендом
      const mappedSettings = {
        id: settings.id,
        userId: settings.user_id,
        clientId: settings.client_id,
        clientSecret: settings.client_secret,
        accessToken: settings.access_token,
        refreshToken: settings.refresh_token,
        isConnected: settings.is_connected,
        lastSync: settings.last_sync,
        createdAt: settings.created_at,
        updatedAt: settings.updated_at
      };
      
      return res.json(mappedSettings);
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
      
      // Маппинг для совместимости с фронтендом
      const mappedSettings = {
        id: settings.id,
        userId: settings.user_id,
        clientId: settings.client_id,
        clientSecret: settings.client_secret,
        accessToken: settings.access_token,
        refreshToken: settings.refresh_token,
        isConnected: settings.is_connected,
        lastSync: settings.last_sync,
        createdAt: settings.created_at,
        updatedAt: settings.updated_at
      };
      
      return res.json(mappedSettings);
    } catch (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Database error' });
    }
  }
  
  res.status(405).json({ error: 'Method not allowed' });
}