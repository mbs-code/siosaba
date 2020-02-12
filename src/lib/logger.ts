import { getLogger } from 'log4js'

const logger = getLogger('CLI')
logger.level = 'all'

export const cli = logger
