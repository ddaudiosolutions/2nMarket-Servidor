/* global use, db */
// MongoDB Playground
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.

// The current database to use.
/* use('merReactMarketLocal'); */
use('mernReactMarket');

// Search for documents in the current collection.
db.getCollection('windfoilproducts')
  .find(
    {
       _id: ObjectId("65f1c77606b5d24fc0e44ee9") 
       /* author: ObjectId("61dcb4124d6bed0016476cd9") */
      /* email: "jjobarcelo@gmail.com" */
    },    
  )
  