import { readDB } from '../db-helper.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Логин и пароль обязательны' });
  }

  try {
    const db = readDB();
    const user = db.users.find(u => u.email === email && u.password === password);
    
    if (user) {
      const { password: _, ...userWithoutPassword } = user;
      return res.json({
        token: 'token_' + user.id + '_' + Date.now(),
        user: userWithoutPassword
      });
    }
    
    return res.status(401).json({ error: 'Неверный логин или пароль' });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Ошибка авторизации' });
  }
}