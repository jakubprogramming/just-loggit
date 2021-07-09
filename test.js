const logger = require('./logger');

logger.info("text info", {meta1: 'meta1'});
logger.info("text info", {test1: 'test1'}, {test2: 'test2'}, "finalstring");
logger.error("text error", {test1: 'test1'}, {test2: 'test2'}, "finalstring");
logger.info("text info", "second part of info");
logger.info("text info --> null", null);
logger.warn("text warn");
logger.error("text error");
logger.error("text error", "i am more error info");
logger.debug("text debug");
logger.debug("text verbose");
logger.error(new Error("something went wrong"));
