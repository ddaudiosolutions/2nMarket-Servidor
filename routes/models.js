const express = require("express");
const router = express.Router({ mergeParams: true });
const mongoDb = require("../controllers/mongoController");

router.post("/addField", mongoDb.addField);

module.exports = router;
