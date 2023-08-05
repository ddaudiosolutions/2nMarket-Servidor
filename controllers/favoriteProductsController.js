const User = require("../models/User");
const Producto = require("../models/ProductModel");

exports.addFavoriteProduct = async (req, res) => {
  console.log("req.body", req.body.productId);
  console.log("req.bodyUSER", req.body.userId);
  // añadir al array del campo favoritos del usuario el id del producto
  try {
    const user = await User.findByIdAndUpdate(
      req.body.userId,
      { $push: { favoritos: req.body.productId } },
      { new: true }
    );
    res.status(200).json({ user: user });
  } catch (error) {
    console.log(error);
    res.status(500).send("Hubo un Error");
  }
};

exports.getFavoriteProducts = async (req, res) => {
  console.log("req.body.Products", req.body);
  const favoriteProducts = [];
  // recuperar todos los prodcuctos de array de favoritos de un usuario
  try {
    for (let idProduct of req.body) {
      const producto = await Producto.findById(idProduct).populate({
        path: "author",
        select: "nombre direccion telefono email imagesAvatar",
      });
      favoriteProducts.push(producto);
    }
    console.log("favoriteProducts", favoriteProducts);
    res.status(200).json({ favoritos: favoriteProducts });
  } catch (error) {
    console.log(error);
    res.status(500).send("Hubo un Error");
  }
};

exports.removeFavoriteProduct = async (req, res) => {
  console.log("req.body, DELETED", req.body.productId);
  console.log("req.bodyUSER", req.body.userId);

  //eliminar del array de favoritos del usuario el id del producto
  try {
    const user = await User.findByIdAndUpdate(
      req.body.userId,
      { $pull: { favoritos: req.body.productId } },
      { new: true }
    );
    console.log("user:::º", user);
    res.status(200).json({ message: "Favorito Borrado", user: user });
  } catch (error) {
    console.log(error);
    res.status(500).send("Hubo un Error");
  }
};
