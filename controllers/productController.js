const Producto = require("../models/ProductModel");
const { validationResult } = require("express-validator");
const cloudinary = require("cloudinary").v2;
const transporter = require("../helpers/transporter.js");
//const mongoose = require("mongoose");
const { BetaAnalyticsDataClient } = require('@google-analytics/data');

exports.crearProducto = async (req, res, next) => {
  //REVISAR SI HAY ERRORES
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).send({ errors: errors.array() });
  }
  
  // Crear un nuevo producto con las imágenes proporcionadas en req.files
  const images = [];
  try {
    //CREAR UN PRODUCTO
    const producto = new Producto(req.body);
    
    //PARA SUBIR VARIAS IMAGENES
    

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
    //GUARDAMOS EL PRODUCTO
    await producto.save();
    console.log(producto);
    res.json(producto);
  } catch (error) {
    // En caso de error al guardar el producto, eliminar las imágenes subidas a Cloudinary
    if (images.length > 0) {
      for (let image of images) {
        try {
          await cloudinary.uploader.destroy(image.filename);
        } catch (deleteError) {
          console.error(`Error al eliminar la imagen ${image.filename} de Cloudinary:`, deleteError);
        }
      }
    }
    console.error(error);
    res.status(500).send({ error: "Hubo un Error" });
  }
};

exports.productosMasVistos = async (req, res) => {
  console.log('entrando en productosMasVistos')  
  const analyticsDataClient = new BetaAnalyticsDataClient();
    const propertyId = '338632609'; // Asegúrate de reemplazar esto con tu ID de propiedad de Google Analytics
    try {
        const [response] = await analyticsDataClient.runReport({
            property: `properties/${propertyId}`,
            dateRanges: [
              {
                  startDate: '7daysAgo',
                  endDate: 'yesterday',
              },
          ],
          dimensions: [
              { name: 'pagePath' },
          ],
          metrics: [
              { name: 'screenPageViews' },
          ],
          orderBys: [
              {
                  desc: true,
                  metric: { metricName: 'screenPageViews' },
              },
          ],
          limit: 100,
      });

      const productosVistas = response.rows.map(row => {
        const pagePath = row.dimensionValues[0].value;
        const regex = /^\/productos\/([a-fA-F0-9]{24})$/;
        const match = pagePath.match(regex);    
        if (match) {
            const idProducto = match[1];
            const vistas = parseInt(row.metricValues[0].value, 10); // Asegurarse de que las vistas sean numéricas            
            return { idProducto, vistas };
        }    
        return undefined;
    }).filter(producto => producto !== undefined)
      .sort((a, b) => b.vistas - a.vistas) // Ordenar de mayor a menor por vistas
      .slice(0, 5) // Tomar solo los primeros 6 productos
      .map(producto => producto.idProducto); // Extraer solo los IDs // Filtra los undefined resultantes de paths que no cumplen con el patrón especificado
 
    res.status(200).json({productosVistas}) ;    
    } catch (err) {
      console.error(err);
      res.status(500).send({ error: "Hubo un Error" });
    }

}

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
      .populate({ path: "author", select: "nombre direccion telefono email imagesAvatar  showPhone" });

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
      .populate({ path: "author", select: "nombre direccion telefono email showPhone" });
    console.log('PRODUCTOSUSR', prodUser, totalProductosUs, totalPagesUs);
    res.json({ prodUser, totalProductosUs, totalPagesUs });
  } catch (error) {
    console.log(error);
    res.status(500).send("Hubo un Error");
  }
};

exports.obtenerProductosAuthor = async (req, res) => {
  const id = req.params.id;
  try {
    const totalProductosAuth = await Producto.countDocuments({
      author: req.params.id,
    });

    const prodAuth = await Producto.find({ author: req.params.id })
      .sort({
        creado: -1,
      })
      .populate({ path: "author", select: "nombre direccion telefono email imagesAvatar  showPhone" });

    console.log('PRODUCTAUTHOR', prodAuth, totalProductosAuth);
    res.send({ prodAuth, totalProductosAuth });
  } catch (error) {
    console.log(error);
    res.status(500).send("Hubo un Error");
  }
};

exports.obtenerProductosAuthorDeleteUser = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const totalProductosAuth = await Producto.countDocuments({ author: id });
      const prodAuth = await Producto.find({ author: id })
        .sort({ creado: -1 })
        .populate({ path: "author", select: "nombre direccion telefono email imagesAvatar showPhone" });

      console.log('PRODUCTAUTHOR', prodAuth, totalProductosAuth);
      resolve({ prodAuth, totalProductosAuth }); // Resuelve la promesa con los datos
    } catch (error) {
      console.log(error);
      reject("Hubo un Error"); // Rechaza la promesa con el mensaje de error
    }
  });
};

