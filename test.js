const logger = require('./logger');

logger.info("text info", {meta1: 'meta1'});
logger.info("text info", "second part of info");
logger.warn("text warn");
logger.error("text error");
logger.error("text error", "i am more error info");
logger.debug("text debug");
logger.debug("text verbose");
logger.error(new Error("something went wrong"));
