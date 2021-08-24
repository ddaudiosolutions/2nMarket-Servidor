const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    url: String,
    filename: String
});

//ESTO NOS SIRVE PARA INTRODUCIR EN MEDIO DE LA URL LA OPCIÓN DE W_200 Y CONVERTIR LAS IMAGENES
// A LA HORA DE VISIONARLAS CON UN WIDTH MAX DE 200

ImageSchema.virtual('thumbnail').get(function(){
    return this.url.replace('/upload', '/upload/w_200')
})

//DEBEMOS USAR ESTA OPTS PARA QUE LOS ELEMENTOS VIRTUALES DE MONGO PUEDAN USARSE DEL LADO DEL CLIENTE.
//const opts ={ toJSON: {virtuals: true}};

const windproductSchema = new Schema({
    title: {
        type: String,           
      },

      images: [ImageSchema],
    // images: [ImageSchema],
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