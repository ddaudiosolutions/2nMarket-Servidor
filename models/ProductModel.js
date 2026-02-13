const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const windfoilproductSchema = new Schema({
  title: {
    type: String,
  },
  slug: {
    type: String,
    unique: true,
    sparse: true
  },
  url: {
    type: String,
    unique: true,
    sparse: true
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
  alto: {
    type: Number,
  },
  ancho: {
    type: Number,
  },
  largo: {
    type: Number,
  },
  pesoVolumetrico: {
    type: Number,
  },
  pesoKgs: {
    type: Number,
  },
  precioEstimado: {
    type: Number,
  },
  delivery: {
    type: Boolean,
  },
  balearicDelivery: {
    type: Boolean,
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
  reservado: {
    type: Boolean,
  },
  vendido: {
    type: Boolean,
  },
  activo: {
    type: Boolean,
    default: true
  },
  fechaActualizacion: {
    type: Date,
    default: null
  },
  fechaReactivar: {
    type: Date,
    default: null
  }



})

module.exports = mongoose.model('WindFoilProducts', windfoilproductSchema)