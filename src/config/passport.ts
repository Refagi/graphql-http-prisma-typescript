// import { Strategy as JwtStrategy, ExtractJwt, StrategyOptions, VerifiedCallback } from 'passport-jwt';
// import config from '../config/config.js';
// import prisma from '../../prisma/client.js';
// import { TokenTypes } from './token.js';
// import { JwtPayloadType } from '../middlewares/types/payload.types.js';

// export const jwtOptions: StrategyOptions = {
//   secretOrKey: config.jwt.secret,
//   jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
// };

// const jwtVerify = async (payload: JwtPayloadType, done: VerifiedCallback) => {
//   try {
//     console.log('paylod type', payload.type);
//     if (payload.type !== TokenTypes.ACCESS) {
//       throw new Error('Invalid token type');
//     }
//     const user = await prisma.user.findFirst({ where: { id: payload.sub } });
//     if (!user) {
//       console.log('User not found for payload.sub:', payload.sub); // Debug ID yang dicari
//       return done(null, false);
//     }
//     return done(null, user);
//   } catch (error) {
//     done(error as Error, false);
//   }
// };

// export const jwtStrategy = new JwtStrategy(jwtOptions, jwtVerify);
