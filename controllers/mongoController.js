const { MongoClient } = require("mongodb");
const User = require("../models/User.js");

const fs = require("fs");
const path = require("path");

exports.addField = async (req, res) => {
  console.log("entrando en addfield");
  const uri = process.env.DB_MONGO;
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const database = client.db("mernReactMarket");
    const collection = database.collection("users");
    // Use the updateMany method with an empty filter to update all documents in the collection
    const result = await collection.updateMany(
      {}, // Empty filter to update all documents
      { $set: { favoritos: [] } }
    );

    console.log(`${result.modifiedCount} documents updated.`);
    res.status(200).json({ message: `${result.modifiedCount} documents updated.` });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Hubo un error" });
  }
};

exports.getField = async (req, res) => {
  try {
    const usersGet = await User.find();
    const userEmails = usersGet.map((user) => user.email);
    console.log(userEmails);

    const jsonContent = userEmails.join(", ");
    const filePath = path.join(__dirname, "../../emailUsers", "user_emails.json");

    fs.writeFile(filePath, jsonContent, "utf8", (err) => {
      if (err) {
        console.error("Error al guardar el archivo:", err);
        res.status(500).send("Error al guardar el archivo");
      } else {
        console.log("Archivo guardado correctamente.");
        res.download(filePath); // Descargar el archivo como respuesta al cliente.
      }
    });
  } catch (error) {
    console.log(error);
  }
};
