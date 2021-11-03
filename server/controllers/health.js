const HealthController = {
    index: (req, res) => {
        res.status(200).send('The Sonoff Manager is running!');
    }
}

module.exports = HealthController;