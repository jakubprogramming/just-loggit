const logger = require('./logger');

logger.info("text info", {meta1: 'meta1'});
logger.warn("text warn");
logger.error("text error");
logger.error("noooo");
logger.debug("text debug");
logger.debug("text verbose");
logger.error(new Error("something went wrong"));
