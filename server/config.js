const dotenv = require('dotenv');
dotenv.config({ path: '../.env' });

const env = name => process.env[name.toUpperCase()];

module.exports = {
    // MQTT
    HOST: env('host') || 'localhost',
    PORT: env('port') || 1883,
    CLIENT_ID: env('client_id') || 'node_server',
    USERNAME: env('username'),
    PASSWORD: env('password'),
    // MONGODB
    DB_HOST: env('db_host') || '127.0.0.1',
    DB_NAME: env('db_name') || 'SonoffDB',
    // EXPRESS
    JWT_SECRET: env('jwt_secret'),
    SERVER_HOST: env('server_host') || 'localhost', 
    SERVER_PORT: env('server_port') || 3000
}