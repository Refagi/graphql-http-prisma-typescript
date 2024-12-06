import express, { Express, NextFunction, Request, Response } from 'express';
import cors from 'cors';
import passport from 'passport';
import config from './config/config';
import morgan from './config/morgan';
import { ApiError } from './utils/ApiError';
import { errorConverter } from './middlewares/error';
import httpStatus from 'http-status';
import xssSanitizeMiddleware from './middlewares/sentinize';
import { createHandler } from 'graphql-http/lib/use/express';
import helmet from 'helmet';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { mergeResolvers } from '@graphql-tools/merge';
import { loadFilesSync } from '@graphql-tools/load-files';
import { loadSchemaSync } from '@graphql-tools/load';
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';
import path from 'path';
import passportJwtAuth from './middlewares/auth';

const app: Express = express();

if (config.env !== 'test') {
  app.use(morgan.errorHandler);
  app.use(morgan.successHandler);
}

// aktifin parsing json
app.use(express.json());

// aktifin urlencoded
app.use(express.urlencoded({ extended: true }));

// enable cors
app.use(cors());
app.options('*', cors());

// jwt authentication
app.use(passport.initialize());
// passport.use('jwt', jwtStrategy);
passportJwtAuth(app);

// set security HTTP headers
app.use(helmet());

//xss middleware
app.use(xssSanitizeMiddleware);

const typeDefs = loadSchemaSync(path.join(__dirname, 'graphql/**/*.graphql'), {
  loaders: [new GraphQLFileLoader()]
});
const resolverFiles = loadFilesSync(path.join(__dirname, 'graphql/**/*.resolver.js'));
const resolvers = mergeResolvers(resolverFiles);

const schema = makeExecutableSchema({ typeDefs, resolvers });

app.all(
  '/graphql',
  createHandler({
    schema: schema,
    rootValue: resolvers,
    context: (req) => {
      return { authHeader: req.headers };
    }
  })
);

export default app;
