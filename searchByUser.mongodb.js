/* global use, db */
// MongoDB Playground
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.

// The current database to use.
use('merReactMarketLocal');

// Search for documents in the current collection.
db.getCollection('users')
  .find(
    {
      _id: ObjectId("6163e43e00798e0016a86227")
    },    
  )
  