const express = require("express");
const router = express.Router({ mergeParams: true });
const auth = require("../middleware/auth.js")
const dotenv = require("dotenv");
dotenv.config();

const buscoController = require("../controllers/buscoController");

//api/buscoposts

//CREAR UN POST
router.post("/newpost",
  auth,
  buscoController.crearBuscoPost);

//OBTENER TODOS LOS POSTS
router.get("/getallposts", buscoController.obtenerBuscoPost);

//OBTENER LOS POSTS DE UN USUARIO
router.get('/getposts/user/:id',
  /* auth, */
  buscoController.obtenerBuscoPostUser)

//OBTENER POST POR ID
router.get('/:id', buscoController.obtenerBuscoPostId)

//OBTENER POST EDITAR
router.get("/user/editar/:id",
  auth,
  buscoController.obtenerBuscoPostEditar);

//ACTUALIZAR POST DE USUARIO
router.put("/user/editar/:id",
  auth,
  buscoController.editarBuscoPost,
);

//BORRAR POST 
router.delete('/user/:id',
  auth,
  buscoController.deleteBuscoPost
);

module.exports = router;