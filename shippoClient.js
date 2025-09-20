const shippo = require("shippo");

const shippoClient = new shippo.Shippo({
  apiKeyHeader: process.env.SHIPPO_KEY,
});

module.exports = shippoClient;
