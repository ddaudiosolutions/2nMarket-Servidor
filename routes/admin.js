const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const adminController = require("../controllers/adminController");

// Envío masivo de email a todos los usuarios (Resend Broadcasts)
// POST /api/admin/emailMasivo
router.post("/emailMasivo", auth, adminController.emailMasivo);

// Migración única: sincronizar usuarios existentes a Resend Audience
// POST /api/admin/syncAudience
router.post("/syncAudience", auth, adminController.syncAudience);

module.exports = router;
