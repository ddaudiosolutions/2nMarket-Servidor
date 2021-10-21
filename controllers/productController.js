const Producto = require("../models/ProductModel");
const { validationResult } = require("express-validator");
const cloudinary = require("cloudinary").v2;
const mongoose = require("mongoose");

exports.crearProducto = async (req, res, next) => {
  //REVISAR SI HAY ERRORES
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).send({ errors: errors.array() });
  }

  try {
    //CREAR UN PRODUCTO
    const producto = new Producto(req.body);
    
    //PARA SUBIR UNA SOLA IMAGEN
    // producto.images = {
    //   url: req.file.path,
    //   filename: req.file.filename,
    // };
    
    //PARA SUBIR VARIAS IMAGENES
    producto.images = req.files.map(f => ({url: f.path, filename: f.filename}))
    console.log(producto.images)
    //GUARDAR EL CREADOR VIA JWT
    producto.author = req.user.id; //REACTIVAR AL TENER EL STATE DEL USUARIO

    //GUARDAMOS EL PROYECTO
    await producto.save();
    console.log(producto)

    res.json(producto);
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "Hubo un Error" });
  }
};

//OBTENER PRODUCTOS //TRABAJAMOS SIEMPRE QUE TRY CATCH PARA TENER MÁS SEGURIDAD Y CONTROL
exports.obtenerProductos = async (req, res) => {
  let busqueda = req.query.busqueda
  // console.log(busqueda);
  let busquedaValue = req.query.busqueda;
  //console.log(busquedaValue);
  if (req.query.busqueda === "ultimos_productos") {
    busquedaValue = {};
    //limit = 6;
  } else {
    busquedaValue = { categoria: busqueda };
   // limit = null;
  }

  try {
    const PAGE_SIZE = 8;
    const page = parseInt(req.query.page || "0");
    const totalProductos = await Producto.countDocuments( busquedaValue );
    const totalPages = Math.ceil(totalProductos / PAGE_SIZE);
    
    const prodAll = await Producto.find(busquedaValue)
      .limit(PAGE_SIZE)
      .skip(PAGE_SIZE * page)
      .sort({ creado: -1 })
      .populate({path: 'author', select: 'nombre direccion telefono email'})
      
      //console.log(prodAll.author.nombre);
    res.json({ prodAll, totalProductos, totalPages });
    // const prodAll = await Producto.find(busquedaValue).sort({ creado: -1 }).limit(limit);
    // res.json({ prodAll });
     //console.log(totalProductos, totalPages, prodAll);
  } catch (error) {
    //console.log(error);
    res.status(500).send({ error: "Hubo un Error" });
  }
};

exports.obtenerProductosUser = async (req, res) => {
  try {
     const PAGE_SIZE = 8;
    // const page = parseInt(req.query.page || "0");
    const totalProductosUs = await Producto.countDocuments({ author: req.user.id });
    const totalPagesUs = Math.ceil(totalProductosUs / PAGE_SIZE);
    const prodUser = await Producto.find({ author: req.user.id })      
    // .limit(PAGE_SIZE)  
    // .skip(PAGE_SIZE * page)      
    .sort({
      creado: -1,
    })
    .populate({path: 'author', select: 'nombre direccion telefono email'});
    //console.log(prodUser, totalProductosUs, totalPagesUs);
    res.json({ prodUser, totalProductosUs, totalPagesUs });
  } catch (error) {
    console.log(error);
    res.status(500).send("Hubo un Error");
  }
};
///OBTENER PRODUCTOS USUARIO CON PAGINADOR (DESACTIVADO TEMPORALMENTE)
// exports.obtenerProductosUser = async (req, res) => {
//   try {
//     const PAGE_SIZE = 8;
//     const page = parseInt(req.query.page || "0");
//     const totalProductosUs = await Producto.countDocuments({ author: req.user.id });
//     const totalPagesUs = Math.ceil(totalProductosUs / PAGE_SIZE);
//     const prodUser = await Producto.find({ author: req.user.id })      
//     .limit(PAGE_SIZE)  
//     .skip(PAGE_SIZE * page)      
//     .sort({
//       creado: -1,
//     });
//     console.log(prodUser, totalProductosUs, totalPagesUs);
//     res.json({ prodUser, totalProductosUs, totalPagesUs });
//   } catch (error) {
//     console.log(error);
//     res.status(500).send("Hubo un Error");
//   }
// };

