const { Broker } = require('../broker');
const logger = require("../logger");

const User = require("../models/user");
const Sonoff = require("../models/sonoff");
const Observation = require("../models/observation");

const SonoffController = {
    create: async (req, res) => {


        const owner = {
            _id: res.locals.authInfo.userId,
            deviceName: req.body.name
        };

        const filter = {
            topic: req.body.topic,
            'owners._id': {$ne: owner._id }
        }
        
        Sonoff.findOneAndUpdate(
            filter, 
            { 
                $push: { 
                    owners: owner
                }
            },
            {
                new: true,
                upsert: true,
                rawResult: true
            },
            (err, sonoff) => {
                if(err || !sonoff){
                    return res.status(500).json({
                        success: false,
                        messagge: "This Sonoff is already owned by the user"
                    });
                }
                if(sonoff.value instanceof Sonoff){
                    if(sonoff.lastErrorObject.updatedExisting){
                        User.findOneAndUpdate(
                            {
                                _id: res.locals.authInfo.userId
                            },
                            {
                                $addToSet: {
                                    sonoffs: {
                                        _id: sonoff.value._id,
                                        topic: sonoff.value.topic,
                                        name: req.body.name
                                    }
                                }
                            },
                            {
                                rawResult: true
                            },
                            (err, user) => {
                                if(err || !(user.value instanceof User)){
                                    return res.status(500).json({
                                        success: true,
                                        messagge: "An error occurred while updating the user's data."
                                    });
                                }else{
                                    return res.status(200).json({
                                        success: true,
                                        messagge: "User added to an existing Sonoff."
                                    });
                                }
                            }
                        );
                    }else{
                        User.findOneAndUpdate(
                            {
                                _id: res.locals.authInfo.userId
                            },
                            {
                                $addToSet: {
                                    sonoffs: {
                                        _id: sonoff.value._id,
                                        topic: sonoff.value.topic,
                                        name: req.body.name
                                    }
                                }
                            },
                            {
                                rawResult: true
                            },
                            (err, user) => {
                                if(err || !(user.value instanceof User)){
                                    return res.status(500).json({
                                        success: true,
                                        messagge: "An error occurred while updating the user's data."
                                    });
                                }else{
                                    Broker.subscribe(sonoff.value.topic);
                                    return res.status(200).json({
                                        success: true,
                                        messagge: "New Sonoff added successfully!"
                                    });
                                }
                            }
                        );
                    }
                }else{
                    return res.status(500).json({
                        success: false,
                        messagge: "An unknown error occurred while creating or updating the Sonoff"
                    });
                }
            }
        );
        
    },

    delete: (req, res) => {
        const owner = {
            _id: res.locals.authInfo.userId
        };

        const filter = {
            topic: req.body.topic,
            'owners._id': {$eq: owner._id }
        };

        Sonoff.findOneAndUpdate(
            filter, 
            { 
                $pull: { 
                    owners: owner
                }
            },
            {
                new: true,
                upsert: false,
                rawResult: true
            },
            (err, sonoff) => {
                if(err || !sonoff){
                    return res.status(500).json({
                        success: false,
                        messagge: "An error occurred while trying to delete this Sonoff."
                    });
                }
                if(sonoff.value instanceof Sonoff){
                    if(sonoff.lastErrorObject.updatedExisting){
                        User.findOneAndUpdate(
                            {
                                _id: res.locals.authInfo.userId
                            },
                            {
                                $pull: {
                                    sonoffs: { _id: sonoff.value._id } 
                                }
                            },
                            {
                                rawResult: true
                            },
                            (err, user) => {
                                if(err || !(user.value instanceof User)){
                                    return res.status(500).json({
                                        success: true,
                                        messagge: "An error occurred while updating the user's data."
                                    });
                                }else{
                                    if(sonoff.value.owners.length<1){
                                        Broker.unsubscribe(sonoff.value.topic);
                                        Sonoff.deleteOne({ topic: sonoff.value.topic }, (err)=>{ if(err) logger('Debug', err) });
                                    }
                                    return res.status(200).json({
                                        success: true,
                                        messagge: "The user now doesn't own this Sonoff."
                                    });
                                }
                            }
                        );
                    }else{
                        return res.status(500).json({
                            success: false,
                            messagge: "User already has no ownership of this Sonoff."
                        });
                    }
                }else{
                    return res.status(500).json({
                        success: false,
                        messagge: "There is no Sonoff with this topic or user already has no ownership of this Sonoff.."
                    });
                }
            }
        );
    },

    getCollection: (req, res) => {
        User.findById(res.locals.authInfo.userId).then((user) => {
            var sonoffList = user.sonoffs.map(s => {
                return {
                    topic: s.topic,
                    name: s.name
                }
            });
            return res.status(200).json({
                success: true,
                messagge: "These are all the Sonoffs the user currently owns.",
                payload: {
                    sonoffs: sonoffList
                }
            });
        })
        .catch(() => res.status(500).json({
            success: false,
            messagge: "An error occurred while trying to obtain all of this user's Sonoffs."
        }));
    },

    getObservations: (req, res) => {
        var id = req.params.id;

        Observation.deleteMany({ created_at: {"$lt" : new Date(Date.now() - 7*24*3600 * 1000) }}, (err, obj) => {});
    
        Observation.find({ sonoff: id })
        .then((observations) => {
            let obsList = observations.map(ob => {
                return {
                    date: new Date(ob.created_at),
                    value: ob.value
                }
            });
            return res.status(200).json({
                success: true,
                messagge: "These are all the latest observations for this Sonoff.",
                payload: {
                    observations: obsList
                }
            });
        })
        .catch((err) => {
            return res.status(500).json({
                success: false,
                messagge: "An error occurred trying to retrieve the latest observations.",
                error: err
            });
        });
    },

    // Broker commands
    toggle: (req, res) => {
        var id = req.params.id;
        var topic = `cmnd/tasmota_${id}/Power`;
        Broker.publish(topic, 'TOGGLE');
        res.status(200).send("Toggled");
    },

    turnOn: (req, res) => {
        var id = req.params.id;
        var topic = `cmnd/tasmota_${id}/Power`;
        Broker.publish(topic, 'ON');
        res.status(200).send("Turned on");
    },

    turnOff: (req, res) => {
        var id = req.params.id;
        var topic = `cmnd/tasmota_${id}/Power`;
        Broker.publish(topic, 'OFF');
        res.status(200).send("Turned off");
    }
}

module.exports = SonoffController;