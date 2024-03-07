const mongoose = require("mongoose");
//import mongoose from 'mongoose';
const Schema = mongoose.Schema;
//const  passportLocalMongoose = require( 'passport-local-mongoose');
//DOCUMENTOS SOBRE PASSPORT-LOCAL MONGOOSE EN GITHUB

//CREAMOS EL MODELO PARA LA COLECION QUE ALMACENAMOS EN MONGODB
const UserSchema = new Schema({
  nombre: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  telefono: {
    type: String,
    //required: true,
    trim: true,
    unique: true,
  },
  showPhone: {
    type: Boolean,
  },
  direccion: {
    type: String,
    // required: true,
  },
  poblacion_CP: {
    type: String,
    // required: true,
  },
  registro: {
    type: Date,
    default: Date.now(),
  },
  imagesAvatar: [
    {
      url: String,
      filename: String,
    },
  ],
  favoritos: [
    {
      type: Schema.Types.ObjectId,
      ref: "WindFoilProducts",
    },
  ],
});

//UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);
