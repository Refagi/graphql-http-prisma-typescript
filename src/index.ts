import prisma from '../prisma/client';
import config from './config/config';
import app from './app';
import { Server } from 'http';

const PORT: number | string = process.env.PORT || config.port;

let server: Server;

if (prisma) {
  console.log('Connected to Database');
  server = app.listen(PORT, () => {
    console.log(`Listening to port ${PORT}`);
  });
}

const exitHandler = () => {
  if (server) {
    server.close(() => {
      console.log('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error: string) => {
  console.log(error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  console.log('SIGTERM received');
  if (server) {
    server.close();
  }
});
