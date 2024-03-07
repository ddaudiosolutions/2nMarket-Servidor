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
 use('merReactMarketLocal') 
  /* use('mernReactMarket');   */

// Insert a few documents into the sales collection.
/* db.getCollection('windfoilproducts').updateMany({},
  {
    $set: {alto: 0, ancho: 0, largo: 0, pesoVolumetrico: 0, precioEstimado: 0, delivery: false}
  }); */
 /* db.getCollection('users').updateMany({},
  {
    $unset: {direccion: '', poblacion_CP: ''}
  }); */ 
  db.getCollection('users').updateMany(
    {
      "telefono": { $exists: false }
    },
    {
      $set: { "telefono": '' }
    }
  );
  
  // Añade 'poblacion_CP' solo si no existe
  db.getCollection('users').updateMany(
    {
      "showPhone": { $exists: false }
    },
    {
      $set: { "showPhone": false }
    }
  );
/* db.getCollection('windfoilproducts').updateMany({},
  {
    $set: {pesoKgs: 0}
  }); */


