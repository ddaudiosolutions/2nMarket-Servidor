//RUTAS PARA AUTENTICAR EL USUARIO
const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const authController = require('../controllers/authController')

//CREAR UN USUARIO
//api/AUTH

router.post(
  "/",
  [
    //INTRODUCIMOS COMO UN ARREGLO, TODOS LOS VALIDADORES QUE QUERAMOS CON EXPRESS-VALIDATOR CHECK
    check("email", "Introduce un email valido").isEmail(),
    check("password", "La contraseña debe tener minimo 6 caracteres").isLength({
      min: 6,}),
  ],
  authController.autenticarUser
);

module.exports = router;
