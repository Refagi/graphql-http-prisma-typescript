import winston from 'winston';
import config from './config';
import { GraphQLError } from 'graphql';

const enumerateErrorFormat = winston.format((info) => {
  if (info instanceof GraphQLError) {
    Object.assign(info, { message: info.stack });
  }
  return info;
});

export const logger = winston.createLogger({
  level: config.env === 'development' ? 'debug' : 'info',
  format: winston.format.combine(
    enumerateErrorFormat(),
    config.env === 'development' ? winston.format.colorize() : winston.format.uncolorize(),
    winston.format.splat(),
    winston.format.printf(({ level, message, ...label }) => `${level}: ${message} ${JSON.stringify(label)} `)
  ),
  transports: [
    new winston.transports.Console({
      stderrLevels: ['error']
    })
  ]
});
