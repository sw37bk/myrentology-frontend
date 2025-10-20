// Avito Settings API v2.0
const avitoSettings = new Map();

export default async function handler(req, res) {
  const { method } = req;
  
  if (method === 'GET') {
    const userId = parseInt(req.query.userId);
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    
    const settings = avitoSettings.get(userId);
    if (!settings) {
      return res.status(404).json({ error: 'Settings not found' });
    }
    
    return res.json(settings);
  }
  
  if (method === 'POST') {
    const { userId, clientId, clientSecret, isActive } = req.body;
    
    if (!userId || !clientId || !clientSecret) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const settings = {
      id: Date.now(),
      userId: userId,
      clientId: clientId,
      clientSecret: clientSecret,
      isConnected: isActive !== false,
      lastSync: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    avitoSettings.set(userId, settings);
    return res.json(settings);
  }
  
  res.status(405).json({ error: 'Method not allowed' });
}