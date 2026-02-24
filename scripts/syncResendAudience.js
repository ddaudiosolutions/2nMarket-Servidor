/**
 * Script de migración única: sincroniza todos los usuarios de MongoDB
 * a la Audience de Resend.
 *
 * Uso:
 *   node scripts/syncResendAudience.js
 */

require("dotenv").config();
const mongoose = require("mongoose");
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);
const audienceId = process.env.RESEND_AUDIENCE_ID;

if (!audienceId) {
  console.error("❌ RESEND_AUDIENCE_ID no está en el .env");
  process.exit(1);
}

const UserSchema = new mongoose.Schema({ nombre: String, email: String });
const User = mongoose.models.User || mongoose.model("User", UserSchema);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  console.log("Conectando a MongoDB...");
  await mongoose.connect(process.env.DB_MONGO);
  console.log("✅ Conectado");

  const usuarios = await User.find({}, "nombre email").lean();
  console.log(`📋 ${usuarios.length} usuarios encontrados`);

  let sincronizados = 0;
  let errores = 0;

  for (const u of usuarios) {
    try {
      const { error } = await resend.contacts.create({
        audienceId,
        email: u.email,
        firstName: u.nombre || "",
        unsubscribed: false,
      });

      if (error) {
        errores++;
        console.error(`  ❌ ${u.email}: ${error.message || JSON.stringify(error)}`);
      } else {
        sincronizados++;
        console.log(`  ✅ ${u.email}`);
      }
    } catch (err) {
      errores++;
      console.error(`  ❌ ${u.email}: ${err.message}`);
    }

    // Resend permite 2 req/seg — esperamos 600ms entre cada contacto
    await sleep(600);
  }

  console.log("\n--- RESULTADO ---");
  console.log(`Total:        ${usuarios.length}`);
  console.log(`Sincronizados: ${sincronizados}`);
  console.log(`Errores:       ${errores}`);

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error("Error fatal:", err);
  process.exit(1);
});
