// Временное хранилище токенов
let avitoTokens = {};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).end();
  }

  const { code, state, error } = req.query;

  if (error) {
    return res.send(`
      <script>
        window.opener.postMessage({type: 'AVITO_AUTH_ERROR', error: '${error}'}, '*');
        window.close();
      </script>
    `);
  }

  if (!code || !state) {
    return res.send(`
      <script>
        window.opener.postMessage({type: 'AVITO_AUTH_ERROR', error: 'Missing code or state'}, '*');
        window.close();
      </script>
    `);
  }

  try {
    // Получаем данные OAuth из state (нужно реализовать хранилище)
    const oauthData = global.oauthStates?.[state];
    if (!oauthData) {
      throw new Error('Invalid state');
    }

    // Обмениваем код на токен
    const tokenResponse = await fetch('https://api.avito.ru/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: oauthData.client_id,
        client_secret: oauthData.client_secret,
        code: code,
        redirect_uri: `${req.headers.origin || 'https://myrentology.ru'}/api/avito-callback`
      })
    });
    
    if (tokenResponse.ok) {
      const tokenData = await tokenResponse.json();
      
      // Сохраняем токен для пользователя
      avitoTokens[oauthData.user_id] = {
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: Date.now() + (tokenData.expires_in * 1000),
        client_id: oauthData.client_id,
        client_secret: oauthData.client_secret
      };
      
      // Обновляем настройки
      await fetch(`${req.headers.origin || 'https://myrentology.ru'}/api/avito-settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: oauthData.user_id,
          client_id: oauthData.client_id,
          client_secret: oauthData.client_secret,
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          is_connected: true
        })
      });
      
      // Очищаем state
      delete global.oauthStates[state];
      
      res.send(`
        <script>
          window.opener.postMessage({type: 'AVITO_AUTH_SUCCESS'}, '*');
          window.close();
        </script>
      `);
    } else {
      const error = await tokenResponse.json();
      console.error('Token exchange error:', error);
      res.send(`
        <script>
          window.opener.postMessage({type: 'AVITO_AUTH_ERROR', error: '${error.error_description || 'Ошибка получения токена'}'}, '*');
          window.close();
        </script>
      `);
    }
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.send(`
      <script>
        window.opener.postMessage({type: 'AVITO_AUTH_ERROR', error: 'Ошибка сервера'}, '*');
        window.close();
      </script>
    `);
  }
}

export { avitoTokens };