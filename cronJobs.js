const cron = require('node-cron');
const mongoose = require("mongoose");
const Producto = require("./models/ProductModel");
require("dotenv").config();

// Configuración: meses de antigüedad antes de desactivar
const MESES_ANTIGUEDAD = 6;

/**
 * Función que desactiva productos antiguos
 */
async function desactivarProductosAntiguos() {
  try {
    console.log('🔍 Iniciando proceso de desactivación de productos antiguos...');

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

  } catch (error) {
    console.error("❌ Error al desactivar productos:", error);
  }
}

/**
 * Configurar cron job
 * Se ejecuta cada día a las 3:00 AM
 */
function iniciarCronJobs() {
  // Ejecutar cada día a las 3:00 AM
  cron.schedule('0 3 * * *', () => {
    console.log('\n⏰ [CRON] Ejecutando tarea programada: Desactivar productos antiguos');
    desactivarProductosAntiguos();
  }, {
    timezone: "Europe/Madrid" // Cambia a tu zona horaria
  });

  console.log('✅ Cron job configurado: Desactivación de productos antiguos (cada día 3:00 AM)');
}

module.exports = { iniciarCronJobs };
