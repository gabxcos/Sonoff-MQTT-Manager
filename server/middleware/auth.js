const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require('../config');

function check(req, res, next){
    if(req.headers && req.headers["authorization"]){
        if(req.headers["authorization"].indexOf("Bearer ") !== -1){
            const accessToken = req.headers["authorization"].split("Bearer ")[1];
            return jwt.verify(accessToken, JWT_SECRET, function (err, decoded) {
                if (err) {
                    return res.status(401).json({
                        error: "Unauthorized",
                        message: "Invalid or expired token"
                    });
                }
                res.locals.authInfo = {
                    userId: decoded.userId
                };
                next();
            });
        }
        else return res.status(401).json({
            error: "Unauthorized",
            message: "Invalid or expired token"
        });
    }else return res.status(401).json({
        error: "Unauthorized",
        message: "Invalid or expired token"
    });
}

module.exports = { check };