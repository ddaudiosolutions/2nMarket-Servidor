const jwt = require("jsonwebtoken");

// Middleware de autenticación opcional
// Si hay token válido, añade req.user
// Si no hay token o es inválido, continúa sin req.user
module.exports = function (req, res, next) {
  // Leer el token del header
  const token = req.header("x-auth-token");

  // Si no hay token, continuar sin usuario
  if (!token) {
    req.user = null;
    return next();
  }

  // Validar el token si existe
  try {
    const cifrado = jwt.verify(token, process.env.SECRETA);
    req.user = cifrado.user;
    console.log("Usuario autenticado (opcional):", cifrado.user);
    next();
  } catch (error) {
    // Token inválido, continuar sin usuario
    console.log("Token inválido, continuando sin autenticación");
    req.user = null;
    next();
  }
};
