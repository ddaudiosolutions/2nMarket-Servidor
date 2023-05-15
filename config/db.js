const mongoose = require("mongoose");

require("dotenv").config();
const connection = mongoose.connect(process.env.DB_MONGO, {
      useCreateIndex: true,
      useNewUrlParser: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    });   
const conectarDB = async () => {
  try {
   await connection 
    console.log("base de datos conectada");
    
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};


module.exports = conectarDB;
