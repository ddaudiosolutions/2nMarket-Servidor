const { MongoClient } = require("mongodb");

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
