const pino = require( "pino");

const logger = pino({
  name: 'email-receiver',
  level: 'debug'
});

module.exports = logger;