const express = require("express");
const router = express.Router({ mergeParams: true });
const mongoDb = require("../controllers/mongoController");

router.post("/addField", mongoDb.addField);
router.get("/getField", mongoDb.getField);

module.exports = router;
