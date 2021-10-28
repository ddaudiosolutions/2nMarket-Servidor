const mongoose = require ('mongoose');
const Schema = mongoose.Schema;

const buscoSchema = new Schema({
    title: {
        type: String,           
      },
         
    description: {
        type: String,  
      },    
    contacto: {
      type: String,
    },  
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    creado: {
        type: Date,
        default: Date
    },
    imagesAvatar: {
      type: Schema.Types.ObjectId,
      ref: 'User'
  },
})

module.exports = mongoose.model('BuscoModel', buscoSchema);