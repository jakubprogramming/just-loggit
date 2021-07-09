require('dotenv').config();
require('winston-mongodb');
const MongoClient = require('mongodb').MongoClient;
const winston = require('winston');
const {format, createLogger, transports} = winston;
const {timestamp, combine, printf, colorize, errors} = format;

const uri = `mongodb://${process.env.MONGO_DB_USER}:${process.env.MONGO_DB_PW}@${process.env.MONGO_DB_URL}/${process.env.LOGGING_ERROR_DB}`;

const client = new MongoClient(uri, {
  useUnifiedTopology: true,
  ssl: true,
  replicaSet: process.env.MONGO_DB_REPLICA_SET,
  authSource: 'admin',
  retryWrites: true
});
const connection = client.connect();


const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} ${level}: ${stack || message}`;
});

const devLogFormat = combine(
  colorize(),
  timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
  errors({stack: true}),
  logFormat,
  format.metadata()
);

const prodLogFormat = combine(
  timestamp({format: 'YYYY-MM-DD HH:mm:ss ZZ'}),
  errors({stack: true}),
  logFormat,
  format.metadata()
);

const myTransports = [
  new transports.Console(),
  new transports.File({ filename: `${process.env.DIRECTORY_LOGFILES}/error.log`, level: 'error' }),
  new transports.File({ filename: `${process.env.DIRECTORY_LOGFILES}/combined.log` })
];

if(process.env.LOGGING_TO_DB_ENABLED === "true"){
  myTransports.push(winston.add(new winston.transports.MongoDB({
      level: 'error',
      db: client,
      collection: process.env.LOGGING_ERROR_COLLECTION,
      storeHost: true,
      leaveConnectionOpen: true,
      decolorize: true,
    })));
}

const logger = createLogger({
  level: process.env.LOGGER_LEVEL,
  format: process.env.NODE_ENV === "development" ? devLogFormat : prodLogFormat,
  defaultMeta: { NODE_ENV: process.env.NODE_ENV },
  transports: myTransports
});


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
