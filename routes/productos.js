const express = require("express");
const router = express.Router({ mergeParams: true });
const auth = require("../middleware/auth");
const { check } = require("express-validator");
const cloudinary = require("../cloudinary");
const multer = require ('multer')
 const dotenv = require ('dotenv')
 dotenv.config()
const productController = require("../controllers/productController");
const { parser} = require ('../cloudinary')
//const {storage} = require('../cloudinary')
 //const Product = require ('../models/ProductoModel')
 //const upload = multer({storage})
 


//CREAR UN PRODUCTO
//api/productos
router.post(
  "/",
  auth, 
  
 parser.single('images'),   
  // [
  //   check("title", "El nombre es obligatorio").not().isEmpty(),
  //   check("description", "Introduce una pequeña descripción").not().isEmpty(),
  //   check("description", "La descripción debe tener al menos 10 caracteres").isLength({min:10, max:2000}),
  //   check("price", "El precio es obligatorio").not().isEmpty(),
  //   check("categoria", "Selecciona una Categoria").not().isEmpty(),
  //   check("subCategoria", "Selecciona una SubCategoria").not().isEmpty(),
    
  // ],
  
  productController.crearProducto
);

//OBTENER TODOS LOS PRODUCTOS
router.get("/", 
auth, 
productController.obtenerProductos);

//OBTENER PRODUCTOS USER
router.get("/user", 
auth, 
productController.obtenerProductosUser);




//OBTENER UN PRODUCTO
router.get('/:id',
auth,
productController.obtenerProductoId);

//MOSTRAR PRODUCTO EDITAR
// router.get("/user/editar/:id", 
// auth, 
// productController.obtenerProductoEditar);

//ACTUALIZAR PRODUCTOS DE USUARIO
router.put("/user/editar/:id", 
auth, 
//(req,res)=>{(console.log('producto : ' + req.body._id))},
parser.single('images'),

productController.editarProductoUser);



//ELIMINAR UN PRODUCTO
router.delete('/user/:id',
auth, 
productController.eliminarProducto,
);



module.exports = router;
