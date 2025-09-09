const express = require('express');
const router = express.Router();

// ✅ now it's /profile, not /info
router.get('/profile', (req, res) => {
  res.json({
    success: true,
    data: {
      name: 'John Doe',
      email: 'john@example.com'
    }
  });
});

module.exports = router;
