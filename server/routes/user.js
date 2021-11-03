const express = require('express');
const router = express.Router();

const { check } = require('express-validator');

const { UserController } = require('../controllers');

router.route('/register').post(
    [
        check('nickname').isString(),
        check('username').isString(),
        check('password').isString()
    ],
    UserController.register
);
router.route('/login').post(
    [
        check('username').isString(),
        check('password').isString()
    ],
    UserController.login
);

module.exports = router;