const { dbApi } = require('./db');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }
  
  try {
    // Админский вход
    if (email === 'sw37@bk.ru' && password === 'Xw6Nfbhz#') {
      return res.json({
        token: 'admin_token',
        user: {
          id: 999,
          email: 'sw37@bk.ru',
          phone: '+78001234567',
          subscription_tier: 'pro',
          subscription_end: '2099-12-31',
          role: 'admin'
        }
      });
    }
    
    // Проверка в базе данных
    const user = await dbApi.getUserByEmail(email);
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    return res.json({
      token: `user_token_${user.id}`,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        subscription_tier: user.subscription_tier,
        subscription_end: user.subscription_end,
        role: user.role
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}