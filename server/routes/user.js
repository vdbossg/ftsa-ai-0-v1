const express = require('express');
const router = express.Router();

router.get('/info', (req, res) => {
  res.json({
    name: 'John Doe',
    email: 'john@example.com'
  });
});

module.exports = router;
