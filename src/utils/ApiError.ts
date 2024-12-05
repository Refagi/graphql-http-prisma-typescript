import { GraphQLError } from 'graphql';
import httpStatus from 'http-status';

// export class ApiError extends GraphQLError {
//   public statusCode: number;
//   public isOperational: boolean;

//   constructor(
//     message: string | object,
//     options: {
//       statusCode: number;
//       isOperational?: boolean;
//       extensions?: { [key: string]: any };
//     }
//   ) {
//     const finalMessage = typeof message === 'string' ? message : JSON.stringify(message);
//     super(finalMessage, {
//       extensions: {
//         code: options.extensions?.code || 'INTERNAL_SERVER_ERROR',
//         http: { status: options.statusCode }
//       }
//     });

//     this.statusCode = options.statusCode;
//     this.isOperational = options.isOperational ?? true;

//     // Capture stack trace for debugging
//     Error.captureStackTrace(this, this.constructor);
//   }
// }

export class ApiError extends GraphQLError {
  public statusCode: number;
  public isOperational: boolean;

  constructor(
    message: string,
    options: {
      statusCode: number;
      isOperational?: boolean;
      extensions?: { [key: string]: any };
    }
  ) {
    const finalMessage = typeof message === 'string' ? message : String(message);

    super(finalMessage, {
      extensions: {
        code: options.extensions?.code || 'INTERNAL_SERVER_ERROR',
        http: { status: options.statusCode || httpStatus.INTERNAL_SERVER_ERROR }
      }
    });

    this.statusCode = options.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
    this.isOperational = options.isOperational ?? true;

    // Capture stack trace for debugging
    Error.captureStackTrace(this, this.constructor);
  }
}
