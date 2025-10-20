export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }
  
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
  
  // Для всех остальных - ошибка
  return res.status(401).json({ error: 'Invalid credentials' });
}