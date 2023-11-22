const Producto = require("../models/ProductModel");
const { validationResult } = require("express-validator");
const cloudinary = require("cloudinary").v2;
//const mongoose = require("mongoose");

exports.crearProducto = async (req, res, next) => {
  //REVISAR SI HAY ERRORES
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).send({ errors: errors.array() });
  }

  try {
    //CREAR UN PRODUCTO
    const producto = new Producto(req.body);

    //PARA SUBIR VARIAS IMAGENES
    // Crear un nuevo producto con las imágenes proporcionadas en req.files
    const images = [];

    // Procesar cada archivo de imagen
    for (let file of req.files) {
      const extension = file.originalname.split(".").pop().toLowerCase();

      if (extension === "heic") {
        console.log("entrando en HEIC", extension);
        try {
          // Si es HEIC, aplicar la transformación a JPEG antes de subir a Cloudinary
          const result = await cloudinary.uploader.upload(file.path, {
            folder: "ProductosMarketV2",
            format: "jpg",
            transformation: [{ quality: calculoReduccionImagen(file.size) }],
          });

          images.push({ url: result.secure_url, filename: result.public_id });

          // Eliminar el archivo HEIC de Cloudinary después de la transformación
          await cloudinary.uploader.destroy(file.filename); // Eliminar el archivo original de Cloudinary
          console.log(
            `Archivo HEIC ${file.filename} eliminado de Cloudinary después de la transformación.`
          );
        } catch (error) {
          console.log(
            `Error al transformar o eliminar el archivo HEIC ${file.filename} de Cloudinary:`,
            error
          );
          // Manejar el error si la transformación o eliminación falla
        }
      } else {
        if (file.size > 1000000) {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: "ProductosMarketV2",
            transformation: [{ quality: calculoReduccionImagen(file.size) }],
          });

          images.push({ url: result.secure_url, filename: result.public_id });
          await cloudinary.uploader.destroy(file.filename); // Eliminar el archivo original de Cloudinary
        } else {
          // Si no es HEIC o no es mayor que 1000000, mantener la imagen original
          images.push({ url: file.path, filename: file.filename });
        }
      }
    }

    producto.images = images;
    console.log(producto.images);

    //GUARDAR EL CREADOR VIA JWT
    producto.author = req.user.id; //REACTIVAR AL TENER EL STATE DEL USUARIO

    //GUARDAMOS EL PROYECTO
    await producto.save();
    console.log(producto);

    res.json(producto);
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "Hubo un Error" });
  }
};

//OBTENER PRODUCTOS //TRABAJAMOS SIEMPRE QUE TRY CATCH PARA TENER MÁS SEGURIDAD Y CONTROL
exports.obtenerProductos = async (req, res) => {
  console.log("OBTENIENDO PRODUCTOS");
  let busqueda = req.query.busqueda;
  // console.log('la busqueda es:  ' + busqueda);
  let busquedaValue = {};
  //console.log(busquedaValue);
  if (busqueda === "ultimos_productos") {
    busquedaValue = {};
    limit = 5;
    // PAGE_SIZE = limit
  } else {
    busquedaValue = { categoria: busqueda };
    limit = 10;
    //PAGE_SIZE = limit
  }

  try {
    const PAGE_SIZE = limit;
    const page = parseInt(req.query.page || "0");
    const totalProductos = await Producto.countDocuments(busquedaValue);
    const totalPages = Math.ceil(totalProductos / PAGE_SIZE);

    const prodAll = await Producto.find(busquedaValue)
      .limit(PAGE_SIZE)
      .skip(PAGE_SIZE * page)
      .sort({ creado: -1 })
      .populate({ path: "author", select: "nombre direccion telefono email imagesAvatar" });

    res.status(200).json({ prodAll, totalProductos, totalPages });
  } catch (error) {
    //console.log(error);
    res.status(500).send({ error: "Hubo un Error" });
  }
};

exports.obtenerProductosUser = async (req, res) => {
  try {
    const PAGE_SIZE = 8;
    // const page = parseInt(req.query.page || "0");
    const totalProductosUs = await Producto.countDocuments({
      author: req.user.id,
    });
    const totalPagesUs = Math.ceil(totalProductosUs / PAGE_SIZE);
    const prodUser = await Producto.find({ author: req.user.id })
      // .limit(PAGE_SIZE)
      // .skip(PAGE_SIZE * page)
      .sort({
        creado: -1,
      })
      .populate({ path: "author", select: "nombre direccion telefono email" });
    //console.log(prodUser, totalProductosUs, totalPagesUs);
    res.json({ prodUser, totalProductosUs, totalPagesUs });
  } catch (error) {
    console.log(error);
    res.status(500).send("Hubo un Error");
  }
};