//OBTENER PRODUCTO POR ID //TRABAJAMOS SIEMPRE QUE TRY CATCH PARA TENER MÁS SEGURIDAD Y CONTROL
exports.obtenerProductoId = async (req, res) => {
  console.log('productoIdBody', req.params)
  try {
    const productoId = await Producto.findById(req.params.id).populate({
      path: "author",
      select: "nombre direccion telefono email imagesAvatar showPhone",
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
  console.log('editarProductoUser', req.body);
  const { 
    imagesDelete, 
    title, 
    categoria, 
    subCategoria, 
    price, 
    description, 
    contacto, 
    delivery, 
    balearicDelivery, 
    ancho, 
    largo, 
    alto, 
    pesoVolumetrico, 
    pesoKgs, 
    precioEstimado, 
    reservado, 
    vendido 
  } = req.body;

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
        $set: { title, categoria, subCategoria, price, description, contacto, delivery, ancho, largo, alto, pesoVolumetrico, pesoKgs, precioEstimado, balearicDelivery, reservado, vendido },
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

exports.eliminarProductoUserDelete = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Buscar el producto por ID
      let producto = await Producto.findById(id);
      console.log(producto);

      // Verificar si el producto existe
      if (!producto) {
        return reject({ statusCode: 404, msg: "Producto no encontrado" });
      }

      // Eliminar el producto
      await Producto.findByIdAndDelete(id);

      // Si el producto tiene imágenes, eliminarlas en Cloudinary
      if (producto.images && producto.images.length > 0) {
        const deletePromises = producto.images.map(image => {
          return new Promise((resolve, reject) => {
            cloudinary.uploader.destroy(image.filename, function (err, result) {
              if (err) {
                reject(err);
              } else {
                resolve(result);
              }
            });
          });
        });

        // Esperar a que todas las promesas de eliminación se completen
        await Promise.all(deletePromises);
      }

      // Responder que el producto fue eliminado
      resolve({ msg: "PRODUCTO ELIMINADO" });
    } catch (error) {
      console.log(error);
      reject({ statusCode: 500, msg: "Hubo un Error" });
    }
  });
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
      select: "nombre direccion telefono email imagesAvatar showPhone",
    });
    res.status(200).json({ prodByWords: producto });
  } catch (error) {
    console.log(error);
    res.status(500).send("Hubo un Error");
  }
};

exports.envioPegatinas = async (req, res) => {
  const { message } = req.body;
  console.log('gestionPegatinas', req.body);
  try {
    // Configuración del correo electrónico
    const mailOptions = {
      from: process.env.EMAIL_USER, // Cambia esto con tu dirección de correo
      to: 'info@windymarket.es', // Cambia esto para enviar al vendedor
      subject: `Petición de pegatinas para envio`,
      html: `<p>Saludos, info@windymarket.es</p>
            <p>${message.nombreRemi} necesita las pegatinas para el envio de un producto a ${message.nombreDesti}</p>
            <h3> SusDatos:</h3><br>
            <h4> Remitente: </h4>
            <h5> Nombre y apellidos: ${message.nombreRemi}</h5>
            <h5> Dirección completa: ${message.direccionRemi}</h5>
            <h5> Población y CP: ${message.poblacion_CPRemi}</h5>
            <h5> Tél. móvil: ${message.telefonoRemi}</h5>
            <h5> e-mail: ${message.emailRemi}</h5><br>
            <h4> Destinatario: </h4>
            <h5>Nombre y apellidos: ${message.nombreDesti}</h5>
            <h5> Dirección completa: ${message.direccionDesti}</h5>
            <h5> Población y CP: ${message.poblacion_CPDesti}</h5>
            <h5> Tél. móvil: ${message.telefonoDesti}</h5>
            <h5> e-mail: ${message.emailDesti}</h5><br>            
            <h4> Datos Paquete: </h4>
            <h5> Alto: ${message.alto}</h5>
            <h5> Ancho: ${message.ancho}</h5>
            <h5> Largo: ${message.largo}</h5>
            <h5> PesoKgs: ${message.pesoKgs}</h5>
            <h5> PesoVolumetrico: ${message.pesoVolumetrico}</h5>            
            `
         };

    // Enviar el correo electrónico
    await transporter.sendMail(mailOptions);

    // Respuesta exitosa
    res.status(200).send("Correo enviado correctamente");
  } catch (error) {
    console.error("Error al enviar el correo:", error);
    res.status(500).send("Error al enviar el correo");
  }
};

exports.editReservedState = async (req, res) => {
  const { productId, reservado } = req.body;
  console.log('editReservedState', req.body);
  try {
    // Actualizar el estado reservado del producto
    const producto = await Producto.findByIdAndUpdate(
      productId,
      { $set: { reservado: reservado } },
      { new: true }
    );

    // Respuesta exitosa
    res.status(200).json({ producto });
  } catch (error) {
    console.error("Error al actualizar el estado reservado:", error);
    res.status(500).send("Error al actualizar el estado reservado");
  }
};

exports.editVendidoState = async (req, res) => {
  const { productId, vendido } = req.body;
  console.log('editVendidoState', req.body);
  try {
    // Actualizar el estado reservado del producto
    const producto = await Producto.findByIdAndUpdate(
      productId,
      { $set: { vendido: vendido } },
      { new: true }
    );

    // Respuesta exitosa
    res.status(200).json({ producto });
  } catch (error) {
    console.error("Error al actualizar el estado reservado:", error);
    res.status(500).send("Error al actualizar el estado reservado");
  }
};


