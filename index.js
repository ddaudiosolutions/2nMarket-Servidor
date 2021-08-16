const express = require('express');

const conectarDB = require ('./config/db')
const cors = require ('cors')
//1 CREAMOS EL SERVIDOR
const app = express();

//4 CONECTAMOS A LA BASE DE DATOS
conectarDB();

//app.use(cors({ credentials: true, origin: true }));
app.options("*", cors());
 
// HABILITAR EXPRESS.JSON
app.use(express.json({extended: true}));

//2 PUERTO DE LA APP
const PORT = process.env.PORT || 4000; //debe ser un servidor diferente al cliente(3000)

app.use(cors())
//IMPORTAR RUTAS
app.use('/api/usuarios', require('./routes/usersRoutes'))
app.use('/api/auth', require('./routes/auth'))
app.use('/api/productos', require('./routes/productos'))
// //DEFINIR LA PAGINA PRINCIPAL


//3 ARRAMCAMOS SERVIDOR
app.listen(PORT, () => {
    console.log(`Corriendo SERVIDOR en PORT:  ${PORT}`)
})