exports.obtenerProductosAuthor = async (req, res) => {
  try {
    const totalProductosAuth = await Producto.countDocuments({
      author: req.params.id,
    });

    const prodAuth = await Producto.find({ author: req.params.id })
      .sort({
        creado: -1,
      })
      .populate({ path: "author", select: "nombre direccion telefono email imagesAvatar" });

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
    const productoId = await Producto.findById(req.params.id).populate({
      path: "author",
      select: "nombre direccion telefono email imagesAvatar",
    });
    console.log("productoId", productoId);
    res.json(productoId);
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
  console.log(req.body);
  const { imagesDelete, title, categoria, subCategoria, price, description, contacto } = req.body;

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

    //BORRAR IMAGENES DE CLOUDINARY
    if (imagesDelete !== undefined) {
      if (typeof imagesDelete === "string") {
        cloudinary.uploader.destroy(imagesDelete, function (err, res) {
          if (err) {
            console.log(err);
            return res.status(400).json({
              ok: false,
              menssage: "Error deleting file",
              errors: err,
            });
          }
          console.log(res);
        });
      } else {
        for (let filename of imagesDelete) {
          console.log(filename);
          cloudinary.uploader.destroy(filename, function (err, res) {
            if (err) {
              console.log(err);
              return res.status(400).json({
                ok: false,
                menssage: "Error deleting file",
                errors: err,
              });
            }
            console.log(res);
          });
        }
      }
    }

    //ACTUALIZAR PRODUCTO
    const producto = await Producto.findByIdAndUpdate(
      req.params.id,
      {
        $pull: { images: { filename: imagesDelete } },
        $set: { title, categoria, subCategoria, price, description, contacto },
      },
      { new: true }
    );

    const images = [];

    // Procesar cada archivo de imagen
    for (let file of req.files) {
      const extension = file.originalname.split(".").pop().toLowerCase();

      if (extension === "heic") {
        // Si es HEIC, aplicar la transformación a JPEG antes de subir a Cloudinary
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "ProductosMarketV2",
          format: "jpg",
          transformation: [{ quality: calculoReduccionImagen(file.size) }],
        });

        images.push({ url: result.secure_url, filename: result.public_id });
        // Eliminar el archivo HEIC de Cloudinary después de la transformación
        await cloudinary.uploader.destroy(file.filename); // Eliminar el archivo original de Cloudinary
        console.log(
          `Archivo HEIC ${file.filename} eliminado de Cloudinary después de la transformación.`
        );
      } else {
        if (file.size > 1000000) {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: "ProductosMarketV2",
            transformation: [{ quality: calculoReduccionImagen(file.size) }],
          });

          images.push({ url: result.secure_url, filename: result.public_id });
          await cloudinary.uploader.destroy(file.filename); // Eliminar el archivo original de Cloudinary
        } else {
          // Si no es HEIC o no es mayor que 1000000, mantener la imagen original
          images.push({ url: file.path, filename: file.filename });
        }
      }
    }
    producto.images.push(...images);
    console.log(producto.images);

    await producto.save();
    res.json({ producto });
  } catch (error) {
    console.log(error);
    res.status(500).send("Hubo un Error");
  }
};
const calculoReduccionImagen = (fileSize) => {
  const limiteMaximo = 950000;
  const quality = Math.floor((limiteMaximo / fileSize) * 100);
  return String(quality);
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
    console.log(producto);

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
    for (let images of producto.images) {
      cloudinary.uploader.destroy(images.filename, function (err, res) {
        if (err) {
          console.log(err);
          return res.status(400).json({
            ok: false,
            menssage: "Error deleting file",
            errors: err,
          });
        }
        console.log(res);
      });
    }

    res.json({ msg: "PRODUCTO ELIMINADO" });
  } catch (error) {
    console.log(error);
    res.status(500).send("Hubo un Error");
  }
};

exports.findProductsByWords = async (req, res) => {
  let searchWords = req.body.searchWord; // Replace with your array of words

  try {
    const producto = await Producto.find({
      $or: [
        { title: { $regex: `${searchWords}`, $options: "i" } },
        { description: { $regex: `${searchWords}`, $options: "i" } },
        { categoria: { $regex: `${searchWords}`, $options: "i" } },
        { subCategoria: { $regex: `${searchWords}`, $options: "i" } },
      ],
    }).populate({
      path: "author",
      select: "nombre direccion telefono email imagesAvatar",
    });
    res.status(200).json({ prodByWords: producto });
  } catch (error) {
    console.log(error);
    res.status(500).send("Hubo un Error");
  }
};
