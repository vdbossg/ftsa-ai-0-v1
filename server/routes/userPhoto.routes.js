const express = require("express");
const { fetchPhoto, uploadPhoto } = require("../controllers/userPhoto.controller");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

const router = express.Router();

// GET /api/user/photo
router.get("/photo", authMiddleware, fetchPhoto);

// POST /api/user/photo
router.post("/photo", authMiddleware, upload.single("photo"), uploadPhoto);

module.exports = router;
