const express = require("express");
const {
  fetchPhoto,
  uploadPhoto,
} = require("../controllers/userPhoto.controller");

const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

const router = express.Router();

router.get("/user/photo", authMiddleware, fetchPhoto);
router.post(
  "/user/photo",
  authMiddleware,
  upload.single("photo"),
  uploadPhoto
);

module.exports = router;
