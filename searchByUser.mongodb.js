/* global use, db */
// MongoDB Playground
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.

// The current database to use.
/* use('merReactMarketLocal'); */
use('mernReactMarket');

// Search for documents in the current collection.


/*  use("tu_base_de_datos"); */

db.windfoilproducts.aggregate([
  { $match: {} },  // Selecciona todos los documentos
  { $out: "windfoilproducts_backup" } // Crea una copia con este nombre
]);