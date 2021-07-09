require('dotenv').config();
const winston = require('winston');
const {format, createLogger, transports} = winston;
const {timestamp, combine, printf, colorize, errors} = format;

if(process.env.LOGGING_TO_DB_ENABLED === "true"){

  if(!process.env.LOGGING_MONGO_DB_USER ||
     !process.env.LOGGING_MONGO_DB_PW ||
     !process.env.LOGGING_MONGO_DB_URL ||
     !process.env.LOGGING_MONGO_DB_REPLICA_SET ||
     !process.env.LOGGING_MONGO_ERROR_DB ||
     !process.env.LOGGING_MONGO_ERROR_COLLECTION
   ) throw("Incomplete MongoDB environment variables. Please check your .env file");

  require('winston-mongodb');
  var MongoClient = require('mongodb').MongoClient;
  var uri = `mongodb://${process.env.LOGGING_MONGO_DB_USER}:${process.env.LOGGING_MONGO_DB_PW}@${process.env.LOGGING_MONGO_DB_URL}/${process.env.LOGGING_MONGO_ERROR_DB}`;
  var client = new MongoClient(uri, {
    useUnifiedTopology: true,
    ssl: true,
    replicaSet: process.env.LOGGING_MONGO_DB_REPLICA_SET,
    authSource: 'admin',
    retryWrites: true
  });
  var connection = client.connect();
}

const logPrintf = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} ${level}: ${stack || message}`;
});

const devLogFormat = combine(
  timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
  errors({stack: true}),
  logPrintf,
  format.metadata()
);

const prodLogFormat = combine(
  timestamp({format: 'YYYY-MM-DD HH:mm:ss ZZ'}),
  errors({stack: true}),
  logPrintf,
  format.metadata()
);

const appliedFormat = process.env.NODE_ENV === "development" ? devLogFormat : prodLogFormat;

const myTransports = [
  new transports.Console({format: combine(colorize(), appliedFormat)}),
  new transports.File({ filename: `${process.env.DIRECTORY_LOGFILES || './logs'}/error.log`, level: 'error' }),
  new transports.File({ filename: `${process.env.DIRECTORY_LOGFILES || './logs'}/combined.log` })
];

if(process.env.LOGGING_TO_DB_ENABLED === "true"){
  myTransports.push(winston.add(new winston.transports.MongoDB({
      level: 'error',
      db: client,
      collection: process.env.LOGGING_MONGO_ERROR_COLLECTION,
      storeHost: true,
      leaveConnectionOpen: true,
      decolorize: true,
    })));
}

const logger = createLogger({
  level: process.env.LOGGER_LEVEL || "debug",
  format: appliedFormat,
  defaultMeta: { NODE_ENV: process.env.NODE_ENV },
  transports: myTransports
});

//Wrapper is used to be able to provide multiple arguments to logging functions
const wrapper = ( original ) => {
    return (...args) => original(args.join(" "));
};
logger.error = wrapper(logger.error);
logger.warn = wrapper(logger.warn);
logger.info = wrapper(logger.info);
logger.verbose = wrapper(logger.verbose);
logger.debug = wrapper(logger.debug);
logger.silly = wrapper(logger.silly);


module.exports = logger;

process.on('exit', (code) => {
  cleanup();
});

function cleanup(){
  try {
    client.close();
  } catch (e) {
    logger.error(e);
  }
}
