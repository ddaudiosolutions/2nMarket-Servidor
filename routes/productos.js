const express = require("express");
const router = express.Router({ mergeParams: true });
const auth = require("../middleware/auth");
const { check } = require("express-validator");
const cloudinary = require("../cloudinary");
const multer = require("multer");
const dotenv = require("dotenv");
dotenv.config();
const productController = require("../controllers/productController");
const { parser } = require("../cloudinary");
//const {storage} = require('../cloudinary')
//const Product = require ('../models/ProductoModel')
//const upload = multer({storage})

//CREAR UN PRODUCTO
//api/productos
router.post("/newproduct", auth, parser.array("images", 4), productController.crearProducto);

//OBTENER PRODUCTOS USER
router.get("/user", auth, productController.obtenerProductosUser);

//OBTENER TODOS LOS PRODUCTOS
router.get(
  "/",
  //auth,
  productController.obtenerProductos
);

//OBTENER TODOS LOS PRODUCTOS de un AUTOR
router.get(
  "/auth/:id",
  //auth,
  productController.obtenerProductosAuthor
);

//OBTENER UN PRODUCTO
router.get(
  "/:id",
  //auth,
  productController.obtenerProductoId
);

//MOSTRAR PRODUCTO EDITAR
router.get("/user/editar/:id", auth, productController.obtenerProductoEditar);

//ACTUALIZAR PRODUCTOS DE USUARIO
router.put(
  "/user/editar/:id",
  auth,
  parser.array("images", 4),
  productController.editarProductoUser
);

//ELIMINAR UN PRODUCTO
router.delete("/user/:id", auth, productController.eliminarProducto);

module.exports = router;
