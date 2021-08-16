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
  registro: {
    type: Date,
    default: Date.now(),
  },
});

//UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);
