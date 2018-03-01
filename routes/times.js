let express = require('express');
let router = express.Router();
let times = require('../converter');

router.get('/', (req, res) => {
  res.json(times.EarthJSON)
})

module.exports = router;