exports.obtenerProductosAuthor = async (req, res) => {
 // const authorid = req.query.authorid
  //const authorId = req.params
  //console.log(authorId)
  try {
     //const PAGE_SIZE = 8;
    // const page = parseInt(req.query.page || "0");
    const totalProductosAuth = await Producto.countDocuments({ author: req.params.id});
    //const totalPagesUs = Math.ceil(totalProductosUs / PAGE_SIZE);
    const prodAuth = await Producto.find({ author: req.params.id })      
    // .limit(PAGE_SIZE)  
    // .skip(PAGE_SIZE * page)      
    .sort({
      creado: -1,
    })
    .populate({path: 'author', select: 'nombre  email imagesAvatar '});
    
    console.log(prodAuth, totalProductosAuth);
    res.send({ prodAuth, totalProductosAuth });
  } catch (error) {
    console.log(error);
    res.status(500).send("Hubo un Error");
  }
};

//OBTENER PRODUCTO POR ID //TRABAJAMOS SIEMPRE QUE TRY CATCH PARA TENER MÁS SEGURIDAD Y CONTROL
exports.obtenerProductoId = async (req, res) => {
  try {
    const productoId = await Producto.findById(req.params.id)
      .populate({path: 'author', select: 'nombre direccion telefono email imagesAvatar'});
      
  
    res.json({ productoId });
  } catch (error) {
    console.log(error);
    res.status(500).send("Hubo un Error");
  }
};

//OBTENER PRODUCTO EDITAR
exports.obtenerProductoEditar = async (req, res) => {
  try {
    const producto = await Producto.findById(req.params.id);
   
    console.log("el producto :" + producto);
    res.json({ producto });
  } catch (error) {
    console.log(error);
    res.status(500).send("Hubo un Error");
  }
};

//EDITAR UN PRODUCTO
exports.editarProductoUser = async (req, res, next) => {
  //REVISAR SI HAY ERRORES
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  console.log(req.body)
  

  try {
    //   //REVISAR EL ID
    const productoTest = await Producto.findById(req.params.id);
    
    //   //SI EL PRODUCTO EXISTE O NO!!!
    if (!productoTest) {
      console.log("hay un error en edicion");
      return res.status(404).json({ msg: "Producto no encontrado" });
    }

    // //   //Verificar el PRODUCTO
    if (productoTest.author.toString() !== req.user.id) {
      return res.status(401).json({ msg: "No Autorizado para Editar" });
    }

    //ACTUALIZAR PRODUCTO
    const producto = await Producto.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    const images = req.files.map(f => ({url: f.path, filename: f.filename}));
    producto.images.push(...images)
      console.log(producto.images)
    // producto.images = req.files.map(f => ({url: f.path, filename: f.filename}));
    // //producto.images.push(...images)
    // await producto.save()
   
     await producto.save()
     res.json({ producto });
  } catch (error) {
    console.log(error);
    res.status(500).send("Hubo un Error");
    }
};

//
//ELIMINAR UN PRODUCTO
exports.eliminarProducto = async (req, res) => {
  //REVISAR SI HAY ERRORES
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    //REVISAR EL ID
    let producto = await Producto.findById(req.params.id);
    console.log(producto)

    //SI EL PRODUCTO EXISTE O NO!!!
    if (!producto) {
      return res.status(404).json({ msg: "Proyecto no encontrado" });
    }

    //Verificar el PRODUCTO
    if (producto.author.toString() !== req.user.id) {
      return res.status(401).json({ msg: "No Autorizado para Eliminar" });
    }

    //ELIMINAR EL PRODUCTO
    producto = await Producto.findByIdAndDelete(req.params.id);
    //ITERAMOS SOBRE LAS IMAGENES PARA TOMAR EL NOMBRE DE CADA IMAGEN Y BORRARLA EN CLOUDINARY
    for(let images of producto.images){   
       cloudinary.uploader.destroy(
        images.filename,
        function (err, res) {
          if (err) {
            console.log(err);
            return res.status(400).json({
              ok: false,
              menssage: "Error deleting file",
              errors: err,
            });
          }
           console.log(res);
        }
      );}   
    

    res.json({ msg: "PRODUCTO ELIMINADO" });
  } catch (error) {
    console.log(error);
    res.status(500).send("Hubo un Error");
  }
};
