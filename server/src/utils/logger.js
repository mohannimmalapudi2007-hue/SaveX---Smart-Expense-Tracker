const config = require('../config/env');

const logger = {
  info: (message, meta = {}) => {
    if (!config.isTest) {
      console.log(`[${new Date().toISOString()}] [INFO]: ${message}`, Object.keys(meta).length ? meta : '');
    }
  },
  warn: (message, meta = {}) => {
    console.warn(`[${new Date().toISOString()}] [WARN]: ${message}`, Object.keys(meta).length ? meta : '');
  },
  error: (message, error = {}) => {
    console.error(`[${new Date().toISOString()}] [ERROR]: ${message}`, error?.stack || error);
  },
  debug: (message, meta = {}) => {
    if (!config.isProduction && !config.isTest) {
      console.debug(`[${new Date().toISOString()}] [DEBUG]: ${message}`, Object.keys(meta).length ? meta : '');
    }
  }
};

module.exports = logger;
