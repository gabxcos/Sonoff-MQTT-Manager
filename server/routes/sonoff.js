const express = require('express');
const router = express.Router();

const { check } = require('express-validator');
const authMiddleware = require('../middleware/auth');

const { SonoffController } = require('../controllers');


// CRUD
router.route('/create').post(
    [
        check('topic').isString(),
        check('name').isString()
    ],
    authMiddleware.check,
    SonoffController.create
);

router.route('/delete').post(
    [
        check('topic').isString()
    ],
    authMiddleware.check,
    SonoffController.delete
);

router.route('/collection').get(
    authMiddleware.check,
    SonoffController.getCollection
);

router.route('/:id/observations').get(
    authMiddleware.check,
    SonoffController.getObservations
);

// COMMANDS
router.route('/:id/toggle').post(
    authMiddleware.check,
    SonoffController.toggle
);
router.route('/:id/on').post(
    authMiddleware.check,
    SonoffController.turnOn
);
router.route('/:id/off').post(
    authMiddleware.check,
    SonoffController.turnOff
);

module.exports = router;