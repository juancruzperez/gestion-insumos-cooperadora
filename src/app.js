// Servir login en la raíz o ruta /login
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'loginPage.html'));
});