const express = require('express');
const router = express.Router();
const { calculateEarthTime, updateCoords } = require('../utils/timeCalculator');

router.get('/', (req, res) => {
  try {
    res.json(calculateEarthTime());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/coords', (req, res) => {
  try {
    updateCoords(req.body);
    res.json(calculateEarthTime());
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
