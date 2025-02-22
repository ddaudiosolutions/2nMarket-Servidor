const mongoose = require("mongoose");
const slugify = require("slugify");
const Producto = require("./models/ProductModel"); // Asegúrate de importar tu modelo
const conectarDB = require("./config/db"); // Asegúrate de que tienes la conexión

const actualizarSlugs = async () => {
  await conectarDB(); // Conectar a la base de datos

  // Buscar productos que tienen slug vacío o que no tienen slug
  const productos = await Producto.find({ $or: [{ slug: "" }, { slug: { $exists: false } }] });

  for (let producto of productos) {
    if (producto.title) {
      producto.slug = slugify(producto.title, { lower: true, strict: true });
      producto.url = `${producto.slug}-${producto._id}`;

      await producto.save(); // Guardamos el producto con el nuevo slug
      console.log(`✅ Producto actualizado: ${producto.url}`);
    }
  }

  console.log("🚀 Todos los productos ahora tienen slugs y URLs actualizadas.");
  process.exit();
};

// Ejecutamos la migración
actualizarSlugs().catch((err) => {
  console.error("❌ Error al actualizar slugs:", err);
  process.exit(1);
});
