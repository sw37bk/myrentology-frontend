module.exports = async function handler(req, res) {
  // Пока используем localStorage вместо БД
  res.status(200).json({ 
    message: 'Using localStorage for now. Database will be added later.' 
  });
}