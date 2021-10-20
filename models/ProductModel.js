const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const windfoilproductSchema = new Schema({
    title: {
        type: String,           
      },
     images: [{
       url: String,
       filename: String
       
     }],     
    description: {
        type: String,  
      },
    price: {
        type: Number,     
              },
    contacto: {
      type: String,
    },
    categoria: {
        type: String,               
      },
    subCategoria: {
        type: String,
        //required: true,
        //trim: true,        
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

module.exports = mongoose.model('WindFoilProducts', windfoilproductSchema)