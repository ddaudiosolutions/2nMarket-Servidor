const express = require("express");
const router = express.Router({ mergeParams: true });
const favoriteProducts = require("../controllers/favoriteProductsController");

router.post("/addFavorite", favoriteProducts.addFavoriteProduct);
router.post("/removeFavorite", favoriteProducts.removeFavoriteProduct);
router.post("/getFavorite", favoriteProducts.getFavoriteProducts);

module.exports = router;
