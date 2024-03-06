const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  //LEER EL TOKEN DEL HEADER
    const token = req.header("x-auth-token");

  //REVISAMOS SI NO HAY TOKEN
  if (!token) {
    return res.status(401).json({ msg: "No hay TOKEN" });
  }

  // VALIDAR EL TOKEN

  try {
    const cifrado = jwt.verify(token, process.env.SECRETA);
    req.user = cifrado.user;
    console.log(cifrado.user);
    next();
  } catch (error) {
    res.status(401).json({ msg: "TOKEN NO VALIDO" });
  }
};
