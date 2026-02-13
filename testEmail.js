const nodemailer = require("nodemailer");
require("dotenv").config();

/**
 * Script de prueba para enviar emails en desarrollo
 *
 * Opción 1: Usar Ethereal (recomendado para testing)
 * Opción 2: Usar tu cuenta de Gmail real
 */

async function testEmail() {
  let transporter;

  // OPCIÓN 1: ETHEREAL (sin enviar emails reales)
  // Crea una cuenta de prueba automáticamente
  /*
  const testAccount = await nodemailer.createTestAccount();

  transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  console.log("📧 Usando Ethereal Email para pruebas");
  console.log("Usuario:", testAccount.user);
  */

  // OPCIÓN 2: GMAIL (descomentar para usar tu cuenta real)
  transporter = nodemailer.createTransport({
    service: "gmail",
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  console.log("📧 Usando Gmail real");
  console.log("Usuario:", process.env.EMAIL_USER);

  try {
    // Enviar email de prueba
    const info = await transporter.sendMail({
      from: '"WindyMarket Test" <david.cladera@gmail.com>',
      to: "infowindymarket@gmail.com",
      subject: "Email de prueba desde localhost",
      html: `
        <h2>Email de prueba</h2>
        <p>Este es un email de prueba enviado desde localhost con cambios</p>
        <p><strong>Fecha:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Entorno:</strong> Desarrollo</p>
      `,
    });

    console.log("✅ Email enviado correctamente");
    console.log("Message ID:", info.messageId);
    console.log("\n📧 Email enviado a:", info.accepted);
    console.log("📬 Revisa tu bandeja de entrada en Gmail");
  } catch (error) {
    console.error("❌ Error al enviar email:", error);
  }
}

testEmail();
