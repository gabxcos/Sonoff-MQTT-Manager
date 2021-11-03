const logger = (service, message) => {
    console.log(`[${service}]: ${message}`);
}

module.exports = logger;