const mongoose = require('mongoose');

const sonoffSchema = new mongoose.Schema({
    owners: [{ 
        _id: {type: mongoose.Schema.Types.ObjectId, ref: 'User', require: true },
        deviceName: { type: String, require: true }
    }],
    topic: { type: String, require: true, index: { unique: true } },
    history: [{
        _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Observation' },
        value: { type: Boolean, require: true},
        timestamp: { type: Date, default: Date.now }
    }]
},
{
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

const Sonoff = mongoose.model('Sonoff', sonoffSchema);
module.exports = Sonoff;