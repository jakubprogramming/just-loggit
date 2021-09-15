require('dotenv').config()
const moment = require('moment')
const winston = require('winston')
const { format, createLogger, transports } = winston
const { timestamp, combine, printf, colorize, errors } = format

if (process.env.LOGGING_TO_DB_ENABLED === 'true') {
  if (!process.env.LOGGING_MONGO_DB_USER ||
     !process.env.LOGGING_MONGO_DB_PW ||
     !process.env.LOGGING_MONGO_DB_URL ||
     !process.env.LOGGING_MONGO_DB_REPLICA_SET ||
     !process.env.LOGGING_MONGO_ERROR_DB ||
     !process.env.LOGGING_MONGO_ERROR_COLLECTION
  ) throw ('Incomplete MongoDB environment variables. Please check your .env file')

  require('winston-mongodb')
  const MongoClient = require('mongodb').MongoClient
  const uri = `mongodb://${process.env.LOGGING_MONGO_DB_USER}:${process.env.LOGGING_MONGO_DB_PW}@${process.env.LOGGING_MONGO_DB_URL}/${process.env.LOGGING_MONGO_ERROR_DB}`
  var client = new MongoClient(uri, {
    useUnifiedTopology: true,
    ssl: true,
    replicaSet: process.env.LOGGING_MONGO_DB_REPLICA_SET,
    authSource: 'admin',
    retryWrites: true
  })
  const connection = client.connect()
}

// const logPrintf = printf(({ level, message, timestamp, stack }) => {
//   return `${timestamp} ${level}: ${stack || message}`
// })

const logPrintf = format.printf((info) => {
  const timestamp = moment().toString()
  const log = `${timestamp} ${info.level}: ${info.message}`

  return info.stack
    ? `${log}\n${info.stack}`
    : log
})

const devLogFormat = combine(
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  format.metadata(),
  logPrintf
)

const prodLogFormat = combine(
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss ZZ' }),
  errors({ stack: true }),
  format.metadata(),
  logPrintf
)

const appliedFormat = process.env.NODE_ENV === 'development' ? devLogFormat : prodLogFormat

const myTransports = [
  new transports.Console({ format: combine(colorize(), appliedFormat) }),
  new transports.File({ filename: `${process.env.DIRECTORY_LOGFILES || './logs'}/error.log`, level: 'error' }),
  new transports.File({ filename: `${process.env.DIRECTORY_LOGFILES || './logs'}/combined.log` })
]

if (process.env.LOGGING_TO_DB_ENABLED === 'true') {
  myTransports.push(winston.add(new winston.transports.MongoDB({
    level: 'error',
    db: client,
    collection: process.env.LOGGING_MONGO_ERROR_COLLECTION,
    storeHost: true,
    leaveConnectionOpen: true,
    decolorize: true
  })))
}

const logger = createLogger({
  level: process.env.LOGGER_LEVEL || 'debug',
  format: appliedFormat,
  defaultMeta: { NODE_ENV: process.env.NODE_ENV },
  transports: myTransports
})

function isError (input) {
  return input && input.stack && input.message // it's an error, probably
}

const wrapper = (original) => {
  return (...args) => {
    if (args.length === 1) {
      return original(
        typeof args[0] === 'object' && !isError(args[0]) ? JSON.stringify(args[0], null, 2) : args[0]
      )
    }

    return original(
      args.reduce((a, b) => {
        if (typeof a === 'object' && !isError(a)) a = JSON.stringify(a, null, 2)
        if (typeof b === 'object' && !isError(b)) b = JSON.stringify(b, null, 2)

        return a + ' ' + b
      }))
  }
}

logger.error = wrapper(logger.error)
logger.warn = wrapper(logger.warn)
logger.info = wrapper(logger.info)
logger.verbose = wrapper(logger.verbose)
logger.debug = wrapper(logger.debug)
logger.silly = wrapper(logger.silly)

module.exports = logger

process.on('exit', (code) => {
  cleanup()
})

function cleanup () {
  try {
    client.close()
  } catch (e) {
    logger.error(e)
  }
}
