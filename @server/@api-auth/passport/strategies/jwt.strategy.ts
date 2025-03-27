import {ExtractJwt, Strategy} from 'passport-jwt';
import { DoneCallback } from 'passport';
import { Payload } from '../../../types';

import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in the environment variables');
}

export const jwtStrategy = new Strategy(
  {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: JWT_SECRET
  },
  async (payload: Payload, done: DoneCallback)=>{
    try {
      return done(null, payload);
    } catch (err) {
      return done(err);
    }
  }
);
