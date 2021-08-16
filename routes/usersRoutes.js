const express = require("express");
const router = express.Router();
const users = require("../controllers/userController");
const { check } = require("express-validator");

//CREAR UN USUARIO
//api/usuarios

router.post(
  "/",

  [
    //INTRODUCIMOS COMO UN ARREGLO, TODOS LOS VALIDADORES QUE QUERAMOS CON EXPRESS-VALIDATOR CHECK
    check("nombre", "El nombre es obligatorio").not().isEmpty(),
    check("email", "Introduce un email valido").isEmail(),
    check("password", "La contraseña debe tener minimo 6 caracteres").isLength({
      min: 6,
    }),
  ],
  users.crearUsuario
);

module.exports = router;
