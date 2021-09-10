const winston = require('winston')
const { format, createLogger, transports } = winston
const { timestamp, combine, printf, colorize, errors } = format

const print = format.printf((info) => {
  const log = `${info.level}: ${info.message}`

  return info.stack
    ? `${log}\n${info.stack}`
    : log
})

const logger = winston.createLogger({
  level: 'debug',
  format: format.combine(
    colorize(),
    format.errors({ stack: true }),
    print,
  ),
  transports: [new transports.Console()]
})

const error = new Error('Ooops')

logger.error(error)
logger.error('An error occurred:', error)
