const Producto = require("../models/ProductoModel");
const { validationResult } = require("express-validator");
const {cloudinary} = require('../cloudinary')


exports.crearProducto = async (req, res) => {
  //REVISAR SI HAY ERRORES
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    //CREAR UN PRODUCTO
    const producto = new Producto(req.body);
    
    //GUARDAR EL CREADOR VIA JWT
    //producto.author = req.user.id; //REACTIVAR AL TENER EL STATE DEL USUARIO 

    //guardamos el proyecto
     producto.save();
    res.json(producto);
    console.log(producto)
  } catch (error) {
    console.log(error);
    res.status(500).send("Hubo un Error");
  }
};

//OBTENER PRODUCTOS //TRABAJAMOS SIEMPRE QUE TRY CATCH PARA TENER MÁS SEGURIDAD Y CONTROL
exports.obtenerProductos = async (req, res) => {
  try {
    const productos = await Producto.find({}).sort({ creado: -1 });
    res.json({ productos });
  } catch (error) {
    console.log(error);
    res.status(500).send("Hubo un Error");
  }
};

//OBTENER PRODUCTO POR ID //TRABAJAMOS SIEMPRE QUE TRY CATCH PARA TENER MÁS SEGURIDAD Y CONTROL
exports.obtenerProducto = async (req, res) => {
  try {
    const producto = await Producto.findById(req.params.id);
    res.json({ producto });
  } catch (error) {
    console.log(error);
    res.status(500).send("Hubo un Error");
  }
};

//EDITAR UN PROYECTO
exports.editarProducto = async (req, res) => { 

  const { id } = req.params;
  console.log(req.body);
  //REVISAR SI HAY ERRORES
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  //OBTENER LA INFORMACION DEL PROYECTO PARA EDITAR

    // const {title, description, price, categoria, subCategoria} = req.body
    // const nuevoProducto = {}

    // if(title){
    //     nuevoProducto.title = title
    // }
    // if(description){
    //     nuevoProducto.description = description
    // }
    // if(price){
    //     nuevoProducto.price = price
    // }
    // if(categoria){
    //     nuevoProducto.categoria = categoria
    // }
    // if(subCategoria){
    //     nuevoProducto.subCategoria = subCategoria
    // }

  try {
    //REVISAR EL ID
    let producto = await Producto.findById(id);
    //SI EL PRODUCTO EXISTE O NO!!!
    if (!producto) {
      return res.status(404).json({ msg: "Proyecto no encontrado" });
    }
    console.log(producto.author.toString())
    console.log(req.user.id)

    //Verificar el PRODUCTO
    if (producto.author.toString() !== req.user.id) {
      return res.status(401).json({ msg: "No Autorizado para Editar" });
    }

    //ACTUALIZAR PRODUCTO
    // producto = await Producto.findByIdAndUpdate({_id: id}, { $set: nuevoProducto}, {new:true});
    producto = await Producto.findByIdAndUpdate({_id: id}, {$set: req.body}, {new:true});
    res.json({producto})
    //await producto.save()
  } catch (error) {
    console.log(error);
    res.status(500).send("Hubo un Error");
  }
};


//ELIMINAR UN PRODUCTO
exports.eliminarProducto = async (req, res) => {
  
    const { id } = req.params;
    console.log(req.body);

    //REVISAR SI HAY ERRORES
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
       
    try {
      //REVISAR EL ID
      let producto = await Producto.findById(id);

      //SI EL PRODUCTO EXISTE O NO!!!

      if (!producto) {
        return res.status(404).json({ msg: "Proyecto no encontrado" });
      }
      // console.log(producto.author.toString())
      // console.log(req.user.id)
  
      //Verificar el PRODUCTO
      // if (producto.author.toString() !== req.user.id) {
      //   return res.status(401).json({ msg: "No Autorizado para Eliminar" });
      // }
  
      //ELIMINAR EL PRODUCTO
      // producto = await Producto.findByIdAndUpdate({_id: id}, { $set: nuevoProducto}, {new:true});
      producto = await Producto.findOneAndRemove({_id: id});
      res.json({msg:'PRODUCTO ELIMINADO'})
      //await producto.save()
    } catch (error) {
      console.log(error);
      res.status(500).send("Hubo un Error");
    }
  };

