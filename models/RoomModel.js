const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const roomSchema = new Schema({   
    title: {
      type: String
    },
    user1: {
      type: String,      
    },
    product: {
      type: String
    },
    user2: {
      type: String
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    creado: {
        type: Date,
        default: Date
    },
    
})

module.exports = mongoose.model('Rooms', roomSchema)