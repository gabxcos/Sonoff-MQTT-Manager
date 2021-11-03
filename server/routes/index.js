const express = require('express');
const router = express.Router();
const { HealthController } = require('../controllers');

const sonoff = require('./sonoff');
const user = require('./user');

router.use('/sonoff', sonoff);
router.use('/user', user);

// Healthy check
router.get('/', HealthController.index);

module.exports = router;