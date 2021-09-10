const logger = require('./logger')

const myObject = {
  name: 'Tim',
  lastname: 'Apple',
  age: 88,
  children: [
    'Jim',
    'Jill'
  ]
}

logger.info('text info', { meta1: 'meta1' })
logger.info('text info', myObject, { test2: 'test2' }, 'finalstring')
logger.error('text error', myObject, { test2: 'test2' }, 'finalstring')
logger.info('text info', 'second part of info')
logger.info('text info --> null', null)
logger.warn('text warn')
logger.error('text error')
logger.error('text error', 'i am more error info')
logger.debug('text debug')
logger.debug('text verbose')
logger.error(new Error('something went wrong'))
logger.error('text error')
logger.error('text error with object', myObject)
logger.error(myObject)
