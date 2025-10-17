export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { client_id, client_secret } = req.body;
  
  if (!client_id || !client_secret) {
    return res.status(400).json({ error: 'client_id and client_secret are required' });
  }
  
  try {
    const response = await fetch('https://api.avito.ru/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: client_id,
        client_secret: client_secret
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      return res.json(data);
    } else {
      const error = await response.json();
      return res.status(400).json(error);
    }
  } catch (error) {
    return res.status(500).json({ error: 'Failed to get access token' });
  }
}