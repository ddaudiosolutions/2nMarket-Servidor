// Importar bcrypt para encriptar la contraseña
const bcrypt = require('bcrypt');

/* global use, db */
// MongoDB Playground
// To disable this template go to Settings | MongoDB | Use Default Template For Playground.
// Make sure you are connected to enable completions and to be able to run a playground.
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.
// The result of the last command run in a playground is shown on the results panel.
// By default the first 20 documents will be returned with a cursor.
// Use 'console.log()' to print to the debug output.
// For more documentation on playgrounds please refer to
// https://www.mongodb.com/docs/mongodb-vscode/playgrounds/

// Select the database to use.
/* use('mernReactMarket_Local') */
use('mernReactMarket');


// Definir la nueva contraseña
/* const newPassword = "martina0319"; */

// Encriptar la contraseña con bcrypt
/* const hashedPassword = bcrypt.hashSync(newPassword, 10); */

// Actualizar el usuario en la base de datos
/* db.getCollection("users").updateOne(
  { email: "ddaudiosolutions@gmail.com" }, // Filtro para encontrar el usuario
  { $set: { password: hashedPassword } }   // Actualización de la contraseña
); */

// Insert a few documents into the sales collection.
/* db.getCollection('users').dropIndex({ nombre: 1 }); */
// Añade 'lo que pongas' solo si no existe
/* db.getCollection('users').createIndex(
  { nombre: 1, apellidos: 1 },
  { unique: true }
); */
/* db.getCollection('users').updateMany(
  {},
  {
    $set: { 'dni': '00000000z', 'apellidos': '', 'codigoPostal': '00000' }
  }
); */
/* db.getCollection('windfoilproducts').updateMany({},
  {
    $set: {alto: 0, ancho: 0, largo: 0, pesoVolumetrico: 0, precioEstimado: 0, delivery: false}
  }); */
/* db.getCollection('users').updateMany({},
 {
   $unset: {direccion: '', poblacion_CP: ''}
 }); */
/*  db.getCollection('users').updateMany(
   {
     "telefono": { $exists: false }
   },
   {
     $set: { "telefono": '' }
   }
 ); */


/* db.getCollection('windfoilproducts').updateMany({},
  {
    $set: {pesoKgs: 0}
  }); */
db.getCollection('windfoilproducts').updateMany({},
  {
    $set: { slug: '', url: '' }
  });

/* db.getCollection('windfoilproducts').find({}, { title: 1, slug: 1, url: 1 }).limit(10); */



