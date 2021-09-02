const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const windproductSchema = new Schema({
    title: {
        type: String,           
      },
     images: {
       type: String,
     },
    description: {
        type: String,  
      },
    price: {
        type: Number,     
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
    }


    
})

module.exports = mongoose.model('WindProducts', windproductSchema)