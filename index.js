const express = require('express');

const conectarDB = require ('./config/db')
const cors = require ('cors')
//1 CREAMOS EL SERVIDOR
const app = express();

// const path = require('path');
//4 CONECTAMOS A LA BASE DE DATOS
conectarDB();

//app.use(cors({ credentials: true, origin: true }));
app.options("*", cors());
app.use(cors())
// HABILITAR EXPRESS.JSON
app.use(express.json({extended: true}));
app.use(express.urlencoded({extended:true}))
//app.use(multer())
    
//2 PUERTO DE LA APP
const port = process.env.PORT || 4000; //debe ser un servidor diferente al cliente(3000)


//IMPORTAR RUTAS
app.use('/api/usuarios', require('./routes/usersRoutes'))//PARA CREAR USUARIOS
app.use('/api/auth', require('./routes/auth'))//PARA AUTENTICAR USUARIOS
app.use('/api/productos', require('./routes/productos'))// PARA MANEJAR LOS PRODUCTOS
app.use('/api/buscoposts', require('./routes/buscoPost'))//PARA MANEJAR LOS POST DE BUSCO;
// //DEFINIR LA PAGINA PRINCIPAL
//app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

//3 ARRAMCAMOS SERVIDOR
app.listen(port,  () => {
    console.log(`Corriendo SERVIDOR en PORT:  ${port}`)
})
