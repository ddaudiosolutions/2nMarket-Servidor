// Importar bcrypt para encriptar la contraseña
const bcrypt = require("bcrypt");

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
use("mernReactMarket_Local");
// use('mernReactMarket');

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
// db.getCollection("windfoilproducts").updateMany(
//   {},
//   {
//     $set: { slug: "", url: "" },
//   },
// );

// db.getCollection("windfoilproducts").updateMany(
//   {},
//   {
//     $set: {
//       activo: true,
//       fechaActualizacion: null,
//       fechaReactivar: null,
//     },
//   },
// );

// db.getCollection("windfoilproducts").updateMany(
//   {},
//   {
//     $rename: {
//       fechaReactar: "fechaReactivar",
//     },
//   },
// );
// Actualizar todos los productos a noviembre 2025 (hace 3 meses)
// db.getCollection("windfoilproducts").updateMany(
//   {},
//   {
//     $set: {
//       creado: new Date("2025-11-01T10:00:00Z"),
//       fechaActualizacion: null,
//       fechaReactivar: null,
//     },
//   },
// );

// Actualizar los primeros 5 productos a Julio 2025 (hace 7 meses)
// const primeros5 = db
//   .getCollection("windfoilproducts")
//   .find({})
//   .limit(5)
//   .toArray()
//   .map((p) => p._id);

// Actualizar solo esos 5 a julio 2025 (hace 7 meses)
// db.getCollection("windfoilproducts").updateMany(
//   { _id: { $in: primeros5 } },
//   {
//     $set: {
//       creado: new Date("2025-07-01T10:00:00Z"),
//     },
//   },
// );

// Tu ID de usuario
const miUserId = ObjectId("61960f6f8d4e400016369b52");

// Fecha límite (6 meses atrás)
const fechaLimite = new Date();
fechaLimite.setMonth(fechaLimite.getMonth() - 6);

// Obtener los 5 productos antiguos
const productosAntiguos = db
  .getCollection("windfoilproducts")
  .find({
    creado: { $lt: fechaLimite },
    activo: true,
  })
  .limit(5)
  .toArray();

const ids = productosAntiguos.map((p) => p._id);

// Actualizar el author
const resultado = db
  .getCollection("windfoilproducts")
  .updateMany({ _id: { $in: ids } }, { $set: { author: miUserId } });

print(`\n✅ ${resultado.modifiedCount} productos actualizados`);
print("\n📋 Lista de productos actualizados:");

ids.forEach((id, i) => {
  const p = db.getCollection("windfoilproducts").findOne({ _id: id });
  print(`  ${i + 1}. ${p.title} | Author: ${p.author} | Creado: ${p.creado}`);
});

/* db.getCollection('windfoilproducts').find({}, { title: 1, slug: 1, url: 1 }).limit(10); */
