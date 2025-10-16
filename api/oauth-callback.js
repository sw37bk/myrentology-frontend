export default async function handler(req, res) {
  const { code, state, error } = req.query;

  if (error) {
    return res.redirect('/?error=' + encodeURIComponent(error));
  }

  if (code) {
    // Обмениваем код на токен
    try {
      const response = await fetch(`${req.headers.origin || 'https://myrentology.ru'}/api/avito-exchange-token`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ code, state })
      });

      if (response.ok) {
        return res.redirect('/?avito_connected=true');
      } else {
        return res.redirect('/?error=token_exchange_failed');
      }
    } catch (error) {
      return res.redirect('/?error=server_error');
    }
  }

  res.redirect('/');
}