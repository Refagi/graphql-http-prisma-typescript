import xss from 'xss';
import { Request, Response, NextFunction } from 'express';

// Middleware untuk sanitasi input menggunakan xss
const xssSanitizeMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (req.body && req.body.variables) {
    // Sanitasi seluruh variabel input GraphQL
    Object.keys(req.body.variables).forEach((key) => {
      if (typeof req.body.variables[key] === 'string') {
        req.body.variables[key] = xss(req.body.variables[key]);
      }
    });
  }

  // Jika ada query dalam request body, sanitasi juga
  if (req.body && req.body.query) {
    req.body.query = xss(req.body.query);
  }

  next();
};

export default xssSanitizeMiddleware;
