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
    producto.images = {
      url: req.file.path,
      filename: req.file.filename,
    };

    //GUARDAR EL CREADOR VIA JWT
    producto.author = req.user.id; //REACTIVAR AL TENER EL STATE DEL USUARIO

    //GUARDAMOS EL PROYECTO
    await producto.save();
    //console.log(producto)

    res.json(producto);
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "Hubo un Error" });
  }
};

//OBTENER PRODUCTOS //TRABAJAMOS SIEMPRE QUE TRY CATCH PARA TENER MÁS SEGURIDAD Y CONTROL
exports.obtenerProductos = async (req, res) => {
  console.log(req.params.busqueda);
  let busquedaValue;
  if (req.params.busqueda === "all") {
    busquedaValue = {};
  } else {
    busquedaValue = { categoria: req.params.busqueda };
  }

  try {
    const prodAll = await Producto.find(busquedaValue).sort({ creado: -1 });
    res.json({ prodAll });
    console.log(prodAll);
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "Hubo un Error" });
  }
};

exports.obtenerProductosUser = async (req, res) => {
  try {
    const prodUser = await Producto.find({ author: req.user.id }).sort({
      creado: -1,
    });
    console.log(prodUser);
    res.json({ prodUser });
  } catch (error) {
    console.log(error);
    res.status(500).send("Hubo un Error");
  }
};

//OBTENER PRODUCTO POR ID //TRABAJAMOS SIEMPRE QUE TRY CATCH PARA TENER MÁS SEGURIDAD Y CONTROL
exports.obtenerProductoId = async (req, res) => {
  try {
    const productoId = await Producto.findById(req.params.id);
    console.log(productoId);
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
    //res.json(req.body)
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

  let dataBody = {
    categoria: req.body.categoria,
    subCategoria: req.body.subCategoria,
    title: req.body.title,
    price: req.body.price,
    description: req.body.description,
    contacto: req.body.contacto,
    ...(typeof req.file !== "undefined" && {
      images: {
        url: req.file.path,
        filename: req.file.filename,
      },
    }),
  };

  try {
    //   //REVISAR EL ID
    const productoTest = await Producto.findById(req.params.id);
    // console.log('TEAT: '  + productoTest.images)

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
      { $set: dataBody },
      { new: true }
    );

    res.json({ producto });
    // await producto.save()
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
    //console.log(producto)

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
    // let imgId = producto.images[0].filename
    // console.log( imgId)
    await cloudinary.uploader.destroy(
      producto.images[0].filename,
      function (err, res) {
        if (err) {
          console.log(err);
          return res.status(400).json({
            ok: false,
            menssage: "Error deleting file",
            errors: err,
          });
        }
        // console.log(res);
      }
    );

    res.json({ msg: "PRODUCTO ELIMINADO" });
  } catch (error) {
    console.log(error);
    res.status(500).send("Hubo un Error");
  }
};
