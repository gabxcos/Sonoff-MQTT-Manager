const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    nickname: { type: String, require: true },
    username: { type: String, require: true, index: { unique: true } },
    password: { type: String, require: true },
    sonoffs: [{
        _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Sonoff' },
        topic: { type: String, require: true },
        name: { type: String, require: true }
    }]
},
{
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

const User = mongoose.model('User', userSchema);
module.exports = User;