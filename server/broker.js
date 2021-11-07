// Service for the MQTT broker

const logger = require('./logger');

var mqtt = require('mqtt');
const { HOST, PORT, CLIENT_ID, USERNAME, PASSWORD } = require('./config');

const { db } = require('./db');
const Sonoff = require("./models/sonoff");
const Observation = require("./models/observation");

options = {
    clientId: CLIENT_ID || 'mqttjs_' + Math.random().toString(16).substr(2, 8),
    protocolId: 'MQIsdp',
    protocolVersion: 3,
    connectTimeout:1000,
    debug: true
}

if(USERNAME && PASSWORD){
    options.username = USERNAME;
    options.password = PASSWORD;
    logger('MQTT', 'Using credentials for '+ USERNAME +'.');
}

var client = mqtt.connect(`mqtt://${HOST}:${PORT}/`, options);
var topics = [];

client.on("connect", () => {
    if(!client.connected){
        logger('MQTT', 'Couldn\'t connect to the broker');
        client.end();
    }
    else logger('MQTT', 'Connected to the broker.');
});

startup = () => {
    if(client.connected){
        topics.forEach(t => 
            client.subscribe(`stat/tasmota_${t}/POWER`, { qos: 2 }, (err, granted) => {
                if (err) {
                    logger('MQTT',`Subscribe error: ${err}`);
                }
                else {
                    logger('MQTT',`Subscribed to ${granted[0].topic}`);
                };
            })
        );
    }else{
        logger('MQTT', 'Not connected to Broker, retrying subscribe in 5 seconds...');
        setTimeout(startup, 5000);
    }
}
 
db.on("connected", () => {

    Sonoff.find({}, (err, sonoffs) => {
        topics = sonoffs.map(s => s.topic);

        var topicsPresent = topics!==null && topics.length>0;

        logger('MQTT', `Found ${topicsPresent ? topics.length : 'no'} topics${topicsPresent ? ': '+topics.toString() : ''}`);

        setTimeout(startup, 5000);
        
    });
});

client.on('message', (topic, message) => {
    let m = topic.match(/stat\/tasmota_([^\/]*)\/POWER/);
    t = m[1];
    logger(t, message);

    let state = message == "ON" ? true : false;
    Broker.updateHistory(t, state);
});

const Broker = {
    connected: () => {
        if(client.connected){
            logger('MQTT', 'Check passed: connected to the broker.');
            return true;
        }else{
            logger('MQTT', 'Check failed: not connected to the broker.');
            return false;
        }
    },

    disconnect: () => client.end(),

    subscribe: async (topic) => {
        client.subscribe(`stat/tasmota_${topic}/POWER`, { qos: 2 }, (err, granted) => {
            if (err) {
                logger('MQTT', `There has been an error trying to subscribe to the topic: ${topic}.`);
                return false;
            }
            else {
                logger('MQTT', `Successfully subscribed to topic: ${topic}`);
                return true;
            }
        });
    },

    unsubscribe: async (topic) => {
        client.unsubscribe(topic, (err) => {
            if (err) {
                logger('MQTT', `There has been an error trying to unsubscribe from the topic: ${topic}.`);
                return false;
            }else{
                logger('MQTT', `Successfully unsubscribed from the topic: ${topic}.`);
                return true;
            }
        });
    },

    publish: async (topic, message) => {
        client.publish(topic, message, (err) => {
            if(err){
                logger('MQTT', `Couldn\'t publish to topic: ${topic}.`);
                return false;
            }else{
                logger('MQTT', `Publish successfull: ${topic} <- "${message}".`);
                return true;
            }
        });
    },

    updateHistory: (topic, state) => {
        Observation.findOne({ sonoff: topic }, null, { sort: {created_at: -1}}, (err, obs) => {
            if((err || !obs) || obs.value != state ){
                let newObs = new Observation({ sonoff: topic, value: state });
                newObs.save()
                .then(() => {
                    logger('MongoDB', `New observation: [${topic}] <- ${state ? 'ON' : 'OFF'}`)
                })
                .catch((err) => {
                    logger('MongoDB', 'There was an error saving a new observation.')
                });
            }
        });

        Observation.deleteMany({ created_at: {"$lt" : new Date(Date.now() - 7*24*3600 * 1000) }}, (err, obj) => {});
    }
}

module.exports = { client, Broker };