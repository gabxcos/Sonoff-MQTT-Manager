const mongoose = require('mongoose');

const observationSchema = new mongoose.Schema({
    sonoff: { type: String, require: true },
    value: { type: Boolean, require: true }
},
{
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

const Observation = mongoose.model('Observation', observationSchema);
module.exports = Observation;