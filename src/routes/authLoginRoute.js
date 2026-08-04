const express = require('express');
const router = express.Router();
const db = require('../db');

// POST: Procesar Inicio de Sesión
router.post('/login', async (req, res) => {
  const { correo, password } = req.body;

  try {
    // Buscar usuario por correo/usuario
    const result = await db.query(
      'SELECT id, correo, nombre, rol, password FROM usuarios WHERE correo = $1',
      [correo]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    const usuario = result.rows[0];

    // Validación temporal directa de la contraseña
    if (usuario.password !== password) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    // Responder con los datos requeridos para la sesión
    res.json({
      status: 'ok',
      usuario: {
        id: usuario.id,
        correo: usuario.correo,
        nombre: usuario.nombre,
        rol: usuario.rol
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;