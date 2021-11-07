// Function to log/debug the app's state
const logger = (service, message) => {
    console.log(`[${service}]: ${message}`);
}

module.exports = logger;