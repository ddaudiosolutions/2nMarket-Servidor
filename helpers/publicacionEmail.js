const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const publicacionEmail = async ({ email, titulo, productoId }) => {
  const productUrl = `${process.env.FRONTEND_URL}/productos/${productoId}`;
  const whatsappMsg = encodeURIComponent(
    `🏄 ¡Mi anuncio ya está publicado en WindyMarket! Échale un vistazo: ${productUrl}`
  );

  const { data, error } = await resend.emails.send({
    from: "WindyMarket <noreply@windymarket.es>",
    replyTo: process.env.ADMIN_EMAIL,
    to: email,
    subject: "¡Tu anuncio ya está publicado en WindyMarket! 🚀",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>¡Tu anuncio ya está publicado! 🚀</h2>
        <p><strong>${titulo}</strong> ya es visible para todos los riders.</p>
        <p>Compártelo para vender más rápido:</p>
        <a href="https://wa.me/?text=${whatsappMsg}"
           style="display:inline-block;background:#25D366;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin-bottom:16px;">
          📲 Compartir en WhatsApp
        </a>
        <br><br>
        <a href="${productUrl}" style="color:#0066cc;">Ver mi anuncio →</a>
      </div>
    `,
  });

  if (error) {
    console.error("Error enviando email de publicación:", error);
  } else {
    console.log("Email de publicación enviado:", data.id);
  }
};

module.exports = publicacionEmail;
