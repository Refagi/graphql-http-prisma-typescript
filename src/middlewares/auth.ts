import passport from 'passport';
import { Strategy, ExtractJwt, StrategyOptions, VerifiedCallback } from 'passport-jwt';
import { JwtPayloadType } from './types/payload.types';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import { roleRights } from '../config/role';
import config from '../config/config';
import prisma from '../../prisma/client';

export const jwtOptions = {
  secretOrKey: config.jwt.secret,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
};

export default function passportJwtAuth(app: any) {
  passport.use(
    new Strategy(jwtOptions, async (payload: JwtPayloadType, done: VerifiedCallback) => {
      try {
        if (!payload) {
          throw new Error('Invalid token type');
        }
        const user = await prisma.user.findFirst({ where: { id: payload.sub } });
        if (!user) {
          console.log('User not found for payload.sub:', payload.sub); // Debug ID yang dicari
          return done(null, false);
        }
        return done(null, user);
      } catch (error) {
        done(error as Error, false);
      }
    })
  );

  const handleReq: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    const token = jwtOptions.jwtFromRequest(req);
    if (token) {
      passport.authenticate('jwt', { session: false }, (err: Error, user: any) => {
        if (err || !user) {
          console.log('Authentication error or no user found:', err, user);
          console.log('Authenticated user:', user); // Debug: pastikan user ditemukan
          return next(err);
        }
        req.user = user;
        next();
      })(req, res, res);
    } else {
      next();
    }
  };
  app.use(handleReq);
}

export const requiredRights = async (access: string[], role: string) => {
  const userRights = roleRights.get(role) || [];
  const hasRequiredRights = access.every((requiredRight) => userRights.includes(requiredRight));
  return hasRequiredRights;
};
