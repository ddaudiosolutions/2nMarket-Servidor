const cloudinary = require("cloudinary").v2;

const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

// PARA ALMACENAR LAS IMAGENES DE LOS PRODUCTOS
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "ProductosMarketV2",
    allowedFormats: ["jpeg", "png", "jpg"],
    transformation: [
      { quality: "auto:best" /* max_bytes: "1000000" */ }, // Ajusta el tamaño máximo en bytes (1MB en este caso)
    ],
  },
});

//PARA ALMACENAR LAS IMAGENES DE LOS AVATARES DE USUARIOS
const storage2 = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "ProductosMarketV2/AvataresUsuarios",
    allowedFormats: ["jpeg", "png", "jpg"],
    // transformation: [{ width: 640, height: 480, crop:'fit'}],
  },
});

const parser = multer({ storage: storage });

//const parser2 = multer({storage2})

module.exports = {
  cloudinary,
  storage,
  storage2,
  parser,
};
