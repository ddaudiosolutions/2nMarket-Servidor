//RUTAS PARA AUTENTICAR EL USUARIO
const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const authController = require("../controllers/authController");
const auth = require("../middleware/auth");
const roomsController = require("../controllers/roomsController");



//api/rooms

// router.post(
//   "/",  
//   auth,
//   roomsController.crearNewRoom
// );

router.post(
  "/",  
  auth,
  roomsController.getOrCreateRoom
);

router.get(
  "/",  
  auth,
  roomsController.getChatRoomById
);

router.get(
  "/buzon",  
  auth,
  roomsController.getChatRoomsByUser
);

// router.get(
//   "/", 
//   auth, 
//   authController.usuarioAutenticado);

module.exports = router;
