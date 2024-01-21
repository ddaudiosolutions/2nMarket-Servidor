const express = require("express");
const router = express.Router({ mergeParams: true });
const users = require("../controllers/userController");
const { check } = require("express-validator");
const { storage2 } = require("../cloudinary");
const dotenv = require("dotenv");
dotenv.config();
const auth = require("../middleware/auth");
const multer = require("multer");

//CREAR UN USUARIO
//api/usuarios

//OBTENER TODOS LOS USUARIOS
router.get("/", users.obtenerUsuarios);

router.post("/correoentreusuarios", users.correoEntreUsuarios);
router.get("/mailingusuarios", users.mailingUsuarios);

router.post(
  "/newuser",
  [
    //INTRODUCIMOS COMO UN ARREGLO, TODOS LOS VALIDADORES QUE QUERAMOS CON EXPRESS-VALIDATOR CHECK
    check("nombre", "El nombre es obligatorio").not().isEmpty(),
    check("email", "Introduce un email valido").isEmail(),
    check("password", "La contraseña debe tener minimo 6 caracteres").isLength({
      min: 6,
    }),
  ],
  //parserAvatar.single('imagesAvatar'),
  users.crearUsuario
);

//OBTENER DATOS DE USUARIO
router.get("/:id", auth, users.obtenerUsuario);

//ACTUALIZAR DATOS DE USUARIO
router.put(
  "/editar/:id",
  auth,
  multer({ storage: storage2 }).single("imagesAvatar"),
  users.editarUsuario
);

router.delete("/:id", auth, users.eliminarUsuario);

module.exports = router;
