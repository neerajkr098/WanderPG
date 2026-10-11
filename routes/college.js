const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const collegeController = require("../controllers/colleges.js");

// GET /colleges - Browse and search colleges
router.get("/", wrapAsync(collegeController.index));

// GET /colleges/:identifier - College detail with nearby PGs and map
router.get("/:identifier", wrapAsync(collegeController.show));

module.exports = router;
