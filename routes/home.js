const express = require('express');
const router = express.Router();
const home = require('../controllers/homeController');

router.route('/').get(home.index);

module.exports = router;