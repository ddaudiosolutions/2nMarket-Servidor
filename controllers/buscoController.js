const BuscoModel = require("../models/BuscoModel");
const { validationResult } = require("express-validator");

exports.crearBuscoPost = async (req, res) => {
  //REVISAR SI HAY ERRORES
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).send({ errors: errors.array() });
  }
  try {
    const buscoPost = new BuscoModel(req.body);
    buscoPost.author = req.user.id; //COMPROBAMOS QUE SEA EL MISMO AUTOR
    await buscoPost.save();
    res.status(201).send({ buscoPost });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "Hubo un error" });
  }
};

exports.obtenerBuscoPost = async (req, res) => {
  console.log("BUSCANDO POSTS");
  //REVISAR SI HAY ERRORES
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).send({ errors: errors.array() });
  }
  try {
    const obtenerBuscoPost = await BuscoModel.find({})
      .sort({ creado: -1 })
      .populate({ path: "author", select: "nombre direccion telefono email imagesAvatar" });
    res.status(200).send({ obtenerBuscoPost });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "Hubo un error" });
  }
};

exports.obtenerBuscoPostUser = async (req, res) => {
  console.log("parammmm", req.params);
  //REVISAR SI HAY ERRORES
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).send({ errors: errors.array() });
  }
  try {
    const obtenerBuscoPostUser = await BuscoModel.find({ author: req.params.id })
      .sort({ creado: -1 })
      .populate({ path: "author", select: "nombre direccion telefono email imagesAvatar" });
    //await buscoPost.save()
    res.status(200).send({ obtenerBuscoPostUser });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "Hubo un error" });
  }
};

//OBTENER POST POR ID //TRABAJAMOS SIEMPRE QUE TRY CATCH PARA TENER MÁS SEGURIDAD Y CONTROL
exports.obtenerBuscoPostId = async (req, res) => {
  try {
    const buscoPostId = await BuscoModel.findById(req.params.id).populate({
      path: "author",
      select: "nombre direccion telefono email imagesAvatar",
    });

    res.json({ buscoPostId });
  } catch (error) {
    console.log(error);
    res.status(500).send("Hubo un Error");
  }
};

//OBTENER POST EDITAR
exports.obtenerBuscoPostEditar = async (req, res) => {
  try {
    const buscoPostEditar = await BuscoModel.findById(req.params.id);
    console.log(req.user.id);
    console.log(buscoPostEditar.author);
    if (buscoPostEditar.author.toString() !== req.user.id) {
      return res.status(401).json({ msg: "No Autorizado para Editar" });
    }
    console.log("el producto :" + buscoPostEditar);
    res.json({ buscoPostEditar });
  } catch (error) {
    console.log(error);
    res.status(500).send("Hubo un Error");
  }
};

//EDITAR UN POST
exports.editarBuscoPost = async (req, res, next) => {
  //REVISAR SI HAY ERRORES
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  console.log(req.body);
  //const { imagesDelete, title, categoria, subCategoria, price, description, contacto } = req.body;

  try {
    //   //REVISAR EL ID
    const buscoPostTest = await BuscoModel.findById(req.params.id);

    //   //SI EL PRODUCTO EXISTE O NO!!!
    if (!buscoPostTest) {
      console.log("hay un error en edicion");
      return res.status(404).json({ msg: "BuscoPost no encontrado" });
    }

    // //   //Verificar el PRODUCTO
    if (buscoPostTest.author.toString() !== req.user.id) {
      return res.status(401).json({ msg: "No Autorizado para Editar" });
    }

    //ACTUALIZAR PRODUCTO
    const buscoPost = await BuscoModel.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.status(200).json({ msg: "PRODUTO ACTUALIZADO" });
  } catch (error) {
    console.log(error);
    res.status(500).send("Hubo un Error");
  }
};

//BORRAR UN POST
exports.deleteBuscoPost = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    //REVISAR EL ID
    let buscoPost = await BuscoModel.findById(req.params.id);
    //console.log(buscoPost);

    //SI EL POST EXISTE O NO!!!
    if (!buscoPost) {
      return res.status(404).json({ msg: "Proyecto no encontrado" });
    }

    //Verificar el POST
    if (buscoPost.author.toString() !== req.user.id) {
      return res.status(401).json({ msg: "No Autorizado para Eliminar" });
    }

    deleteBuscoPost = await BuscoModel.findByIdAndDelete(req.params.id);
    res.status(200).json({ msg: "BUSCOPOST ELIMINADO" });
  } catch (error) {
    console.log(error);
    res.status(500).send("HUBO UN ERROR");
  }
};
