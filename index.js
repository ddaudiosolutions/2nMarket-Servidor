const express = require('express');
http = require('http');
const conectarDB = require ('./config/db')
const cors = require ('cors')
const { Server } = require('socket.io');

//1 CREAMOS EL SERVIDOR
const app = express();

const server = http.createServer(app); // Add this

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
  app.use('/api/rooms', require('./routes/rooms'))
  // //DEFINIR LA PAGINA PRINCIPAL
  //app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
  
// Create an io server and allow for CORS from http://localhost:3000 with GET and POST methods
const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

let users = []
//Funcionalidad de socket.io en el servidor
io.on("connection", (socket) => {    
  let nombre;
  socket.on("conectado", (nomb) => {  
    console.log(`Connected: ${socket.id} nomb`);  
   
    //socket.broadcast.emit manda el mensaje a todos los clientes excepto al que ha enviado el mensaje
    socket.broadcast.emit("mensajes", {
      nombre: nombre,
      mensaje: `${nombre} ha entrado en la sala del chat`,
    });
  });

  socket.on("mensaje", (nombre, mensaje) => {
    console.log('nombre', nombre)
    console.log('mensaje', mensaje)
    //io.emit manda el mensaje a todos los clientes conectados al chat
    io.emit("mensajes", { nombre, mensaje });
  });

  socket.on('join', (room) => {
    console.log(`Socket ${socket.id} joining ${room}`);
    socket.join(room);
 });

 socket.on('chat', (data) => {
  const { message, room, user } = data;
  console.log(`msg: ${message}, room: ${room}, user: ${user}`);
  io.to(room).emit('chat', message, user);
});

  socket.on("disconnect", () => {
    console.log(`Disconnected: ${socket.id}`)
    io.emit("mensajes", {
      server: "Servidor",
      mensaje: `${nombre} ha abandonado la sala`,
    });
  });
});

  //3 ARRAMCAMOS SERVIDOR
server.listen(port, () => {
    'Server is running on port 3000'
    console.log(`Corriendo SERVIDOR en PORT:  ${port}`)
});
// app.listen(port,  () => {
//     console.log(`Corriendo SERVIDOR en PORT:  ${port}`)
// })
