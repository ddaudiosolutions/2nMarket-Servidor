const express = require("express");
const router = express.Router({ mergeParams: true });
const auth = require("../middleware/auth");
const { check } = require("express-validator");
//const multer = require ('multer')
//  const dotenv = require ('dotenv')
//  dotenv.config()
const productController = require("../controllers/productController");

//  const Product = require ('../models/ProductoModel')

// const {storage } = require ('../cloudinary')
// const upload = multer({storage});

//CREAR UN PRODUCTO
//api/productos
router.post(
  "/",
  //auth,
  [
    check("title", "El nombre es obligatorio").not().isEmpty(),
    check("description", "Introduce una pequeña descripción").not().isEmpty(),
    check("description", "La descripción debe tener al menos 10 caracteres").isLength({min:10, max:2000}),
    check("price", "El precio es obligatorio").not().isEmpty(),
    check("categoria", "Selecciona una Categoria").not().isEmpty(),
    check("subCategoria", "Selecciona una SubCategoria").not().isEmpty(),
    
  ],
  //upload.single('image'),
  productController.crearProducto
);

//OBTENER TODOS LOS PRODUCTOS
router.get("/", 
//auth, 
productController.obtenerProductos);

//OBTENER UN PRODUCTO
router.get('/:id',
productController.obtenerProducto);

//ACTULIZAR PRODUCTOS
router.put("/:id", 
//auth, 
productController.editarProducto);

//ELIMINAR UN PRODUCTO
router.delete('/:id',
//auth, 
productController.eliminarProducto);



module.exports = router;
