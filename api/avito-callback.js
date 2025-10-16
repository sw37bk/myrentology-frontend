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
    // Получаем настройки из localStorage (они будут переданы через URL или другим способом)
    // Для простоты используем фиксированные значения, в реальности нужно передавать через state
    
    res.send(`
      <script>
        // Сохраняем код авторизации для дальнейшего обмена на токен
        fetch('/api/avito-exchange-token', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            code: '${code}',
            state: '${state}'
          })
        }).then(response => {
          if (response.ok) {
            window.opener.postMessage({type: 'AVITO_AUTH_SUCCESS'}, '*');
          } else {
            window.opener.postMessage({type: 'AVITO_AUTH_ERROR'}, '*');
          }
          window.close();
        }).catch(() => {
          window.opener.postMessage({type: 'AVITO_AUTH_ERROR'}, '*');
          window.close();
        });
      </script>
    `);
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.send(`
      <script>
        window.opener.postMessage({type: 'AVITO_AUTH_ERROR'}, '*');
        window.close();
      </script>
    `);
  }
}