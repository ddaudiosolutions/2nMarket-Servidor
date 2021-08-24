const Producto = require("../models/ProductoModel");
const { validationResult } = require("express-validator");
//const {cloudinary} = require('../cloudinary')

exports.crearProducto = async (req, res) => {
  
  //REVISAR SI HAY ERRORES
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {

    //CREAR UN PRODUCTO
    const producto = new Producto(req.body, req.file);
    console.log(producto)  

    
    //GUARDAR EL CREADOR VIA JWT
    producto.author = req.user.id; //REACTIVAR AL TENER EL STATE DEL USUARIO 
    
    //guardamos el proyecto
     producto.save();
     //res.send(producto)
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
    //console.log('hola' + ' ' + req.user.id)
    const productos = await Producto.find({}).sort({ creado: -1 });
    //console.log(productos)
    res.json({ productos });
  } catch (error) {
    console.log(error);
    res.status(500).send("Hubo un Error");
  }
};

exports.obtenerProductosUser = async (req, res) => {
  try {
    //console.log('hola' + ' ' + req.user.id)
    const productos = await Producto.find({'author': req.user.id}).sort({creado: -1});
    console.log(productos)
    res.json({ productos });
  } catch (error) {
    console.log(error);
    res.status(500).send("Hubo un Error");
  }
};

//OBTENER PRODUCTO POR ID //TRABAJAMOS SIEMPRE QUE TRY CATCH PARA TENER MÁS SEGURIDAD Y CONTROL
exports.obtenerProductoId = async (req, res) => {
  try {
    const productoId = await Producto.findById(req.params.id);
   
    res.json({ productoId });
   // console.log(productoId)
  } catch (error) {
    console.log(error);
    res.status(500).send("Hubo un Error");
  }
};

//EDITAR UN PROYECTO
exports.editarProductoUser = async (req, res) => { 

  const {id } = req.params;
  console.log(req.body);
  //REVISAR SI HAY ERRORES
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  //OBTENER LA INFORMACION DEL PROYECTO PARA EDITAR

    
  try {
    //REVISAR EL ID
    let producto = await Producto.findById(id);
    console.log(producto)
    //SI EL PRODUCTO EXISTE O NO!!!
    if (!producto) {
      console.log('hay un error en edicion')
      return res.status(404).json({ msg: "Proyecto no encontrado" });
      
    }
    //console.log(producto.author.toString())
    //console.log(req.user.id)

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
       console.log(producto.author.toString())
      console.log(req.user.id)
  
      //Verificar el PRODUCTO
      if (producto.author.toString() !== req.user.id) {
        return res.status(401).json({ msg: "No Autorizado para Eliminar" });
       }
  
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

