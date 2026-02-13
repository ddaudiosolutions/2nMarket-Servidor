const mongoose = require("mongoose");
const Producto = require("./models/ProductModel");
require("dotenv").config();

// Configuración: meses de antigüedad antes de desactivar
const MESES_ANTIGUEDAD = 6;

/**
 * Script para desactivar productos antiguos automáticamente
 *
 * Lógica:
 * - Usa la fecha más reciente de: fechaActualizacion, fechaReactivar o creado
 * - Si esa fecha es > MESES_ANTIGUEDAD, desactiva el producto
 * - Solo afecta productos activos y no vendidos
 */
async function desactivarProductosAntiguos() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.DB_MONGO, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Conectado a MongoDB");

    // Calcular fecha límite (MESES_ANTIGUEDAD meses atrás)
    const fechaLimite = new Date();
    fechaLimite.setMonth(fechaLimite.getMonth() - MESES_ANTIGUEDAD);

    console.log(`📅 Fecha límite: ${fechaLimite.toISOString()}`);
    console.log(`🔍 Buscando productos con más de ${MESES_ANTIGUEDAD} meses sin actividad...`);

    // Buscar todos los productos activos y no vendidos
    const productosActivos = await Producto.find({
      activo: true,
      vendido: false,
    });

    console.log(`📦 Total productos activos no vendidos: ${productosActivos.length}`);

    // Filtrar productos que deben desactivarse
    const productosADesactivar = productosActivos.filter((producto) => {
      // Determinar la fecha más reciente
      let fechaMasReciente = producto.creado;

      if (producto.fechaReactivar && producto.fechaReactivar > fechaMasReciente) {
        fechaMasReciente = producto.fechaReactivar;
      }

      if (producto.fechaActualizacion && producto.fechaActualizacion > fechaMasReciente) {
        fechaMasReciente = producto.fechaActualizacion;
      }

      // Verificar si la fecha más reciente es anterior a la fecha límite
      return fechaMasReciente < fechaLimite;
    });

    console.log(`⚠️  Productos a desactivar: ${productosADesactivar.length}`);

    if (productosADesactivar.length === 0) {
      console.log("✨ No hay productos antiguos para desactivar");
      await mongoose.connection.close();
      return;
    }

    // Mostrar información de los productos a desactivar
    console.log("\n📋 Lista de productos a desactivar:");
    productosADesactivar.forEach((producto, index) => {
      let fechaMasReciente = producto.creado;
      let origen = "creación";

      if (producto.fechaReactivar && producto.fechaReactivar > fechaMasReciente) {
        fechaMasReciente = producto.fechaReactivar;
        origen = "reactivación";
      }

      if (producto.fechaActualizacion && producto.fechaActualizacion > fechaMasReciente) {
        fechaMasReciente = producto.fechaActualizacion;
        origen = "actualización";
      }

      console.log(
        `  ${index + 1}. ${producto.title} - Última ${origen}: ${fechaMasReciente.toLocaleDateString()}`
      );
    });

    // Extraer IDs de productos a desactivar
    const idsADesactivar = productosADesactivar.map((p) => p._id);

    // Desactivar productos en masa
    const resultado = await Producto.updateMany(
      { _id: { $in: idsADesactivar } },
      { $set: { activo: false } }
    );

    console.log(`\n✅ Productos desactivados: ${resultado.modifiedCount}`);
    console.log("🎉 Proceso completado exitosamente");

    // Cerrar conexión
    await mongoose.connection.close();
    console.log("👋 Conexión a MongoDB cerrada");
  } catch (error) {
    console.error("❌ Error al desactivar productos:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Ejecutar el script
desactivarProductosAntiguos();
