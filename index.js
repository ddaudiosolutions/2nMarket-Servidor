const express = require("express");

const conectarDB = require("./config/db");
const cors = require("cors");
/* const prerender = require("prerender-node"); */

//1 CREAMOS EL SERVIDOR
const app = express();

const whitelist = ['https://windymarketnextfront.vercel.app', 'https://www.windymarket.es', 'http://localhost:3000', 'http://localhost:3001'];

const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  optionsSuccessStatus: 200 // Para algunos navegadores que soportan correctamente el status 204
};

app.use(cors(corsOptions));

// HABILITAR EXPRESS.JSON
app.use(express.json({ extended: true }));
app.use(express.urlencoded({ extended: true }));
//app.use(multer())

//2 PUERTO DE LA APP
const port = process.env.PORT || 4000; //debe ser un servidor diferente al cliente(3000)

// Health check endpoint para Railway
app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'WindyMarket API is running' });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Configuración de Prerender.io
/* app.use(prerender.set('prerenderToken', process.env.PRERENDER)); */
//IMPORTAR RUTAS
app.use("/api/usuarios", require("./routes/usersRoutes")); //PARA CREAR USUARIOS
app.use("/api/auth", require("./routes/auth")); //PARA AUTENTICAR USUARIOS
app.use("/api/productos", require("./routes/productos")); // PARA MANEJAR LOS PRODUCTOS
app.use("/api/buscoposts", require("./routes/buscoPost")); //PARA MANEJAR LOS POST DE BUSCO;
app.use("/api/models", require("./routes/models")); //PARA hacer cambios en bbdd mongodb;
app.use("/api/favoriteProducts", require("./routes/favoriteProducts"));
//3 ARRAMCAMOS SERVIDOR despues de conectar la base de datos en Mongo
//4 CONECTAMOS A LA BASE DE DATOS
conectarDB().then(() => {
  console.log("ENTRANDO EN LISTEN PORT");
  app.listen(port, () => {
    console.log(`Corriendo SERVIDOR en PORT:  ${port}`);
  });
});
