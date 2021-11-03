const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bufferFrom = require('buffer-from');
const { JWT_SECRET } = require('../config');

const User = require("../models/user");

const UserController = {
    register: (req, res) => {
        const newUser = new User(req.body);
        newUser.password = bufferFrom(crypto.createHash('sha256')
            .update(req.body.password, 'utf-8').digest()).toString('base64');
        newUser.save()
            .then(() => res.status(200).json({
                success: true,
                message: "New user created successfully!"
            }))
            .catch((err)=>res.status(500).json({
                success: false,
                message: "Couldn't create a new user!",
                error: err
            }));
    },

    login: (req, res) => {
        const filter = {
            username: req.body.username,
            password: bufferFrom(crypto.createHash('sha256')
                .update(req.body.password, 'utf-8').digest()).toString('base64')
        };
        return User.findOne(filter, (err, user) => {
            if(err){
                return res.status(500).json({
                    success: false,
                    message: "Couldn't find the requested user!",
                    error: err
                });
            }

            if(!user){
                return res.status(401).json({
                    success: false,
                    message: "Wrong username or password!",
                    error: err
                });
            }

            const accessToken = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "1 hour" });
            const bodyResponse = {
                success: true,
                message: `Successfully logged in as ${user.nickname}!`,
                payload: {
                    accessToken,
                    expiresIn: 3600,
                    nickname: user.nickname,
                    topics: user.sonoffs.map(son => { return { topic: son.topic, name: son.name }})
                }
            };
            return res.json(bodyResponse);
        })
    }
}

module.exports = UserController;